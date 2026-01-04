import { useState, useEffect } from "react";
import "./ViewTeams.css";

export default function ViewTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/teams", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTeams(data.teams);
      } else {
        setError(data.error || "Failed to fetch teams");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedTeamId(expandedTeamId === id ? null : id);
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    if (status.toLowerCase().includes("paid")) return "status-paid";
    if (status.toLowerCase().includes("manual")) return "status-manual";
    return "status-pending";
  };

  if (loading) return <div className="view-teams-container">Loading...</div>;
  if (error)
    return (
      <div className="view-teams-container" style={{ color: "#f87171" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="view-teams-container">
      <header className="navy-header">
        <h2 className="navy-title">Registered Teams</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <p className="navy-subtitle">
            Overview of all participating teams, members, and payment status.
          </p>
          <span
            style={{
              fontSize: "14px",
              color: "#38bdf8",
              fontWeight: 600,
              background: "rgba(56, 189, 248, 0.1)",
              padding: "5px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            Total Teams: {teams.length}
          </span>
        </div>
      </header>

      <div className="teams-list">
        {teams.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.5 }}>
            No teams registered yet.
          </p>
        ) : (
          teams.map((team) => (
            <div key={team.team_id} className="team-card">
              <div
                className="team-summary"
                onClick={() => toggleExpand(team.team_id)}
              >
                <div className="ts-main">
                  <p className="ts-header">
                    {team.team_name}{" "}
                    <span style={{ opacity: 0.5, fontWeight: 400 }}>
                      ({team.team_id})
                    </span>
                  </p>
                  <span className="ts-meta">
                    Leader: {team.leader.fullName} • Members:{" "}
                    {1 + (team.members ? team.members.length : 0)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <span
                    className={`status-badge ${getStatusClass(team.status)}`}
                  >
                    {team.status || "Unknown"}
                  </span>
                  <span style={{ fontSize: "12px", opacity: 0.5 }}>
                    {expandedTeamId === team.team_id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expandedTeamId === team.team_id && (
                <div className="team-details">
                  <div className="detail-grid">
                    {/* Members Column */}
                    <div className="members-table-wrapper">
                      <span className="dt-label">Team Rosters</span>
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
                          <tr>
                            <td style={{ color: "#fff", fontWeight: 600 }}>
                              {team.leader.fullName}
                            </td>
                            <td style={{ color: "#38bdf8" }}>LEADER</td>
                            <td>{team.leader.email}</td>
                            <td>{team.leader.sapid}</td>
                            <td>{team.leader.phone}</td>
                          </tr>
                          {team.members.map((m, idx) => (
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
                    </div>

                    {/* Info Column */}
                    <div className="info-box">
                      <span className="dt-label">Registration Data</span>

                      <div className="info-row">
                        <span className="info-label">Payment Amount</span>
                        <span className="info-val">₹{team.amount}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">
                          Transaction / Order ID
                        </span>
                        <span
                          className="info-val mono"
                          style={{ fontSize: "11px" }}
                        >
                          {team.order_id || "N/A"}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Login Password</span>
                        {/* In a real app, maybe hide this or show only if manual */}
                        <span className="info-val mono">
                          {team.payment_id === "MANUAL_ENTRY"
                            ? "Hidden (Check Log)"
                            : "Hidden"}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Registered On</span>
                        <span className="info-val" style={{ fontSize: "11px" }}>
                          {new Date(
                            team.timestamp.endsWith("Z")
                              ? team.timestamp
                              : team.timestamp + "Z"
                          ).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour12: true,
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
