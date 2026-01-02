import { useEffect, useState } from "react";
import "./Viewgithubsubmission.css";

const API = "http://localhost:5000";

export default function ViewGithubSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [activeSubmission, setActiveSubmission] = useState(null);

    useEffect(() => {
        fetch(`${API}/api/admin/view-github-submissions`, {
            method: "GET",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSubmissions(data.teams || []);
                } else {
                    setError(data.error || "Failed to load submissions");
                }
            })
            .catch(() => setError("Server connection failed"))
            .finally(() => setLoading(false));
    }, []);

    const openModal = (submission) => {
        setActiveSubmission(submission);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setActiveSubmission(null);
    };

    if (loading) {
        return <div className="github-view-container">Loading submissions…</div>;
    }

    if (error) {
        return <div className="github-view-container error">{error}</div>;
    }

    return (
        <div className="github-view-container">
            <div className="gv-header">
                <h2 className="gv-title">GitHub Submissions</h2>
                <p className="gv-subtitle">
                    View all submitted GitHub repositories
                </p>
            </div>

            {submissions.length === 0 ? (
                <p className="empty-text">No submissions yet</p>
            ) : (
                <div className="submission-list">
                    {submissions.map((sub, idx) => (
                        <div key={idx} className="submission-row">
                            <div className="submission-info">
                                <p className="team-name">{sub.team_name}</p>
                                <p className="team-id">{sub.team_id}</p>
                            </div>

                            <button
                                className="btn-view"
                                onClick={() => openModal(sub)}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && activeSubmission && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <h3 className="modal-title">GitHub Submission Details</h3>

                        <div className="detail-row">
                            <span>Team ID</span>
                            <strong>{activeSubmission.team_id}</strong>
                        </div>

                        <div className="detail-row">
                            <span>Team Name</span>
                            <strong>{activeSubmission.team_name}</strong>
                        </div>

                        <div className="detail-row">
                            <span>Submitted Via</span>
                            <strong>{activeSubmission.submitted_via}</strong>
                        </div>

                        <div className="detail-row">
                            <span>Submitted At</span>
                            <strong>
                                {new Date(activeSubmission.submitted_at).toLocaleString()}
                            </strong>
                        </div>

                        <div className="modal-actions">
                            <a
                                href={activeSubmission.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-open"
                            >
                                Open Link
                            </a>

                            <button
                                className="btn-cancel"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
