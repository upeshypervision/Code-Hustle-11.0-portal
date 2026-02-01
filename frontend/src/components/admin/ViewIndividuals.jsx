import React, { useState, useEffect } from "react";
import "./ViewTeams.css";

const ViewIndividuals = () => {
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchIndividuals();
  }, []);

  const fetchIndividuals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/view-individuals",
        {
          credentials: "include",
        },
      );
      const data = await response.json();
      if (data.success) {
        setIndividuals(data.individuals || []);
      }
    } catch (error) {
      console.error("Error fetching individuals:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteIndividual = async (individualId, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this individual? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/delete-individual/${individualId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (data.success) {
        setIndividuals(
          individuals.filter((i) => i.individualId !== individualId),
        );
      } else {
        alert(
          "Failed to delete individual: " + (data.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error deleting individual:", error);
      alert("Error deleting individual");
    }
  };

  const toggleRow = (individualId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [individualId]: !prev[individualId],
    }));
  };

  const filteredIndividuals = individuals.filter((indi) => {
    const search = searchTerm.toLowerCase();
    return (
      (indi.fullName || "").toLowerCase().includes(search) ||
      (indi.individualId || "").toLowerCase().includes(search) ||
      (indi.email || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="view-teams-container">
      <div className="navy-header">
        <h2 className="navy-title">All Individuals</h2>
        <p className="navy-subtitle">View and manage registered individuals</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 15px",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "14px",
            width: "100%",
            maxWidth: "400px",
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading individuals...
        </div>
      ) : (
        <div>
          {filteredIndividuals.map((indi) => {
            const isExpanded = expandedRows[indi.individualId];
            // Always allow generic expansion or specific check if you only want it when there are details
            // The user request implies "show details" like teams. Teams are always expandable.
            // But for individuals, maybe only expand if there's something to show?
            // Let's keep it consistent: always clickable if we want, OR only if details.
            // Given previous logic 'hasDetails', let's stick to that but maybe make it always clickable
            // to show "No additional details" or just generic info?
            // Actually, ViewCreateTeams always expands to show members.
            // Here, let's only expand if hasDetails to allow seeing the "accepted" or "removed" info.
            // But the Chevron should probably only show if hasDetails.
            const hasDetails = indi.accepted || indi.reason;

            return (
              <div key={indi.individualId} className="team-card">
                <div
                  className="team-summary"
                  onClick={() => hasDetails && toggleRow(indi.individualId)}
                  style={{ cursor: hasDetails ? "pointer" : "default" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* Chevron - Only if details exist */}
                    <div
                      style={{
                        transition: "transform 0.2s ease",
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        display: "flex",
                        alignItems: "center",
                        color: hasDetails ? "#64748b" : "transparent", // Hide if no details
                        width: "20px",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    <div className="ts-main">
                      <h3 className="ts-header">
                        {indi.fullName}{" "}
                        <span
                          className="mono-font"
                          style={{ fontSize: "0.8em", color: "#64748b" }}
                        >
                          ({indi.individualId})
                        </span>
                      </h3>
                      <div
                        className="ts-meta"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {indi.email}
                        </span>
                        <span>{indi.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {indi.reason ? (
                      <span
                        className="status-badge"
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        REMOVED
                      </span>
                    ) : indi.accepted ? (
                      <span className="status-badge status-paid">ACCEPTED</span>
                    ) : (
                      <span className="status-badge status-pending">
                        PENDING
                      </span>
                    )}

                    <button
                      className="delete-btn"
                      onClick={(e) => deleteIndividual(indi.individualId, e)}
                      style={{
                        background: "#ef4444",
                        border: "none",
                        color: "white",
                        padding: "5px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        transition: "background 0.2s",
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>

                {isExpanded && hasDetails && (
                  <div className="team-details">
                    <div className="detail-grid">
                      {/* Reuse detail-grid but we might manipulate columns if needed. 
                                                For individuals, we often just have one block of info (Reason OR Team Details).
                                                So a simple div wrapper might suffice, but detail-grid is responsive.
                                            */}

                      {indi.reason ? (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div
                            style={{
                              background: "rgba(239, 68, 68, 0.05)",
                              padding: "15px",
                              borderRadius: "8px",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          >
                            <h4
                              style={{
                                color: "#ef4444",
                                margin: "0 0 8px 0",
                                fontSize: "14px",
                              }}
                            >
                              Removal Reason
                            </h4>
                            <p
                              style={{
                                color: "#cbd5e1",
                                margin: 0,
                                fontSize: "14px",
                              }}
                            >
                              {indi.reason}
                            </p>
                          </div>
                        </div>
                      ) : indi.teamDetails ? (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div
                            style={{
                              background: "rgba(16, 185, 129, 0.05)",
                              padding: "20px",
                              borderRadius: "12px",
                              border: "1px solid rgba(16, 185, 129, 0.2)",
                            }}
                          >
                            <h4
                              style={{
                                color: "#10b981",
                                margin: "0 0 15px 0",
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                              JOINED TEAM
                            </h4>

                            {/* A mini grid for team details */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(140px, 1fr))",
                                gap: "20px",
                              }}
                            >
                              <div>
                                <span className="dt-label">Team Name</span>
                                <span
                                  style={{
                                    color: "#f8fafc",
                                    fontWeight: "600",
                                  }}
                                >
                                  {indi.teamDetails.teamName}
                                </span>
                              </div>
                              <div>
                                <span className="dt-label">Team ID</span>
                                <span
                                  className="mono-font"
                                  style={{ color: "#cbd5e1" }}
                                >
                                  {indi.teamDetails.teamId}
                                </span>
                              </div>
                              <div>
                                <span className="dt-label">Leader</span>
                                <div style={{ color: "#f8fafc" }}>
                                  {indi.teamDetails.leaderName}
                                </div>
                                <div
                                  style={{ color: "#64748b", fontSize: "12px" }}
                                >
                                  {indi.teamDetails.leaderEmail}
                                </div>
                              </div>
                              <div>
                                <span className="dt-label">Members</span>
                                <span style={{ color: "#f8fafc" }}>
                                  {indi.teamDetails.memberCount}/5
                                </span>
                              </div>
                            </div>

                            {indi.teamDetails.teamBio && (
                              <div
                                style={{
                                  marginTop: "15px",
                                  paddingTop: "15px",
                                  borderTop:
                                    "1px solid rgba(16, 185, 129, 0.1)",
                                }}
                              >
                                <span className="dt-label">Bio</span>
                                <span
                                  style={{
                                    fontStyle: "italic",
                                    color: "#94a3b8",
                                  }}
                                >
                                  "{indi.teamDetails.teamBio}"
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredIndividuals.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              No individuals found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewIndividuals;
