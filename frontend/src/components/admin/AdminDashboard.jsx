import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";

import RoundManagement from "./RoundManagement";
import ViewTeams from "./ViewTeams";
import ProblemStatements from "./ProblemStatements";
import ViewSubmissions from "./ViewSubmissions";
import ManualPPT from "./ManualPPT";
import Viewgithubsubmission from "./Viewgithubsubmission";
import Manualgithub from "./Manualgithub";
import ManualHackerrank from "./ManualHackerrank";
import ViewHackerrank from "./ViewHackerrank";
import AddParticipant from "./AddParticipant";
import Round1 from "./Round1";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("rounds");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div style={{ flex: 1, padding: "20px" }}>
        {activeSection === "rounds" && <RoundManagement />}
        {activeSection === "view-teams" && <ViewTeams />}
        {activeSection === "problem-statements" && <ProblemStatements />}
        {activeSection === "submissions" && <ViewSubmissions />}
        {activeSection === "manual-ppt" && <ManualPPT />}
        {activeSection === "view-github-submissions" && <Viewgithubsubmission />}
        {activeSection === "manual-github" && <Manualgithub />}
        {activeSection === "manual-hackerrank" && <ManualHackerrank />}
        {activeSection === "view-hackerrank" && <ViewHackerrank />}

        {/* 🔥 THIS IS WHAT MAKES ROUND 1 WORK */}
        {activeSection === "round-1" && <Round1 />}

        {activeSection === "add-participant" && <AddParticipant />}
      </div>
    </div>
  );
}
