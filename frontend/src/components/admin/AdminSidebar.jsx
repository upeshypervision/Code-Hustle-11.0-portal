import React from "react";

export default function AdminSidebar({ activeSection, setActiveSection }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-title">Admin Console</h2>
        <p className="admin-sidebar-subtitle">Code Hustle Management</p>
      </div>

      <ul className="admin-nav-menu">
        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "rounds" ? "active" : ""
              }`}
            onClick={() => setActiveSection("rounds")}
          >
            <span>Round Management</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "view-teams" ? "active" : ""
              }`}
            onClick={() => setActiveSection("view-teams")}
          >
            <span>View Teams</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "problem-statements" ? "active" : ""
              }`}
            onClick={() => setActiveSection("problem-statements")}
          >
            <span>Problem Statements</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "submissions" ? "active" : ""
              }`}
            onClick={() => setActiveSection("submissions")}
          >
            <span>View PPT Submissions</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "review-ppts" ? "active" : ""}`}
            onClick={() => setActiveSection("review-ppts")}
          >
            <span>Review PPTs</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "manual-ppt" ? "active" : ""
              }`}
            onClick={() => setActiveSection("manual-ppt")}
          >
            <span>Manual PPT</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "view-github-submissions" ? "active" : ""
              }`}
            onClick={() => setActiveSection("view-github-submissions")}
          >
            <span>View GitHub Submissions</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "manual-github" ? "active" : ""
              }`}
            onClick={() => setActiveSection("manual-github")}
          >
            <span>Manual GitHub Submission</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "manual-hackerrank" ? "active" : ""
              }`}
            onClick={() => setActiveSection("manual-hackerrank")}
          >
            <span>Manual Hackerrank</span>
          </a>
        </li>

        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "view-hackerrank" ? "active" : ""
              }`}
            onClick={() => setActiveSection("view-hackerrank")}
          >
            <span>View Hackerrank</span>
          </a>
        </li>
        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "selected-teams" ? "active" : ""}`}
            onClick={() => setActiveSection("selected-teams")}
          >
            <span>Selected Teams</span>
          </a>
        </li>



        <li className="admin-nav-item">
          <a
            className={`admin-nav-link ${activeSection === "add-participant" ? "active" : ""
              }`}
            onClick={() => setActiveSection("add-participant")}
          >
            <span>Add Participant</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}
