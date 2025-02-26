"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

// Predefined list of topics
const predefinedTopics = ["Technology", "Sports", "Music", "Movies", "Travel"];

export default function Chat() {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ username: string; text: string }[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");

  useEffect(() => {
    // Listen for previous messages when the user joins a topic
    socket.on("previousMessages", (oldMessages) => {
      setMessages(oldMessages);
    });

    // Listen for new messages in the room
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("message");
      socket.off("previousMessages");
    };
  }, []);

  const handleLogin = () => {
    if (username.trim() && topic.trim()) {
      socket.emit("joinRoom", topic); // Join the selected topic room
      socket.emit("setUsername", username); // Set the username for the chat
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { username, text: message, topic }); // Send message to the room
      setMessage("");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-lg">
      {!loggedIn ? (
        <div className="text-center">
          <h2 className="text-2xl text-black font-bold mb-4">Enter your username and select a topic</h2>

          {/* Username input field */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username..."
            className="w-3/4 p-2 border border-gray-300 rounded-md mb-4"
          />

          {/* Predefined topics list */}
          <div className="mb-4">
            <h3 className="text-xl text-black font-medium">Select a Topic:</h3>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {predefinedTopics.map((topicOption) => (
                <button
                  key={topicOption}
                  onClick={() => setTopic(topicOption)}
                  className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-500 hover:text-white transition ${topic === topicOption ? "bg-blue-500 text-white" : ""
                    }`}
                >
                  {topicOption}
                </button>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-3/4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            disabled={!username.trim() || !topic}
          >
            Join Chat
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-semibold text-center mb-6">Chat App - {topic}</h1>

          {/* Chat messages display */}
          <div className="border border-gray-300 p-4 mb-4 rounded-md max-h-[300px] overflow-y-auto">
            {messages.map((msg, index) => (
              <p key={index} className="mb-2">
                <strong className="text-blue-600">{msg.username}:</strong> {msg.text}
              </p>
            ))}
          </div>

          {/* Message input */}
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-4/5 p-2 text-black border border-gray-300 rounded-md mr-2"
            />
            <button
              onClick={sendMessage}
              className="w-1/5 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
