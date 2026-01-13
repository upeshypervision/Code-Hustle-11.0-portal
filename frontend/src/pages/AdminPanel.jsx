import { useState, useEffect } from "react";
import GlobalNavbar from "../components/GlobalNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import RoundManagement from "../components/admin/RoundManagement";
import ProblemStatements from "../components/admin/ProblemStatements";
import AddParticipant from "../components/admin/AddParticipant";
import ViewTeams from "../components/admin/ViewTeams";
import ViewSubmissions from "../components/admin/ViewSubmissions";
import ManualPPT from "../components/admin/ManualPPT";
import Manualgithub from "../components/admin/Manualgithub";
import ViewCreateTeams from "../components/admin/ViewCreateTeams";
import ViewIndividuals from "../components/admin/ViewIndividuals";
import ViewChatMessages from "../components/admin/ViewChatMessages";

/* ✅ ORIGINAL IMPORTS KEPT STRICTLY INTACT */
import Viewgithubsubmission from "../components/admin/Viewgithubsubmission";
import ManualHackerrank from "../components/admin/ManualHackerrank";
import ViewHackerrank from "../components/admin/ViewHackerrank";
import SelectedTeam from "../components/admin/Selected_team";
import ReviewEvaluatedPPTs from "../components/admin/ReviewEvaluatedPPTs";

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("rounds");
  const [adminInfo, setAdminInfo] = useState({ login_id: "Loading..." });

  /* ✅ MOBILE STATE */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/user-info", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.role === "admin") {
          setAdminInfo({ login_id: data.login_id });
        }
      })
      .catch((err) => console.error("Error fetching admin info:", err));
  }, []);

  const adminMenuItems = [
    { id: "rounds", label: "Round Management", active: activeSection === "rounds" },
    { id: "view-teams", label: "View Teams", active: activeSection === "view-teams" },
    { id: "problem-statements", label: "Problem Statements", active: activeSection === "problem-statements" },
    { id: "submissions", label: "View PPT Submissions", active: activeSection === "submissions" },
    { id: "review-ppts", label: "Review PPTs", active: activeSection === "review-ppts" },
    { id: "manual-ppt", label: "Manual PPT", active: activeSection === "manual-ppt" },
    { id: "view-github-submissions", label: "View GitHub Submissions", active: activeSection === "view-github-submissions" },
    { id: "manual-github", label: "Manual GitHub Submission", active: activeSection === "manual-github" },
    { id: "manual-hackerrank", label: "Manual Hackerrank", active: activeSection === "manual-hackerrank" },
    { id: "view-hackerrank", label: "View Hackerrank", active: activeSection === "view-hackerrank" },
    { id: "selected-teams", label: "Selected Teams", active: activeSection === "selected-teams" },
    { id: "view-create-teams", label: "View Create Teams", active: activeSection === "view-create-teams" },
    { id: "view-individuals", label: "View Individuals", active: activeSection === "view-individuals" },
    { id: "view-chat-messages", label: "View Chat Messages", active: activeSection === "view-chat-messages" },
    { id: "add-participant", label: "Add Participant", active: activeSection === "add-participant" },
  ];

  const handleMenuItemClick = (item) => {
    setActiveSection(item.id);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "rounds": return <RoundManagement />;
      case "problem-statements": return <ProblemStatements />;
      case "add-participant": return <AddParticipant />;
      case "view-teams": return <ViewTeams />;
      case "submissions": return <ViewSubmissions />;
      case "manual-ppt": return <ManualPPT />;
      case "manual-github": return <Manualgithub />;
      case "view-github-submissions": return <Viewgithubsubmission />;
      case "manual-hackerrank": return <ManualHackerrank />;
      case "view-hackerrank": return <ViewHackerrank />;
      case "review-ppts": return <ReviewEvaluatedPPTs />;
      case "selected-teams": return <SelectedTeam />;
      case "view-create-teams": return <ViewCreateTeams />;
      case "view-individuals": return <ViewIndividuals />;
      case "view-chat-messages": return <ViewChatMessages />;
      default: return null;
    }
  };

  return (
    <div className={`dashboard-page ${isMobileMenuOpen ? "sidebar-visible" : ""}`}>
      <style>{`
        @media (max-width: 1024px) {
          .hamburger-menu {
            display: flex !important;
            visibility: visible !important;
          }
          .admin-sidebar-v2 {
            position: fixed !important;
            left: ${isMobileMenuOpen ? "0" : "-100%"} !important;
            top: 0;
            z-index: 2000;
          }
          .admin-layout {
            display: block !important;
          }
          .admin-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
        @media (min-width: 1025px) {
          .hamburger-menu {
            display: none !important;
          }
          .admin-sidebar-v2 {
            left: 0 !important;
            position: relative !important;
          }
        }
      `}</style>

      <GlobalNavbar
        userInfo={<>Admin: <strong>{adminInfo.login_id}</strong></>}
        isAdmin={true}
        menuItems={adminMenuItems}
        onMenuItemClick={handleMenuItemClick}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="admin-layout">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={(id) => {
            setActiveSection(id);
            setIsMobileMenuOpen(false);
          }}
          isMobileOpen={isMobileMenuOpen}
        />

        <main className="admin-content">{renderContent()}</main>

        {isMobileMenuOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'block',
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1999
            }}
          ></div>
        )}
      </div>
    </div>
  );
}