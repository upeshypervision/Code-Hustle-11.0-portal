import React, { useState, useRef, useEffect } from "react";
import socket from "../../socket";
import "./Indi.css";

const ChatBox = ({ team, userDetails, userType, onClose }) => {
  // Determine display name and IDs based on user type
  const isIndividual = userType === "individual";
  const displayName = isIndividual
    ? team?.teamName ||
      team?.name ||
      team?.leaderName ||
      team?.full_name ||
      "Chat Partner"
    : team?.full_name || team?.name || "Chat Partner";

  const userId = isIndividual ? userDetails?.id : userDetails?.teamId;
  const partnerId = isIndividual
    ? team?.teamId || team?.team_id
    : team?.individual_id || team?.id;
  const partnerType = isIndividual ? "team" : "individual";

  // Generate conversation ID
  const conversationId = isIndividual
    ? `CONV_${partnerId}_${userId}`
    : `CONV_${userId}_${partnerId}`;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/chat/history/${conversationId}`,
          {
            credentials: "include",
          },
        );

        const data = await response.json();

        if (response.ok && data.success) {
          const formattedMessages = data.messages.map((msg) => ({
            id: msg.message_id,
            sender: msg.sender_type === userType ? "user" : "partner",
            name: msg.sender_type === userType ? "You" : displayName,
            message: msg.message,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(formattedMessages);
        } else {
          setError(data.error || "Failed to load chat history");
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setError("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [conversationId, userType, displayName]);

  // Join chat room and set up Socket.IO listeners
  useEffect(() => {
    // Join the chat room
    socket.emit("join_chat_room", { conversation_id: conversationId });

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.conversation_id === conversationId) {
        const newMessage = {
          id: data.message_id,
          sender: data.sender_type === userType ? "user" : "partner",
          name: data.sender_type === userType ? "You" : displayName,
          message: data.message,
          timestamp: new Date(data.timestamp),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    // Listen for typing indicators
    const handleTyping = (data) => {
      if (
        data.conversation_id === conversationId &&
        data.sender_type !== userType
      ) {
        setPartnerTyping(data.is_typing);
      }
    };

    socket.on("new_chat_message", handleNewMessage);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("new_chat_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
    };
  }, [conversationId, userType, displayName]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Emit typing indicator
    socket.emit("typing_indicator", {
      conversation_id: conversationId,
      sender_type: userType,
      is_typing: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_indicator", {
        conversation_id: conversationId,
        sender_type: userType,
        is_typing: false,
      });
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setSending(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipient_id: partnerId,
          recipient_type: partnerType,
          message: messageText,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Message will be added via Socket.IO event
        setInputMessage("");

        // Stop typing indicator
        socket.emit("typing_indicator", {
          conversation_id: conversationId,
          sender_type: userType,
          is_typing: false,
        });
      } else {
        if (response.status === 429) {
          setError(
            "You're sending messages too quickly. Please wait a moment.",
          );
        } else {
          setError(data.error || "Failed to send message");
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
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
    <div
      className={`chatbox-container ${isMaximized ? "chatbox-maximized" : ""}`}
    >
      {/* Chat Header */}
      <div className="chatbox-header">
        <div className="chatbox-header-left">
          <div className="chatbox-avatar">{getInitials(displayName)}</div>
          <div className="chatbox-header-info">
            <div className="chatbox-name">{displayName}</div>
            <div className="chatbox-status">
              <span className="status-dot"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
        <div className="chatbox-header-right">
          <button
            className="chatbox-control-btn"
            onClick={() => setIsMaximized(!isMaximized)}
            aria-label={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="6"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="6"
                  y="2"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="12"
                  height="12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 2V6H2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 14V10H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
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
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}
          >
            Loading messages...
          </div>
        ) : error && messages.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#ef4444" }}
          >
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}
          >
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
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
          ))
        )}
        {partnerTyping && (
          <div className="chatbox-message message-left">
            <div
              className="chatbox-message-bubble"
              style={{ fontStyle: "italic", opacity: 0.7 }}
            >
              <div className="chatbox-message-text">typing...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && messages.length > 0 && (
        <div
          style={{
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontSize: "0.85rem",
            borderTop: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Chat Input Area */}
      <form className="chatbox-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="chatbox-input"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={handleInputChange}
          disabled={sending}
        />
        <button
          type="submit"
          className="chatbox-send-btn"
          aria-label="Send message"
          disabled={sending || !inputMessage.trim()}
          style={{
            opacity: sending || !inputMessage.trim() ? 0.5 : 1,
            cursor: sending || !inputMessage.trim() ? "not-allowed" : "pointer",
          }}
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
