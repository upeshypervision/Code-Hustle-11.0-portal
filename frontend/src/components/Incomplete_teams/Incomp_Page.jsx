import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobalNavbar from "../GlobalNavbar";
import "../../styles/global.css";
import "../Individual-Member/Indi.css";
import "./Incomp_Page.css";
import RequestedIndividual from "./RequestedIndividual"; // Fixed import path from prev step
import { sanitizeText } from "../../utils/sanitizer";
import NotificationBadge from "../NotificationBadge";
import socket from "../../socket";
import ChatBox from "../Individual-Member/ChatBox";

const Incomp_Page = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  // Notification State
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
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
    visible: false,  // Team visibility status (default hidden for new teams)
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
      showNotification(`📩 New join request from ${data.individualName}!`, 'info');
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
          const errData = await response.json();
          console.error("Team Auth Error:", errData);
          showNotification(`Authentication Failed: ${errData.error || "Unknown Error"}`, 'error');
          // navigate('/team-login'); // Disabled for debugging
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch team data");

        const data = await response.json();
        setTeamData(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Error loading team data:", error);
        showNotification(`Error: ${error.message}`, 'error');
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
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          email: member.email,
          reason: "Original team member removed by team leader" // Default reason for backend
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("Member removed successfully.", 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification(result.error || "Failed to remove member", 'error');
      }
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification("Failed to remove member", 'error');
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
    const wordCount = deleteReason.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 15) {
      showNotification("Please provide a reason of at least 15 words.", 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/team-member/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          individual_id: memberToDelete.individual_id,
          reason: deleteReason
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("Member removed successfully.", 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification(result.error || "Failed to remove member", 'error');
      }
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification("Failed to remove member", 'error');
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
        showNotification('Request accepted successfully! Member added to team.', 'success');
        // Refresh team data to get updated member count
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showNotification(data.error || 'Failed to accept request', 'error');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      showNotification('Failed to accept request', 'error');
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
        showNotification('Request rejected successfully', 'success');
      } else {
        showNotification(data.error || 'Failed to reject request', 'error');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Failed to reject request', 'error');
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
      const response = await fetch(`${API_BASE}/api/team/toggle-visibility/${teamData.teamId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setTeamData(prev => ({ ...prev, visible: data.visible }));
        showNotification(
          `Team is now ${data.visible ? 'visible' : 'hidden'} to individuals`,
          data.visible ? 'success' : 'error' // Red for hidden, Green for visible
        );
      } else {
        showNotification(data.error || 'Failed to toggle visibility', 'error');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showNotification('Failed to toggle visibility', 'error');
    }
  };


  return (
    <div className="dashboard-page team-up-page-container" style={{ minHeight: "100vh", background: "#0a0b1e" }}>
      <GlobalNavbar
        userInfo={null}
        logoutPath="/team-login"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        menuItems={[
          {
            id: "profile",
            label: "Team Info",
            name: "Team Info",
            active: showProfile,
          },
          {
            id: "details",
            label: "Team Details",
            name: "Team Details",
            active: activeView === "details" && !showProfile
          },
          {
            id: "requests",
            label: "Requests",
            name: "Requested Individuals",
            active: activeView === "requests" && !showProfile
          },
        ]}
        onMenuItemClick={(item) => {
          if (item.id === "profile") {
            setShowProfile(!showProfile);
          } else {
            setActiveView(item.id);
            setShowProfile(false);
          }
        }}
        showContactUs={true}
      />

      <div className="admin-content dashboard-container">
        <div className="teamup-layout">
          {/* LEFT SIDEBAR - TEAM DETAILS */}
          <div className={`member-details-sidebar profile-sidebar-wrapper ${showProfile ? "mobile-visible" : ""}`}>
            <div className="neural-node node-materialize animate-enter delay-1 profile-node">
              <span className="label-detail teamup-label">TEAM DETAILS</span>
              <div className="sidebar-profile-container" style={{ display: "block" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h3 className="user-profile-header" style={{ fontSize: "1.8rem", color: "#60a5fa" }}>
                    {sanitizeText(teamData.teamName, 100) || "Loading..."}
                  </h3>
                  <p className="user-profile-sub" style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "4px" }}>
                    ID: {sanitizeText(teamData.teamId, 50)}
                  </p>
                </div>

                <div className="user-skills-box" style={{ background: "rgba(255, 255, 255, 0.03)", padding: "15px", borderRadius: "8px" }}>
                  <strong className="skills-label-sidebar" style={{ color: "#aaa", fontSize: "0.9rem", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    TEAM VISION
                  </strong>
                  <p className="skills-text-sidebar" style={{ fontStyle: "italic", margin: 0, fontSize: "1rem", color: "#cbd5e1", lineHeight: "1.5" }}>
                    {sanitizeText(teamData.teamVision, 500) || "No vision provided"}
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
            <div className="tab-nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
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

              {/* Visibility Toggle Switch moved here */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '10px' }}>
                <span style={{
                  color: '#94a3b8',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginRight: '5px',
                  fontWeight: '600'
                }}>
                  Team Visibility
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: teamData.visible ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: teamData.visible ? '#4ade80' : '#f87171',
                  border: `1px solid ${teamData.visible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  transition: 'all 0.3s ease'
                }}>
                  {teamData.visible ? "VISIBLE" : "HIDDEN"}
                </span>
                <label className="visibility-toggle" title="Toggle Visibility">
                  <input
                    type="checkbox"
                    checked={teamData.visible || false}
                    onChange={handleToggleClick}
                  />
                  <span className="visibility-slider"></span>
                </label>
              </div>
            </div>

            {activeView === "details" && (
              <div className="neural-node node-materialize animate-enter">
                {/* Team Name & Vision Header */}
                {/* TEAM LEADER SECTION IN MAIN AREA */}
                <div className="team-header-wrapper" style={{ background: "rgba(96, 165, 250, 0.05)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(96, 165, 250, 0.1)", marginBottom: "30px" }}>
                  <span className="label-detail teamup-label" style={{ marginBottom: "15px" }}>TEAM LEADER</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                    <div>
                      <h1 className="team-header-main" style={{ margin: 0, fontSize: "1.8rem" }}>
                        {sanitizeText(teamData.leader.name, 100)}
                      </h1>
                      <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "1rem" }}>
                        {sanitizeText(teamData.leader.university, 200)} • {sanitizeText(teamData.leader.sapId, 50)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "200px" }}>
                      <div style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "4px" }}>
                        <span style={{ color: "#60a5fa" }}>Email:</span> {sanitizeText(teamData.leader.email, 100)}
                      </div>
                      <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                        <span style={{ color: "#60a5fa" }}>Phone:</span> {sanitizeText(teamData.leader.phone, 20)}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <strong style={{ display: "block", color: "#aaa", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>LEADER BIO / SKILLS</strong>
                    <p style={{ color: "#ddd", margin: 0, fontStyle: "italic", fontSize: "0.95rem", lineHeight: "1.5" }}>
                      {sanitizeText(teamData.leader.details, 500) || "No details provided"}
                    </p>
                  </div>
                </div>

                {/* Original Team Members List */}
                <div style={{ marginBottom: "15px" }}>
                  <span className="label-detail teamup-label members-list-label">
                    TEAM MEMBERS ({totalCount}/5)
                  </span>
                </div>
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
                            onClick={() => handleDeleteClick(member)}
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
                                      onClick={() => handleDeleteClick(member)}
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
          <div className="modal-content request-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="member-card-title" style={{ color: "#ef4444", textShadow: "0 0 15px rgba(239, 68, 68, 0.4)" }}>Remove Member</h2>
            <div className="member-card-body" style={{ gap: "20px" }}>
              <p style={{ color: "#cbd5e1", fontSize: "1rem", textAlign: "center", marginBottom: "0" }}>
                Are you sure you want to remove <span style={{ color: "#fff", fontWeight: "bold" }}>{memberToDelete.name}</span>?
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ color: "#94a3b8", fontSize: "0.9rem", fontFamily: "'Space Mono', monospace" }}>
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
                    resize: "vertical"
                  }}
                />
                <div style={{
                  textAlign: "right",
                  fontSize: "0.8rem",
                  color: deleteReason.trim().split(/\s+/).filter(w => w.length > 0).length < 15 ? "#f87171" : "#4ade80",
                  fontFamily: "'Space Mono', monospace"
                }}>
                  Word count: {deleteReason.trim().split(/\s+/).filter(w => w.length > 0).length}/15
                </div>
              </div>

              <div className="request-modal-actions">
                <button
                  className="modal-action-btn"
                  onClick={cancelDeleteMember}
                  style={{ background: "rgba(148, 163, 184, 0.2)", color: "#e2e8f0", border: "1px solid rgba(148, 163, 184, 0.3)" }}
                >
                  Cancel
                </button>
                <button
                  className="modal-action-btn"
                  onClick={confirmDeleteMember}
                  disabled={deleteReason.trim().split(/\s+/).filter(w => w.length > 0).length < 15}
                  style={{
                    background: deleteReason.trim().split(/\s+/).filter(w => w.length > 0).length >= 15 ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)",
                    color: deleteReason.trim().split(/\s+/).filter(w => w.length > 0).length >= 15 ? "#ef4444" : "rgba(239, 68, 68, 0.5)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    cursor: deleteReason.trim().split(/\s+/).filter(w => w.length > 0).length >= 15 ? "pointer" : "not-allowed"
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
              Turning on visibility will allow <strong>individuals to send request</strong> to your team.
              <br /><br />
              Once your team is complete, please <strong>turn off visibility</strong> to avoid unwanted requests.
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