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

/* ✅ ADD THIS IMPORT */
import Viewgithubsubmission from "../components/admin/Viewgithubsubmission";
import ManualHackerrank from "../components/admin/ManualHackerrank";
import ViewHackerrank from "../components/admin/ViewHackerrank";
import SelectedTeam from "../components/admin/Selected_team";
import ReviewEvaluatedPPTs from "../components/admin/ReviewEvaluatedPPTs";

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

  // Menu items matching the exact order and names from AdminSidebar
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
      label: "View PPT Submissions",
      active: activeSection === "submissions",
    },
    {
      id: "review-ppts",
      label: "Review PPTs",
      active: activeSection === "review-ppts",
    },
    {
      id: "manual-ppt",
      label: "Manual PPT",
      active: activeSection === "manual-ppt",
    },
    {
      id: "view-github-submissions",
      label: "View GitHub Submissions",
      active: activeSection === "view-github-submissions",
    },
    {
      id: "manual-github",
      label: "Manual GitHub Submission",
      active: activeSection === "manual-github",
    },
    {
      id: "manual-hackerrank",
      label: "Manual Hackerrank",
      active: activeSection === "manual-hackerrank",
    },
    {
      id: "view-hackerrank",
      label: "View Hackerrank",
      active: activeSection === "view-hackerrank",
    },
    {
      id: "selected-teams",
      label: "Selected Teams",
      active: activeSection === "selected-teams",
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

      case "manual-hackerrank":
        return <ManualHackerrank />;

      case "view-hackerrank":
        return <ViewHackerrank />;

      case "review-ppts":
        return <ReviewEvaluatedPPTs />;

      case "selected-teams":
        return <SelectedTeam />;

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <GlobalNavbar
        userInfo={
          <>
            Admin: <strong>{adminInfo.login_id}</strong>
          </>
        }
        isAdmin={true}
        menuItems={adminMenuItems}
        onMenuItemClick={handleMenuItemClick}
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
