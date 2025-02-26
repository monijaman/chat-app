import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import Message from "./models/Message"; // Import Message model

dotenv.config();

// MongoDB URI
const MONGO_URI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/chat-app";

// Create Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your client URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err: unknown) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Buffer to hold messages temporarily before saving
const messageBuffer: {
  username: string;
  text: string;
  topic: string;
  timestamp: Date;
}[] = [];
const BATCH_SIZE = 100; // Save after this many messages
const ARCHIVE_INTERVAL = 60000; // Archive every 1 minute

// Function to save messages in bulk to MongoDB
async function archiveMessages(messages: typeof messageBuffer) {
  try {
    await Message.insertMany(messages); // Save all buffered messages
    console.log(`Archived ${messages.length} messages`);
    messageBuffer.length = 0; // Clear the buffer after saving
  } catch (error) {
    console.error("Error archiving messages:", error);
  }
}

// Set up an interval to archive messages periodically
setInterval(() => {
  if (messageBuffer.length > 0) {
    archiveMessages(messageBuffer);
  }
}, ARCHIVE_INTERVAL);

// Socket.IO connection
io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send previous messages when a user connects
  socket.on("joinTopic", async (topic: string) => {
    const messages = await Message.find({ topic }).sort({ timestamp: 1 });
    socket.emit("previousMessages", messages);
  });

  // Handle incoming messages
  socket.on(
    "message",
    async (data: { username: string; text: string; topic: string }) => {
      messageBuffer.push({ ...data, timestamp: new Date() });

      // If buffer reaches the batch size, archive messages
      if (messageBuffer.length >= BATCH_SIZE) {
        await archiveMessages(messageBuffer);
      } else {
        console.log(`Buffer size: ${messageBuffer.length}`);
      }

      io.emit("message", data); // Broadcast to all clients
    }
  );

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Graceful shutdown to archive remaining messages
process.on("SIGINT", async () => {
  console.log("Server shutting down... Archiving remaining messages...");
  if (messageBuffer.length > 0) {
    await archiveMessages(messageBuffer);
  }
  process.exit();
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
