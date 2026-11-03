const mqtt = require("mqtt");
require("dotenv").config();
const { getLastHistoricByEntityId } = require("../../models/historic_model");
const { updateEntityStatus } = require("../../models/entity_model");
const { emitEntityStateChange } = require("../../sockets/ws_helper");

let mqttClient = null;
const entityMap = new Map();
const heartbeatTimers = new Map();

function getEntity(client_id, entity_id) {
  return entityMap.get(`${client_id}:${entity_id}`);
}

function initialize(entity, eventEmitter) {
  const key = `${entity.client_id}:${entity.entity_id}`;
  entityMap.set(key, entity);

  if (!mqttClient) {
    mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker.");

      for (const ent of entityMap.values()) {
        subscribeToTopics(ent);
      }
    });

    mqttClient.on("reconnect", () => {
      console.log("Reconnecting to MQTT broker...");
      for (const ent of entityMap.values()) {
        subscribeToTopics(ent);
      }
    });

    mqttClient.on("error", (error) => {
      console.error("MQTT client error:", error);
    });

    mqttClient.on("message", (topic, message) => {
      handleIncomingMessage(topic, message, eventEmitter);
    });
  }

  subscribeToTopics(entity);
  handleReconnection(entity);
  startHeartbeatTimer(entity);
}

function stop(entity) {
  const key = `${entity.client_id}:${entity.entity_id}`;
  clearTimeout(heartbeatTimers.get(key));
  heartbeatTimers.delete(key);
  entityMap.delete(key);
  if (mqttClient) {
    const base = `users/${entity.client_id}/device/${entity.entity_id}`;
    const config = entity.datasource_config;
    mqttClient.unsubscribe([
      `${base}/data/${config.sub_topic}`,
      `${base}/${config.request_topic || 'requests'}/${config.sub_topic}`,
      `${base}/${config.heartbeat_topic || 'heartbeat'}/${config.sub_topic}`,
    ]);
  }
}

function subscribeToTopics(entity) {
  const { client_id, entity_id, datasource_config } = entity;
  const base = `users/${client_id}/device/${entity_id}`;
  const sub = datasource_config.sub_topic;
  const req = datasource_config.request_topic || "requests";
  const hb = datasource_config.heartbeat_topic || "heartbeat";

  const topics = [
    `${base}/data/${sub}`, // datos del device
    `${base}/${req}/${sub}`, // requests del device
    `${base}/${hb}/${sub}`, // heartbeats del device
  ];

  topics.forEach((topic) => {
    mqttClient.subscribe(topic, (err) => {
      if (err) console.error(`Error suscribiendo a ${topic}:`, err);
      else console.log(`Subscribed to ${topic}`);
    });
  });
}

//#region Reconnections
function handleReconnection(entity) {
  const sourceOfTruth = entity.datasource_config.source_of_truth;
  if (sourceOfTruth === "platform") {
    console.log("Platform is the source of truth. Sending state to device.");
    sendPlatformStateToDevice(entity);
  } else if (sourceOfTruth === "device") {
    console.log("Device is the source of truth. Requesting sync from device.");
    requestSyncFromDevice(entity);
  }
}

async function sendPlatformStateToDevice(entity) {
  try {
    const { client_id, entity_id, datasource_config } = entity;
    const topic = `users/${client_id}/device/${entity_id}/data/${datasource_config.pub_topic}`;
    const lastRecord = await getLastHistoricByEntityId(entity_id);

    mqttClient.publish(topic, JSON.stringify(lastRecord[0]), (err) => {
      if (err) console.error(`Publish error to ${topic}:`, err);
      else console.log(`Published platform state to ${topic}`);
    });
  } catch (error) {
    console.error(
      `Failed to send platform state to device ${entity.entity_id}:`,
      error
    );
  }
}

function requestSyncFromDevice(entity) {
  const { client_id, entity_id } = entity;
  const topic = `users/${client_id}/device/${entity_id}/requests/platform`;
  const message = JSON.stringify({ action: "requestSync" });

  mqttClient.publish(topic, message, (err) => {
    if (err) console.error(`Publish sync request error to ${topic}:`, err);
    else console.log(`Published sync request to ${topic}`);
  });
}

async function getPlatformStateForEntity(entity) {
  try {
    const lastHistoric = await getLastHistoricByEntityId(entity.entity_id);
    console.log(
      `Last historic data for entity ${entity.entity_id} is:`,
      lastHistoric[0].data
    );
    return lastHistoric[0]; // Retorna solo la propiedad `data`
  } catch (error) {
    console.error(
      `Error fetching historic data for entity ${entity.entity_id}:`,
      error
    );
    throw error;
  }
}

//#endregion

