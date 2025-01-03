import { io } from "socket.io-client";
import config from "@config";

const socket = io('localhost:3007', {
    origin: `${config.FRONTEND_URL}:${config.FRONTEND_PORT}`,
    methods: ["GET", "POST"],      
    credentials: true,
});

export default socket;