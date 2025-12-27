import { useState } from 'react';

export default function EditTeams() {
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [editingTeam, setEditingTeam] = useState(null);
    const [editTeamData, setEditTeamData] = useState({
        team_name: '', leaderId: '', members: []
    });

    const demoTeams = [
        {
            id: "CH-TEAM-001",
            name: "HyperCoders",
            leader: "Ananya Sharma",
            leaderId: "50001234",
            members: [
                { name: "Ananya Sharma", sapId: "50001234", role: "Team Lead" },
                { name: "Rohit Kumar", sapId: "50001235", role: "Backend" },
                { name: "Priya Singh", sapId: "50001236", role: "Frontend" }
            ]
        },
        {
            id: "CH-TEAM-002",
            name: "Bit Benders",
            leader: "Sneha Gupta",
            leaderId: "50002345",
            members: [
                { name: "Sneha Gupta", sapId: "50002345", role: "Team Lead" },
                { name: "Arjun Patel", sapId: "50002346", role: "Full Stack" },
                { name: "Neha Reddy", sapId: "50002347", role: "UI/UX" },
                { name: "Vikram Kumar", sapId: "50002348", role: "Backend" }
            ]
        },
        {
            id: "CH-TEAM-003",
            name: "Debug Demons",
            leader: "Rahul Verma",
            leaderId: "50003456",
            members: [
                { name: "Rahul Verma", sapId: "50003456", role: "Team Lead" },
                { name: "Kavya Nair", sapId: "50003457", role: "Frontend" }
            ]
        }
    ];

    const handleEditTeam = (team) => {
        setEditingTeam(team.id);
        setEditTeamData({
            team_name: team.name,
            leaderId: team.leaderId,
            members: team.members
        });
    };

    const handleSaveTeam = () => {
        // In production, save to backend
        setEditingTeam(null);
    };

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">Edit Teams</h2>
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        Click on a team to expand and edit details.
                    </p>

                    {demoTeams.map((team) => (
                        <div key={team.id} style={{ marginBottom: '12px' }}>
                            <div
                                className="submission-card"
                                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="submission-info">
                                    <p className="submission-team">
                                        {team.name} ({team.id})
                                    </p>
                                    <p className="submission-meta">
                                        Leader: {team.leader} ({team.leaderId}) · {team.members.length} members
                                    </p>
                                </div>
                                <div className="submission-actions">
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {expandedTeam === team.id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {expandedTeam === team.id && (
                                <div style={{
                                    background: 'rgba(15,23,42,0.95)',
                                    border: '1px solid rgba(148,163,184,0.25)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '16px',
                                    marginTop: '8px'
                                }}>
                                    {editingTeam === team.id ? (
                                        <div className="form">
                                            <div className="form-row">
                                                <label className="form-label">Team Name</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    value={editTeamData.team_name}
                                                    onChange={(e) => setEditTeamData({ ...editTeamData, team_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-row">
                                                <label className="form-label">Leader SAP ID</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    value={editTeamData.leaderId}
                                                    onChange={(e) => setEditTeamData({ ...editTeamData, leaderId: e.target.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button onClick={handleSaveTeam} className="button-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}>
                                                    Save Changes
                                                </button>
                                                <button onClick={() => setEditingTeam(null)} className="btn-small">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Team Members:</h4>
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>SAP ID</th>
                                                        <th>Role</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {team.members.map((member, idx) => (
                                                        <tr key={idx}>
                                                            <td>{member.name}</td>
                                                            <td>{member.sapId}</td>
                                                            <td>{member.role}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button
                                                onClick={() => handleEditTeam(team)}
                                                className="btn-small"
                                                style={{ marginTop: '12px' }}
                                            >
                                                Edit Team Details
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
