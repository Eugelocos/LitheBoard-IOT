/* The line `let io;` is declaring a variable named `io` using the `let` keyword in JavaScript. It is
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
 * The function `emitDataMessage` emits a "data_updated" event with the provided data using Socket.IO
 * if it is initialized.
 * @param data - The `data` parameter in the `emitDataMessage` function is the data that will be sent
 * along with the "data_updated" event when emitting it using Socket.IO. This data will be any sort of 
 * data that the backend has received previusly
 */
function emitDataMessage(data) {
  if (io) io.emit("data_updated", data);
};


/**
 * The function `emitEntityStateChange` emits a "state_updated" event with the provided data using
 * Socket.IO if it is initialized.
 * @param data - The `data` parameter in the `emitEntityStateChange` function is the information or
 * data that you want to emit to the clients when the entity state changes. This data could include any
 * relevant information about the state change that you want to send to the connected clients using
 * Socket.IO.
 */
function emitEntityStateChange({ entity_id, status }) {
  if (io) io.emit("entity_state_change", { entity_id, status });
}

module.exports = {
  init,
  emitDataMessage,
  emitEntityStateChange
};