import { io, Socket } from "socket.io-client";

// In development, Vite proxies /socket.io to http://localhost:5000
const SERVER_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "/";

export const socket: Socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Connected to GPS Tracking Server. Socket ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.warn("Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from server:", reason);
});
