import React, { useState, useEffect } from "react";
import "./ViewTeams.css";

const ViewChatMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedConversations, setExpandedConversations] = useState({});

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/view-chat-messages",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching chat conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConversation = (conversationId) => {
    setExpandedConversations((prev) => ({
      ...prev,
      [conversationId]: !prev[conversationId],
    }));
  };

  const filteredConversations = conversations.filter((conv) => {
    const search = searchTerm.toLowerCase();
    const p1Name = conv.participant1?.name || "";
    const p2Name = conv.participant2?.name || "";

    return (
      p1Name.toLowerCase().includes(search) ||
      p2Name.toLowerCase().includes(search) ||
      conv.conversationId.toLowerCase().includes(search) ||
      conv.messages.some((msg) => msg.message.toLowerCase().includes(search))
    );
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="view-teams-container">
      <div className="navy-header">
        <h2 className="navy-title">Chat Conversations</h2>
        <p className="navy-subtitle">
          View all chat conversations between individuals and teams
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by participant name or message..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 15px",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "14px",
            width: "100%",
            maxWidth: "400px",
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading conversations...
        </div>
      ) : (
        <div>
          {filteredConversations.map((conv) => {
            const isExpanded = expandedConversations[conv.conversationId];
            const participant1 = conv.participant1 || {
              name: "Individual",
              type: "Individual",
            };
            const participant2 = conv.participant2 || {
              name: "Team",
              type: "Team",
            };

            return (
              <div key={conv.conversationId} className="team-card">
                <div
                  className="team-summary"
                  onClick={() => toggleConversation(conv.conversationId)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* Chevron Icon */}
                    <div
                      style={{
                        transition: "transform 0.2s ease",
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        display: "flex",
                        alignItems: "center",
                        color: "#64748b",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    <div className="ts-main">
                      <h3 className="ts-header">
                        {participant1.name} ↔{" "}
                        {participant2.type === "Team"
                          ? `🏆 ${participant2.name}`
                          : participant2.name}
                      </h3>
                      <div className="ts-meta">
                        <span>
                          {conv.totalMessages} message
                          {conv.totalMessages !== 1 ? "s" : ""}
                        </span>
                        {conv.lastMessageTime && (
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            Last: {formatTimestamp(conv.lastMessageTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {conv.unreadCount > 0 && (
                      <span className="status-badge status-pending">
                        {conv.unreadCount} UNREAD
                      </span>
                    )}

                    <span className="status-badge status-paid">
                      {participant1.type}
                    </span>

                    <span className="status-badge status-manual">
                      {participant2.type}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="team-details">
                    <div
                      className="detail-grid"
                      style={{ gridTemplateColumns: "1fr" }}
                    >
                      <div
                        style={{
                          background: "#1e293b",
                          padding: "20px",
                          borderRadius: "12px",
                        }}
                      >
                        <h4
                          style={{
                            color: "#e2e8f0",
                            margin: "0 0 15px 0",
                            fontSize: "14px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            paddingBottom: "10px",
                            borderBottom: "1px solid #334155",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          CONVERSATION THREAD ({conv.totalMessages} messages)
                        </h4>

                        {/* Messages List */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            maxHeight: "500px",
                            overflowY: "auto",
                            padding: "10px 0",
                          }}
                        >
                          {conv.messages.map((msg, idx) => {
                            const isTeam = msg.senderType === "team";

                            return (
                              <div
                                key={msg.messageId || idx}
                                style={{
                                  display: "flex",
                                  justifyContent: isTeam
                                    ? "flex-end"
                                    : "flex-start",
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    background: isTeam
                                      ? "rgba(59, 130, 246, 0.15)"
                                      : "#0f172a",
                                    padding: "12px 16px",
                                    borderRadius: "12px",
                                    border: `1px solid ${
                                      isTeam
                                        ? "rgba(59, 130, 246, 0.3)"
                                        : "#334155"
                                    }`,
                                    maxWidth: "75%",
                                    position: "relative",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      marginBottom: "8px",
                                      gap: "12px",
                                    }}
                                  >
                                    <div>
                                      <span
                                        style={{
                                          color: isTeam ? "#60a5fa" : "#f8fafc",
                                          fontWeight: "600",
                                          fontSize: "13px",
                                        }}
                                      >
                                        {msg.senderName}
                                      </span>
                                      <span
                                        style={{
                                          color: "#64748b",
                                          fontSize: "10px",
                                          marginLeft: "6px",
                                          textTransform: "uppercase",
                                          fontWeight: "600",
                                        }}
                                      >
                                        ({isTeam ? "TEAM" : "INDIVIDUAL"})
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {!msg.read && (
                                        <span
                                          style={{
                                            background: "#f59e0b",
                                            color: "#0f172a",
                                            fontSize: "9px",
                                            padding: "2px 5px",
                                            borderRadius: "3px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          NEW
                                        </span>
                                      )}
                                      <span
                                        style={{
                                          color: "#94a3b8",
                                          fontSize: "10px",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {formatTimestamp(msg.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      color: "#cbd5e1",
                                      fontSize: "14px",
                                      lineHeight: "1.5",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    {msg.message}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              No conversations found.
            </div>
          )}
        </div>
      )}

      {!loading && conversations.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#0f172a",
            borderRadius: "8px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          Total Conversations:{" "}
          <strong style={{ color: "#e2e8f0" }}>{conversations.length}</strong>
        </div>
      )}
    </div>
  );
};

export default ViewChatMessages;
