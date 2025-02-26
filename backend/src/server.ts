import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("setUsername", (username: string) => {
    socket.data.username = username;
    console.log(`User ${socket.id} set their name as ${username}`);
  });

  socket.on("message", (data: { username: string; text: string }) => {
    console.log("Message received:", data);
    io.emit("message", data); // Broadcast with username
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
