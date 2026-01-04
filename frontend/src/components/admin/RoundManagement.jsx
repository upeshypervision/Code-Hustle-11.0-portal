import { useState } from "react";

export default function RoundManagement() {
  // Granular State for Toggles
  const [psSelectionActive, setPsSelectionActive] = useState(true);
  const [pptUploadActive, setPptUploadActive] = useState(true);
  const [githubSubmissionActive, setGithubSubmissionActive] = useState(false);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Round Management</h2>
        <p
          className="admin-section-subtitle"
          style={{ color: "var(--text-muted)", marginTop: "5px" }}
        >
          Control access to specific round activities for participants.
        </p>
      </div>

      <div
        className="control-group"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Round 1: PS Selection Toggle */}
        <label className="toggle-label">
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={psSelectionActive}
              onChange={(e) => setPsSelectionActive(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </div>
          <span>
            <strong style={{ color: "#60a5fa" }}>
              Round 1: Problem Statement Selection
            </strong>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {psSelectionActive
                ? "OPEN - Teams can browse and select their Problem Statement."
                : "CLOSED - Selection is disabled."}
            </div>
          </span>
        </label>

        {/* Round 1: PPT Upload Toggle */}
        <label className="toggle-label">
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={pptUploadActive}
              onChange={(e) => setPptUploadActive(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </div>
          <span>
            <strong style={{ color: "#60a5fa" }}>
              Round 1: PPT Submission
            </strong>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {pptUploadActive
                ? "OPEN - Teams can upload their solution PPTs."
                : "CLOSED - Upload portal is locked."}
            </div>
          </span>
        </label>

        {/* Round 2: GitHub Submission Toggle */}
        <label className="toggle-label">
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={githubSubmissionActive}
              onChange={(e) => setGithubSubmissionActive(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </div>
          <span>
            <strong style={{ color: "#a78bfa" }}>
              Round 2: GitHub Repository Submission
            </strong>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {githubSubmissionActive
                ? "OPEN - Qualified teams can submit GitHub repository links."
                : "CLOSED - GitHub submission is hidden/disabled."}
            </div>
          </span>
        </label>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3
          style={{ fontSize: "1rem", marginBottom: "15px", color: "#e2e8f0" }}
        >
          Configuration Summary
        </h3>
        <div className="panel">
          <div className="panel-inner" style={{ padding: "0" }}>
            <table className="table" style={{ margin: "0" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "20px" }}>Activity</th>
                  <th>Round</th>
                  <th>Status</th>
                  <th>Target Audience</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500" }}>
                    PS Selection
                  </td>
                  <td>
                    <span className="badge-round r1">Round 1</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        psSelectionActive ? "pass" : "pending"
                      }`}
                    >
                      {psSelectionActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>All Registered Teams</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500" }}>
                    PPT Upload
                  </td>
                  <td>
                    <span className="badge-round r1">Round 1</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        pptUploadActive ? "pass" : "pending"
                      }`}
                    >
                      {pptUploadActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>All Registered Teams</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500" }}>
                    GitHub Submission
                  </td>
                  <td>
                    <span className="badge-round r2">Round 2</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        githubSubmissionActive ? "pass" : "pending"
                      }`}
                    >
                      {githubSubmissionActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>Qualified Teams Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
                .badge-round {
                    font-size: 11px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 700;
                }
                .r1 { background: rgba(96, 165, 250, 0.1); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.2); }
                .r2 { background: rgba(167, 139, 250, 0.1); color: #a78bfa; border: 1px solid rgba(167, 139, 250, 0.2); }
            `}</style>
    </div>
  );
}
