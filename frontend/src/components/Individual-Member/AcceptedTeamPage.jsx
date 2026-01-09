import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalNavbar from "../GlobalNavbar";
import ChatBox from "./ChatBox";
import "../../styles/global.css";
import "../admin/ViewTeams.css";
import "../../pages/Registration.css";
import "./Indi.css";
import socket from "../../socket";

const AcceptedTeamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { team: stateTeam, userDetails: stateUserDetails } = location.state || {};

  const [team, setTeam] = useState(stateTeam || null);
  const [userDetails, setUserDetails] = useState(stateUserDetails || null);
  const [loading, setLoading] = useState(!stateTeam);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // If we already have data from navigation state, skip fetching
      if (stateTeam && stateUserDetails) {
        console.log("Using state data, skipping fetch");
        return;
      }

      try {
        setLoading(true);

        // Fetch individual data to get the accepted team ID
        const individualResponse = await fetch("http://localhost:5000/api/individual-dashboard", {
          credentials: "include"
        });
        const individualData = await individualResponse.json();

        if (!individualData.success) {
          console.error("Failed to fetch individual data");
          setLoading(false);
          return;
        }

        setUserDetails(individualData.data);

        if (individualData.data.reason) {
          setRejectionReason(individualData.data.reason);
        }

        // Get the accepted team ID from individual data
        const acceptedTeamId = individualData.data.accepted;

        if (!acceptedTeamId) {
          console.log("No accepted team found");
          setLoading(false);
          return;
        }

        // Fetch the accepted team details
        const teamResponse = await fetch("http://localhost:5000/api/individual/accepted-team", {
          credentials: "include"
        });
        const teamData = await teamResponse.json();

        if (teamData.success && teamData.team) {
          setTeam(teamData.team);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run only once on mount

  // Socket.IO Listener for Real-time Removal Updates
  useEffect(() => {
    if (userDetails?.id) {
      const roomName = `individual_${userDetails.id}`;
      socket.emit("join_room", { room: roomName });
      console.log(`Joined socket room: ${roomName}`);

      const handleMemberRemoved = (data) => {
        console.log("Real-time update: Member removed", data);
        setTeam(null);
        setRejectionReason(data.reason);
      };

      socket.on("member_removed", handleMemberRemoved);

      return () => {
        socket.off("member_removed", handleMemberRemoved);
      };
    }
  }, [userDetails]);

  if (loading) {
    return (
      <div className="dashboard-page" style={{ minHeight: "100vh", background: "#0a0b1e", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>⏳</div>
          <div>Loading your team...</div>
        </div>
      </div>
    );
  }

  if (!team) {
    if (rejectionReason) {
      const parts = rejectionReason.split(':');
      const teamName = parts[0];
      const reasonText = parts.slice(1).join(':').trim();

      return (
        <div className="dashboard-page" style={{ minHeight: "100vh", background: "#0a0b1e", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center", padding: "40px", background: "rgba(220, 38, 38, 0.1)", borderRadius: "16px", border: "1px solid rgba(220, 38, 38, 0.3)", maxWidth: "600px", margin: "20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⚠️</div>
            <h2 style={{ color: "#ef4444", marginBottom: "15px", textShadow: "0 0 10px rgba(239, 68, 68, 0.3)" }}>Removed from Team</h2>
            <div style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "20px" }}>
              You have been removed from <strong style={{ color: "#f87171" }}>{teamName}</strong>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #ef4444", textAlign: "left" }}>
              <label style={{ color: "#999", fontSize: "0.9rem", display: "block", marginBottom: "8px" }}>REASON:</label>
              <p style={{ color: "#fff", margin: 0, fontStyle: "italic", fontSize: "1.1rem" }}>"{reasonText}"</p>
            </div>
            <button
              onClick={() => navigate("/indimember")}
              style={{
                marginTop: "30px",
                padding: "12px 30px",
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="dashboard-page"
        style={{ minHeight: "100vh", background: "#0a0b1e" }}
      >
        <div
          style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>😔</div>
          <h2>You are not accepted by any team</h2>
          <p style={{ color: "#aaa", marginTop: "10px", fontSize: "1.1rem" }}>
            Keep sending requests to teams you're interested in!
          </p>
          <button
            onClick={() => navigate("/indimember")}
            style={{
              marginTop: "30px",
              padding: "12px 30px",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-page"
      style={{ minHeight: "100vh", background: "#0a0b1e" }}
    >
      <GlobalNavbar
        userInfo={null}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        menuItems={[
          {
            id: "profile",
            label: "Profile",
            name: "Profile",
          },
        ]}
        onMenuItemClick={(item) => {
          if (item.id === "profile") {
            setShowProfile(!showProfile);
          }
        }}
        showContactUs={true}
      />

      <div className="admin-content dashboard-container">
        <div className="teamup-layout">
          {/* User Details Section - Left Sidebar (Desktop) / Mobile Modal */}
          <div
            className={`member-details-sidebar ${showProfile ? "mobile-visible" : ""
              }`}
          >
            {/* Mobile Close Button */}
            <button
              className="mobile-profile-close"
              onClick={() => setShowProfile(false)}
              aria-label="Close profile"
            >
              ×
            </button>
            <div
              className="neural-node node-materialize animate-enter delay-1"
              style={{ marginBottom: "40px" }}
            >
              <span className="label-detail teamup-label">YOUR PROFILE</span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "28px",
                  marginTop: "16px",
                  color: "#ddd",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "#fff",
                      marginBottom: "10px",
                      fontSize: "1.5rem",
                    }}
                  >
                    {userDetails?.fullName || "Guest User"}
                  </h3>
                  <p style={{ fontSize: "1.1rem", color: "#aaa" }}>
                    {userDetails?.university || "Unknown University"} •{" "}
                    {userDetails?.sapId || "N/A"}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", marginBottom: "12px" }}>
                    Email: {userDetails?.email || "N/A"}
                  </div>
                  <div style={{ fontSize: "1.05rem", marginBottom: "12px" }}>
                    Phone: {userDetails?.mobile || "N/A"}
                  </div>
                  <div style={{ fontSize: "1.05rem" }}>
                    Member of UPES-Hypervision:{" "}
                    <span style={{ color: "#60a5fa", fontWeight: "600" }}>
                      {userDetails?.isUPESHypervision ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "24px",
                    borderRadius: "12px",
                    marginTop: "12px",
                  }}
                >
                  <strong
                    style={{
                      color: "#aaa",
                      fontSize: "1rem",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  >
                    YOUR SKILLS
                  </strong>
                  <p
                    style={{
                      fontStyle: "italic",
                      margin: 0,
                      fontSize: "1.05rem",
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {userDetails?.skills || "No skills provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="teamup-separator"></div>

          {/* Team Details Section */}
          <div className="teams-content-section">
            <div className="team-details-section">
              <div className="neural-node node-materialize animate-enter">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <span className="label-detail teamup-label">YOUR TEAM</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <h2
                    style={{
                      color: "#fff",
                      margin: 0,
                      fontSize: "1.8rem",
                      flex: "1",
                      minWidth: "200px",
                    }}
                  >
                    {team.teamName}
                  </h2>
                  {team.requestStatus && (
                    <button
                      onClick={() => {
                        setShowChat(true);
                      }}
                      className="team-chat-btn"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(102, 126, 234, 0.6)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(102, 126, 234, 0.4)";
                      }}
                    >
                      <span>💬</span>
                      <span>Chat</span>
                    </button>
                  )}
                </div>
                <div
                  style={{
                    color: "#aaa",
                    fontSize: "1.1rem",
                    marginBottom: "30px",
                  }}
                >
                  TEAM ID: {team.teamId}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "30px",
                    marginTop: "20px",
                    width: "100%",
                  }}
                >
                  <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                    <div className="label-row">
                      <span>TEAM VISION</span>
                    </div>
                    <div
                      className="glow-input-container"
                      style={{
                        padding: "24px",
                        background: "rgba(255,255,255,0.03)",
                        width: "100%",
                      }}
                    >
                      <p
                        style={{
                          color: "#ddd",
                          fontSize: "1.1rem",
                          lineHeight: "1.7",
                          margin: 0,
                          wordWrap: "break-word",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {team.vision}
                      </p>
                    </div>
                  </div>

                  <div
                    className="input-group"
                    style={{ width: "100%", gridColumn: "1 / -1" }}
                  >
                    <div className="label-row">
                      <span>LEADER</span>
                    </div>
                    <div
                      className="glow-input-container"
                      style={{
                        padding: "24px",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "1.15rem",
                            fontWeight: "600",
                          }}
                        >
                          {team.leaderName}
                        </span>
                        <span
                          style={{
                            color: "#aaa",
                            fontSize: "1rem",
                            marginBottom: "8px",
                          }}
                        >
                          {team.leaderUniversity}
                        </span>
                        {team.leaderSkills && (
                          <div
                            style={{
                              fontSize: "0.95rem",
                              color: "#ddd",
                              paddingTop: "8px",
                              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                              wordWrap: "break-word",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            <strong
                              style={{
                                color: "#aaa",
                                fontSize: "0.85rem",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Skills:
                            </strong>
                            {team.leaderSkills}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {team.members && team.members.length > 0 && (
                  <div className="input-group" style={{ marginTop: "30px" }}>
                    <div className="label-row">
                      <span>MEMBERS ({team.members.length})</span>
                    </div>
                    <div
                      className="glow-input-container"
                      style={{ padding: "24px" }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "20px",
                          width: "100%",
                        }}
                      >
                        {team.members.map((member, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              color: "#ddd",
                              padding: "16px",
                              background: "rgba(255, 255, 255, 0.02)",
                              borderRadius: "8px",
                              border: "1px solid rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                                marginBottom: "10px",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "1.1rem",
                                  color: "#fff",
                                }}
                              >
                                {member.name}
                              </span>
                              <span
                                style={{ color: "#aaa", fontSize: "0.95rem" }}
                              >
                                {member.university}
                              </span>
                            </div>
                            {member.skills && (
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  color: "#ddd",
                                  paddingTop: "10px",
                                  borderTop:
                                    "1px solid rgba(255, 255, 255, 0.1)",
                                  marginTop: "8px",
                                  wordWrap: "break-word",
                                  wordBreak: "break-word",
                                  overflowWrap: "break-word",
                                  whiteSpace: "normal",
                                }}
                              >
                                <strong
                                  style={{
                                    color: "#aaa",
                                    fontSize: "0.85rem",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Skills:
                                </strong>
                                {member.skills}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="teamup-footer">
        <div className="teamup-footer-separator"></div>
        <div className="teamup-footer-content">
          <p>CodeHustle 11.0, powered by UPES, Hypervision</p>
        </div>
      </footer>

      {/* ChatBox */}
      {showChat && team && (
        <ChatBox
          team={team}
          userDetails={userDetails}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default AcceptedTeamPage;
