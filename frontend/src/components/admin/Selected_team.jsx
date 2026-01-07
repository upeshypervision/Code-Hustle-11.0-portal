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

  const [expandedTeamId, setExpandedTeamId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedTeamId(expandedTeamId === id ? null : id);
  };

  // Reuse styling from ViewTeams or embed simpler version if CSS not imported
  // But strictly, we should try to match the UI.

  return (
    <div className="admin-content">
      {/* Existing Styles + New embedded styles for tables to avoid dependency issues if ViewTeams.css isn't global */}
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
          
          /* New Styles for Expanded View */
          .st-card {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            margin-bottom: 10px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .st-header {
             padding: 15px 20px;
             display: flex;
             align-items: center;
             justify-content: space-between;
             cursor: pointer;
             transition: background 0.2s;
          }
          .st-header:hover {
             background: rgba(255,255,255,0.08);
          }
          .st-details {
             padding: 0 20px 20px 20px;
             border-top: 1px solid rgba(255,255,255,0.05);
             animation: slideDown 0.3s ease-out;
             background: rgba(0,0,0,0.2);
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .navy-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 0.9rem;
          }
          .navy-table th {
            text-align: left;
            padding: 10px;
            color: #94a3b8;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .navy-table td {
            padding: 10px;
            color: #cbd5e1;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .info-grid {
             display: grid;
             grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
             gap: 20px;
             margin-top: 20px;
          }
          .info-item {
             display: flex;
             flex-direction: column;
          }
          .info-label {
             color: #94a3b8;
             font-size: 0.8rem;
             margin-bottom: 5px;
          }
          .info-val {
             color: #fff;
             font-weight: 500;
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
        <div className="teams-list">
          {teams.map((team, index) => (
            <div key={team.team_id || index} className="st-card">
              <div
                className="st-header"
                onClick={() => toggleExpand(team.team_id)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    marginRight: "15px",
                    opacity: 0.5,
                    fontSize: "0.8rem",
                    fontFamily: "monospace",
                    width: "25px"
                  }}>
                    {index + 1}.
                  </span>
                  <span style={{ color: "#22c55e", marginRight: "10px", fontWeight: "bold" }}>
                    {team.team_id}
                  </span>
                  {team.team_name && (
                    <span style={{ color: "#fff", fontWeight: "600", fontSize: '1.1rem' }}> – {team.team_name}</span>
                  )}
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
                  {expandedTeamId === team.team_id ? "▲ Collapse" : "▼ Details"}
                </span>
              </div>

              {expandedTeamId === team.team_id && (
                <div className="st-details">
                  {/* Members Table */}
                  <table className="navy-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>SAP ID</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Leader */}
                      {team.leader && (
                        <tr>
                          <td style={{ color: "#fff", fontWeight: 600 }}>{team.leader.fullName}</td>
                          <td style={{ color: "#38bdf8" }}>LEADER</td>
                          <td>{team.leader.email}</td>
                          <td>{team.leader.sapid}</td>
                          <td>{team.leader.phone}</td>
                        </tr>
                      )}
                      {/* Members */}
                      {team.members && team.members.map((m, idx) => (
                        <tr key={idx}>
                          <td>{m.fullName}</td>
                          <td>MEMBER</td>
                          <td>{m.email}</td>
                          <td>{m.sapid}</td>
                          <td>{m.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Info Grid (No Payment) */}
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Assigned Problem Statement</span>
                      <span className="info-val" style={{ color: team.selected_ps_id ? '#fbbf24' : '#94a3b8' }}>
                        {team.selected_ps_id || "Not Selected"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Registration Date</span>
                      <span className="info-val">
                        {team.timestamp ? new Date(team.timestamp).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {/* Add other non-payment fields if available */}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
