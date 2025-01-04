const mqtt = require("mqtt");
const entityModel = require("../models/entity_model");
const historialModel = require("../models/historial_model");
const widgetModel = require("../models/widget_model");
const alarmModel = require("../models/alarm_model");
require("dotenv").config();
const mqttSocket = require("../sockets/mqtt_socket");

/**
 * Espacio de nombres para las funciones de la API dentro de los controladores.
 * @namespace controllers.mqtt
 *
 */

// Initialize MQTT client connection
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: 'litheboard_admin',
  password: 'pepelithe',
});

/**
 * Subscribes to all MQTT device topics based on entities fetched from the database.
 * Validates token before subscription.
 */
async function subscribeToDevices() {
  const entities = await entityModel.getEntities(); // Fetch all entities from database
  entities.forEach((entity) => {
    if (isValidToken(entity.token)) {
      const topic = `users/${entity.client_id}/devices/${entity.entity_id}/message/${entity.sub_topic}`;
      mqttClient.subscribe(topic, (err) => {
        if (err) console.error(`Error subscribing to topic: ${topic}`, err);
        else console.log(`Subscribed to topic: ${topic}`);
      });
    }
  });
}

/**
 * Token validation logic - Replace with actual logic as needed.
 * @param {string} token - Token to validate
 * @returns {boolean} Whether token is valid or not
 * @function
 * @memberof controllers.mqtt
 */
function isValidToken(token) {
  return true; // For now, assume all tokens are valid
}

// Handle connection to the MQTT broker
mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker.");
  subscribeToDevices();
});

mqttClient.on("error", (error) => {
  console.error("MQTT client error:", error);
});

// Handle incoming MQTT messages
mqttClient.on("message", async (topic, message) => {


  const parts = topic.split("/");

  const client_id = parts[1];
  const device_id = parts[3];
  console.log("Incoming message received... client_id:",client_id, "device_id:",device_id);
  console.log("Messasge  :", message.toString())
  const messageData = JSON.parse(message.toString());
  console.log("Messasge JSON : ", messageData)
  try {
    // Fetch all widgets associated with this device_id
    const widgetData = await widgetModel.getWidgetsByEntityId(
      device_id,
      client_id
    );
    

    // Save message to the history database
    await historialModel.saveMessage(device_id, client_id, null, messageData);

    if (widgetData) {
      if (widgetData.length > 0) {
        for (const widget of widgetData) {
          try {
            const config = widget.config_data;
            const selected_key = config.selected_key || null;
          
            // Send message to frontend through MQTT socket
            mqttSocket.emitMqttMessage({
              topic,
              client_id,
              data: messageData,
              widget_id: widget.widget_id,
            });
            console.log("Notification sent to frontend.");
          } catch (error) {
            console.error(
              `Error processing widget_id: ${widget.widget_id}`,
              error
            );
          }
        }
      } else {
        console.log(`No more than 0 widgets were found for device_id: ${device_id}`);
      }
    } else {
      console.log("No widgets found for device_id:", device_id);
    }

    // Handle alarms
    const alarms = await alarmModel.getAlarmsByDevice(device_id, client_id);
    if (alarms && alarms.length > 0) {
      for (const alarm of alarms) {
        const conditionMet = checkAlarmCondition(alarm, messageData);
        if (conditionMet) {
          await alarmModel.saveAlarmNotification(
            alarm[0].alarm_id,
            client_id,
            parseInt(messageData[alarm[0].selected_key])
          );

          mqttSocket.emitMqttMessage({
            status: "alarm",
            alarm_id: alarm.alarm_id,
            client_id,
            device_id,
            message: "Alarm triggered",
            data: messageData,
          });
          console.log(`Alarm notification registered`);
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving widget data:", error);
  }
});

/**
 * Checks if the alarm conditions are met based on the received data.
 * @param {Array} alarm - The alarm data
 * @param {Object} messageData - Message received from the MQTT topic
 * @returns {boolean} Whether the condition is met
 * @function
 * @memberof controllers.mqtt
 */
function checkAlarmCondition(alarm, messageData) {

  const value = parseFloat(messageData[alarm[0].selected_key]);
  const threshold = parseFloat(alarm[0].valor);

  if (isNaN(value) || isNaN(threshold)) {
    console.error("Invalid value or threshold.");
    return false;
  }

  if (alarm[0].alarm_condition === ">" && value > threshold) {
    console.log("Alarm condition met: Greater than threshold.");
    return true;
  } else if (alarm[0].alarm_condition === "<" && value < threshold) {
    console.log("Alarm condition met: Less than threshold.");
    return true;
  }

  console.log("No alarm condition met.");
  return false;
}

/**
 * Publishes a message to the MQTT broker after validating token existence.
 * @param {string} client_id - The client ID
 * @param {string} entity_id - The entity ID
 * @param {Object} message - Message to publish
 * @function
 * @memberof controllers.mqtt
 */
async function publishMessage(client_id, entity_id, message) {
  const [rows] = await entityModel.getToken(client_id, entity_id);

  if (rows.length > 0) {
    const token = rows[0].token;
    if (isValidToken(token)) {
      const topic = `users/${client_id}/entities/${entity_id}/message`;
      mqttClient.publish(topic, JSON.stringify(message), (err) => {
        if (err) console.error(`Error publishing message: ${err}`);
        else console.log(`Message published to topic: ${topic}`);
      });
    } else {
      console.error("Invalid token.");
    }
  }
}

module.exports = {
  subscribeToDevices,
  publishMessage,
};
