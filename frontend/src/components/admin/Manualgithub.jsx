import { useEffect, useState } from "react";
import "./Manualgithub.css";

const API = "http://localhost:5000";

export default function Manualgithub() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [activeTeam, setActiveTeam] = useState(null);
    const [githubLink, setGithubLink] = useState("");
    const [liveLink, setLiveLink] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'

    useEffect(() => {
        fetch(`${API}/api/admin/pending-github`, {
            method: "GET",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTeams(data.teams || []);
                } else {
                    setError(data.error || "Failed to load teams");
                }
            })
            .catch(() => setError("Server connection failed"))
            .finally(() => setLoading(false));
    }, []);

    const openModal = (teamId) => {
        setActiveTeam(teamId);
        setGithubLink("");
        setLiveLink("");
        setMessage("");
        setMessageType("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setActiveTeam(null);
    };

    const submitLink = async () => {
        if (!githubLink.trim()) {
            setMessage("Please enter a GitHub repository link.");
            setMessageType("error");
            return;
        }

        setSubmitting(true);
        setMessage("");
        setMessageType("");

        try {
            const res = await fetch(`${API}/api/submit-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    team_id: activeTeam,
                    github_link: githubLink,
                    live_link: liveLink || null
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage("Link submitted successfully! ✓");
                setMessageType("success");

                // Remove team from list
                setTeams(prev => prev.filter(t => t !== activeTeam));

                // Close modal after delay
                setTimeout(closeModal, 1500);
            } else {
                setMessage(data.error || "Submission failed");
                setMessageType("error");
            }
        } catch (err) {
            console.error("Error submitting link:", err);
            setMessage("Server connection failed.");
            setMessageType("error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="manual-link-container">Loading teams…</div>;
    }

    if (error) {
        return <div className="manual-link-container error">{error}</div>;
    }

    return (
        <div className="manual-link-container">
            <div className="ml-header">
                <h2 className="ml-title">Manual GitHub Submission</h2>
                <p className="ml-subtitle">
                    Submit GitHub repositories on behalf of teams
                </p>
            </div>

            {teams.length === 0 ? (
                <p className="empty-text">All teams have submitted 🎉</p>
            ) : (
                <div className="team-list">
                    {teams.map(team => (
                        <div key={team.team_id} className="team-row">
                            <div className="team-info">
                                <span className="team-name">{team.team_name}</span>
                                <span className="team-id-small">({team.team_id})</span>
                            </div>
                            <button
                                className="btn-add"
                                onClick={() => openModal(team.team_id)}
                            >
                                Add Link
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Submit GitHub Link</h3>

                        <p className="modal-team">
                            Team ID: <span>{activeTeam}</span>
                        </p>

                        {/* GitHub Link (Required) */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                color: '#94a3b8',
                                marginBottom: '6px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                GitHub Repository (Required)
                            </label>
                            <input
                                className="modal-input"
                                type="url"
                                placeholder="https://github.com/username/repository"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                            />
                        </div>

                        {/* Live Link (Optional) */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                color: '#64748b',
                                marginBottom: '6px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Live Deployment (Optional)
                            </label>
                            <input
                                className="modal-input"
                                type="url"
                                placeholder="https://your-app.vercel.app"
                                value={liveLink}
                                onChange={(e) => setLiveLink(e.target.value)}
                                style={{ borderColor: '#1e293b' }}
                            />
                        </div>

                        {message && (
                            <p className={`modal-message ${messageType}`}>
                                {message}
                            </p>
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={closeModal}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn-submit"
                                onClick={submitLink}
                                disabled={submitting || !githubLink.trim()}
                            >
                                {submitting ? 'Submitting...' : 'Submit Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
