import React, { useState, useEffect } from "react";
import socket from "../../socket";
import "../admin/Viewgithubsubmission.css"; // Reusing ViewHackerrank/GitHub layout

export default function ReviewEvaluatedPPTs() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvaluatedSubmissions();
  }, []);

  // WebSocket listener for real-time updates
  useEffect(() => {
    socket.on("ppt_approval_updated", fetchEvaluatedSubmissions);
    return () => socket.off("ppt_approval_updated", fetchEvaluatedSubmissions);
  }, []);

  const fetchEvaluatedSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/evaluated-ppts",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissions(data.submissions || []);
      } else {
        setError(data.error || "Failed to fetch evaluated submissions");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (teamId, action) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/update-ppt-approval",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ team_id: teamId, action: action }),
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        // Update local state
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.team_id === teamId
              ? { ...sub, approval_status: data.new_status }
              : sub
          )
        );
      } else {
        console.error(`Failed to ${action}: ${data.error}`);
      }
    } catch (err) {
      console.error(`Action error:`, err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#f59e0b", text: "PENDING" },
      approved: { bg: "#22c55e", text: "APPROVED" },
      rejected: { bg: "#ef4444", text: "REJECTED" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        style={{
          background: style.bg,
          color: "#000",
          padding: "4px 12px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: "700",
        }}
      >
        {style.text}
      </span>
    );
  };

  if (loading)
    return (
      <div className="admin-section">
        <p>Loading evaluated submissions...</p>
      </div>
    );

  if (error)
    return (
      <div className="admin-section" style={{ color: "#ef4444" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="github-view-container">
      <div className="gv-header">
        <h2 className="gv-title">Review Evaluated PPTs</h2>
        <p className="gv-subtitle">
          {submissions.length} Evaluated Submissions (Sorted by Marks)
        </p>
      </div>

      {submissions.length === 0 ? (
        <p className="empty-text">No evaluated submissions yet</p>
      ) : (
        <div className="submission-list">
          {submissions.map((submission, index) => (
            <div key={submission.team_id} className="submission-row">
              <div className="submission-info">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      border: "1px solid rgba(255,255,255,0.05)",
                      marginRight: "6px",
                    }}
                  >
                    #{index + 1}
                  </span>
                  <p className="team-name" style={{ fontSize: "1.2rem" }}>
                    {submission.team_name}
                  </p>

                  <span
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#60a5fa",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    MARKS: {submission.marks}
                  </span>

                  {submission.approval_status && (
                    <span
                      className="badge-status"
                      style={{
                        background:
                          submission.approval_status === "approved"
                            ? "rgba(34, 197, 94, 0.1)"
                            : submission.approval_status === "rejected"
                            ? "rgba(239, 68, 68, 0.1)"
                            : "rgba(234, 179, 8, 0.1)",
                        color:
                          submission.approval_status === "approved"
                            ? "#22c55e"
                            : submission.approval_status === "rejected"
                            ? "#ef4444"
                            : "#eab308",
                        border: `1px solid ${
                          submission.approval_status === "approved"
                            ? "#22c55e"
                            : submission.approval_status === "rejected"
                            ? "#ef4444"
                            : "#eab308"
                        }`,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      {submission.approval_status}
                    </span>
                  )}
                </div>
                <p
                  className="team-id"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#cbd5e1",
                  }}
                >
                  {submission.team_id}
                  {submission.evaluated_by && (
                    <span
                      style={{
                        marginLeft: "12px",
                        opacity: 0.7,
                        fontSize: "0.9rem",
                        fontWeight: "500",
                      }}
                    >
                      • Evaluated by: {submission.evaluated_by}
                    </span>
                  )}
                </p>
              </div>

              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {submission.approval_status === "pending" && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() =>
                        handleAction(submission.team_id, "approve")
                      }
                      style={{
                        background: "#22c55e",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleAction(submission.team_id, "reject")}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}

                {submission.approval_status === "approved" && (
                  <button
                    onClick={() => handleAction(submission.team_id, "revoke")}
                    style={{
                      background: "rgba(234, 179, 8, 0.1)",
                      color: "#eab308",
                      border: "1px solid rgba(234, 179, 8, 0.2)",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    Revoke
                  </button>
                )}

                {submission.approval_status === "rejected" && (
                  <button
                    onClick={() => handleAction(submission.team_id, "approve")}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
