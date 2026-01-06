import React, { useState, useRef, useEffect } from "react";
import "./TeamUp.css";

const ChatBox = ({ team, userDetails, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "leader",
      name: team?.leaderName || "Team Leader",
      message: "Hii!",
      timestamp: new Date(),
    },
    {
      id: 2,
      sender: "user",
      name: "You",
      message: "Hey! Thanks for reaching out. What's your tech stack?",
      timestamp: new Date(),
    },
    {
      id: 3,
      sender: "leader",
      name: team?.leaderName || "Team Leader",
      message: `I work with React, Node.js, and MongoDB.`,
      timestamp: new Date(),
    },
    {
      id: 4,
      sender: "user",
      name: "You",
      message: "That sounds perfect for our project!",
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "user",
        name: "You",
        message: inputMessage.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="chatbox-container">
      {/* Chat Header */}
      <div className="chatbox-header">
        <div className="chatbox-header-left">
          <div className="chatbox-avatar">
            {getInitials(team?.leaderName || "Team Leader")}
          </div>
          <div className="chatbox-header-info">
            <div className="chatbox-name">
              {team?.leaderName || "Team Leader"}
            </div>
            <div className="chatbox-status">
              <span className="status-dot"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
        <div className="chatbox-header-right">
          <button
            className="chatbox-control-btn"
            onClick={() => {
              // Maximize/restore functionality can be added here
            }}
            aria-label="Maximize"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3h10v10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className="chatbox-control-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="chatbox-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chatbox-message ${
              msg.sender === "user" ? "message-right" : "message-left"
            }`}
          >
            <div className="chatbox-message-bubble">
              <div className="chatbox-message-name">{msg.name}</div>
              <div className="chatbox-message-text">{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <form className="chatbox-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="chatbox-input"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
          type="submit"
          className="chatbox-send-btn"
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
