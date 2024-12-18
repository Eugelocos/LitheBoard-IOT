// /sockets/socket.js
const { Server } = require("socket.io");

/* This code snippet is a module that exports a function. When this function is called with a `server`
parameter, it creates a new instance of a Socket.IO server using the `Server` class. The server is
configured with CORS settings to allow requests from a specific origin (`http://localhost:3000`),
specify allowed methods (`GET` and `POST`), and enable credentials. */
module.exports = function (server) {
  const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Origen permitido
        methods: ["GET", "POST"],       // Métodos permitidos
        credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    
    // Eventos comunes de Socket.IO
    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};