//#region Handle messages
function handleIncomingMessage(topic, message, eventEmitter) {
  try {
    const parts = topic.split("/");
    const client_id = parts[1];
    const device_id = parts[3];
    const key = `${client_id}:${device_id}`;
    const entity = entityMap.get(key);
    const data = JSON.parse(message.toString());

    if (!entity) {
      console.warn(`No entity for topic ${topic}`);
      return;
    }

    if (entity.connection_status !== "online") {
      entity.connection_status = "online";
      console.log(`Entity ${entity.entity_id} marked active on any message.`);
      updateEntityStatus(entity.client_id, entity.entity_id, "online");
      emitEntityStateChange({
        entity_id: entity.entity_id,
        connection_status: "online",
      });
    }

    startHeartbeatTimer(entity);

    if (topic.includes(`/data/${entity.datasource_config.sub_topic}`)) {
      handleDeviceStateUpdate(entity, data, eventEmitter);
    } else if (
      topic.includes(`/requests/${entity.datasource_config.sub_topic}`)
    ) {
      handleDeviceStateRequest(entity);
    } else if (
      topic.includes(`/heartbeat/${entity.datasource_config.sub_topic}`)
    ) {
      handleDeviceHeartbeat(entity, data);
    } else {
      console.warn(`Unhandled topic: ${topic}`);
    }
  } catch (error) {
    console.error(`Error processing MQTT message from topic ${topic}:`, error);
  }
}

function handleDeviceStateUpdate(entity, data, eventEmitter) {
  console.log(`State update from device ${entity.entity_id}:`, data);
  eventEmitter.emit("datasourceEvent", { entity, data, source: "mqtt" });
}

function handleDeviceStateRequest(entity) {
  console.log(`State request from device ${entity.entity_id}`);
  sendPlatformStateToDevice(entity);
}
//#endregion

//#region Heartbeats
function startHeartbeatTimer(entity) {
  const key = `${entity.client_id}:${entity.entity_id}`;
  const timeout = (entity.datasource_config.heartbeat_timeout_s ?? 60) * 1000;
  if (heartbeatTimers.has(key)) clearTimeout(heartbeatTimers.get(key));
  const timer = setTimeout(async () => {
    entity.connection_status = "offline";

    console.log(`Heartbeat timeout for ${key}. Marking inactive.`);
    await updateEntityStatus(entity.client_id, entity.entity_id, "offline");
    emitEntityStateChange({
      entity_id: entity.entity_id,
      connection_status: "offline",
    });
  }, timeout);

  heartbeatTimers.set(key, timer);
}

function handleDeviceHeartbeat(entity, data) {
  console.log(`Heartbeat from device ${entity.entity_id}:`, data);
  if (entity.connection_status === "offline") {
    entity.connection_status = "online";
    console.log(`Entity ${entity.entity_id} is now active.`);
    updateEntityStatus(entity.client_id, entity.entity_id, "online");
    emitEntityStateChange({
      entity_id: entity.entity_id,
      connection_status: "online",
    });
  }
  startHeartbeatTimer(entity);
}

//#endregion

//#region Publish
async function publishMessage(entity, message) {
  try {
    console.log(`enbity`, entity);
    const topic = `users/${entity.client_id}/device/${entity.entity_id}/data/${entity.datasource_config.pub_topic}`;
    mqttClient.publish(topic, JSON.stringify(message), (err) => {
      if (err) console.error(`Error publishing to ${topic}:`, err);
      else console.log(`Published message to ${topic}`);
    });
  } catch (error) {
    console.error(`publishMessage error for ${entity.entity_id}:`, error);
  }
}

async function publishToTopic(entity, topic, message, qos = 0) {
  try {
    console.log(`→ publicando en topic=${topic}`, message);
    mqttClient.publish(topic, JSON.stringify(message), { qos }, (err) => {
      if (err) console.error(`Error publishing to ${topic}:`, err);
      else console.log(`Published message to ${topic} with QoS ${qos}`);
    });
  } catch (error) {
    console.error(`publishToTopic error for ${entity.entity_id}:`, error);
  }
}

//#endregion
module.exports = { initialize, publishMessage, publishToTopic, getEntity, stop};

/*
subscription:
- users/{client_id}/device/{entity_id}/data/{sub_topic}         <--- data
- users/{client_id}/device/{entity_id}/requests/{sub_topic}     <--- state request
- users/{client_id}/device/{entity_id}/heartbeat/{sub_topic}    <--- heartbeats
------------------------------------------------------------
publish:
- users/{client_id}/device/{entity_id}/data/{pub_topic}         <--- data
- users/{client_id}/device/{entity_id}/requests/platform        <--- state request
*/
