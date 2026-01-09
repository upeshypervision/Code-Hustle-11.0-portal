import React from "react";
import "../Individual-Member/Indi.css";
import { sanitizeText } from "../../utils/sanitizer";

const RequestedIndividual = ({ requests, onAccept, onReject, onChat, onView }) => {
    return (
        <div
            className="neural-node node-materialize animate-enter delay-2"
            style={{ marginBottom: "40px" }}
        >
            <span className="label-detail teamup-label">REQUESTED INDIVIDUALS</span>

            <div className="indi-table-container">
                <table className="indi-table">
                    <thead>
                        <tr>
                            <th style={{ width: "20%" }}>Name</th>
                            <th style={{ width: "25%" }}>University</th>
                            <th style={{ width: "25%" }}>Skills/About</th>
                            <th style={{ width: "30%" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests && requests.length > 0 ? (
                            requests.map((req) => (
                                <tr key={req.id} className="team-row">
                                    <td className="indi-td-name" data-label="Name">
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                                                    fontWeight: "600"
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
                                    <td className="indi-td-bio" data-label="Skills">
                                        {sanitizeText(req.about || req.skills, 60)}
                                    </td>
                                    <td data-label="Actions">
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            <button
                                                className="edit-btn"
                                                onClick={() => onAccept(req.id)}
                                                style={{
                                                    background: "rgba(40, 167, 69, 0.2)",
                                                    color: "#28a745",
                                                    border: "1px solid rgba(40, 167, 69, 0.3)",
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "0.85rem",
                                                    flex: 1
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => onReject(req.id)}
                                                style={{
                                                    background: "rgba(220, 53, 69, 0.2)",
                                                    color: "#dc3545",
                                                    border: "1px solid rgba(220, 53, 69, 0.3)",
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "0.85rem",
                                                    flex: 1
                                                }}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                className="edit-btn"
                                                onClick={() => onChat(req)}
                                                style={{
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "0.85rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    marginLeft: "4px"
                                                }}
                                                title="Chat"
                                            >
                                                <span>💬</span> Chat
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
