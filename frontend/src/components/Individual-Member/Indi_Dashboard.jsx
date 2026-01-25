import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IndividualMemberNavbar from "./IndividualMemberNavbar";
import Indi_SentRequest from "./Indi_SentRequest";
import ChatBox from "./ChatBox";
import "../../styles/global.css";
import "../admin/ViewTeams.css";
import "../../pages/Registration.css";
import "./Indi.css";
import "./Indi.mobile.css";
import Indi_AvailableTeams from "./Indi_AvailableTeams";
import Indi_TeamDetails from "./Indi_TeamDetails";
import CongratulationsBanner from "./CongratulationsBanner";
import { sanitizeText } from "../../utils/sanitizer";
import socket from "../../socket";
import NotificationBadge from "../NotificationBadge";
import indiBg from "../../assets/indi-bg.png";

const Indi_Dashboard = () => {
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
  const [activeTab, setActiveTab] = useState("teams"); // For navbar navigation: "profile", "teams"
  const [teamsSubSection, setTeamsSubSection] = useState("available-teams"); // Sub-section within teams: "available-teams" or "sent-requests"
  const [acceptedTeam, setAcceptedTeam] = useState(null); // Accepted team data
  const [rejectedTeamIds, setRejectedTeamIds] = useState([]);

  // Notification State
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!userDetails?.id) return;

    // Join individual room
    socket.emit("join_room", { room: `individual_${userDetails.id}` });
    console.log(`Joined room: individual_${userDetails.id}`);

    // Listen for request accepted
    // Listen for request accepted
    const handleRequestAccepted = (data) => {
      console.log("Request accepted!", data);
      showNotification(
        `🎉 Congratulations! You have been accepted by ${data.teamName}!`,
        "success",
      );
      // Refresh to show accepted team
      setTimeout(() => window.location.reload(), 2000);
    };

    // Listen for request rejected
    const handleRequestRejected = (data) => {
      console.log("Request rejected", data);
      showNotification(
        `Your request to ${data.teamName} was declined.`,
        "error",
      );
      // Refresh to update status
      setTimeout(() => window.location.reload(), 2000);
    };

    socket.on("request_accepted", handleRequestAccepted);
    socket.on("request_rejected", handleRequestRejected);

    return () => {
      socket.off("request_accepted", handleRequestAccepted);
      socket.off("request_rejected", handleRequestRejected);
    };
  }, [userDetails?.id]); // Rejected team IDs

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/individual-dashboard",
          {
            method: "GET",
            credentials: "include",
          },
        );

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
        const response = await fetch(
          "http://localhost:5000/api/available-teams",
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();

        if (data.success) {
          setTeams(data.teams);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    const fetchSentRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/individual/sent-requests",
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();

        if (data.success) {
          // Extract rejected team IDs
          const rejected = data.teams
            .filter((t) => t.requestStatus === "Rejected")
            .map((t) => t.teamId);
          setRejectedTeamIds(rejected);

          // Check for accepted team from sent requests
          const accepted = data.teams.find(
            (t) => t.requestStatus === "Accepted",
          );
          if (accepted) {
            setAcceptedTeam(accepted);
          }

          // Merge sent requests with available teams
          setTeams((prevTeams) => {
            const sentTeamIds = data.teams.map((t) => t.teamId);
            const availableOnly = prevTeams.filter(
              (t) => !sentTeamIds.includes(t.teamId),
            );
            return [...availableOnly, ...data.teams];
          });
        }
      } catch (error) {
        console.error("Error fetching sent requests:", error);
      }
    };

    const checkAcceptedTeam = async () => {
      // Check if user has an accepted team from userDetails
      console.log("Checking accepted team. userDetails:", userDetails);
      console.log("userDetails.accepted:", userDetails?.accepted);

      if (userDetails?.accepted) {
        try {
          console.log("Fetching accepted team data...");
          const response = await fetch(
            "http://localhost:5000/api/individual/accepted-team",
            {
              credentials: "include",
            },
          );
          const data = await response.json();
          console.log("Accepted team response:", data);

          if (data.success && data.team) {
            console.log("Setting accepted team:", data.team);
            setAcceptedTeam(data.team);
          }
        } catch (error) {
          console.error("Error fetching accepted team:", error);
        }
      } else {
        // No accepted team, clear the state
        console.log("No accepted team, clearing state");
        setAcceptedTeam(null);
      }
    };

    const loadAllData = async () => {
      await fetchTeams();
      await fetchSentRequests();
      await checkAcceptedTeam();
    };

    loadAllData();
  }, [userDetails]);

  return (
    <div
      className="dashboard-page"
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

      <IndividualMemberNavbar
        userName={userDetails.fullName || "INDIVIDUAL MEMBER"}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedTeam(null);
          // Reset to available-teams when switching to teams tab
          if (tab === "teams") {
            setTeamsSubSection("available-teams");
          }
        }}
      />

      <div
        className="admin-content dashboard-container"
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent:
            activeTab === "profile" ||
            (activeTab === "teams" &&
              teamsSubSection === "available-teams" &&
              acceptedTeam)
              ? "center"
              : "flex-start",
          alignItems: "center",
          minHeight:
            activeTab === "profile" ||
            (activeTab === "teams" &&
              teamsSubSection === "available-teams" &&
              acceptedTeam)
              ? "calc(100vh - 140px)"
              : "auto",
        }}
      >
        {activeTab === "profile" ? (
          /* Profile Box - Centered Square */
          <div
            className="neural-node node-materialize animate-enter delay-1 profile-container"
            style={{
              width: "100%",
              maxWidth: "600px",
              aspectRatio: "1",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: "40px",
            }}
          >
            <span className="label-detail teamup-label">YOUR PROFILE</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "28px",
                marginTop: "16px",
                color: "#FFFFFF",
              }}
            >
              <div>
                <h3 className="user-profile-header">
                  {sanitizeText(userDetails.fullName, 100)}
                </h3>
                <p className="user-profile-sub">
                  {sanitizeText(userDetails.university, 200)} •{" "}
                  {sanitizeText(userDetails.sapId, 50)}
                </p>
              </div>
              <div>
                <div className="user-profile-info-row">
                  <span className="profile-label">Email:</span>{" "}
                  {sanitizeText(userDetails.email, 100)}
                </div>
                <div className="user-profile-info-row">
                  <span className="profile-label">Phone:</span>{" "}
                  {sanitizeText(userDetails.phone, 10)}
                </div>
                <div className="user-profile-info-row">
                  <span className="profile-label">
                    Member of UPES-Hypervision:
                  </span>{" "}
                  <span style={{ color: "#00D4FF", fontWeight: "600" }}>
                    {userDetails.isUPESHypervision ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div className="user-skills-box">
                <strong
                  style={{
                    color: "#FF4D4D",
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
                  {sanitizeText(userDetails.skills, 500) ||
                    "No skills provided"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Main Content - Centered */
          <>
            {!selectedTeam ? (
              <>
                {activeTab === "teams" && (
                  <div
                    style={{
                      width: "fit-content",
                      maxWidth: "100%",
                      margin: "0 auto",
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                    }}
                  >
                    {/* Toggle Buttons - Separate Container */}
                    {/* View Switching Toggle from Team Up Page */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
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
                          onClick={() => setTeamsSubSection("available-teams")}
                          style={{
                            background:
                              teamsSubSection === "available-teams"
                                ? "rgba(56, 189, 248, 0.2)"
                                : "transparent",
                            color:
                              teamsSubSection === "available-teams"
                                ? "#38bdf8"
                                : "#94a3b8",
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
                          AVAILABLE TEAMS
                        </button>
                        <button
                          onClick={() => setTeamsSubSection("sent-requests")}
                          style={{
                            background:
                              teamsSubSection === "sent-requests"
                                ? "rgba(56, 189, 248, 0.2)"
                                : "transparent",
                            color:
                              teamsSubSection === "sent-requests"
                                ? "#38bdf8"
                                : "#94a3b8",
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
                          SENT REQUESTS
                        </button>
                      </div>
                    </div>

                    {/* Content Section - Separate Container */}
                    <div
                      className="teams-content-section"
                      style={{
                        width: "fit-content",
                        height: "fit-content",
                        minHeight: "auto",
                        background: "transparent",
                        border: "none",
                        boxShadow: "none",
                        padding: 0,
                        margin: "0 auto",
                      }}
                    >
                      {teamsSubSection === "available-teams" ? (
                        <>
                          {acceptedTeam ? (
                            <CongratulationsBanner
                              acceptedTeam={acceptedTeam}
                              userDetails={userDetails}
                            />
                          ) : (
                            <Indi_AvailableTeams
                              teams={teams.filter(
                                (t) =>
                                  !t.requestStatus &&
                                  !rejectedTeamIds.includes(t.teamId),
                              )}
                              onViewTeam={setSelectedTeam}
                              scrollToTop={scrollToTop}
                            />
                          )}
                        </>
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
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Team Details Section */
              <div
                className="teams-content-section"
                style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
              >
                <Indi_TeamDetails
                  team={selectedTeam}
                  onClose={() => setSelectedTeam(null)}
                  onChat={(team) => {
                    setChatTeam(team);
                    setShowChat(true);
                  }}
                  onSendRequest={async (team) => {
                    try {
                      const response = await fetch(
                        "http://localhost:5000/api/individual/send-request",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ team_id: team.teamId }),
                        },
                      );

                      const data = await response.json();

                      if (response.ok) {
                        socket.emit("new_join_request", {
                          teamId: team.teamId,
                          individualName: userDetails.fullName,
                        });

                        showNotification(
                          `Request sent to ${team.teamName}!`,
                          "success",
                        );
                        setSelectedTeam(null);
                        // Refresh teams to update request status
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        showNotification(
                          data.error || "Failed to send request",
                          "error",
                        );
                      }
                    } catch (error) {
                      console.error("Error sending request:", error);
                      showNotification("Failed to send request", "error");
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
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
          userType="individual"
          onClose={() => {
            setShowChat(false);
            setChatTeam(null);
          }}
        />
      )}

      {/* Notification Badge */}
      {notification && (
        <NotificationBadge
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Indi_Dashboard;
