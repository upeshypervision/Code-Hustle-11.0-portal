import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobalNavbar from "../GlobalNavbar";
import "../../styles/global.css";
import "../Individual-Member/Indi.css";
import "./Incomp_Page.css";
import RequestedIndividual from "./RequestedIndividual"; // Fixed import path from prev step
import { sanitizeText } from "../../utils/sanitizer";
import socket from "../../socket";

const Incomp_Page = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const API_BASE = "http://localhost:5000";

  const [activeView, setActiveView] = useState("details");

  const initialTeamData = {
    teamName: "Loading...",
    teamVision: "",
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
      alert(`📩 New join request from ${data.individualName}!`);
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
          credentials: "include"
        });

        if (response.status === 401) {
          navigate('/team-login');
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch team data");

        const data = await response.json();
        setTeamData(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Error loading team data:", error);
      }
    };

    const fetchJoinRequests = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/team/join-requests`, {
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTeamData(prev => ({ ...prev, joinRequests: data.requests }));
          }
        }
      } catch (error) {
        console.error("Error loading join requests:", error);
      }
    };

    fetchTeamData();
    fetchJoinRequests();
  }, [navigate]);

  // Chat Logic (Dummy Data)
  const dummyChatHistory = [
    { id: 1, sender: "them", text: "Hii!" },
    { id: 2, sender: "me", text: "Hey!" }
  ];

  const handleChatOpen = (target) => {
    setChatTarget(target);
    if (selectedRequest) closeRequestModal();
  };

  const closeChatModal = () => {
    setChatTarget(null);
    setChatMessage("");
    setIsChatExpanded(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatMessage("");
  };

  const handleDeleteMember = async (member) => {
    try {
      const response = await fetch(`${API_BASE}/api/team-member/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: member.email })
      });

      const data = await response.json();
      if (response.ok) {
        setTeamData((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m.email !== member.email),
          joinedMembers: prev.joinedMembers.filter((m) => m.email !== member.email),
        }));
        alert('Member deleted successfully');
      } else {
        alert(data.error || 'Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member');
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/team/accept-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ individual_id: id })
      });

      const data = await response.json();

      if (response.ok) {
        // Emit socket event to notify individual
        socket.emit("request_accepted", {
          individualId: id,
          teamName: teamData.teamName
        });

        // Remove from joinRequests and refresh team data
        setTeamData((prev) => ({
          ...prev,
          joinRequests: prev.joinRequests.filter((req) => req.id !== id),
        }));
        alert('Request accepted successfully! Member added to team.');
        // Refresh team data to get updated member count
        window.location.reload();
      } else {
        alert(data.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
    closeRequestModal();
  };

  const handleRejectRequest = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/team/reject-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ individual_id: id })
      });

      const data = await response.json();

      if (response.ok) {
        // Emit socket event to notify individual
        socket.emit("request_rejected", {
          individualId: id,
          teamName: teamData.teamName
        });

        setTeamData((prev) => ({
          ...prev,
          joinRequests: prev.joinRequests.filter((req) => req.id !== id),
        }));
        alert('Request rejected successfully');
      } else {
        alert(data.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
    closeRequestModal();
  };

  const handleViewRequest = (request) => setSelectedRequest(request);
  const closeRequestModal = () => setSelectedRequest(null);

  const handleViewMember = (member) => setSelectedMember(member);
  const closeMemberModal = () => setSelectedMember(null);


  return (
    <div className="dashboard-page" style={{ minHeight: "100vh", background: "#0a0b1e" }}>
      <GlobalNavbar
        userInfo={null}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        menuItems={[
          { id: "details", label: "Team Details", name: "Team Details", active: activeView === "details" },
          { id: "requests", label: "Requests", name: "Requested Individuals", active: activeView === "requests" },
        ]}
        onMenuItemClick={(item) => setActiveView(item.id)}
        showContactUs={true}
      />

      <div className="admin-content dashboard-container">
        <div className="teamup-layout">
          {/* LEFT SIDEBAR - TEAM LEADER DETAILS */}
          <div className={`member-details-sidebar profile-sidebar-wrapper ${showProfile ? "mobile-visible" : ""}`}>
            <div className="neural-node node-materialize animate-enter delay-1 profile-node">
              <span className="label-detail teamup-label">TEAM LEADER</span>
              <div className="sidebar-profile-container">
                <div>
                  <h3 className="user-profile-header">
                    {sanitizeText(teamData.leader.name, 100) || "Loading..."}
                  </h3>
                  <p className="user-profile-sub">
                    {sanitizeText(teamData.leader.university, 200)} • {sanitizeText(teamData.leader.sapId, 50)}
                  </p>
                </div>
                <div>
                  <div className="user-profile-info-row">
                    Email: {sanitizeText(teamData.leader.email, 100)}
                  </div>
                  <div className="user-profile-info-row">
                    Phone: {sanitizeText(teamData.leader.phone, 20)}
                  </div>
                </div>
                <div className="user-skills-box">
                  <strong className="skills-label-sidebar" style={{ color: "#aaa", fontSize: "1rem", display: "block", marginBottom: "10px" }}>
                    LEADER SKILLS
                  </strong>
                  <p className="skills-text-sidebar" style={{ fontStyle: "italic", margin: 0, fontSize: "1.05rem", wordWrap: "break-word", whiteSpace: "normal" }}>
                    {sanitizeText(teamData.leader.details, 500) || "No details provided"}
                  </p>
                </div>
              </div>
            </div>
            <button
              className="mobile-profile-close"
              onClick={() => setShowProfile(false)}
              aria-label="Close profile"
            >
              ×
            </button>
          </div>

          <div className="teamup-separator"></div>

          {/* MAIN CONTENT AREA */}
          <div className="teams-content-section">
            {/* Navigation Tabs */}
            <div className="tab-nav-container">
              <button
                onClick={() => setActiveView("details")}
                className={`tab-nav-btn ${activeView === "details" ? "active" : ""}`}
              >
                Team Details
              </button>
              <button
                onClick={() => setActiveView("requests")}
                className={`tab-nav-btn ${activeView === "requests" ? "active" : ""}`}
              >
                Requested Individuals {teamData.joinRequests.length > 0 && `(${teamData.joinRequests.length})`}
              </button>
            </div>

            {activeView === "details" && (
              <div className="neural-node node-materialize animate-enter">
                {/* Team Name & Vision Header */}
                <div className="team-header-wrapper">
                  <span className="label-detail teamup-label">YOUR TEAM</span>
                  <div style={{ marginTop: "16px" }}>
                    <h1 className="team-header-main">
                      {sanitizeText(teamData.teamName, 100)}
                    </h1>
                    <div className="vision-container">
                      <strong className="vision-label">Team Vision</strong>
                      <p className="team-vision">{sanitizeText(teamData.teamVision, 500)}</p>
                    </div>
                  </div>
                </div>

                {/* Original Team Members List */}
                <span className="label-detail teamup-label members-list-label">
                  TEAM MEMBERS ({totalCount}/5)
                </span>
                <div className="members-list">
                  {teamData.members
                    .concat(teamData.joinedMembers)
                    .filter(member => !member.joinedViaRequest)
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
                            onClick={() => handleDeleteMember(member)}
                            className="member-btn-remove"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Accepted Team Members Section */}
                {teamData.members.filter(m => m.joinedViaRequest).length > 0 && (
                  <>
                    <span className="label-detail teamup-label members-list-label" style={{ marginTop: "40px" }}>
                      ACCEPTED TEAM MEMBERS ({teamData.members.filter(m => m.joinedViaRequest).length})
                    </span>
                    <div className="indi-table-container" style={{ marginTop: "20px" }}>
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
                            .filter(m => m.joinedViaRequest)
                            .map((member, idx) => (
                              <tr key={idx}>
                                <td>{sanitizeText(member.full_name || member.name, 100)}</td>
                                <td>{sanitizeText(member.college_name || member.university, 150)}</td>
                                <td>{sanitizeText(member.bio || member.details, 200)}</td>
                                <td>
                                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                    <button
                                      onClick={() => handleViewMember(member)}
                                      className="indi-btn-view"
                                      style={{ width: "auto" }}
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleChatOpen(member)}
                                      className="edit-btn"
                                      style={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        color: "#fff",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                        boxShadow: "0 2px 5px rgba(102, 126, 234, 0.4)",
                                        whiteSpace: "nowrap"
                                      }}
                                    >
                                      <span>💬</span> Chat
                                    </button>
                                    <button
                                      onClick={() => console.log("Remove member:", member)}
                                      className="member-btn-remove"
                                      style={{ padding: "6px 12px", fontSize: "0.9rem" }}
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
          <div className="modal-content member-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMemberModal}>&times;</button>
            <h2 className="member-card-title">Member Details</h2>
            <div className="member-card-body">
              <div className="member-detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{sanitizeText(selectedMember.name, 100)}</span>
              </div>
              <div className="member-detail-row">
                <span className="detail-label">University:</span>
                <span className="detail-value">{sanitizeText(selectedMember.university, 200)}</span>
              </div>
              <div className="member-detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{sanitizeText(selectedMember.email, 100)}</span>
              </div>
              <div className="member-detail-row">
                <span className="detail-label">Skills:</span>
                <span className="detail-value">{sanitizeText(selectedMember.skills || selectedMember.about, 500) || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={closeRequestModal}>
          <div className="modal-content request-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeRequestModal}>&times;</button>
            <h2 className="request-modal-name">{sanitizeText(selectedRequest.name, 100)}</h2>
            <div className="request-modal-body">
              <p className="request-about">{sanitizeText(selectedRequest.about, 500) || "No details provided."}</p>
              <div className="request-modal-actions">
                <button className="modal-action-btn accept-btn" onClick={() => handleAcceptRequest(selectedRequest.id)}>Accept</button>
                <button className="modal-action-btn reject-btn" onClick={() => handleRejectRequest(selectedRequest.id)}>Reject</button>
                <button className="modal-action-btn chat-btn-modal" onClick={() => handleChatOpen(selectedRequest)}>Chat</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {chatTarget && (
        <div className="modal-overlay chat-overlay" onClick={closeChatModal}>
          <div className={`modal-content chat-modal-card ${isChatExpanded ? "expanded" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <h3>Chat with {sanitizeText(chatTarget.name, 50)}</h3>
              <button className="chat-close" onClick={closeChatModal}>&times;</button>
            </div>
            <div className="chat-body">
              {dummyChatHistory.map(msg => (
                <div key={msg.id} className={`chat-message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
            </div>
            <form className="chat-footer" onSubmit={handleSendMessage}>
              <input type="text" className="chat-input" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type a message..." />
              <button type="submit" className="chat-send-btn">Send</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Incomp_Page;
