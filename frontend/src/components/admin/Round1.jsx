import React, { useEffect, useState } from "react";

export default function Round1() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/approved-hackerrank-teams", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeams(data.teams);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching Round 1 teams:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ color: "#fff" }}>Loading Round 1 teams...</p>;
  }

  return (
    <div className="admin-content">
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>
        Round 1 – Hackerrank Selected Teams
      </h2>

      {teams.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.6)" }}>
          No teams approved for Round 1 yet.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {teams.map((team, index) => (
            <li
              key={team.team_id}
              style={{
                padding: "12px 16px",
                marginBottom: "10px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: "600"
              }}
            >
              {index + 1}. {team.team_id}
              {team.team_name && (
                <span style={{ opacity: 0.7 }}> ({team.team_name})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
