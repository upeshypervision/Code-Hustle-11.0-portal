import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import ChatBox from "./ChatBox";
import "../styles/global.css";
import "../components/admin/ViewTeams.css";
import "../pages/Registration.css";
import "./TeamUp.css";

const TeamUpDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userDetails = location.state?.userDetails || {
    fullName: "Guest User",
    university: "Unknown University",
    sapId: "N/A",
    phone: "N/A",
    email: "N/A",
    vision: "No vision provided",
    isUPESHypervision: false,
  };

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAcceptancePopup, setShowAcceptancePopup] = useState(false);
  const [acceptedTeam, setAcceptedTeam] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatTeam, setChatTeam] = useState(null);

  useEffect(() => {
    const popupDismissed = localStorage.getItem("acceptance-popup-dismissed");
    const accepted = teams.find((team) => team.requestStatus === "Accepted");

    if (accepted && !popupDismissed) {
      const teamWithUser = {
        ...accepted,
        members: [
          ...accepted.members,
          {
            name: userDetails.fullName,
            university: userDetails.university,
            skills: userDetails.skills || "Your skills here",
          },
        ],
      };
      setAcceptedTeam(teamWithUser);
      setTimeout(() => {
        setShowAcceptancePopup(true);
      }, 1000);
    } else if (accepted) {
      const teamWithUser = {
        ...accepted,
        members: [
          ...accepted.members,
          {
            name: userDetails.fullName,
            university: userDetails.university,
            skills: userDetails.skills || "Your skills here",
          },
        ],
      };
      setAcceptedTeam(teamWithUser);
    }
  }, []);

  // Dummy Data for Teams
  const [teams] = useState([
    {
      teamId: "TM001",
      teamName: "Code Warriors",
      vision: "To build a revolutionary AI app that solves daily problems.",
      requestStatus: "Declined",
      leaderName: "Arjun Mehta",
      leaderUniversity: "UPES",
      leaderSkills: "Full-stack development, AI/ML, Project management",
      members: [
        {
          name: "Rohan Verma",
          university: "UPES",
          skills: "Backend architecture, Database design, API development",
        },
        {
          name: "Sanya Kapoor",
          university: "IIT Delhi",
          skills: "Frontend development, UI/UX design, React",
        },
      ],
    },
    {
      teamId: "TM042",
      teamName: "Hack Hustlers",
      vision: "Creating the next big fintech solution using blockchain.",
      requestStatus: "Accepted",
      leaderName: "Vikram Singh",
      leaderUniversity: "MIT Manipal",
      leaderSkills: "Blockchain development, Smart contracts, Cryptography",
      members: [
        {
          name: "Priya Reddy",
          university: "MIT Manipal",
          skills: "Blockchain security, Penetration testing, Security audits",
        },
      ],
    },
    {
      teamId: "TM088",
      teamName: "Pixel Pioneers",
      vision: "Gamified learning platform for kids.",
      requestStatus: "Pending",
      leaderName: "Kabir Das",
      leaderUniversity: "UPES",
      leaderSkills: "Game development, Educational technology, UI/UX design",
      members: [],
    },
    {
      teamId: "TM101",
      teamName: "Quantum Quests",
      vision: "Exploring quantum computing simulations in browser.",
      requestStatus: "Pending",
      leaderName: "Meera Nair",
      leaderUniversity: "BITS Pilani",
      leaderSkills: "Quantum computing, Algorithm design, Research",
      members: [
        {
          name: "Ishaan Malhotra",
          university: "VIT Vellore",
          skills: "Quantum physics, Mathematical modeling, Simulation",
        },
        {
          name: "Neha Joshi",
          university: "SRM University",
          skills: "Probability theory, Statistics, Data analysis",
        },
      ],
    },
    {
      teamId: "TM200",
      teamName: "Nebula Nomads",
      vision: "Building space exploration VR experiences.",
      requestStatus: null,
      leaderName: "Aryan Khan",
      leaderUniversity: "Thapar University",
      leaderSkills: "VR development, 3D modeling, Unity",
      members: [],
    },
    {
      teamId: "TM205",
      teamName: "Cyber Synthetics",
      vision: "AI-generated music and art platform.",
      requestStatus: null,
      leaderName: "Riya Desai",
      leaderUniversity: "Nirma University",
      leaderSkills: "AI/ML, Music generation, Creative coding",
      members: [
        {
          name: "Dev Patel",
          university: "PDEU",
          skills: "Hardware optimization, Embedded systems, Logic design",
        },
      ],
    },
  ]);

  return (
    <div
      className="dashboard-page"
      style={{ minHeight: "100vh", background: "#0a0b1e" }}
    >
      {/* Same Navbar as User Panel but customized if needed */}
      <UserNavbar
        variant="glass"
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
      />

      <div className="admin-content dashboard-container">
        <div className="teamup-layout">
          {/* User Details Section - Left Sidebar (Desktop) / Mobile Modal */}
          <div
            className={`member-details-sidebar ${
              showProfile ? "mobile-visible" : ""
            }`}
          >
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
                    {userDetails.fullName}
                  </h3>
                  <p style={{ fontSize: "1.1rem", color: "#aaa" }}>
                    {userDetails.university} • {userDetails.sapId}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", marginBottom: "12px" }}>
                    Email: {userDetails.email}
                  </div>
                  <div style={{ fontSize: "1.05rem", marginBottom: "12px" }}>
                    Phone: {userDetails.mobile}
                  </div>
                  <div style={{ fontSize: "1.05rem" }}>
                    Member of UPES-Hypervision:{" "}
                    <span style={{ color: "#60a5fa", fontWeight: "600" }}>
                      {userDetails.isUPESHypervision ? "Yes" : "No"}
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
                    YOUR VISION
                  </strong>
                  <p
                    style={{
                      fontStyle: "italic",
                      margin: 0,
                      fontSize: "1.05rem",
                    }}
                  >
                    {userDetails.vision}
                  </p>
                </div>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              className="mobile-profile-close"
              onClick={() => setShowProfile(false)}
              aria-label="Close profile"
            >
              ×
            </button>
          </div>

          {/* Vertical Separator */}
          <div className="teamup-separator"></div>

          {/* Main Content - Teams Sections or Team Details */}
          <div className="teams-content-section">
            {!selectedTeam ? (
              <>
                {/* AVAILABLE TEAMS SECTION */}
                <div
                  className="neural-node node-materialize animate-enter delay-2"
                  style={{ marginBottom: "40px" }}
                >
                  <span className="label-detail teamup-label">
                    AVAILABLE TEAMS (Join Now)
                  </span>
                  <div
                    className="table-container"
                    style={{ marginTop: "28px", overflowX: "auto" }}
                  >
                    <table
                      className="admin-table"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        color: "#ddd",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            textAlign: "left",
                          }}
                        >
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Team ID
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Team Name
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Team Vision
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Members
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Leader
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams
                          .filter((t) => !t.requestStatus)
                          .map((team) => (
                            <tr
                              key={team.teamId}
                              className="team-row"
                              style={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <td
                                data-label="Team ID"
                                style={{
                                  padding: "20px",
                                  fontFamily: "monospace",
                                  color: "#aaa",
                                  fontSize: "1rem",
                                }}
                              >
                                {team.teamId}
                              </td>
                              <td
                                data-label="Team Name"
                                style={{
                                  padding: "20px",
                                  fontWeight: "bold",
                                  color: "#fff",
                                  fontSize: "1.05rem",
                                }}
                              >
                                {team.teamName}
                              </td>
                              <td
                                data-label="Team Vision"
                                style={{
                                  padding: "20px",
                                  color: "#ccc",
                                  maxWidth: "250px",
                                  fontSize: "1rem",
                                }}
                              >
                                {team.vision.length > 50
                                  ? team.vision.substring(0, 50) + "..."
                                  : team.vision}
                              </td>
                              <td
                                data-label="Members"
                                style={{
                                  padding: "20px",
                                  color: "#ddd",
                                  fontSize: "1rem",
                                }}
                              >
                                {team.members.length + 1}/5
                              </td>
                              <td
                                data-label="Leader"
                                style={{
                                  padding: "20px",
                                  color: "#ddd",
                                  fontSize: "1rem",
                                }}
                              >
                                {team.leaderName}
                              </td>
                              <td
                                data-label="Action"
                                style={{ padding: "20px" }}
                              >
                                <button
                                  className="edit-btn"
                                  onClick={() => setSelectedTeam(team)}
                                  style={{
                                    background: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  View & Join
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SENT REQUESTS SECTION */}
                <div
                  className="neural-node node-materialize animate-enter delay-3"
                  style={{ marginBottom: "40px" }}
                >
                  <span className="label-detail teamup-label">
                    SENT REQUESTS (Status)
                  </span>
                  <div
                    className="table-container"
                    style={{ marginTop: "28px", overflowX: "auto" }}
                  >
                    <table
                      className="admin-table"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        color: "#ddd",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            textAlign: "left",
                          }}
                        >
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Team ID
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Team Name
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Team Vision
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Members
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Req Status
                          </th>
                          <th style={{ padding: "20px", fontSize: "1rem" }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams
                          .filter((t) => t.requestStatus)
                          .map((team) => (
                            <tr
                              key={team.teamId}
                              className="team-row"
                              style={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <td
                                data-label="Team ID"
                                style={{
                                  padding: "20px",
                                  fontFamily: "monospace",
                                  color: "#aaa",
                                  fontSize: "1rem",
                                }}
                              >
                                {team.teamId}
                              </td>
                              <td
                                data-label="Team Name"
                                style={{
                                  padding: "20px",
                                  fontWeight: "bold",
                                  color: "#fff",
                                  fontSize: "1.05rem",
                                }}
                              >
                                {team.teamName}
                              </td>
                              <td
                                data-label="Team Vision"
                                style={{
                                  padding: "20px",
                                  color: "#ccc",
                                  maxWidth: "250px",
                                  fontSize: "1rem",
                                }}
                              >
                                {team.vision.length > 50
                                  ? team.vision.substring(0, 50) + "..."
                                  : team.vision}
                              </td>
                              <td
                                data-label="Members"
                                style={{
                                  padding: "20px",
                                  color: "#ddd",
                                  fontSize: "1rem",
                                }}
                              >
                                {team.members.length + 1}/5
                              </td>
                              <td
                                data-label="Req Status"
                                style={{ padding: "20px" }}
                              >
                                <span
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    fontSize: "0.95rem",
                                    fontWeight: "500",
                                    background:
                                      team.requestStatus === "Accepted"
                                        ? "rgba(40, 167, 69, 0.2)"
                                        : team.requestStatus === "Declined"
                                        ? "rgba(220, 53, 69, 0.2)"
                                        : "rgba(255, 193, 7, 0.1)",
                                    color:
                                      team.requestStatus === "Accepted"
                                        ? "#28a745"
                                        : team.requestStatus === "Declined"
                                        ? "#dc3545"
                                        : "#ffc107",
                                  }}
                                >
                                  {team.requestStatus}
                                </span>
                              </td>
                              <td
                                data-label="Action"
                                style={{ padding: "20px" }}
                              >
                                <button
                                  className="edit-btn"
                                  onClick={() => setSelectedTeam(team)}
                                  style={{
                                    background: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  View Team Details
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Team Details Section - Replaces Teams Tables */
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
                    <span className="label-detail teamup-label">
                      TEAM DETAILS
                    </span>
                    <button
                      onClick={() => setSelectedTeam(null)}
                      className="close-team-details-btn"
                      aria-label="Close team details"
                    >
                      ×
                    </button>
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
                      {selectedTeam.teamName}
                    </h2>
                    {selectedTeam.requestStatus && (
                      <button
                        onClick={() => {
                          setChatTeam(selectedTeam);
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
                    TEAM ID: {selectedTeam.teamId}
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
                    <div
                      className="input-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div className="label-row">
                        <span>TEAM VISION</span>
                      </div>
                      <div
                        className="glow-input-container"
                        style={{
                          padding: "24px",
                          background: "rgba(255,255,255,0.03)",
                          minHeight: "120px",
                          width: "100%",
                        }}
                      >
                        <p
                          style={{
                            color: "#ddd",
                            fontSize: "1.1rem",
                            lineHeight: "1.7",
                            margin: 0,
                          }}
                        >
                          {selectedTeam.vision}
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
                          minHeight: "120px",
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
                            {selectedTeam.leaderName}
                          </span>
                          <span
                            style={{
                              color: "#aaa",
                              fontSize: "1rem",
                              marginBottom: "8px",
                            }}
                          >
                            {selectedTeam.leaderUniversity}
                          </span>
                          {selectedTeam.leaderSkills && (
                            <div
                              style={{
                                fontSize: "0.95rem",
                                color: "#ddd",
                                paddingTop: "8px",
                                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
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
                              {selectedTeam.leaderSkills}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedTeam.members && selectedTeam.members.length > 0 && (
                    <div className="input-group" style={{ marginTop: "30px" }}>
                      <div className="label-row">
                        <span>MEMBERS ({selectedTeam.members.length})</span>
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
                          {selectedTeam.members.map((member, idx) => (
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

                  {!selectedTeam.requestStatus && (
                    <button
                      className="neon-shade-btn next-glow"
                      onClick={() => {
                        console.log(
                          `Sending request to team: ${selectedTeam.teamName} (ID: ${selectedTeam.teamId})`
                        );
                        alert(`Request sent to ${selectedTeam.leaderName}!`);
                        setSelectedTeam(null);
                      }}
                      style={{
                        marginTop: "30px",
                        width: "100%",
                        padding: "12px 20px",
                        fontSize: "1rem",
                      }}
                    >
                      SEND REQUEST ❯
                    </button>
                  )}
                </div>
              </div>
            )}
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

      {/* Acceptance Popup Modal */}
      {showAcceptancePopup && acceptedTeam && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            backdropFilter: "blur(5px)",
          }}
          onClick={() => setShowAcceptancePopup(false)}
        >
          <div
            className="neural-node node-materialize modal-content-enter"
            style={{
              maxWidth: "500px",
              width: "90%",
              padding: "40px",
              position: "relative",
              backgroundColor: "#0f172a",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowAcceptancePopup(false);
                localStorage.setItem("acceptance-popup-dismissed", "true");
              }}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "rgba(255, 255, 255, 0.6)";
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🎉</div>
              <h2
                style={{
                  color: "#fff",
                  marginBottom: "15px",
                  fontSize: "1.8rem",
                }}
              >
                Congratulations!
              </h2>
              <p
                style={{
                  color: "#ddd",
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  marginBottom: "30px",
                }}
              >
                You have been admitted to team{" "}
                <strong style={{ color: "#60a5fa" }}>
                  {acceptedTeam.teamName}
                </strong>
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexDirection: "column",
                }}
              >
                <button
                  onClick={() => {
                    setShowAcceptancePopup(false);
                    localStorage.setItem("acceptance-popup-dismissed", "true");
                    navigate("/individual-member/accepted", {
                      state: {
                        team: acceptedTeam,
                        userDetails: userDetails,
                      },
                    });
                  }}
                  className="neon-shade-btn next-glow"
                  style={{
                    width: "100%",
                    padding: "14px 28px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  View Team
                </button>
                <button
                  onClick={() => {
                    setShowAcceptancePopup(false);
                    localStorage.setItem("acceptance-popup-dismissed", "true");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 28px",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "rgba(255, 255, 255, 0.7)";
                  }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ChatBox */}
      {showChat && chatTeam && (
        <ChatBox
          team={chatTeam}
          userDetails={userDetails}
          onClose={() => {
            setShowChat(false);
            setChatTeam(null);
          }}
        />
      )}
    </div>
  );
};

export default TeamUpDashboard;
