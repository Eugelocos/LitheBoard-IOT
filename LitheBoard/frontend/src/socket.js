import { io } from "socket.io-client";
import config from "@config";

const socket = io(`${config.BACKEND_URL}:${config.BACKEND_WS_PORT}`, {
    autoConnect: false,
    withCredentials: true,
    credentials: true,
    auth: (callback) => callback({ token: localStorage.getItem("token") }),
});
export default socket;
