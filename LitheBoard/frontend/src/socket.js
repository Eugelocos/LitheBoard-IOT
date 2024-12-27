import { io } from "socket.io-client";


const socket = io('backend:3007', {
    origin: `backend:3010`,
    methods: ["GET", "POST"],      
    credentials: true,
});

export default socket;