const mqtt = require("mqtt");
require("dotenv").config();
const { getLastHistoricByEntityId } = require("../../models/historial_model")

let mqttClient = null;
const entityMap = new Map();
const heartbeatTimers = new Map();

function initialize(entity, eventEmitter) {
    if (!mqttClient) {
        mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
            username: process.env.MQTT_USERNAME || "litheboard",
            password: process.env.MQTT_PASSWORD || "litheboard_password",
        });

        mqttClient.on("connect", () => {
            console.log("Connected to MQTT broker.");
            subscribeToTopics(entity);
            handleReconnection(entity);
        });

        mqttClient.on("reconnect", () => {
            console.log("Reconnecting to MQTT broker...");
            subscribeToTopics(entity);
            handleReconnection(entity);
        });

        mqttClient.on("error", (error) => {
            console.error("MQTT client error:", error);
        });

        mqttClient.on("message", (topic, message) => {
            handleIncomingMessage(topic, message, eventEmitter);
        });
    }
}

function subscribeToTopics(entity) {
    const userId = entity.client_id;
    const entityId = entity.entity_id;

    const entityKey = `${entity.client_id}:${entity.entity_id}`;
    if (!entityMap.has(entityKey)) {
        entityMap.set(entityKey, entity);
    }

    const topics = [
        `users/${userId}/device/${entityId}/data/device`,
        `users/${userId}/device/${entityId}/requests/device`,
        `users/${userId}/device/${entityId}/heartbeat/device`,
    ];

    topics.forEach((topic) => {
        mqttClient.subscribe(topic, (err) => {
            if (err) {
                console.error(`Error subscribing to topic ${topic}:`, err);
            } else {
                console.log(`Subscribed to topic: ${topic}`);
            }
        });
    });
}

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
        const topic = `users/${entity.client_id}/device/${entity.entity_id}/data/platform`;
        const state = await getPlatformStateForEntity(entity);

        mqttClient.publish(topic, JSON.stringify(state), (err) => {
            if (err) {
                console.error(`Error publishing state to topic ${topic}:`, err);
            } else {
                console.log(`Published state to topic: ${topic}`);
            }
        });
    } catch (error) {
        console.error(`Failed to send platform state to device ${entity.entity_id}:`, error);
    }
}


function requestSyncFromDevice(entity) {
    const topic = `users/${entity.client_id}/device/${entity.entity_id}/requests/platform`;
    const message = { action: "requestSync" };

    mqttClient.publish(topic, JSON.stringify(message), (err) => {
        if (err) {
            console.error(`Error publishing sync request to topic ${topic}:`, err);
        } else {
            console.log(`Published sync request to topic: ${topic}`);
        }
    });
}

async function getPlatformStateForEntity(entity) {
    try {
        const lastHistoric = await getLastHistoricByEntityId(entity.entity_id);
            console.log(`Last historic data for entity ${entity.entity_id} is:`, lastHistoric[0].data);
            return lastHistoric[0]; // Retorna solo la propiedad `data`
    } catch (error) {
        console.error(`Error fetching historic data for entity ${entity.entity_id}:`, error);
        throw error;
    }
}


function handleIncomingMessage(topic, message, eventEmitter) {
    try {
        const parts = topic.split("/");
        const client_id = parts[1];
        const device_id = parts[3];
        const entityKey = `${client_id}:${device_id}`;
        const entity = entityMap.get(entityKey);
        const data = JSON.parse(message.toString());
        entityMap.set()
        if (topic.includes("/data/device")) {
            handleDeviceStateUpdate(data, topic, eventEmitter);
        } else if (topic.includes("/requests/device")) {
            handleDeviceStateRequest(data, entity);
        } else if (topic.includes("/heartbeat")) {
            handleDeviceHeartbeat(data, topic);
        } else {
            console.warn(`Unhandled topic: ${topic}`);
        }


    } catch (error) {
        console.error(`Error processing MQTT message from topic ${topic}:`, error);
    }
}

function handleDeviceStateUpdate(data, topic, eventEmitter) {
    console.log("Handling device state update", data);
    const parts = topic.split("/");

    const client_id = parts[1];
    const device_id = parts[3];
    const entityKey = `${client_id}:${device_id}`;
    const entity = entityMap.get(entityKey);

    if (entity) {
        eventEmitter.emit("datasourceEvent", {
            entity,
            data,
            source: "MQTT",
        });
    } else {
        console.warn(`No entity found for topic: ${topic}`);
    }
}

function handleDeviceStateRequest(data, entity) {
    console.log("Handling device state request", data);
    sendPlatformStateToDevice(entity);
}

function handleDeviceHeartbeat(data, topic) {
    console.log("Handling device heartbeat", data);
    const parts = topic.split("/");
    const client_id = parts[1];
    const device_id = parts[3];
    const entityKey = `${client_id}:${device_id}`;
    const entity = entityMap.get(entityKey);

    if (entity) {
        if (entity.datasource_config.status === "inactive") {
            entity.datasource_config.status = "active";
            console.log(`Entity ${entityKey} is now active.`);
        }

        if (heartbeatTimers.has(entityKey)) {
            clearTimeout(heartbeatTimers.get(entityKey));
        }

        const timeout = setTimeout(() => {
            entity.datasource_config.status = "inactive";
            console.log(`Entity ${entityKey} is now inactive due to heartbeat timeout.`);
        }, entity.datasource_config.heartbeat_timeout);

        heartbeatTimers.set(entityKey, timeout);
    } else {
        console.warn(`No entity found for heartbeat: ${client_id}:${device_id}`);
    }
}

module.exports = { initialize };
