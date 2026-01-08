import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalNavbar from "../GlobalNavbar";
import ChatBox from "./ChatBox";
import "../../styles/global.css";
import "../admin/ViewTeams.css";
import "../../pages/Registration.css";
import "./Indi.css";
import Indi_AvailableTeams from "./Indi_AvailableTeams";
import Indi_TeamDetails from "./Indi_TeamDetails";
import { sanitizeText } from "../../utils/sanitizer";

const Indi_Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    fullName: "Loading...",
    university: "Loading...",
    sapId: "Loading...",
    phone: "Loading...",
    email: "Loading...",
    skills: "Loading...",
    isUPESHypervision: null,
  });

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatTeam, setChatTeam] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/individual-dashboard", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setUserDetails(data.data);
        } else if (response.status === 401) {
          navigate("/individual-login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [navigate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/available-teams", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setTeams(data.teams);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

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
          {/* User Details Section - Left Sidebar */}
          <div
            className={`member-details-sidebar ${showProfile ? "mobile-visible" : ""}`}
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
                  <h3 className="user-profile-header">
                    {sanitizeText(userDetails.fullName, 100)}
                  </h3>
                  <p className="user-profile-sub">
                    {sanitizeText(userDetails.university, 200)} • {sanitizeText(userDetails.sapId, 50)}
                  </p>
                </div>
                <div>
                  <div className="user-profile-info-row">
                    Email: {sanitizeText(userDetails.email, 100)}
                  </div>
                  <div className="user-profile-info-row">
                    Phone: {sanitizeText(userDetails.phone, 10)}
                  </div>
                  <div className="user-profile-info-row">
                    Member of UPES-Hypervision:{" "}
                    <span style={{ color: "#60a5fa", fontWeight: "600" }}>
                      {userDetails.isUPESHypervision ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="user-skills-box">
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
                      whiteSpace: "normal",
                    }}
                  >
                    {sanitizeText(userDetails.skills, 500) || "No skills provided"}
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

          {/* Vertical Separator */}
          <div className="teamup-separator"></div>

          {/* Main Content */}
          <div className="teams-content-section">
            {!selectedTeam ? (
              <>
                {/* 1. AVAILABLE TEAMS SECTION (TOP) */}
                <Indi_AvailableTeams
                  teams={teams}
                  onViewTeam={setSelectedTeam}
                  scrollToTop={scrollToTop}
                />

                {/* 2. SENT REQUESTS SECTION (BOTTOM) */}
                <div
                  className="neural-node node-materialize animate-enter delay-3"
                  style={{ marginBottom: "40px" }}
                >
                  <span className="label-detail teamup-label">
                    SENT REQUESTS (Status)
                  </span>
                  <div className="indi-table-container">
                    <table className="indi-table">
                      <thead>
                        <tr>
                          <th style={{ width: "15%" }}>Team ID</th>
                          <th style={{ width: "25%" }}>Team Name</th>
                          <th style={{ width: "15%" }}>Members</th>
                          <th style={{ width: "15%" }}>Req Status</th>
                          <th style={{ width: "15%" }}>Chat</th>
                          <th style={{ width: "15%" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams
                          .filter((t) => t.requestStatus)
                          .map((team) => (
                            <tr key={team.teamId} className="team-row">
                              <td className="indi-td-id">{team.teamId}</td>
                              <td className="indi-td-name">{team.teamName}</td>
                              <td className="indi-td-members">
                                {team.memberCount}/5
                              </td>
                              <td style={{ padding: "15px" }}>
                                <span
                                  className="indi-status-tag"
                                  style={{
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
                              <td style={{ padding: "15px" }}>
                                <button
                                  className="edit-btn"
                                  onClick={() => {
                                    setChatTeam(team);
                                    setShowChat(true);
                                  }}
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.95rem",
                                    fontWeight: "500",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow:
                                      "0 2px 5px rgba(102, 126, 234, 0.4)",
                                  }}
                                >
                                  <span>💬</span> Chat
                                </button>
                              </td>
                              <td style={{ padding: "15px" }}>
                                <button
                                  className="indi-btn-view"
                                  onClick={() => {
                                    scrollToTop();
                                    setSelectedTeam(team);
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        {teams.filter((t) => t.requestStatus).length === 0 && (
                          <tr>
                            <td
                              colSpan="6"
                              style={{
                                textAlign: "center",
                                padding: "40px",
                                color: "#aaa",
                              }}
                            >
                              No sent requests.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Team Details Section */
              <Indi_TeamDetails
                team={selectedTeam}
                onClose={() => setSelectedTeam(null)}
                onChat={(team) => {
                  setChatTeam(team);
                  setShowChat(true);
                }}
                onSendRequest={(team) => {
                  alert(`Request sent to ${team.leaderName}!`);
                  setSelectedTeam(null);
                }}
              />
            )}

          </div>
        </div>
      </div>

      <footer className="teamup-footer">
        <div className="teamup-footer-separator"></div>
        <div className="teamup-footer-content">
          <p>CodeHustle 11.0, powered by UPES, Hypervision</p>
        </div>
      </footer>

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

export default Indi_Dashboard;