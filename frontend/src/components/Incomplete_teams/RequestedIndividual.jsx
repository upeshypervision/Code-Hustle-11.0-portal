import React from "react";
import "../Individual-Member/Indi.css";
import { sanitizeText } from "../../utils/sanitizer";

const RequestedIndividual = ({
  requests,
  onAccept,
  onReject,
  onChat,
  onView,
}) => {
  return (
    <div
      className="neural-node node-materialize animate-enter delay-2"
      style={{ marginBottom: "40px" }}
    >
      <span className="label-detail teamup-label">REQUESTED INDIVIDUALS</span>

      <div
        className="indi-table-container"
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "20px",
        }}
      >
        <table className="indi-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>University</th>
              <th>Skills/About</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests && requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="team-row">
                  <td className="indi-td-name" data-label="Name">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        className="request-avatar"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "rgba(96, 165, 250, 0.2)",
                          color: "#60a5fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                        }}
                      >
                        {req.name.charAt(0)}
                      </div>
                      {sanitizeText(req.name, 50)}
                    </div>
                  </td>
                  <td data-label="University" style={{ color: "#cbd5e1" }}>
                    {sanitizeText(req.university, 50)}
                  </td>
                  <td className="indi-td-skills" data-label="Skills">
                    {sanitizeText(req.about || req.skills, 60)}
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons-container">
                      <button
                        className="indi-btn-accept"
                        onClick={() => onAccept(req.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="indi-btn-chat"
                        onClick={() => onChat(req)}
                        title="Chat"
                      >
                        Chat
                      </button>
                      <button
                        className="indi-btn-remove"
                        onClick={() => onReject(req.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#aaa",
                  }}
                >
                  No pending requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestedIndividual;
