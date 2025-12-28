import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Modal from '../../components/Modal';
const API_BASE = "http://localhost:8000";

export default function ProblemStatements() {
    const [psVisible, setPsVisible] = useState(false);
    const [psToggles, setPsToggles] = useState({
        PS001: true,
        PS002: true,
        PS003: true
    });
    const [selectedPs, setSelectedPs] = useState(null);
    const [newPs, setNewPs] = useState({ id: '', title: '', track: '' });
    const [psMessage, setPsMessage] = useState({ type: '', text: '' });
    useEffect(() => {
        fetch(`${API_BASE}/admin/settings`)
          .then(res => res.json())
          .then(data => setPsVisible(data.psVisible))
          .catch(err => console.error("Failed to load settings", err));
      }, []);
      
      useEffect(() => {
        const socket = io(API_BASE);
      
        socket.on("PS_VISIBILITY_UPDATED", (data) => {
          setPsVisible(data.psVisible);
        });
      
        return () => socket.disconnect();
      }, []);
      
    // Demo data
    const demoPs = [
        {
            id: "PS001",
            title: "Smart campus mobility",
            track: "Smart Cities",
            selections: 12,
            teams: [
                { teamId: "CH-TEAM-001", teamName: "HyperCoders", leader: "Ananya Sharma" },
                { teamId: "CH-TEAM-003", teamName: "Debug Demons", leader: "Rahul Verma" },
                { teamId: "CH-TEAM-007", teamName: "Code Crushers", leader: "Priya Singh" },
                { teamId: "CH-TEAM-012", teamName: "Tech Titans", leader: "Arjun Patel" }
            ]
        },
        {
            id: "PS002",
            title: "Developer productivity insights",
            track: "DevTools",
            selections: 8,
            teams: [
                { teamId: "CH-TEAM-002", teamName: "Bit Benders", leader: "Sneha Gupta" },
                { teamId: "CH-TEAM-005", teamName: "Code Ninjas", leader: "Vikram Kumar" },
                { teamId: "CH-TEAM-009", teamName: "Logic Lords", leader: "Neha Reddy" }
            ]
        },
        {
            id: "PS003",
            title: "Green energy monitor",
            track: "Sustainability",
            selections: 15,
            teams: [
                { teamId: "CH-TEAM-004", teamName: "Eco Warriors", leader: "Amit Joshi" },
                { teamId: "CH-TEAM-006", teamName: "Green Geeks", leader: "Riya Malhotra" },
                { teamId: "CH-TEAM-008", teamName: "Sustain Squad", leader: "Karan Mehta" },
                { teamId: "CH-TEAM-011", teamName: "Planet Protectors", leader: "Divya Iyer" },
                { teamId: "CH-TEAM-013", teamName: "Carbon Coders", leader: "Rohan Das" }
            ]
        }
    ];
    
    const toggleGlobalVisibility = async (checked) => {
        setPsVisible(checked);
      
        await fetch(
          `${API_BASE}/admin/settings/ps-visibility?visible=${checked}`,
          { method: "POST" }
        );
      };
      
    const handleAddPs = (e) => {
        e.preventDefault();
        if (!newPs.id.trim() || !newPs.title.trim()) {
            setPsMessage({ type: 'error', text: 'PS ID and Title are required.' });
            return;
        }
        setPsMessage({
            type: 'success',
            text: `Problem Statement ${newPs.id} added successfully! Backend should persist this.`
        });
        setPsToggles({ ...psToggles, [newPs.id]: true });
        setNewPs({ id: '', title: '', track: '' });
    };

    const togglePsVisibility = (psId) => {
        setPsToggles({ ...psToggles, [psId]: !psToggles[psId] });
    };

    const handleViewTeams = (ps) => {
        setSelectedPs(ps);
    };

    const handleCloseModal = () => {
        setSelectedPs(null);
    };

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">Problem Statements</h2>
                <label className="toggle-label">
                    <span style={{ fontSize: '0.85rem', marginRight: '8px' }}>
                        Global PS Visibility
                    </span>
                    <div className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={psVisible}
                        onChange={(e) => toggleGlobalVisibility(e.target.checked)}
                    />

                        <span className="toggle-slider"></span>
                    </div>
                </label>
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '12px' }}>
                        {psVisible
                            ? '✅ Problem statements are globally visible. Use individual toggles below to hide specific PS.'
                            : '🔒 All problem statements are globally hidden from participants'}
                    </p>

                    <h3 style={{ fontSize: '0.9rem', margin: '16px 0 8px' }}>Active Problem Statements</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Visible</th>
                                <th>PS ID</th>
                                <th>Title</th>
                                <th>Track</th>
                                <th>Selections</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demoPs.map((ps) => (
                                <tr key={ps.id}>
                                    <td>
                                        <label className="toggle-switch" style={{ width: '40px', height: '20px' }}>
                                            <input
                                                type="checkbox"
                                                checked={psToggles[ps.id]}
                                                onChange={() => togglePsVisibility(ps.id)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </td>
                                    <td><strong>{ps.id}</strong></td>
                                    <td>{ps.title}</td>
                                    <td>{ps.track}</td>
                                    <td>
                                        <button
                                            className="chip chip-info"
                                            onClick={() => handleViewTeams(ps)}
                                            style={{ cursor: 'pointer', border: '1px solid rgba(37,99,235,0.5)' }}
                                        >
                                            {ps.selections} teams (View)
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Add New Problem Statement</h3>
                <div className="panel">
                    <div className="panel-inner">
                        <form onSubmit={handleAddPs} className="form">
                            <div className="form-row">
                                <label className="form-label" htmlFor="psId">
                                    Problem Statement ID
                                    <span className="form-hint">e.g., PS004</span>
                                </label>
                                <input
                                    id="psId"
                                    name="id"
                                    className="form-input"
                                    type="text"
                                    value={newPs.id}
                                    onChange={(e) => setNewPs({ ...newPs, id: e.target.value })}
                                    placeholder="PS004"
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label" htmlFor="psTitle">
                                    Title
                                </label>
                                <input
                                    id="psTitle"
                                    name="title"
                                    className="form-input"
                                    type="text"
                                    value={newPs.title}
                                    onChange={(e) => setNewPs({ ...newPs, title: e.target.value })}
                                    placeholder="e.g., AI-powered campus assistant"
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label" htmlFor="psTrack">
                                    Track
                                    <span className="form-hint">Optional</span>
                                </label>
                                <input
                                    id="psTrack"
                                    name="track"
                                    className="form-input"
                                    type="text"
                                    value={newPs.track}
                                    onChange={(e) => setNewPs({ ...newPs, track: e.target.value })}
                                    placeholder="e.g., AI/ML"
                                />
                            </div>
                            {psMessage.text && (
                                <div className={`message-box ${psMessage.type}`}>
                                    {psMessage.text}
                                </div>
                            )}
                            <button type="submit" className="button-primary">
                                Add Problem Statement
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!selectedPs}
                onClose={handleCloseModal}
                title={selectedPs ? `Teams for ${selectedPs.id}` : ''}
            >
                {selectedPs && (
                    <>
                        <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '0.9rem' }}>
                            Problem: <strong>{selectedPs.title}</strong>
                        </p>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {selectedPs.teams.map((team) => (
                                <div
                                    key={team.teamId}
                                    style={{
                                        background: 'rgba(37,99,235,0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(37,99,235,0.3)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <strong style={{ color: '#60a5fa' }}>{team.teamId}</strong>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{team.teamName}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Leader: {team.leader}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
