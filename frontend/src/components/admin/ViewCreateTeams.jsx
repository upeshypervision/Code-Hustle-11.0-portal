import React, { useState, useEffect } from "react";
import "./ViewTeams.css";

const ViewCreateTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/admin/view-create-teams", {
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) {
                setTeams(data.teams || []);
            }
        } catch (error) {
            console.error("Error fetching create teams:", error);
        } finally {
            setLoading(false);
        }
    };

    // State to track expanded teams
    const [expandedTeams, setExpandedTeams] = useState({});

    const toggleTeam = (teamId) => {
        setExpandedTeams(prev => ({
            ...prev,
            [teamId]: !prev[teamId]
        }));
    };

    const filteredTeams = teams.filter(team => {
        const search = searchTerm.toLowerCase();
        return (
            (team.teamName || "").toLowerCase().includes(search) ||
            (team.teamId || "").toLowerCase().includes(search) ||
            (team.leaderName || "").toLowerCase().includes(search)
        );
    });

    return (
        <div className="view-teams-container">
            <div className="navy-header">
                <h2 className="navy-title">All Create Teams</h2>
                <p className="navy-subtitle">View all teams from create_team collection</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "10px 15px",
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                        fontSize: "14px",
                        width: "300px"
                    }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading teams...
                </div>
            ) : (
                <div>
                    {filteredTeams.map((team) => {
                        const isExpanded = expandedTeams[team.teamId];
                        return (
                            <div key={team.teamId} className="team-card">
                                <div
                                    className="team-summary"
                                    onClick={() => toggleTeam(team.teamId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                                        {/* Chevron Icon */}
                                        <div style={{
                                            transition: 'transform 0.2s ease',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#64748b'
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </div>

                                        <div className="ts-main">
                                            <h3 className="ts-header">
                                                {team.teamName} <span className="mono-font" style={{ fontSize: '0.8em', color: '#64748b' }}>({team.teamId})</span>
                                            </h3>
                                            <div className="ts-meta">
                                                {team.memberCount}/5 Members
                                            </div>
                                        </div>
                                    </div>

                                    <span className={`status-badge ${team.memberCount === 5 ? "status-success" : "status-pending"}`}>
                                        {team.memberCount === 5 ? "FULL" : "INCOMPLETE"}
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div className="team-details">
                                        <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                                            <div className="members-table-wrapper">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <span className="dt-label">Team Roster</span>
                                                    {team.teamBio && (
                                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                            "{team.teamBio}"
                                                        </span>
                                                    )}
                                                </div>
                                                <table className="navy-table">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '30%' }}>Name</th>
                                                            <th style={{ width: '35%' }}>Email</th>
                                                            <th style={{ width: '20%' }}>Phone</th>
                                                            <th style={{ width: '15%' }}>Source</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                {team.leaderName}
                                                                <span style={{
                                                                    marginLeft: '8px',
                                                                    fontSize: '10px',
                                                                    background: '#3b82f6',
                                                                    color: '#fff',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    fontWeight: 'bold',
                                                                    verticalAlign: 'middle'
                                                                }}>LEADER</span>
                                                            </td>
                                                            <td>{team.leaderEmail}</td>
                                                            <td>{team.leaderPhone || "N/A"}</td>
                                                            <td><span className="status-badge status-paid">Original</span></td>
                                                        </tr>
                                                        {team.members && team.members.map((member, idx) => (
                                                            <tr key={idx}>
                                                                <td>{member.name}</td>
                                                                <td>{member.email}</td>
                                                                <td>{member.phone || "N/A"}</td>
                                                                <td>
                                                                    {member.joinedViaRequest ? (
                                                                        <span className="status-badge status-manual">Accepted</span>
                                                                    ) : (
                                                                        <span className="status-badge status-paid">Original</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredTeams.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                            No teams found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewCreateTeams;
