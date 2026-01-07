import React from "react";
import "../../pages/Registration.css";
import "../../pages/CreateTeam.css";
import "./TeamUp.css";

const TeamDetailsModal = ({ team, onClose }) => {
  if (!team) return null;

  const handleSendRequest = () => {
    console.log(
      `Sending request to team: ${team.teamName} (ID: ${team.teamId})`
    );
    alert(`Request sent to ${team.leaderName}!`);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="neural-node node-materialize modal-content-enter"
        style={{
          maxWidth: "600px",
          width: "90%",
          padding: "30px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        <span className="label-detail">TEAM DETAILS</span>

        <h2 style={{ color: "#fff", marginBottom: "10px" }}>{team.teamName}</h2>
        <div
          style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "20px" }}
        >
          TEAM ID: {team.teamId}
        </div>

        <div className="input-group">
          <div className="label-row">
            <span>TEAM VISION</span>
          </div>
          <div
            className="glow-input-container"
            style={{ padding: "15px", background: "rgba(255,255,255,0.03)" }}
          >
            <p
              style={{ color: "#ddd", fontSize: "0.95rem", lineHeight: "1.5" }}
            >
              {team.vision}
            </p>
          </div>
        </div>

        <div className="input-group" style={{ marginTop: "20px" }}>
          <div className="label-row">
            <span>LEADER</span>
          </div>
          <div
            className="glow-input-container"
            style={{ padding: "10px 15px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#fff",
              }}
            >
              <span>{team.leaderName}</span>
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                {team.leaderUniversity}
              </span>
            </div>
          </div>
        </div>

        <div className="input-group" style={{ marginTop: "20px" }}>
          <div className="label-row">
            <span>LEADER VISION</span>
          </div>
          <div
            className="glow-input-container"
            style={{ padding: "15px", background: "rgba(255,255,255,0.03)" }}
          >
            <p
              style={{ color: "#ddd", fontSize: "0.95rem", lineHeight: "1.5" }}
            >
              {team.vision}
            </p>
          </div>
        </div>

        {team.members && team.members.length > 0 && (
          <div className="input-group" style={{ marginTop: "20px" }}>
            <div className="label-row">
              <span>MEMBERS ({team.members.length})</span>
            </div>
            <div
              className="glow-input-container"
              style={{ padding: "10px 15px" }}
            >
              {team.members.map((member, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    color: "#ddd",
                    padding: "8px 0",
                    borderBottom:
                      idx < team.members.length - 1
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      marginBottom: "5px",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>{member.name}</span>
                    <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                      {member.university}
                    </span>
                  </div>
                  {member.vision && (
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#888",
                        fontStyle: "italic",
                        paddingLeft: "10px",
                        borderLeft: "2px solid #555",
                      }}
                    >
                      "{member.vision}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="neon-shade-btn next-glow"
          onClick={handleSendRequest}
          style={{ marginTop: "30px", width: "100%" }}
        >
          SEND REQUEST ❯
        </button>
      </div>
    </div>
  );
};

export default TeamDetailsModal;
