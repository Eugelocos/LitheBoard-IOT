/* The line `let io;` is declaring a variable named `io` using the `let` keyword in JavaScript. This
variable is being declared but not initialized with a value, so it is currently `undefined`. It is
intended to be used to store a reference to a Socket.IO connection once it is initialized in
the `init` function. */
let io;



/**
 * The `init` function initializes a socket.io connection by setting the `io` variable to the provided
 * `socketIo` parameter.
 * @param {object} socketIo - Socket.IO is a JavaScript library for real-time web applications. It enables
 * real-time, bidirectional and event-based communication between clients and servers.
 */
function init(socketIo) {
  io = socketIo;
}

/**
 * The function `emitMqttMessage` emits a MQTT message through Socket.IO and logs the message to the
 * console if Socket.IO is initialized.
 * @param {object} data - The `data` parameter in the `emitMqttMessage` function represents the message or data
 * that you want to emit via MQTT (Message Queuing Telemetry Transport) protocol using Socket.IO. This
 * data could be any information or payload that you want to send to the MQTT broker for further
 * processing or
 */
function emitMqttMessage(data) {
  if (io) {
    io.emit("mqtt_message", data);
    console.log("Mensaje MQTT emitido a través de Socket.IO:", data);
  } else {
    console.error("Socket.IO no está inicializado.");
  }
};

module.exports = {
  init,
  emitMqttMessage
};