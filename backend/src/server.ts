// Import necessary modules
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import Message from "./models/Message"; // Import Message model to interact with MongoDB

// Load environment variables from .env file
dotenv.config();

// Set up MongoDB URI from environment variables or fallback to local URI
const MONGO_URI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/chat-app";

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);

// Initialize socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow connections from frontend running on this port
    methods: ["GET", "POST"], // Allow only GET and POST methods
  },
});

// Middleware to handle cross-origin requests
app.use(cors());

// Connect to MongoDB using the URI from environment variables
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB")) // Log success message on successful connection
  .catch((err: unknown) => {
    console.error("❌ MongoDB connection error:", err); // Log error if the connection fails
  });

// Socket.io event listener for a new connection
io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.id}`); // Log when a new user connects

  // Retrieve previous messages from the database and send to the connected user
  const messages = await Message.find().sort({ timestamp: 1 });
  socket.emit("previousMessages", messages); // Emit previous messages to the client

  // Event listener for new messages
  socket.on("message", async (data: { username: string; text: string }) => {
    // Create a new message in the database
    const newMessage = new Message(data);
    await newMessage.save(); // Save the new message to the database

    // Broadcast the new message to all connected clients
    io.emit("message", data); // Emit the message to all clients
  });

  // Event listener for when the user disconnects
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`); // Log when a user disconnects
  });
});

// Set the server to listen on a specific port (5000)
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // Log the server's URL when it starts
});
