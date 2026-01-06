import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import RoundManagement from "../components/admin/RoundManagement";
import ProblemStatements from "../components/admin/ProblemStatements";
import AddParticipant from "../components/admin/AddParticipant";
import ViewTeams from "../components/admin/ViewTeams";
import ViewSubmissions from "../components/admin/ViewSubmissions";
import ManualPPT from "../components/admin/ManualPPT";
import Manualgithub from "../components/admin/Manualgithub";

/* ✅ ADD THIS IMPORT */
import Viewgithubsubmission from "../components/admin/Viewgithubsubmission";

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("rounds");
  const [adminInfo, setAdminInfo] = useState({ login_id: "Loading..." });

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
    {
      id: "rounds",
      label: "Round Management",
      active: activeSection === "rounds",
    },
    {
      id: "view-teams",
      label: "View Teams",
      active: activeSection === "view-teams",
    },
    {
      id: "problem-statements",
      label: "Problem Statements",
      active: activeSection === "problem-statements",
    },
    {
      id: "submissions",
      label: "View Submissions",
      active: activeSection === "submissions",
    },
    {
      id: "manual-ppt",
      label: "Manual PPT",
      active: activeSection === "manual-ppt",
    },
    {
      id: "manual-github",
      label: "Manual GitHub Submission",
      active: activeSection === "manual-github",
    },
    {
      id: "view-github-submissions",
      label: "View GitHub Submissions",
      active: activeSection === "view-github-submissions",
    },
    {
      id: "add-participant",
      label: "Add Participant",
      active: activeSection === "add-participant",
    },
  ];

  const handleMenuItemClick = (item) => {
    setActiveSection(item.id);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "rounds":
        return <RoundManagement />;

      case "problem-statements":
        return <ProblemStatements />;

      case "add-participant":
        return <AddParticipant />;

      case "view-teams":
        return <ViewTeams />;

      case "submissions":
        return <ViewSubmissions />;

      case "manual-ppt":
        return <ManualPPT />;

      case "manual-github":
        return <Manualgithub />;

      case "view-github-submissions":
        return <Viewgithubsubmission />;

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar
        style={{
          background: "transparent",
          backdropFilter: "none",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          fontFamily: "'Orbitron', sans-serif",
        }}
        userInfo={
          <>
            Admin: <strong>{adminInfo.login_id}</strong>
          </>
        }
        isAdmin={true}
        menuItems={adminMenuItems}
        onMenuItemClick={handleMenuItemClick}
        hideSubtitle={true}
      />

      <div className="admin-layout">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
}
