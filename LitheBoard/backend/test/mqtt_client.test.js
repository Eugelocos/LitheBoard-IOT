require("dotenv").config();
const mqtt = require("mqtt");
const readline = require("readline");

const TEST_CLIENT_ID = "4";
const TEST_ENTITY_ID = "228";
const TEST_SUB_TOPIC = `pr3pu`;
const TEST_SYNC_TOPIC = `users/${TEST_CLIENT_ID}/devices/${TEST_ENTITY_ID}/sync`;
const TEST_REQUEST_TOPIC = `users/${TEST_CLIENT_ID}/devices/${TEST_ENTITY_ID}/requestState`;

let mqttClient = null;
let simulatedState = { temperature: 25, humidity: 50 };
let isDisconnected = false;

function initializeTestClient() {
    mqttClient = mqtt.connect("mqtt://tongavla.mooo.com:47851", {
        username: "litheboard_admin",
        password: "pepelithe",
    });

    mqttClient.on("connect", () => {
        console.log("Device connected to MQTT broker.");
        publishReconnectionStatus();
        subscribeToTestTopics();
        startSendingHeartbeat();
    });

    mqttClient.on("reconnect", () => {
        console.log("Reconnecting to MQTT broker...");
        if (!isDisconnected) {
            simulatePlatformSync();
        }
    });

    mqttClient.on("message", (topic, message) => {
        handleTestMessage(topic, message);
    });

    mqttClient.on("error", (error) => {
        console.error("Test client MQTT error:", error);
    });
}

function publishReconnectionStatus() {
    const statusTopic = `users/${TEST_CLIENT_ID}/devices/${TEST_ENTITY_ID}/status`;
    mqttClient.publish(statusTopic,JSON.stringify({ type: "status", message: "reconnected" }), { retain: true }, (err) => {
        if (err) {
            console.error(`Error publishing reconnection status to ${statusTopic}:`, err);
        } else {
            console.log(`Published reconnection status to ${statusTopic}: reconnected`);
        }
    });
}

function subscribeToTestTopics() {
    const topics = [
        `users/${TEST_CLIENT_ID}/devices/${TEST_ENTITY_ID}/heartbeat`,
        TEST_SYNC_TOPIC,
        TEST_REQUEST_TOPIC
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

function handleTestMessage(topic, message) {
    if (topic === TEST_SYNC_TOPIC) {
        console.log("Received sync request. State:", message.toString());
    } else if (topic === TEST_REQUEST_TOPIC) {
        console.log("Received state request from platform.");
        simulateDeviceStatePublish();
    }
}

function startSendingHeartbeat() {
    const heartbeatTopic = `users/${TEST_CLIENT_ID}/devices/${TEST_ENTITY_ID}/heartbeat`;

    setInterval(() => {
        if (!isDisconnected) {
            mqttClient.publish(heartbeatTopic, JSON.stringify({ type: "heartbeat", message: "ping" }), (err) => {
                if (err) {
                    console.error(`Error sending heartbeat to ${heartbeatTopic}:`, err);
                } else {
                    console.log(`Sent heartbeat to ${heartbeatTopic}`);
                }
            });
        }
    }, 60 * 1000);
}

function simulateDeviceStatePublish() {
    const publishTopic = `users/${TEST_CLIENT_ID}/devices/${TEST_ENTITY_ID}/message/${TEST_SUB_TOPIC}`;
    mqttClient.publish(publishTopic, JSON.stringify(simulatedState), (err) => {
        if (err) {
            console.error(`Error publishing simulated state to ${publishTopic}:`, err);
        } else {
            console.log(`Published simulated state to ${publishTopic}:`, simulatedState);
        }
    });
}

function simulatePlatformSync() {
    console.log("Simulating platform sync...");
    mqttClient.publish(TEST_SYNC_TOPIC, JSON.stringify(simulatedState), { retain: true }, (err) => {
        if (err) {
            console.error(`Error publishing sync state to ${TEST_SYNC_TOPIC}:`, err);
        } else {
            console.log(`Published sync state to ${TEST_SYNC_TOPIC}:`, simulatedState);
        }
    });
}

function disconnectClient() {
    console.log("Manually disconnecting MQTT client...");
    isDisconnected = true;
    simulatedState.temperature+=5;
    mqttClient.end(() => {
        console.log("MQTT client disconnected.");
    });
}

function reconnectClient() {
    console.log("Manually reconnecting MQTT client...");
    isDisconnected = false;
    initializeTestClient();
}

function runTestClient() {
    initializeTestClient();
    startMenu();
}

function startMenu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    function showMenu() {
        console.log("\nMenu:");
        console.log("1. Disconnect client");
        console.log("2. Reconnect client");
        console.log("3. Exit");

        rl.question("Choose an option: ", (answer) => {
            switch (answer) {
                case "1":
                    disconnectClient();
                    break;
                case "2":
                    reconnectClient();
                    break;
                case "3":
                    rl.close();
                    process.exit();
                default:
                    console.log("Invalid option, please try again.");
            }
            showMenu();
        });
    }

    showMenu();
}

runTestClient();
