import { io } from "socket.io-client";


const socket = io('http://tonga.mooo.com:3000', {
    origin: `http://tonga.mooo.com:3010`,
    methods: ["GET", "POST"],      
    credentials: true,
});

export default socket;