import React, { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  FileStack,
  Github,
  Code2,
  Users2,
  UserPlus,
  Target
} from "lucide-react";
import "./AdminSidebar.css";

export default function AdminSidebar({ activeSection, setActiveSection, isMobileOpen }) {
  const [openMenus, setOpenMenus] = useState({
    ppt: false,
    github: false,
    hacker: false,
    teams: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <aside className={`admin-sidebar-v2 ${isMobileOpen ? "mobile-open" : ""}`}>
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-title">Admin Console</h2>
        <p className="admin-sidebar-subtitle">Code Hustle Management</p>
      </div>

      <div className="sidebar-scroll-container">
        {/* CORE OPS */}
        <div className="sidebar-section-label">CORE OPS</div>
        <button
          className={`nav-item-v2 ${activeSection === "rounds" ? "active-glow" : ""}`}
          onClick={() => setActiveSection("rounds")}
        >
          <span className="icon-box"><LayoutDashboard size={18} /></span>
          <span className="label-text">Round Management</span>
        </button>

        <button
          className={`nav-item-v2 ${activeSection === "problem-statements" ? "active-glow" : ""}`}
          onClick={() => setActiveSection("problem-statements")}
        >
          <span className="icon-box"><Target size={18} /></span>
          <span className="label-text">Problem Statements</span>
        </button>

        {/* PPT FORGE */}
        <div className="dropdown-node">
          <button className={`dropdown-trigger ${openMenus.ppt ? "open" : ""}`} onClick={() => toggleMenu('ppt')}>
            <span className="icon-box"><FileStack size={18} /></span>
            <span className="label-text">PPT FORGE</span>
            <ChevronDown className="arrow-icon" size={14} />
          </button>
          <div className={`dropdown-content ${openMenus.ppt ? "expanded" : ""}`}>
            <button className={activeSection === "submissions" ? "sub-active" : ""} onClick={() => setActiveSection("submissions")}>View PPT Submissions</button>
            <button className={activeSection === "review-ppts" ? "sub-active" : ""} onClick={() => setActiveSection("review-ppts")}>Review PPTs</button>
            <button className={activeSection === "manual-ppt" ? "sub-active" : ""} onClick={() => setActiveSection("manual-ppt")}>Manual PPT</button>
          </div>
        </div>

        {/* GITHUB SYNC */}
        <div className="dropdown-node">
          <button className={`dropdown-trigger ${openMenus.github ? "open" : ""}`} onClick={() => toggleMenu('github')}>
            <span className="icon-box"><Github size={18} /></span>
            <span className="label-text">GITHUB SYNC</span>
            <ChevronDown className="arrow-icon" size={14} />
          </button>
          <div className={`dropdown-content ${openMenus.github ? "expanded" : ""}`}>
            <button className={activeSection === "view-github-submissions" ? "sub-active" : ""} onClick={() => setActiveSection("view-github-submissions")}>View GitHub Submissions</button>
            <button className={activeSection === "manual-github" ? "sub-active" : ""} onClick={() => setActiveSection("manual-github")}>Manual GitHub Submission</button>
          </div>
        </div>

        {/* HACKERRANK LAB */}
        <div className="dropdown-node">
          <button className={`dropdown-trigger ${openMenus.hacker ? "open" : ""}`} onClick={() => toggleMenu('hacker')}>
            <span className="icon-box"><Code2 size={18} /></span>
            <span className="label-text">HACKERRANK</span>
            <ChevronDown className="arrow-icon" size={14} />
          </button>
          <div className={`dropdown-content ${openMenus.hacker ? "expanded" : ""}`}>
            <button className={activeSection === "view-hackerrank" ? "sub-active" : ""} onClick={() => setActiveSection("view-hackerrank")}>View Hackerrank</button>
            <button className={activeSection === "manual-hackerrank" ? "sub-active" : ""} onClick={() => setActiveSection("manual-hackerrank")}>Manual Hackerrank</button>
          </div>
        </div>

        {/* TEAM NEXUS */}
        <div className="dropdown-node">
          <button className={`dropdown-trigger ${openMenus.teams ? "open" : ""}`} onClick={() => toggleMenu('teams')}>
            <span className="icon-box"><Users2 size={18} /></span>
            <span className="label-text">TEAM NEXUS</span>
            <ChevronDown className="arrow-icon" size={14} />
          </button>
          <div className={`dropdown-content ${openMenus.teams ? "expanded" : ""}`}>
            <button className={activeSection === "view-teams" ? "sub-active" : ""} onClick={() => setActiveSection("view-teams")}>View Teams</button>
            <button className={activeSection === "selected-teams" ? "sub-active" : ""} onClick={() => setActiveSection("selected-teams")}>Selected Teams</button>
            <button className={activeSection === "view-create-teams" ? "sub-active" : ""} onClick={() => setActiveSection("view-create-teams")}>View Create Teams</button>
            <button className={activeSection === "view-individuals" ? "sub-active" : ""} onClick={() => setActiveSection("view-individuals")}>View Individuals</button>
            <button className={activeSection === "view-chat-messages" ? "sub-active" : ""} onClick={() => setActiveSection("view-chat-messages")}>View Chat Messages</button>
          </div>
        </div>

        {/* USER OPS */}
        <div className="sidebar-section-label" style={{ marginTop: '20px' }}>USER OPS</div>
        <button
          className={`nav-item-v2 ${activeSection === "add-participant" ? "active-glow" : ""}`}
          onClick={() => setActiveSection("add-participant")}
        >
          <span className="icon-box"><UserPlus size={18} /></span>
          <span className="label-text">Add Participant</span>
        </button>
      </div>

      <div className="sidebar-vfx-glow"></div>
    </aside>
  );
}