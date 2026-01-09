import React from "react";
import "./Indi.css";

const Indi_SentRequest = ({ teams, onViewTeam, onChat, scrollToTop }) => {
  return (
    <div
      className="neural-node node-materialize animate-enter delay-3"
      style={{ marginBottom: "40px" }}
    >
      <span className="label-detail teamup-label">
        SENT REQUESTS (Status)
      </span>
      <div className="indi-table-container">
        <table className="indi-table">
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Team ID</th>
              <th style={{ width: "20%" }}>Team Name</th>
              <th style={{ width: "12%" }}>Members</th>
              <th style={{ width: "18%" }}>Req Status</th>
              <th style={{ width: "18%" }}>Chat</th>
              <th style={{ width: "20%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {teams
              .filter((t) => t.requestStatus)
              .map((team) => (
                <tr key={team.teamId} className="team-row">
                  <td className="indi-td-id" data-label="Team ID">
                    {team.teamId}
                  </td>
                  <td className="indi-td-name" data-label="Team Name">
                    {team.teamName}
                  </td>
                  <td className="indi-td-members" data-label="Members">
                    {team.memberCount}/5
                  </td>
                  <td style={{ padding: "15px" }} data-label="Request Status">
                    <span
                      className="indi-status-tag"
                      style={{
                        background:
                          team.requestStatus === "Accepted"
                            ? "rgba(40, 167, 69, 0.2)"
                            : team.requestStatus === "Rejected"
                              ? "rgba(220, 53, 69, 0.2)"
                              : "rgba(255, 193, 7, 0.1)",
                        color:
                          team.requestStatus === "Accepted"
                            ? "#28a745"
                            : team.requestStatus === "Rejected"
                              ? "#dc3545"
                              : "#ffc107",
                      }}
                    >
                      {team.requestStatus}
                    </span>
                  </td>
                  <td style={{ padding: "15px", width: "18%" }} data-label="Chat">
                    {team.requestStatus !== "Rejected" && (
                      <button
                        className="edit-btn chat-btn-mobile"
                        onClick={() => {
                          onChat(team);
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          boxShadow:
                            "0 2px 5px rgba(102, 126, 234, 0.4)",
                          width: "100%",
                          boxSizing: "border-box",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span>💬</span> Chat
                      </button>
                    )}
                  </td>
                  <td style={{ padding: "15px", width: "20%" }} data-label="Action">
                    <button
                      className="indi-btn-view"
                      onClick={() => {
                        scrollToTop();
                        onViewTeam(team);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            {teams.filter((t) => t.requestStatus).length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#aaa",
                  }}
                >
                  No sent requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Indi_SentRequest;

