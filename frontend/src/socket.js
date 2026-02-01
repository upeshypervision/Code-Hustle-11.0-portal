console.log("SOCKET FILE LOADED");
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

console.log("SOCKET INIT CALLED");

socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("SOCKET CONNECT ERROR:", err);
});

export default socket;
