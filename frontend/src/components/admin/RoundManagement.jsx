import { useState, useEffect } from "react";
import RoundStateSelector from "./RoundStateSelector";

export default function RoundManagement() {
  // Enum State for Rounds: "not_started", "live", "closed"
  const [psSelectionState, setPsSelectionState] = useState("not_started");
  const [pptUploadState, setPptUploadState] = useState("not_started");
  const [githubSubmissionState, setGithubSubmissionState] = useState("not_started");
  const [hackerrankSubmissionState, setHackerrankSubmissionState] = useState("not_started");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch current round status on mount
  useEffect(() => {
    fetchRoundStatus();
  }, []);

  const fetchRoundStatus = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/round-status', {
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
      const res = await fetch('http://localhost:5001/api/admin/round-status', {
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

  const handleStateChange = async (roundType, newState) => {
    // Check if closing PPT upload round
    if (roundType === 'ppt_upload' && newState === 'closed') {
      // Automatically distribute without blocking confirm, or assume user action of verify
      // User requested "remove the js alert", implying streamlined flow.
      // We will trigger distribution and show a toast.

      // Trigger distribution
      try {
        setNotification({ type: 'info', message: 'Distributing submissions...' });
        const res = await fetch('http://localhost:5001/api/admin/distribute-submissions', {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          setNotification({ type: 'success', message: data.message || "Submissions distributed successfully!" });
          setTimeout(() => setNotification(null), 5000);
        } else {
          setNotification({ type: 'error', message: "Distribution Warning: " + data.error });
        }
      } catch (err) {
        console.error("Distribution error:", err);
        setNotification({ type: 'error', message: "Error triggering submission distribution." });
      }
    }

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

        {notification && (
          <div style={{
            marginTop: "15px",
            padding: "10px 15px",
            borderRadius: "6px",
            background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.1)' :
              notification.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${notification.type === 'success' ? '#22c55e' :
              notification.type === 'error' ? '#ef4444' : '#3b82f6'}`,
            color: notification.type === 'success' ? '#22c55e' :
              notification.type === 'error' ? '#ef4444' : '#60a5fa',
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            {notification.message}
          </div>
        )}
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
            <table className="table" style={{ margin: "0", tableLayout: "fixed", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "20px", width: "50%" }}>Activity</th>
                  <th style={{ width: "25%" }}>Round</th>
                  <th style={{ width: "25%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Hackerrank Submission
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span className="badge-round r1">Round 1</span>
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span
                      className={`status-pill ${hackerrankSubmissionState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {hackerrankSubmissionState === "live" ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis" }}>
                    PS Selection
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span className="badge-round r2">Round 2</span>
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span
                      className={`status-pill ${psSelectionState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {psSelectionState === "live" ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis" }}>
                    PPT Upload
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span className="badge-round r2">Round 2</span>
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span
                      className={`status-pill ${pptUploadState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {pptUploadState === "live" ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: "20px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis" }}>
                    GitHub Submission
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span className="badge-round r3">Round 3</span>
                  </td>
                  <td style={{ overflow: "visible" }}>
                    <span
                      className={`status-pill ${githubSubmissionState === "live" ? "pass" : "pending"
                        }`}
                    >
                      {githubSubmissionState === "live" ? "Active" : "Inactive"}
                    </span>
                  </td>
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
                    white-space: nowrap;
                    display: inline-block;
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
                   white-space: nowrap;
                   display: inline-block;
                   min-width: fit-content;
                }
                .status-pill.pass { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
                .status-pill.pending { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

                /* Mobile fixes for status column */
                @media (max-width: 768px) {
                  .table th:nth-child(3),
                  .table td:nth-child(3) {
                    width: 35% !important;
                    min-width: 100px !important;
                    overflow: visible !important;
                  }
                  
                  .table td:nth-child(3) {
                    overflow: visible !important;
                    text-overflow: clip !important;
                  }

                  .status-pill {
                    font-size: 10px;
                    padding: 5px 12px;
                    white-space: nowrap;
                    overflow: visible;
                    width: auto;
                    min-width: 80px;
                  }

                  .badge-round {
                    font-size: 10px;
                    padding: 4px 8px;
                    white-space: nowrap;
                  }

                  .table th:nth-child(1),
                  .table td:nth-child(1) {
                    width: 40% !important;
                  }

                  .table th:nth-child(2),
                  .table td:nth-child(2) {
                    width: 25% !important;
                  }
                }
            `}</style>
    </div>
  );
}
