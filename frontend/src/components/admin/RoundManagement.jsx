import { useState, useEffect } from "react";
import RoundStateSelector from "./RoundStateSelector";

export default function RoundManagement() {
  // Enum State for Rounds: "not_started", "live", "closed"
  const [psSelectionState, setPsSelectionState] = useState("not_started");
  const [pptUploadState, setPptUploadState] = useState("not_started");
  const [githubSubmissionState, setGithubSubmissionState] = useState("not_started");
  const [hackerrankSubmissionState, setHackerrankSubmissionState] = useState("not_started");
  const [loading, setLoading] = useState(true);

  // Fetch current round status on mount
  useEffect(() => {
    fetchRoundStatus();
  }, []);

  const fetchRoundStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/round-status', {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        setPsSelectionState(data.rounds.ps_selection || "not_started");
        setPptUploadState(data.rounds.ppt_upload || "not_started");
        setGithubSubmissionState(data.rounds.github_submission || "not_started");
        setHackerrankSubmissionState(data.rounds.hackerrank_submission || "not_started");
      }
    } catch (err) {
      console.error('Error fetching round status:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRoundStatus = async (roundType, state) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/round-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          round_type: roundType,
          state: state  // "not_started", "live", "closed"
        })
      });

      const data = await res.json();
      if (!data.success) {
        console.error('Failed to update round status:', data.error);
        // Revert if update failed
        fetchRoundStatus();
      }
    } catch (err) {
      console.error('Error updating round status:', err);
      fetchRoundStatus();
    }
  };

  const handleStateChange = (roundType, newState) => {
    // Update local state
    switch (roundType) {
      case 'ps_selection':
        setPsSelectionState(newState);
        break;
      case 'ppt_upload':
        setPptUploadState(newState);
        break;
      case 'github_submission':
        setGithubSubmissionState(newState);
        break;
      case 'hackerrank_submission':
        setHackerrankSubmissionState(newState);
        break;
    }
    // Update backend
    updateRoundStatus(roundType, newState);
  };

  if (loading) {
    return (
      <div className="admin-section">
        <p>Loading round status...</p>
      </div>
    );
  }

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
        {/* Round 1: Hackerrank Submission */}
        <RoundStateSelector
          roundName="Round 1: Hackerrank Protocol"
          currentState={hackerrankSubmissionState}
          onStateChange={(newState) => handleStateChange('hackerrank_submission', newState)}
          color="#22c55e"
        />

        {/* Round 2: PS Selection */}
        <RoundStateSelector
          roundName="Round 2: Problem Statement Selection"
          currentState={psSelectionState}
          onStateChange={(newState) => handleStateChange('ps_selection', newState)}
          color="#60a5fa"
        />

        {/* Round 2: PPT Upload */}
        <RoundStateSelector
          roundName="Round 2: PPT Submission"
          currentState={pptUploadState}
          onStateChange={(newState) => handleStateChange('ppt_upload', newState)}
          color="#60a5fa"
        />

        {/* Round 3: GitHub Submission */}
        <RoundStateSelector
          roundName="Round 3: GitHub Repository Submission"
          currentState={githubSubmissionState}
          onStateChange={(newState) => handleStateChange('github_submission', newState)}
          color="#a78bfa"
        />
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
                    Hackerrank Submission
                  </td>
                  <td>
                    <span className="badge-round r1">Round 1</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${hackerrankSubmissionState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {hackerrankSubmissionState === "live" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>All Registered Teams</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500" }}>
                    PS Selection
                  </td>
                  <td>
                    <span className="badge-round r2">Round 2</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${psSelectionState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {psSelectionState === "live" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>Qualified Teams</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500" }}>
                    PPT Upload
                  </td>
                  <td>
                    <span className="badge-round r2">Round 2</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${pptUploadState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {pptUploadState === "live" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>Qualified Teams</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500" }}>
                    GitHub Submission
                  </td>
                  <td>
                    <span className="badge-round r3">Round 3</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${githubSubmissionState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {githubSubmissionState === "live" ? "Active" : "Inactive"}
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
                .r1 { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
                .r2 { background: rgba(96, 165, 250, 0.1); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.2); }
                .r3 { background: rgba(167, 139, 250, 0.1); color: #a78bfa; border: 1px solid rgba(167, 139, 250, 0.2); }
                
                /* Extra subtle transitions */
                .status-pill {
                   font-size: 11px;
                   padding: 4px 10px;
                   border-radius: 20px;
                   font-weight: 600;
                   text-transform: uppercase;
                   letter-spacing: 0.5px;
                }
                .status-pill.pass { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
                .status-pill.pending { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
            `}</style>
    </div>
  );
}
