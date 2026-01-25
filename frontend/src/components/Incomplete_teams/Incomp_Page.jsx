import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeamUpNavbar from "./TeamUpNavbar";
import "../../styles/global.css";
import "../Individual-Member/Indi.css";
import "./Incomp_Page.css";
import "./Incomp_Page_Mobile.css";
import RequestedIndividual from "./RequestedIndividual"; // Fixed import path from prev step
import { sanitizeText } from "../../utils/sanitizer";
import NotificationBadge from "../NotificationBadge";
import socket from "../../socket";
import ChatBox from "../Individual-Member/ChatBox";
import indiBg from "../../assets/indi-bg.png";

const Incomp_Page = () => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  // Notification State
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const API_BASE = "http://localhost:5000";

  const [activeView, setActiveView] = useState("details");

  const initialTeamData = {
    teamId: "",
    teamName: "Loading...",
    teamVision: "",
    visible: false, // Team visibility status (default hidden for new teams)
    leader: {
      name: "",
      details: "",
      university: "",
      sapId: "",
      email: "",
      phone: "",
      isUPESHypervision: false,
    },
    members: [],
    joinedMembers: [],
    joinRequests: [],
  };

  const [teamData, setTeamData] = useState(initialTeamData);
  const totalCount =
    1 +
    (teamData.members ? teamData.members.length : 0) +
    (teamData.joinedMembers ? teamData.joinedMembers.length : 0);

  // Socket listener for new join requests
  useEffect(() => {
    if (!teamData.teamId) return;

    // Join team room
    socket.emit("join_room", { room: `team_${teamData.teamId}` });
    console.log(`Joined room: team_${teamData.teamId}`);

    // Listen for new join requests
    const handleNewRequest = (data) => {
      console.log("New join request received!", data);
      showNotification(
        `📩 New join request from ${data.individualName}!`,
        "info",
      );
      // Refresh to show new request
      window.location.reload();
    };

    socket.on("new_join_request", handleNewRequest);

    return () => {
      socket.off("new_join_request", handleNewRequest);
    };
  }, [teamData.teamId]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/team-details`, {
          credentials: "include",
        });

        if (response.status === 401) {
          const errData = await response.json();
          console.error("Team Auth Error:", errData);
          showNotification(
            `Authentication Failed: ${errData.error || "Unknown Error"}`,
            "error",
          );
          // navigate('/team-login'); // Disabled for debugging
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch team data");

        const data = await response.json();
        setTeamData((prev) => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Error loading team data:", error);
        showNotification(`Error: ${error.message}`, "error");
      }
    };

    const fetchJoinRequests = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/team/join-requests`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTeamData((prev) => ({ ...prev, joinRequests: data.requests }));
          }
        }
      } catch (error) {
        console.error("Error loading join requests:", error);
      }
    };

    fetchTeamData();
    fetchJoinRequests();
  }, [navigate]);

  const handleChatOpen = (target) => {
    setChatTarget(target);
    if (selectedRequest) closeRequestModal();
  };

  const handleDeleteClick = (member) => {
    // For original members (no individual_id), delete directly (no confirmation for small things)
    if (!member.individual_id) {
      deleteOriginalMember(member);
    } else {
      // For accepted members (have individual_id), show reason modal
      setMemberToDelete(member);
      setDeleteReason("");
    }
  };

  const deleteOriginalMember = async (member) => {
    try {
      const response = await fetch(`${API_BASE}/api/team-member/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: member.email,
          reason: "Original team member removed by team leader", // Default reason for backend
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("Member removed successfully.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification(result.error || "Failed to remove member", "error");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification("Failed to remove member", "error");
    }
  };

  const cancelDeleteMember = () => {
    setMemberToDelete(null);
    setDeleteReason("");
  };

  // Visibility Warning State
  const [showVisibilityWarning, setShowVisibilityWarning] = useState(false);

  // New Toggle Handler (Intercepts "ON" action)
  const handleToggleClick = () => {
    if (!teamData.visible) {
      // If currently hidden, we are turning it ON -> Show Warning
      setShowVisibilityWarning(true);
    } else {
      // If currently visible, we are turning it OFF -> Proceed directly
      toggleTeamVisibility();
    }
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    // Word count validation (min 15 words)
    const wordCount = deleteReason
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    if (wordCount < 15) {
      showNotification(
        "Please provide a reason of at least 15 words.",
        "error",
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/team-member/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          individual_id: memberToDelete.individual_id,
          reason: deleteReason,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("Member removed successfully.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification(result.error || "Failed to remove member", "error");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification("Failed to remove member", "error");
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/team/accept-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ individual_id: id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Emit socket event to notify individual
        socket.emit("request_accepted", {
          individualId: id,
          teamName: teamData.teamName,
        });

        // Remove from joinRequests and refresh team data
        setTeamData((prev) => ({
          ...prev,
          joinRequests: prev.joinRequests.filter((req) => req.id !== id),
        }));
        showNotification(
          "Request accepted successfully! Member added to team.",
          "success",
        );
        // Refresh team data to get updated member count
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showNotification(data.error || "Failed to accept request", "error");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      showNotification("Failed to accept request", "error");
    }
    closeRequestModal();
  };

  const handleRejectRequest = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/team/reject-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ individual_id: id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Emit socket event to notify individual
        socket.emit("request_rejected", {
          individualId: id,
          teamName: teamData.teamName,
        });

        setTeamData((prev) => ({
          ...prev,
          joinRequests: prev.joinRequests.filter((req) => req.id !== id),
        }));
        showNotification("Request rejected successfully", "success");
      } else {
        showNotification(data.error || "Failed to reject request", "error");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showNotification("Failed to reject request", "error");
    }
    closeRequestModal();
  };

  const handleViewRequest = (request) => setSelectedRequest(request);
  const closeRequestModal = () => setSelectedRequest(null);

  const handleViewMember = (member) => setSelectedMember(member);
  const closeMemberModal = () => {
    setSelectedMember(null);
  };

  const toggleTeamVisibility = async () => {
    // If warning is open, close it (we are proceeding)
    if (showVisibilityWarning) setShowVisibilityWarning(false);

    try {
      const response = await fetch(
        `${API_BASE}/api/team/toggle-visibility/${teamData.teamId}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (response.ok) {
        setTeamData((prev) => ({ ...prev, visible: data.visible }));
        showNotification(
          `Team is now ${data.visible ? "visible" : "hidden"} to individuals`,
          data.visible ? "success" : "error", // Red for hidden, Green for visible
        );
      } else {
        showNotification(data.error || "Failed to toggle visibility", "error");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      showNotification("Failed to toggle visibility", "error");
    }
  };

  return (
    <div
      className="dashboard-page team-up-page-container"
      style={{
        minHeight: "100vh",
        background: "#0a0b1e",
        paddingTop: "70px",
        position: "relative",
      }}
    >
      {/* --- FIXED BACKGROUND --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${indiBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: "1",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(circle at 40% 70%, transparent 10%, rgba(20, 16, 16, 0.42) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <TeamUpNavbar
        teamName={teamData.teamName || "TEAM"}
        activeTab={activeView}
        setActiveTab={setActiveView}
        showTeamDetails={showProfile}
        setShowTeamDetails={setShowProfile}
      />

      <div
        className="admin-content dashboard-container"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="teamup-layout">
          {/* MAIN CONTENT AREA */}
          <div
            className="teams-content-section"
            style={{ width: "100%", maxWidth: "100%" }}
          >
            {/* View Switching Toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "rgba(22, 28, 51, 0.5)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "30px",
                  padding: "4px",
                  display: "flex",
                  gap: "4px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <button
                  onClick={() => setActiveView("details")}
                  style={{
                    background:
                      activeView === "details"
                        ? "rgba(56, 189, 248, 0.2)"
                        : "transparent",
                    color: activeView === "details" ? "#38bdf8" : "#94a3b8",
                    border: "none",
                    padding: "8px 24px",
                    borderRadius: "24px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.8rem",
                    transition: "all 0.3s ease",
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: "1px",
                  }}
                >
                  TEAM DETAILS
                </button>
                <button
                  onClick={() => setActiveView("requests")}
                  style={{
                    background:
                      activeView === "requests"
                        ? "rgba(56, 189, 248, 0.2)"
                        : "transparent",
                    color: activeView === "requests" ? "#38bdf8" : "#94a3b8",
                    border: "none",
                    padding: "8px 24px",
                    borderRadius: "24px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.8rem",
                    transition: "all 0.3s ease",
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  REQUESTS
                  {teamData.joinRequests &&
                    teamData.joinRequests.length > 0 && (
                      <span
                        style={{
                          background: "#ef4444",
                          color: "white",
                          borderRadius: "12px",
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          lineHeight: "1",
                        }}
                      >
                        {teamData.joinRequests.length}
                      </span>
                    )}
                </button>
              </div>
            </div>

            {activeView === "details" && (
              <div
                className="desktop-layout-container animate-enter"
                style={{
                  display: "flex",
                  gap: "0",
                  width: "100%",
                  alignItems: "flex-start",
                  background: "rgba(22, 28, 51, 0.3)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "24px",
                }}
              >
                {/* LEFT SIDEBAR (Desktop Only) */}
                <div
                  className="desktop-sidebar desktop-only"
                  style={{
                    width: "350px",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    position: "sticky",
                    top: "100px",
                  }}
                >
                  <span
                    className="label-detail teamup-label"
                    style={{
                      width: "100%",
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    TEAM DETAILS
                  </span>

                  {/* Team Info Card */}
                  <div
                    className="team-details-card neural-node"
                    style={{
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      background: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div>
                      <h3
                        className="user-profile-header"
                        style={{
                          fontSize: "1.8rem",
                          color: "#ffffff",
                          margin: "0 0 6px 0",
                          fontWeight: "600",
                          lineHeight: "1.3",
                          wordBreak: "break-word",
                        }}
                      >
                        {sanitizeText(teamData.teamName, 100) || "Loading..."}
                      </h3>
                      <p
                        className="user-profile-sub"
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.85rem",
                          margin: "0",
                          lineHeight: "1.4",
                        }}
                      >
                        ID: {sanitizeText(teamData.teamId, 50)}
                      </p>
                    </div>

                    {/* Visibility Toggle */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          letterSpacing: "0.5px",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          backgroundColor: teamData.visible
                            ? "rgba(34, 197, 94, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          color: teamData.visible ? "#4ade80" : "#f87171",
                          border: `1px solid ${
                            teamData.visible
                              ? "rgba(34, 197, 94, 0.3)"
                              : "rgba(239, 68, 68, 0.3)"
                          }`,
                        }}
                      >
                        {teamData.visible ? "VISIBLE" : "HIDDEN"}
                      </span>
                      <label
                        className="visibility-toggle"
                        title="Toggle Visibility"
                        style={{ marginBottom: 0 }}
                      >
                        <input
                          type="checkbox"
                          checked={teamData.visible || false}
                          onChange={handleToggleClick}
                        />
                        <span className="visibility-slider"></span>
                      </label>
                    </div>
                  </div>

                  {/* Team Vision Card */}
                  <div
                    className="team-details-card neural-node"
                    style={{
                      padding: "24px",
                      background: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <strong
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                        display: "block",
                        marginBottom: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        fontWeight: "600",
                      }}
                    >
                      TEAM VISION
                    </strong>
                    <p
                      style={{
                        fontStyle: "italic",
                        margin: "0",
                        fontSize: "0.95rem",
                        color: "#cbd5e1",
                        lineHeight: "1.6",
                      }}
                    >
                      {sanitizeText(teamData.teamVision, 500) ||
                        "No vision provided"}
                    </p>
                  </div>
                </div>

                {/* DIVIDER (Desktop Only) */}
                <div
                  className="desktop-only"
                  style={{
                    width: "1px",
                    background:
                      "linear-gradient(to bottom, transparent, rgba(148, 163, 184, 0.3), transparent)",
                    alignSelf: "stretch",
                    margin: "0 24px",
                  }}
                ></div>

                {/* MAIN CONTENT (Flex 1) */}
                <div
                  className="main-content"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* MOBILE HEADER (Mobile Only) */}
                  <div
                    className="team-details-card mobile-only neural-node"
                    style={{
                      padding: "24px",
                      marginBottom: "30px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      background: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <h3
                        className="user-profile-header"
                        style={{
                          fontSize: "1.8rem",
                          color: "#ffffff",
                          margin: "0 0 6px 0",
                          fontWeight: "600",
                          lineHeight: "1.3",
                          textAlign: "center",
                        }}
                      >
                        {sanitizeText(teamData.teamName, 100) || "Loading..."}
                      </h3>
                      <p
                        className="user-profile-sub"
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.9rem",
                          margin: "0 0 16px 0",
                          lineHeight: "1.4",
                          textAlign: "center",
                        }}
                      >
                        ID: {sanitizeText(teamData.teamId, 50)}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            letterSpacing: "0.5px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: teamData.visible
                              ? "rgba(34, 197, 94, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                            color: teamData.visible ? "#4ade80" : "#f87171",
                            border: `1px solid ${
                              teamData.visible
                                ? "rgba(34, 197, 94, 0.3)"
                                : "rgba(239, 68, 68, 0.3)"
                            }`,
                          }}
                        >
                          {teamData.visible ? "VISIBLE" : "HIDDEN"}
                        </span>
                        <label
                          className="visibility-toggle"
                          title="Toggle Visibility"
                          style={{ marginBottom: 0 }}
                        >
                          <input
                            type="checkbox"
                            checked={teamData.visible || false}
                            onChange={handleToggleClick}
                          />
                          <span className="visibility-slider"></span>
                        </label>
                      </div>
                    </div>
                    <div
                      style={{
                        height: "1px",
                        background: "rgba(255, 255, 255, 0.1)",
                        width: "100%",
                      }}
                    ></div>
                    <div>
                      <strong
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.85rem",
                          display: "block",
                          marginBottom: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "1.5px",
                          fontWeight: "600",
                          textAlign: "center",
                        }}
                      >
                        TEAM VISION
                      </strong>
                      <p
                        style={{
                          fontStyle: "italic",
                          margin: "0",
                          fontSize: "1rem",
                          color: "#cbd5e1",
                          lineHeight: "1.6",
                          textAlign: "center",
                        }}
                      >
                        {sanitizeText(teamData.teamVision, 500) ||
                          "No vision provided"}
                      </p>
                    </div>
                  </div>

                  {/* REST OF CONTENT - Leader, Members */}
                  <span
                    className="label-detail teamup-label"
                    style={{
                      marginBottom: "24px",
                      width: "100%",
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    TEAM LEADER
                  </span>
                  <div
                    className="team-header-wrapper neural-node"
                    style={{
                      padding: "24px",
                      marginBottom: "30px",
                      background: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "20px",
                      }}
                    >
                      <div style={{ flex: "1", minWidth: "200px" }}>
                        <h1
                          className="team-header-main"
                          style={{ margin: "0 0 4px 0", fontSize: "1.8rem" }}
                        >
                          {sanitizeText(teamData.leader.name, 100)}
                        </h1>
                        <p
                          style={{
                            color: "#94a3b8",
                            margin: "0",
                            fontSize: "1rem",
                          }}
                        >
                          {sanitizeText(teamData.leader.university, 200)} •{" "}
                          {sanitizeText(teamData.leader.sapId, 50)}
                        </p>
                      </div>
                      <div style={{ textAlign: "left", minWidth: "200px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            color: "#fff",
                            fontSize: "0.9rem",
                            marginBottom: "4px",
                            gap: "8px",
                          }}
                        >
                          <span style={{ color: "#94a3b8" }}>Email:</span>
                          <span>
                            {sanitizeText(teamData.leader.email, 100)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            color: "#fff",
                            fontSize: "0.9rem",
                            gap: "8px",
                          }}
                        >
                          <span style={{ color: "#94a3b8" }}>Phone:</span>
                          <span>{sanitizeText(teamData.leader.phone, 20)}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <strong
                          style={{
                            color: "#aaa",
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          LEADER BIO / SKILLS:
                        </strong>
                      </div>
                      <p
                        style={{
                          color: "#ddd",
                          margin: "0",
                          fontStyle: "italic",
                          fontSize: "0.95rem",
                          lineHeight: "1.5",
                        }}
                      >
                        {sanitizeText(teamData.leader.details, 500) ||
                          "No details provided"}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <span
                      className="label-detail teamup-label members-list-label"
                      style={{
                        width: "100%",
                        textAlign: "center",
                        display: "block",
                      }}
                    >
                      TEAM MEMBERS ({totalCount})
                    </span>
                  </div>
                  <div
                    className="members-list neural-node"
                    style={{
                      padding: "20px",
                      background: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {teamData.members
                      .concat(teamData.joinedMembers)
                      .filter((member) => !member.joinedViaRequest)
                      .map((member) => (
                        <div key={member.id} className="member-list-item">
                          <span className="member-name">
                            {sanitizeText(member.name, 100)}
                          </span>
                          <div className="member-actions">
                            <button
                              onClick={() => handleViewMember(member)}
                              className="member-btn-view"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteClick(member)}
                              className="member-btn-remove"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {teamData.members.filter((m) => m.joinedViaRequest).length >
                    0 && (
                    <>
                      <span
                        className="label-detail teamup-label members-list-label"
                        style={{
                          marginTop: "40px",
                          width: "100%",
                          textAlign: "center",
                          display: "block",
                        }}
                      >
                        ACCEPTED TEAM MEMBERS (
                        {
                          teamData.members.filter((m) => m.joinedViaRequest)
                            .length
                        }
                        )
                      </span>
                      <div
                        className="indi-table-container"
                        style={{
                          marginTop: "20px",
                          background: "rgba(0, 0, 0, 0.4)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          padding: "20px",
                        }}
                      >
                        <table className="indi-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>University</th>
                              <th>Skills</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teamData.members
                              .filter((m) => m.joinedViaRequest)
                              .map((member, idx) => (
                                <tr key={idx}>
                                  <td data-label="Name">
                                    {sanitizeText(
                                      member.full_name || member.name,
                                      100,
                                    )}
                                  </td>
                                  <td data-label="University">
                                    {sanitizeText(
                                      member.college_name || member.university,
                                      150,
                                    )}
                                  </td>
                                  <td data-label="Skills">
                                    {sanitizeText(
                                      member.bio || member.details,
                                      200,
                                    )}
                                  </td>
                                  <td data-label="Actions">
                                    <div className="action-buttons-container">
                                      <button
                                        onClick={() => handleViewMember(member)}
                                        className="indi-btn-view"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleChatOpen(member)}
                                        className="indi-btn-chat"
                                      >
                                        Chat
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteClick(member)
                                        }
                                        className="indi-btn-remove"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {totalCount >= 3 && (
                    <div className="register-btn-container">
                      <button
                        onClick={() => navigate("/register")}
                        className="neon-shade-btn next-glow register-team-btn"
                      >
                        Register Team In Hackathon
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === "requests" && (
              <RequestedIndividual
                requests={teamData.joinRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onChat={handleChatOpen}
                onView={handleViewRequest}
              />
            )}
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={closeMemberModal}>
          <div
            className="modal-content member-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeMemberModal}>
              &times;
            </button>
            <h2 className="member-card-title">Member Details</h2>
            <div className="member-card-body">
              <div className="member-detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">
                  {sanitizeText(selectedMember.name, 100)}
                </span>
              </div>
              <div className="member-detail-row">
                <span className="detail-label">University:</span>
                <span className="detail-value">
                  {sanitizeText(selectedMember.university, 200)}
                </span>
              </div>
              <div className="member-detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {sanitizeText(selectedMember.email, 100)}
                </span>
              </div>
              <div className="member-detail-row">
                <span className="detail-label">Skills:</span>
                <span className="detail-value">
                  {sanitizeText(
                    selectedMember.skills || selectedMember.about,
                    500,
                  ) || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={closeRequestModal}>
          <div
            className="modal-content request-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeRequestModal}>
              &times;
            </button>
            <h2 className="request-modal-name">
              {sanitizeText(selectedRequest.name, 100)}
            </h2>
            <div className="request-modal-body">
              <p className="request-about">
                {sanitizeText(selectedRequest.about, 500) ||
                  "No details provided."}
              </p>
              <div className="request-modal-actions">
                <button
                  className="modal-action-btn accept-btn"
                  onClick={() => handleAcceptRequest(selectedRequest.id)}
                >
                  Accept
                </button>
                <button
                  className="modal-action-btn reject-btn"
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                >
                  Reject
                </button>
                <button
                  className="modal-action-btn chat-btn-modal"
                  onClick={() => handleChatOpen(selectedRequest)}
                >
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {chatTarget && (
        <ChatBox
          team={chatTarget}
          userDetails={teamData}
          userType="team"
          onClose={() => setChatTarget(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteMember}>
          <div
            className="modal-content request-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="member-card-title"
              style={{
                color: "#ef4444",
                textShadow: "0 0 15px rgba(239, 68, 68, 0.4)",
              }}
            >
              Remove Member
            </h2>
            <div className="member-card-body" style={{ gap: "20px" }}>
              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: "1rem",
                  textAlign: "center",
                  marginBottom: "0",
                }}
              >
                Are you sure you want to remove{" "}
                <span style={{ color: "#fff", fontWeight: "bold" }}>
                  {memberToDelete.name}
                </span>
                ?
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  Reason for removal (required, min 15 words):
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please explain why you are removing this member..."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "0.8rem",
                    color:
                      deleteReason
                        .trim()
                        .split(/\s+/)
                        .filter((w) => w.length > 0).length < 15
                        ? "#f87171"
                        : "#4ade80",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  Word count:{" "}
                  {
                    deleteReason
                      .trim()
                      .split(/\s+/)
                      .filter((w) => w.length > 0).length
                  }
                  /15
                </div>
              </div>

              <div className="request-modal-actions">
                <button
                  className="modal-action-btn"
                  onClick={cancelDeleteMember}
                  style={{
                    background: "rgba(148, 163, 184, 0.2)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-action-btn"
                  onClick={confirmDeleteMember}
                  disabled={
                    deleteReason
                      .trim()
                      .split(/\s+/)
                      .filter((w) => w.length > 0).length < 15
                  }
                  style={{
                    background:
                      deleteReason
                        .trim()
                        .split(/\s+/)
                        .filter((w) => w.length > 0).length >= 15
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(239, 68, 68, 0.1)",
                    color:
                      deleteReason
                        .trim()
                        .split(/\s+/)
                        .filter((w) => w.length > 0).length >= 15
                        ? "#ef4444"
                        : "rgba(239, 68, 68, 0.5)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    cursor:
                      deleteReason
                        .trim()
                        .split(/\s+/)
                        .filter((w) => w.length > 0).length >= 15
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Badge */}
      {notification && (
        <NotificationBadge
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Visibility Warning Modal */}
      {showVisibilityWarning && (
        <div className="modal-overlay">
          <div className="visibility-warning-modal">
            <div className="warning-icon">⚠️</div>
            <h3 className="warning-title">Visibility Warning</h3>
            <p className="warning-message">
              Turning on visibility will allow{" "}
              <strong>individuals to send request</strong> to your team.
              <br />
              <br />
              Once your team is complete, please{" "}
              <strong>turn off visibility</strong> to avoid unwanted requests.
            </p>
            <div className="warning-actions">
              <button
                className="btn-cancel-warning"
                onClick={() => setShowVisibilityWarning(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-visibility"
                onClick={toggleTeamVisibility}
              >
                Confirm & Turn On
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incomp_Page;
