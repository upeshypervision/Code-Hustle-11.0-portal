import React, { useState, useEffect } from "react";
import "./EvaluatorDash.css";

export default function EvaluatorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marksInput, setMarksInput] = useState({});
  const [evaluatorStats, setEvaluatorStats] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignedSubmissions();
  }, []);

  const fetchAssignedSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "http://localhost:5001/api/evaluator/assigned-submissions",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.submissions || []);
        setEvaluatorStats(data.evaluator_info);
      } else {
        setError(data.error || "Failed to fetch assignments");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (teamId, action) => {
    const disposition = action === "view" ? "inline" : "attachment";
    try {
      const res = await fetch(
        `http://localhost:5001/api/admin/submission/${teamId}?disposition=${disposition}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (action === "view") {
          window.open(data.url, "_blank");
        }
      } else {
        alert(`Error: ${data.error || "Action failed"}`);
      }
    } catch (err) {
      alert("Server connection failed.");
    }
  };

  const handleMarksChange = (teamId, value) => {
    const val = value < 0 ? 0 : value;
    setMarksInput((prev) => ({ ...prev, [teamId]: val }));
  };

  const submitAllMarks = async () => {
    const teamIdsToSubmit = Object.keys(marksInput);
    if (teamIdsToSubmit.length === 0) {
      alert("No marks entered to submit.");
      return;
    }
    if (!window.confirm(`Submit marks for ${teamIdsToSubmit.length} teams?`))
      return;

    setSubmitting(true);
    const promises = teamIdsToSubmit.map(async (teamId) => {
      const marks = marksInput[teamId];
      const res = await fetch(
        "http://localhost:5001/api/evaluator/submit-marks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ team_id: teamId, marks: marks }),
        }
      );
      return { teamId, ok: res.ok };
    });

    const results = await Promise.all(promises);
    setSubmissions((prev) =>
      prev.map((sub) => {
        const res = results.find((r) => r.teamId === sub.team_id && r.ok);
        return res
          ? { ...sub, marks: marksInput[sub.team_id], marks_submitted: true }
          : sub;
      })
    );
    setSubmitting(false);
    alert("Submissions synced successfully.");
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

  if (loading)
    return (
      <div className="admin-section">
        <p>Loading Assignments...</p>
      </div>
    );
  if (error)
    return (
      <div className="admin-section" style={{ color: "#ef4444" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div className="header-flex-container">
          <h2 className="admin-section-title">My Assignments</h2>
          {evaluatorStats && (
            <div className="stats-pill-group">
              <span className="stats-pill assigned">
                <strong>{evaluatorStats.assigned_count}</strong> Assigned
              </span>
              <span className="stats-pill pending">
                <strong>{evaluatorStats.total_pending}</strong> Pending
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-inner">
          <p className="panel-subtitle">
            Evaluate and grade the assigned PPT submissions.
          </p>

          <div className="submission-container">
            {submissions.length === 0 ? (
              <p className="empty-text">No pending submissions assigned.</p>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.team_id}
                  className={`submission-card ${
                    submission.marks || submission.marks_submitted
                      ? "graded-card"
                      : ""
                  }`}
                >
                  <div className="submission-info">
                    <div className="submission-team-row">
                      <div className="team-name-group">
                        <span className="submission-team">
                          {submission.team_name}
                        </span>
                        <span className="team-id-label">
                          Team ID: {submission.team_id}
                        </span>
                      </div>
                      {(submission.marks || submission.marks_submitted) && (
                        <span className="evaluated-badge">✓ EVALUATED</span>
                      )}
                    </div>
                    <div className="submission-meta">
                      <span className="file-name">
                        File: <strong>{submission.file_name}</strong>
                      </span>
                      <span className="meta-separator">·</span>
                      <span className="time-stamp">
                        {formatDate(submission.submitted_at)}
                      </span>
                    </div>
                  </div>

                  <div className="submission-actions">
                    <button
                      className="btn-small view-btn"
                      onClick={() => handleAction(submission.team_id, "view")}
                    >
                      View PPT
                    </button>
                    <div className="marks-input-container">
                      <input
                        type="number"
                        placeholder="00"
                        value={
                          marksInput[submission.team_id] !== undefined
                            ? marksInput[submission.team_id]
                            : submission.marks || ""
                        }
                        onChange={(e) =>
                          handleMarksChange(submission.team_id, e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {submissions.length > 0 && (
            <div className="panel-footer">
              <button
                className="btn-submit-all"
                onClick={submitAllMarks}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "SUBMIT ALL EVALUATIONS"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
