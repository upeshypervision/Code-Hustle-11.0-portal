import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import UserNavbar from "../components/user_dash/UserNavbar";
import PSGallery from "../components/user_dash/prob_stmt";
import DashboardView from "../components/user_dash/DashboardView";
import PPTSubmission from "../components/user_dash/PPTSubmission";
import GitHubSubmission from "../components/user_dash/GitHubSubmission";
import HackerrankSubmission from "../components/user_dash/HackerrankSubmission";
import "./UserPortal.css";

export default function UserPortal() {
  const navigate = useNavigate(); // Hook for redirection
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize from localStorage, default to 'dashboard' if not found
    return localStorage.getItem("userPortalActiveTab") || "dashboard";
  });
  const [selectedPS, setSelectedPS] = useState(null);
  const [isPPTSubmitted, setIsPPTSubmitted] = useState(false);
  const [isGithubSubmitted, setIsGithubSubmitted] = useState(false);

  // Add a specific loading state for the authentication check
  const [isLoading, setIsLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState({ login_id: "" });

  // Persist activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("userPortalActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    // CHECK YOUR PORT: Is your backend on 5001?
    // Ensure this matches your Flask/Node server console.
    fetch("http://localhost:5000/api/user-info", {
      method: "GET",
      credentials: "include", // Crucial for cookies
    })
      .then((res) => {
        // If server says Unauthorized (401) or Forbidden (403)
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setTeamInfo({ login_id: data.team_name });
          setIsLoading(false); // Stop loading, show dashboard
        } else {
          // API returned success: false
          console.error("Session invalid:", data.error);
          navigate("/login"); // Redirect to login
        }
      })
      .catch((err) => {
        console.error("Error fetching team info:", err);
        // If fetch fails (e.g., server down or 401), go to login
        navigate("/login");
      });
  }, [navigate]);

  const handlePSSelect = (ps) => {
    setSelectedPS(ps);
    setActiveTab("dashboard");
  };

  // 1. Prevent "Blinking": Don't render the dashboard until we confirm the user is logged in
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0f172a",
          color: "white",
        }}
      >
        <p>Verifying Session...</p>
      </div>
    );
  }

  // 2. Main Render
  return (
    <div
      className="dashboard-page"
      style={{
        background: "transparent",
        minHeight: "100vh",
        paddingTop: "70px",
      }}
    >
      <UserNavbar
        teamName={teamInfo.login_id}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* DASHBOARD VIEW */}
      {activeTab === "dashboard" && (
        <DashboardView
          selectedPS={selectedPS}
          isPPTSubmitted={isPPTSubmitted}
          isGithubSubmitted={isGithubSubmitted}
          setActiveTab={setActiveTab}
          teamName={teamInfo.login_id}
          activeTab={activeTab}
        />
      )}

      {/* OTHER TABS */}
      {activeTab !== "dashboard" && (
        <div
          className="main-content-wrapper"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            background: "transparent",
            position: "relative",
            boxSizing: "border-box",
            minHeight: "calc(100vh - 70px)",
          }}
        >
          {activeTab === "ps-selection" && (
            <div
              className="card-inner"
              style={{
                width: "100%",
                maxWidth: "100%",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minHeight: "100%",
              }}
            >
              <PSGallery
                onSelect={handlePSSelect}
                teamName={teamInfo.login_id}
              />
            </div>
          )}

          {activeTab === "hackerrank-submission" && (
            <div
              className="card-inner"
              style={{
                width: "100%",
                maxWidth: "100%",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minHeight: "100%",
              }}
            >
              <HackerrankSubmission teamName={teamInfo.login_id} />
            </div>
          )}

          {activeTab === "ppt-submission" && (
            <div
              className="card-inner"
              style={{
                width: "100%",
                maxWidth: "100%",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minHeight: "100%",
              }}
            >
              <PPTSubmission
                selectedPS={selectedPS}
                isSubmitted={isPPTSubmitted}
                onUploadSuccess={() => setIsPPTSubmitted(true)}
              />
            </div>
          )}

          {activeTab === "github-submission" && (
            <div
              className="card-inner"
              style={{ width: "100%", maxWidth: "100%", margin: "auto" }}
            >
              <GitHubSubmission
                isSubmitted={isGithubSubmitted}
                onUpload={() => {
                  setIsGithubSubmitted(true);
                  setActiveTab("dashboard");
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
