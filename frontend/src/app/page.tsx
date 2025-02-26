"use client"
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

export default function Chat() {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ username: string; text: string }[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      socket.emit("setUsername", username);
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { username, text: message });
      setMessage("");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      {!loggedIn ? (
        <div>
          <h2>Enter your username</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username..."
          />
          <button onClick={handleLogin}>Join Chat</button>
        </div>
      ) : (
        <div>
          <h1>Chat App</h1>
          <div style={{ border: "1px solid black", padding: "10px", minHeight: "200px" }}>
            {messages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.username}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ width: "80%", padding: "5px" }}
          />
          <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: "10px" }}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}
