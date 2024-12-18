import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
    origin: "http://localhost:3000", // Origen permitido
    methods: ["GET", "POST"],       // Métodos permitidos
    credentials: true,
});

export default socket;