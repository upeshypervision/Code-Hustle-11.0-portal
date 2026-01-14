import { useState, useEffect, useRef } from "react";
import "./ManualPPT.css";

/**
 * ManualPPT Component
 * Allows admins to manually submit PPTs for teams.
 * Fetches all registered teams and displays a list with upload buttons.
 */
export default function ManualPPT() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // New state for details modal
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null); // State to hold fetched details
  const [pendingFile, setPendingFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false); // Loading state for details
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const API_BASE = "http://localhost:5000"; // Or your backend server's address

  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/teams-without-ppt`, // Use the correct backend route
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTeams(data.teams || []);
      } else {
        setError(data.error || "Failed to fetch teams");
      }
    } catch (err) {
      console.error("Fetch teams error:", err);
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const openUploadModal = (team) => {
    setSelectedTeam(team);
    setPendingFile(null);
    setDragActive(false);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedTeam(null);
    setPendingFile(null);
    setDragActive(false);
  };

  // --- NEW: Fetch and Display Team Details ---
  const fetchTeamDetails = async (teamId) => {
    setIsFetchingDetails(true);
    setError("");
    setMessage({ type: "", text: "" }); // Clear previous messages

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/team-details?team_id=${teamId}`,
        {
          method: "GET",
          credentials: "include", // Include cookies for auth
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setTeamDetails(data.team); // Store the full team object
        setShowDetailsModal(true); // Show the details modal
      } else {
        setError(
          data.error ||
            `Failed to fetch details. Server responded with status: ${res.status}`
        );
      }
    } catch (err) {
      console.error("Fetch team details error:", err);
      setError("Server connection failed while fetching details.");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setTeamDetails(null); // Clear details when closing modal
  };
  // --- END NEW FUNCTIONS ---

  const handleFileAction = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (file) {
      setPendingFile(file);
    }
  };

  const handleUpload = async () => {
    if (!pendingFile || !selectedTeam) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", pendingFile);
    formData.append("team_id", selectedTeam.team_id);

    try {
      const res = await fetch(`${API_BASE}/api/submit-ppt`, {
        // Use the correct backend route
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setPendingFile(null);
        closeUploadModal();
        fetchTeams(); // Refresh teams list
      } else {
        setMessage({ type: "error", text: data.error || "Submission failed" });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading)
    return <div className="manual-ppt-container">Loading Teams...</div>;
  if (error)
    return (
      <div className="manual-ppt-container" style={{ color: "#ef4444" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="manual-ppt-container">
      <header className="ppt-header">
        <div>
          <h2 className="ppt-title">Manual PPT Submission</h2>
          <p className="ppt-subtitle">
            Submit presentations for teams encountering technical issues.
            <strong style={{ color: "#3b82f6", marginLeft: "8px" }}>
              {teams.length} team{teams.length !== 1 ? "s" : ""} pending
            </strong>
          </p>
        </div>
      </header>

      {message.text && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      {/* Teams List */}
      <div className="ppt-list">
        {teams.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
          >
            All teams have submitted their PPTs 🎉
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.team_id} className="ppt-row">
              {/* Team Details */}
              <div className="ppt-info">
                <p className="ppt-team-header">
                  {team.team_name}{" "}
                  <span style={{ opacity: 0.5, fontWeight: 400 }}>
                    ({team.team_id})
                  </span>
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                    margin: "4px 0 0 0",
                  }}
                >
                  Submissions: {team.submissions?.length || 0}
                </p>
              </div>
              {/* Actions */}
              <div className="ppt-action">
                <button
                  className="btn-upload-ppt"
                  onClick={() => openUploadModal(team)}
                >
                  Upload PPT
                </button>
                {/* ✅ UPDATED: Call fetchTeamDetails on View Details click */}
                <button
                  className="btn-small"
                  onClick={() => fetchTeamDetails(team.team_id)} // Pass team_id to the new function
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal (existing code) */}
      {showUploadModal && selectedTeam && (
        <div className="upload-modal-backdrop" onClick={closeUploadModal}>
          <div
            className="upload-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="upload-modal-header">
              <h3>Upload PPT for {selectedTeam.team_name}</h3>
              <button className="close-modal-btn" onClick={closeUploadModal}>
                ×
              </button>
            </div>

            <div
              className={`upload-dropbox ${dragActive ? "drag-active" : ""} ${
                pendingFile ? "file-selected" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileAction}
              onClick={() => !pendingFile && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileAction}
                accept=".pdf,.ppt,.pptx"
              />

              {pendingFile ? (
                <>
                  <div className="upload-icon-wrapper">
                    <div style={{ fontSize: "3.5rem" }}>📄</div>
                  </div>
                  <h4
                    style={{
                      color: "#fff",
                      fontSize: "1.4rem",
                      marginBottom: "5px",
                      fontWeight: "600",
                    }}
                  >
                    {pendingFile.name}
                  </h4>
                  <p
                    style={{
                      color: "#3b82f6",
                      fontSize: "0.85rem",
                      marginBottom: "30px",
                      fontWeight: "bold",
                      letterSpacing: "2px",
                    }}
                  >
                    FILE READY FOR UPLOAD
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                      }}
                      className="btn-confirm-upload"
                      disabled={isUploading}
                    >
                      {isUploading ? "UPLOADING..." : "CONFIRM & UPLOAD"}
                    </button>
                    {!isUploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingFile(null);
                        }}
                        className="btn-abort-upload"
                      >
                        ABORT
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="upload-icon-wrapper">
                    <div
                      style={{
                        fontSize: "3.5rem",
                        opacity: dragActive ? 1 : 0.4,
                      }}
                    >
                      📤
                    </div>
                  </div>
                  <h4
                    style={{
                      color: "#fff",
                      fontSize: "1.4rem",
                      marginBottom: "10px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      fontStyle: "italic",
                    }}
                  >
                    Drop Your PPT here or{" "}
                    <span
                      style={{ color: "#3b82f6", textDecoration: "underline" }}
                    >
                      browse
                    </span>
                  </h4>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.85rem",
                      marginBottom: "30px",
                      letterSpacing: "1px",
                    }}
                  >
                    Accepted Formats: PDF, PPTX (Max 5MB)
                  </p>
                  <button className="btn-select-file">SELECT FILE</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: Details Modal --- */}
      {showDetailsModal && teamDetails && (
        <div className="details-modal-backdrop" onClick={closeDetailsModal}>
          <div
            className="details-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="details-modal-header">
              <h3>Team Details: {teamDetails.team_name}</h3>
              <button className="close-modal-btn" onClick={closeDetailsModal}>
                ×
              </button>
            </div>

            <div className="details-modal-body">
              {isFetchingDetails ? ( // Show loading state if still fetching details (should be rare here)
                <p>Loading details...</p>
              ) : (
                <>
                  {/* Leader Section */}
                  <div className="member-section">
                    <h4>Leader</h4>
                    <div className="member-details">
                      <p>
                        <strong>Name:</strong> {teamDetails.leader.full_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {teamDetails.leader.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {teamDetails.leader.phone}
                      </p>
                      <p>
                        <strong>About:</strong> {teamDetails.leader.bio}
                      </p>
                      <p>
                        <strong>University:</strong>{" "}
                        {teamDetails.leader.university_type}
                      </p>
                      {teamDetails.leader.sapid && (
                        <p>
                          <strong>SAP ID:</strong> {teamDetails.leader.sapid}
                        </p>
                      )}
                      {teamDetails.leader.college_name && (
                        <p>
                          <strong>College:</strong>{" "}
                          {teamDetails.leader.college_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Members Section */}
                  {teamDetails.members && teamDetails.members.length > 0 && (
                    <div className="member-section">
                      <h4>Members</h4>
                      {teamDetails.members.map((member, index) => (
                        <div key={index} className="member-details">
                          <p>
                            <strong>Name:</strong> {member.full_name}
                          </p>
                          <p>
                            <strong>Email:</strong> {member.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {member.phone}
                          </p>
                          <p>
                            <strong>About:</strong> {member.bio}
                          </p>
                          <p>
                            <strong>University:</strong>{" "}
                            {member.university_type}
                          </p>
                          {member.sapid && (
                            <p>
                              <strong>SAP ID:</strong> {member.sapid}
                            </p>
                          )}
                          {member.college_name && (
                            <p>
                              <strong>College:</strong> {member.college_name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="details-modal-footer">
              <button
                className="liquid-btn animated-btn"
                onClick={closeDetailsModal}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- END NEW MODAL --- */}
    </div>
  );
}
