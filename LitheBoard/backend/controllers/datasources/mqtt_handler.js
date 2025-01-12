const mqtt = require("mqtt");
require("dotenv").config();

let mqttClient = null;
const entityMap = new Map();

function initialize(entity, eventEmitter) {
    if (!mqttClient) {
            mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
            username: process.env.MQTT_USERNAME || "litheboard",
            password: process.env.MQTT_PASSWORD || "litheboard_password",
        });

        mqttClient.on("connect", () => {
            console.log("Connected to MQTT broker.");
        });

        mqttClient.on("reconnect", () => {
            console.log("Reconnecting to MQTT broker...");

        });

        mqttClient.on("error", (error) => {
            console.error("MQTT client error:", error);
        });

        mqttClient.on("message", (topic, message) => {
            try {
                const parts = topic.split("/");
                const client_id = parts[1];
                const device_id = parts[3];

                const entityKey = `${client_id}:${device_id}`;
                const entity = entityMap.get(entityKey);

                if (entity) {
                    const data = JSON.parse(message.toString());
                    eventEmitter.emit("datasourceEvent", {
                        entity,
                        data,
                        source: "MQTT",
                    });
                } else {
                    console.warn(`No entity found for topic: ${topic}`);
                }
            } catch (error) {
                console.error(`Error processing MQTT message from topic ${topic}:`, error);
            }
        });
    }

    const topic = `users/${entity.client_id}/devices/${entity.entity_id}/message/${entity.datasource_config.sub_topic}`;
    const entityKey = `${entity.client_id}:${entity.entity_id}`;

    if (!entityMap.has(entityKey)) {
        entityMap.set(entityKey, entity);

        mqttClient.subscribe(topic, (err) => {
            if (err) {
                console.error(`Error subscribing to topic ${topic}:`, err);
            } else {
                console.log(`Subscribed to topic: ${topic}`);
            }
        });
    }
}


module.exports = { initialize };
