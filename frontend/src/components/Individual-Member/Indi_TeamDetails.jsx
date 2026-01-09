import React from "react";
import "./Indi.css";
import { sanitizeText } from "../../utils/sanitizer";

const Indi_TeamDetails = ({ team, onClose, onChat, onSendRequest }) => {
  if (!team) return null;

  return (
    <div className="team-details-section">
      <div className="neural-node node-materialize animate-enter">
        <div className="team-details-header">
          <span className="label-detail teamup-label">TEAM DETAILS</span>
          <button
            onClick={onClose}
            className="close-team-details-btn"
            aria-label="Close team details"
          >
            ×
          </button>
        </div>

        <div className="team-details-title-row">
          <h2 className="team-details-name">{sanitizeText(team.teamName, 100)}</h2>
          {team.requestStatus && team.requestStatus !== "Rejected" && (
            <button
              onClick={() => onChat(team)}
              className="team-chat-btn"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
          )}
        </div>
        <div className="team-details-id">TEAM ID: {sanitizeText(team.teamId, 50)}</div>

        <div className="team-details-grid">
          <div className="input-group" style={{ gridColumn: "1 / -1" }}>
            <div className="label-row">
              <span>TEAM VISION</span>
            </div>
            <div className="glow-input-container team-details-box">
              <p className="team-details-text">{sanitizeText(team.vision, 1000)}</p>
            </div>
          </div>

          <div
            className="input-group"
            style={{ width: "100%", gridColumn: "1 / -1" }}
          >
            <div className="label-row">
              <span>LEADER</span>
            </div>
            <div className="glow-input-container team-details-box">
              <div className="leader-info-container">
                <span className="leader-name">{sanitizeText(team.leaderName, 100)}</span>
                <span className="leader-university">
                  {sanitizeText(team.leaderUniversity, 200)}
                </span>
                {team.leaderSkills && (
                  <div className="skills-section">
                    <strong className="skills-label">Skills:</strong>
                    {sanitizeText(team.leaderSkills, 500)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {team.members && team.members.length > 0 && (
          <div className="input-group" style={{ marginTop: "30px" }}>
            <div className="label-row">
              <span>MEMBERS ({team.members.length})</span>
            </div>
            <div className="glow-input-container" style={{ padding: "24px" }}>
              <div className="members-grid">
                {team.members.map((member, idx) => (
                  <div key={idx} className="member-card">
                    <div className="member-header">
                      <span className="member-name">{sanitizeText(member.name, 100)}</span>
                      <span className="member-university">
                        {sanitizeText(member.university, 200)}
                      </span>
                    </div>
                    {member.skills && (
                      <div className="skills-section">
                        <strong className="skills-label">Skills:</strong>
                        {sanitizeText(member.skills, 500)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!team.requestStatus && (
          <button
            className="neon-shade-btn next-glow send-request-btn"
            onClick={() => onSendRequest(team)}
          >
            SEND REQUEST ❯
          </button>
        )}
      </div>
    </div>
  );
};

export default Indi_TeamDetails;
