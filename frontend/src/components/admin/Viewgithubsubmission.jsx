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
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
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
          View all submitted GitHub repositories and live deployments
        </p>
      </div>

      {submissions.length === 0 ? (
        <p className="empty-text">No submissions yet</p>
      ) : (
        <div className="submission-list">
          {submissions.map((sub, idx) => (
            <div key={idx} className="submission-row">
              <div className="submission-info">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <p className="team-name">{sub.team_name}</p>
                  <span className={`badge-via ${sub.submitted_via}`}>
                    {sub.submitted_via}
                  </span>
                </div>
                <p className="team-id">{sub.team_id}</p>
                {sub.live_link && (
                  <span className="live-indicator">
                    🌐 Live deployment included
                  </span>
                )}
              </div>

              <button className="btn-view" onClick={() => openModal(sub)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && activeSubmission && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Submission Details</h3>

            <div className="detail-row">
              <span>Team Name</span>
              <strong>{activeSubmission.team_name}</strong>
            </div>

            <div className="detail-row">
              <span>Team ID</span>
              <strong>{activeSubmission.team_id}</strong>
            </div>

            <div className="detail-row">
              <span>Submitted Via</span>
              <strong style={{ textTransform: "capitalize" }}>
                {activeSubmission.submitted_via}
              </strong>
            </div>

            <div className="detail-row">
              <span>Submitted At</span>
              <strong>
                {new Date(activeSubmission.submitted_at).toLocaleString()}
              </strong>
            </div>

            {/* GitHub Link */}
            <div className="link-section">
              <label className="link-label">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ marginRight: "6px" }}
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub Repository
              </label>
              <a
                href={activeSubmission.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-url"
              >
                {activeSubmission.github_link}
              </a>
            </div>

            {/* Live Link (Optional) */}
            {activeSubmission.live_link && (
              <div className="link-section">
                <label className="link-label">🌐 Live Deployment</label>
                <a
                  href={activeSubmission.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-url"
                >
                  {activeSubmission.live_link}
                </a>
              </div>
            )}

            <div className="modal-actions">
              <a
                href={activeSubmission.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open github"
              >
                Open GitHub
              </a>

              {activeSubmission.live_link && (
                <a
                  href={activeSubmission.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open live"
                >
                  Open Live Site
                </a>
              )}

              <button className="btn-cancel" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
