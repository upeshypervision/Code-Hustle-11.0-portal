import { useEffect, useState } from "react";
import socket from "../../socket";
import "./Viewgithubsubmission.css"; // Reuse existing styles

const API = "http://localhost:5000";

export default function ViewHackerrank() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingTeamId, setProcessingTeamId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);

  const fetchSubmissions = () => {
    setLoading(true);
    setError("");
    fetch(`${API}/api/admin/view-hackerrank-submissions`, {
      // Changed endpoint
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubmissions(data.submissions || []);
        } else {
          setError(data.error || "Failed to load submissions");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Server connection failed");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Socket listener for new Hackerrank submissions
  useEffect(() => {
    socket.on("hackerrank_submitted", fetchSubmissions);
    socket.on("hackerrank_approval_updated", fetchSubmissions);
    return () => {
      socket.off("hackerrank_submitted", fetchSubmissions);
      socket.off("hackerrank_approval_updated", fetchSubmissions);
    };
  }, []);

  const openModal = (submission) => {
    setActiveSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveSubmission(null);
  };

  const handleApprove = async (teamId) => {
    setProcessingTeamId(teamId);
    try {
      const res = await fetch(`${API}/api/admin/approve-hackerrank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team_id: teamId, action: "approve" }),
      });

      const data = await res.json();
      if (data.success) {
        fetchSubmissions(); // Refresh list
      } else {
        console.error("Failed to approve submission:", data.error);
      }
    } catch (err) {
      console.error("Server connection failed:", err);
    } finally {
      setProcessingTeamId(null);
    }
  };

  const handleReject = async (teamId) => {
    setProcessingTeamId(teamId);
    try {
      const res = await fetch(`${API}/api/admin/approve-hackerrank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team_id: teamId, action: "reject" }),
      });

      const data = await res.json();
      if (data.success) {
        fetchSubmissions(); // Refresh list
      } else {
        console.error("Failed to reject submission:", data.error);
      }
    } catch (err) {
      console.error("Server connection failed:", err);
    } finally {
      setProcessingTeamId(null);
    }
  };

  if (loading && submissions.length === 0) {
    return <div className="github-view-container">Loading submissions...</div>;
  }

  if (error) {
    return <div className="github-view-container error">{error}</div>;
  }

  return (
    <div className="github-view-container">
      <div className="gv-header">
        <h2 className="gv-title">Hackerrank Submissions</h2>
        <p className="gv-subtitle">View all submitted Hackerrank profiles</p>
      </div>

      {submissions.length === 0 ? (
        <p className="empty-text">No submissions yet</p>
      ) : (
        <div className="submission-list">
          {submissions.map((sub, idx) => (
            <div key={idx} className="submission-row">
              <div className="submission-info">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <p className="team-name">{sub.team_name}</p>
                  <span className={`badge-via ${sub.submitted_via}`}>
                    {sub.submitted_via}
                  </span>
                  {sub.approval_status && (
                    <span
                      className="badge-status"
                      style={{
                        background:
                          sub.approval_status === "approved"
                            ? "rgba(34, 197, 94, 0.1)"
                            : sub.approval_status === "pending"
                            ? "rgba(234, 179, 8, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color:
                          sub.approval_status === "approved"
                            ? "#22c55e"
                            : sub.approval_status === "pending"
                            ? "#eab308"
                            : "#ef4444",
                        border: `1px solid ${
                          sub.approval_status === "approved"
                            ? "#22c55e"
                            : sub.approval_status === "pending"
                            ? "#eab308"
                            : "#ef4444"
                        }`,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      {sub.approval_status}
                    </span>
                  )}
                </div>
                <p className="team-id">{sub.team_id}</p>
                <a
                  href={sub.hackerrank_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "0.8rem",
                    color: "#22c55e",
                    textDecoration: "none",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {sub.hackerrank_link}
                </a>
              </div>

              <div
                className="submission-actions"
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {!sub.approval_status || sub.approval_status === "pending" ? (
                  <>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(sub.team_id)}
                      disabled={processingTeamId === sub.team_id}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor:
                          processingTeamId === sub.team_id
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        opacity: processingTeamId === sub.team_id ? 0.6 : 1,
                        boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.transform = "translateY(-1px)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.transform = "translateY(0)")
                      }
                      title="Reject Submission"
                    >
                      Reject
                    </button>
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(sub.team_id)}
                      disabled={processingTeamId === sub.team_id}
                      style={{
                        background: "#22c55e",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor:
                          processingTeamId === sub.team_id
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        opacity: processingTeamId === sub.team_id ? 0.6 : 1,
                        boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.transform = "translateY(-1px)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.transform = "translateY(0)")
                      }
                      title="Approve Submission"
                    >
                      Approve
                    </button>
                  </>
                ) : null}
                <button className="btn-view" onClick={() => openModal(sub)}>
                  View Details
                </button>
              </div>
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

            {/* Hackerrank Link */}
            <div className="link-section">
              <label className="link-label">
                <span style={{ marginRight: "6px" }}>🧩</span>
                Hackerrank Profile
              </label>
              <a
                href={activeSubmission.hackerrank_link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-url"
              >
                {activeSubmission.hackerrank_link}
              </a>
            </div>

            <div className="modal-actions">
              <a
                href={activeSubmission.hackerrank_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open github" // Reusing github button style
                style={{ background: "#22c55e", borderColor: "#22c55e" }}
              >
                Open Profile
              </a>

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
