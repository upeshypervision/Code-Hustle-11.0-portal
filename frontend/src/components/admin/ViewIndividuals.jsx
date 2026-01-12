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
            const response = await fetch("http://localhost:5000/api/admin/view-individuals", {
                credentials: "include"
            });
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
        if (!window.confirm("Are you sure you want to delete this individual? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/delete-individual/${individualId}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await response.json();

            if (data.success) {
                setIndividuals(individuals.filter(i => i.individualId !== individualId));
            } else {
                alert("Failed to delete individual: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error deleting individual:", error);
            alert("Error deleting individual");
        }
    };

    const toggleRow = (individualId) => {
        setExpandedRows(prev => ({
            ...prev,
            [individualId]: !prev[individualId]
        }));
    };

    const filteredIndividuals = individuals.filter(indi => {
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

            <div style={{ marginBottom: "24px" }}>
                <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "12px 16px",
                        background: "rgba(30, 41, 59, 0.7)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "12px",
                        color: "#e2e8f0",
                        fontSize: "14px",
                        width: "100%",
                        maxWidth: "400px",
                        backdropFilter: "blur(4px)",
                        outline: "none",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(148, 163, 184, 0.2)"}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                    <div style={{ marginBottom: "12px" }}>Loading individuals...</div>
                </div>
            ) : (
                <div style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    backdropFilter: "blur(10px)"
                }}>
                    <div className="teams-table-wrapper" style={{ overflowX: "auto" }}>
                        <table className="navy-table" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                            <thead>
                                <tr style={{ background: "rgba(15, 23, 42, 0.6)" }}>
                                    <th style={{ width: "48px", padding: "16px" }}></th>
                                    <th style={{ padding: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>Name</th>
                                    <th style={{ padding: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>ID</th>
                                    <th style={{ padding: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>Email</th>
                                    <th style={{ padding: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>Phone</th>
                                    <th style={{ padding: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>Status</th>
                                    <th style={{ padding: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIndividuals.map((indi) => {
                                    const isExpanded = expandedRows[indi.individualId];
                                    const hasDetails = indi.accepted || indi.reason;

                                    return (
                                        <React.Fragment key={indi.individualId}>
                                            <tr style={{
                                                borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                                                background: isExpanded ? "rgba(59, 130, 246, 0.05)" : "transparent",
                                                transition: "background 0.2s"
                                            }}>
                                                <td style={{ padding: "16px", borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>
                                                    {hasDetails && (
                                                        <div
                                                            onClick={() => toggleRow(indi.individualId)}
                                                            className="expand-toggle"
                                                            style={{
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: isExpanded ? '#3b82f6' : '#64748b',
                                                                background: isExpanded ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '6px'
                                                            }}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: "16px", fontWeight: "600", color: "#f8fafc", borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>{indi.fullName}</td>
                                                <td style={{ padding: "16px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9em", color: "#cbd5e1", borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>{indi.individualId}</td>
                                                <td style={{ padding: "16px", color: "#cbd5e1", borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>{indi.email}</td>
                                                <td style={{ padding: "16px", color: "#cbd5e1", borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>{indi.phone || "N/A"}</td>
                                                <td style={{ padding: "16px", borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>
                                                    {indi.reason ? (
                                                        <span className="status-badge" style={{
                                                            background: 'rgba(239, 68, 68, 0.15)',
                                                            color: '#f87171',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}>REMOVED</span>
                                                    ) : indi.accepted ? (
                                                        <span className="status-badge" style={{
                                                            background: 'rgba(16, 185, 129, 0.15)',
                                                            color: '#34d399',
                                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}>ACCEPTED</span>
                                                    ) : (
                                                        <span className="status-badge" style={{
                                                            background: 'rgba(148, 163, 184, 0.15)',
                                                            color: '#94a3b8',
                                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}>PENDING</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "16px", borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => deleteIndividual(indi.individualId, e)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            color: '#f87171',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            transition: 'all 0.2s',
                                                            letterSpacing: '0.05em'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#ef4444';
                                                            e.currentTarget.style.color = '#fff';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                            e.currentTarget.style.color = '#f87171';
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                        DELETE
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && hasDetails && (
                                                <tr>
                                                    <td colSpan="7" style={{
                                                        background: 'rgba(15, 23, 42, 0.4)',
                                                        padding: '0',
                                                        borderBottom: "1px solid rgba(148, 163, 184, 0.1)"
                                                    }}>
                                                        <div style={{ padding: '24px 32px' }}>
                                                            {indi.reason ? (
                                                                <div style={{
                                                                    background: 'rgba(239, 68, 68, 0.05)',
                                                                    padding: '20px',
                                                                    borderRadius: '12px',
                                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                    display: 'flex',
                                                                    gap: '16px',
                                                                    alignItems: 'flex-start'
                                                                }}>
                                                                    <div style={{
                                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                                        padding: '8px',
                                                                        borderRadius: '50%',
                                                                        color: '#ef4444'
                                                                    }}>
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <circle cx="12" cy="12" r="10"></circle>
                                                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <h4 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '14px', fontWeight: '600', marginTop: '0' }}>
                                                                            Removal Reason
                                                                        </h4>
                                                                        <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                                                                            {indi.reason}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : indi.teamDetails ? (
                                                                <div style={{
                                                                    background: 'rgba(16, 185, 129, 0.05)',
                                                                    padding: '24px',
                                                                    borderRadius: '12px',
                                                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                                                        <div style={{
                                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                                            padding: '8px',
                                                                            borderRadius: '50%',
                                                                            color: '#10b981'
                                                                        }}>
                                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                                                <circle cx="9" cy="7" r="4"></circle>
                                                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                                            </svg>
                                                                        </div>
                                                                        <h4 style={{ color: '#10b981', margin: '0', fontSize: '16px', fontWeight: '600' }}>
                                                                            Team Information
                                                                        </h4>
                                                                    </div>

                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                                                        <div>
                                                                            <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Team Name</span>
                                                                            <span style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '600' }}>{indi.teamDetails.teamName}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Team ID</span>
                                                                            <span style={{ color: '#f8fafc', fontSize: '14px', fontFamily: "'JetBrains Mono', monospace" }}>{indi.teamDetails.teamId}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Leader</span>
                                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                <span style={{ color: '#f8fafc', fontSize: '14px', fontWeight: '500' }}>{indi.teamDetails.leaderName}</span>
                                                                                <span style={{ color: '#64748b', fontSize: '12px' }}>{indi.teamDetails.leaderEmail}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Members</span>
                                                                            <span style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '600' }}>{indi.teamDetails.memberCount} / 5</span>
                                                                        </div>
                                                                    </div>
                                                                    {indi.teamDetails.teamBio && (
                                                                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                                                            <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Team Bio</span>
                                                                            <span style={{ color: '#cbd5e1', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6' }}>"{indi.teamDetails.teamBio}"</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredIndividuals.length === 0 && (
                        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                            No individuals found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewIndividuals;
