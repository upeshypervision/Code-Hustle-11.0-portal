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
    const [message, setMessage] = useState("");

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
        setMessage("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setActiveTeam(null);
    };

    const submitLink = async () => {
        if (!githubLink.trim()) {
            setMessage("Please enter a GitHub repository link.");
            return;
        }

        try {
            const res = await fetch(`${API}/api/submit-link-admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    team_id: activeTeam,
                    link: githubLink
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error || "Submission failed");
                return;
            }

            setMessage("Link submitted successfully.");

            setTeams(prev => prev.filter(t => t !== activeTeam));

            setTimeout(closeModal, 1000);

        } catch {
            setMessage("Server connection failed.");
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
                        <div key={team} className="team-row">
                            <span className="team-id">{team}</span>
                            <button
                                className="btn-add"
                                onClick={() => openModal(team)}
                            >
                                Add Link
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <h3 className="modal-title">Submit GitHub Link</h3>

                        <p className="modal-team">
                            Team ID: <span>{activeTeam}</span>
                        </p>

                        <input
                            className="modal-input"
                            type="text"
                            placeholder="https://github.com/username/repository"
                            value={githubLink}
                            onChange={(e) => setGithubLink(e.target.value)}
                        />

                        {message && (
                            <p className="modal-message">{message}</p>
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn-submit"
                                onClick={submitLink}
                            >
                                Submit Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
