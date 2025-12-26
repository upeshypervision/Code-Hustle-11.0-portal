import React from 'react';

export default function ViewSubmissions() {
    const demoSubmissions = [
        { teamId: "CH-TEAM-001", teamName: "HyperCoders", ps: "PS001", fileName: "solution-round1.pptx", submittedAt: "Dec 15, 2025 3:45 PM" },
        { teamId: "CH-TEAM-002", teamName: "Bit Benders", ps: "PS002", fileName: "innovation-deck.pptx", submittedAt: "Dec 15, 2025 4:12 PM" },
        { teamId: "CH-TEAM-005", teamName: "Code Ninjas", ps: "PS001", fileName: "campus-solution.pptx", submittedAt: "Dec 16, 2025 10:30 AM" }
    ];

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">PPT Submissions</h2>
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        All Round 1 PPT submissions from teams. Click "View" to download or preview.
                    </p>

                    {demoSubmissions.map((sub) => (
                        <div key={sub.teamId} className="submission-card">
                            <div className="submission-info">
                                <p className="submission-team">
                                    {sub.teamName} ({sub.teamId})
                                </p>
                                <p className="submission-meta">
                                    PS: <strong>{sub.ps}</strong> · File: {sub.fileName} · {sub.submittedAt}
                                </p>
                            </div>
                            <div className="submission-actions">
                                <button className="btn-small">View PPT</button>
                                <button className="btn-small">Download</button>
                            </div>
                        </div>
                    ))}

                    {demoSubmissions.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No submissions yet
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
