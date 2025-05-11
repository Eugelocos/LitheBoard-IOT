import { io } from "socket.io-client";
import config from "@config";

const socket = io(`${config.BACKEND_URL}:${config.BACKEND_WS_PORT}`, {
    origin: `${config.FRONTEND_URL}:${config.BACKEND_WS_PORT}`,
    methods: ["GET", "POST"],      
    credentials: true,
});

export default socket;