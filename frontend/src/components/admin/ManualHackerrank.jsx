import { useEffect, useState } from "react";
import "./Manualgithub.css"; // Reuse existing styles

const API = "http://localhost:5001";

export default function ManualHackerrank() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [activeTeam, setActiveTeam] = useState(null);
    const [hackerrankLink, setHackerrankLink] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'

    useEffect(() => {
        fetch(`${API}/api/admin/pending-hackerrank`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
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
        setHackerrankLink("");
        setMessage("");
        setMessageType("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setActiveTeam(null);
    };

    const submitLink = async () => {
        if (!hackerrankLink.trim()) {
            setMessage("Please enter a Hackerrank profile link.");
            setMessageType("error");
            return;
        }

        setSubmitting(true);
        setMessage("");
        setMessageType("");

        try {
            const res = await fetch(`${API}/api/submit-hackerrank`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    team_id: activeTeam,
                    hackerrank_link: hackerrankLink,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage("Link submitted successfully! ✓");
                setMessageType("success");

                // Remove team from list
                setTeams((prev) => prev.filter((t) => t.team_id !== activeTeam));

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
                <h2 className="ml-title">Manual Hackerrank Submission</h2>
                <p className="ml-subtitle">
                    Submit Hackerrank profiles on behalf of teams
                </p>
            </div>

            {teams.length === 0 ? (
                <p className="empty-text">All teams have submitted 🎉</p>
            ) : (
                <div className="team-list">
                    {teams.map((team) => (
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
                        <h3 className="modal-title">Submit Hackerrank Link</h3>

                        <p className="modal-team">
                            Team ID: <span>{activeTeam}</span>
                        </p>

                        {/* Hackerrank Link (Required) */}
                        <div style={{ marginBottom: "12px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "11px",
                                    color: "#94a3b8",
                                    marginBottom: "6px",
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                Hackerrank Profile (Required)
                            </label>
                            <input
                                className="modal-input"
                                type="url"
                                placeholder="https://www.hackerrank.com/profile/username"
                                value={hackerrankLink}
                                onChange={(e) => setHackerrankLink(e.target.value)}
                            />
                        </div>

                        {message && (
                            <p className={`modal-message ${messageType}`}>{message}</p>
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
                                disabled={submitting || !hackerrankLink.trim()}
                            >
                                {submitting ? "Submitting..." : "Submit Link"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
