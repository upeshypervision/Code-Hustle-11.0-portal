import React from "react";
import "./Indi.css";
import { sanitizeText } from "../../utils/sanitizer";

const Indi_AvailableTeams = ({ teams, onViewTeam, scrollToTop }) => {
    const availableTeams = teams.filter((t) => !t.requestStatus);

    return (
        <div
            className="neural-node node-materialize animate-enter delay-2"
            style={{ marginBottom: "40px" }}
        >
            <span className="label-detail teamup-label">
                AVAILABLE TEAMS (Join Now)
            </span>
            <div className="indi-table-container">
                <table className="indi-table">
                    <thead>
                        <tr>
                            <th style={{ width: "13%" }}>Team ID</th>
                            <th style={{ width: "23%" }}>Team Name</th>
                            <th style={{ width: "34%" }}>Team Bio</th>
                            <th style={{ width: "10%" }}>Members</th>
                            <th style={{ width: "19%" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availableTeams.map((team) => (
                            <tr key={team.teamId} className="team-row">
                                <td className="indi-td-id">{sanitizeText(team.teamId, 50)}</td>
                                <td className="indi-td-name">{sanitizeText(team.teamName, 100)}</td>
                                <td className="indi-td-bio">
                                    {team.vision && team.vision.length > 100
                                        ? sanitizeText(team.vision.substring(0, 100), 100) + "..."
                                        : sanitizeText(team.vision, 100) || "No bio available"}
                                </td>
                                <td className="indi-td-members">{team.memberCount}/5</td>
                                <td style={{ padding: "15px" }}>
                                    <button
                                        className="indi-btn-view"
                                        onClick={() => {
                                            if (scrollToTop) scrollToTop();
                                            onViewTeam(team);
                                        }}
                                    >
                                        View & Join
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {availableTeams.length === 0 && (
                            <tr>
                                <td
                                    colSpan="5"
                                    style={{
                                        textAlign: "center",
                                        padding: "40px",
                                        color: "#aaa",
                                    }}
                                >
                                    No available teams found at the moment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Indi_AvailableTeams;
