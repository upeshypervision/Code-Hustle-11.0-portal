import React, { useEffect, useState } from "react";

export default function SelectedTeam() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState("round1"); // round1, round2, round3

  useEffect(() => {
    fetchTeams();
  }, [selectedRound]);

  const fetchTeams = () => {
    setLoading(true);
    let endpoint = "";

    switch (selectedRound) {
      case "round1":
        endpoint = "/api/admin/approved-hackerrank-teams";
        break;
      case "round2":
        endpoint = "/api/admin/approved-ppt-teams";
        break;
      case "round3":
        endpoint = "/api/admin/approved-github-teams";
        break;
      default:
        endpoint = "/api/admin/approved-hackerrank-teams";
    }

    fetch(`http://localhost:5000${endpoint}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeams(data.teams || []);
        } else {
          console.error("Failed to fetch teams:", data.error);
          setTeams([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(`Error fetching ${selectedRound} teams:`, err);
        setLoading(false);
      });
  };

  const getRoundTitle = () => {
    switch (selectedRound) {
      case "round1": return "Round 1 – Hackerrank Selected Teams";
      case "round2": return "Round 2 – PPT Selected Teams";
      case "round3": return "Round 3 – GitHub Winners";
      default: return "Selected Teams";
    }
  };

  return (
    <div className="admin-content">
      <style>
        {`
          .custom-select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            padding: 10px 40px 10px 16px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.08);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            outline: none;
            transition: all 0.2s ease;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 16px;
          }
          .custom-select:hover {
            background-color: rgba(255, 255, 255, 0.12);
            border-color: rgba(255, 255, 255, 0.4);
          }
          .custom-select:focus {
            border-color: #22c55e;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
          }
          .custom-select option {
            background-color: #1a1a1a;
            color: #fff;
            padding: 10px;
          }
        `}
      </style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
          {getRoundTitle()}
        </h2>

        <select
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
          className="custom-select"
        >
          <option value="round1">Round 1 (Hackerrank)</option>
          <option value="round2">Round 2 (PPT)</option>
          <option value="round3">Round 3 (GitHub)</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "#fff" }}>Loading teams...</p>
      ) : teams.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.6)" }}>
          No teams found for {getRoundTitle()}.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {teams.map((team, index) => (
            <li
              key={team.team_id || index}
              style={{
                padding: "12px 16px",
                marginBottom: "10px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: "600",
                display: "flex",
                alignItems: "center"
              }}
            >
              <span style={{
                marginRight: "15px",
                opacity: 0.5,
                fontSize: "0.8rem",
                fontFamily: "monospace",
                width: "25px"
              }}>
                {index + 1}.
              </span>
              <span style={{ color: "#22c55e", marginRight: "10px" }}>
                {team.team_id}
              </span>
              {team.team_name && (
                <span style={{ opacity: 0.9 }}> – {team.team_name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
