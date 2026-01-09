import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalNavbar from "../GlobalNavbar";
import Indi_SentRequest from "./Indi_SentRequest";
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
  const [activeView, setActiveView] = useState("available"); // "available" or "sent-requests"

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/individual-dashboard", {
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
        const response = await fetch("http://localhost:5001/api/available-teams", {
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
            active: showProfile,
          },
          {
            id: "available-teams",
            label: "Available Teams",
            name: "Available Teams",
            active: activeView === "available" && !selectedTeam,
          },
          {
            id: "sent-requests",
            label: "Sent Requests",
            name: "Sent Requests",
            active: activeView === "sent-requests" && !selectedTeam,
          },
        ]}
        onMenuItemClick={(item) => {
          if (item.id === "profile") {
            setShowProfile(!showProfile);
          } else if (item.id === "available-teams") {
            setActiveView("available");
            setSelectedTeam(null);
            setShowProfile(false);
          } else if (item.id === "sent-requests") {
            setActiveView("sent-requests");
            setSelectedTeam(null);
            setShowProfile(false);
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
                {/* Desktop Navigation Tabs */}
                <div className="indi-view-tabs" style={{ 
                  display: "flex", 
                  gap: "12px", 
                  marginBottom: "24px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingBottom: "12px"
                }}>
                  <button
                    onClick={() => setActiveView("available")}
                    style={{
                      padding: "10px 20px",
                      background: activeView === "available" 
                        ? "linear-gradient(135deg, #3b82f6, #2563eb)" 
                        : "transparent",
                      color: activeView === "available" ? "#fff" : "#94a3b8",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Available Teams
                  </button>
                  <button
                    onClick={() => setActiveView("sent-requests")}
                    style={{
                      padding: "10px 20px",
                      background: activeView === "sent-requests" 
                        ? "linear-gradient(135deg, #3b82f6, #2563eb)" 
                        : "transparent",
                      color: activeView === "sent-requests" ? "#fff" : "#94a3b8",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Sent Requests
                  </button>
                </div>

                {/* Content based on active view */}
                {activeView === "available" ? (
                  acceptedTeam ? (
                    // Congratulations Banner when accepted
                    <div className="neural-node node-materialize animate-enter congrats-banner" style={{
                      background: "linear-gradient(135deg, rgba(148, 163, 184, 0.25) 0%, #2563eb 100%)",
                      padding: "60px 40px",
                      borderRadius: "16px",
                      textAlign: "center",
                      boxShadow: "0 20px 60px rgba(37, 99, 235, 0.4)",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      margin: "0 auto",
                      maxWidth: "100%",
                      boxSizing: "border-box"
                    }}>
                      <h1 className="congrats-title" style={{
                        color: "#fff",
                        fontSize: "2.5rem",
                        marginBottom: "15px",
                        fontWeight: "800",
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px"
                      }}>
                        <span>Congratulations!</span>
                        <span>🎉</span>
                      </h1>
                      <p className="congrats-subtitle" style={{
                        color: "#fff",
                        fontSize: "1.5rem",
                        marginBottom: "10px",
                        fontWeight: "600",
                        wordWrap: "break-word",
                        overflowWrap: "break-word"
                      }}>
                        You've been accepted by
                      </p>
                      <h2 className="congrats-team-name" style={{
                        color: "#fff",
                        fontSize: "2rem",
                        marginBottom: "10px",
                        fontWeight: "700",
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        wordWrap: "break-word",
                        overflowWrap: "break-word"
                      }}>
                        {acceptedTeam.teamName}
                      </h2>
                      <p className="congrats-team-id" style={{
                        color: "rgba(255,255,255,0.95)",
                        fontSize: "1.2rem",
                        marginBottom: "40px",
                        fontWeight: "500",
                        wordWrap: "break-word",
                        overflowWrap: "break-word"
                      }}>
                        Team ID: {acceptedTeam.teamId}
                      </p>
                      <button
                        className="congrats-button"
                        onClick={() => navigate("/accepted-team", {
                          state: { team: acceptedTeam, userDetails }
                        })}
                        style={{
                          background: "#fff",
                          color: "#2563eb",
                          border: "none",
                          padding: "16px 40px",
                          borderRadius: "10px",
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                          transition: "all 0.3s ease",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          width: "auto",
                          maxWidth: "100%"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-3px)";
                          e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
                        }}
                      >
                        View Your Team →
                      </button>
                    </div>
                  ) : (
                    // Available Teams when not accepted
                    <Indi_AvailableTeams
                      teams={teams.filter(t => !t.requestStatus && !rejectedTeamIds.includes(t.teamId))}
                      onViewTeam={setSelectedTeam}
                      scrollToTop={scrollToTop}
                    />
                  )
                ) : (
                  <Indi_SentRequest
                    teams={teams}
                    onViewTeam={setSelectedTeam}
                    onChat={(team) => {
                      setChatTeam(team);
                      setShowChat(true);
                    }}
                    scrollToTop={scrollToTop}
                  />
                )}
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