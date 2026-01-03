import React, { useState, useEffect } from 'react';

export default function ViewSubmissions() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/teams-with-ppt', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setTeams(data.teams || []);
            } else {
                setError(data.error || 'Failed to fetch teams');
            }
        } catch (err) {
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="admin-section"><p>Loading Submissions...</p></div>;
    if (error) return <div className="admin-section" style={{ color: '#ef4444' }}>Error: {error}</div>;

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">PPT Submissions</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>
                    {teams.length} submission{teams.length !== 1 ? 's' : ''} received
                </p>
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        All Round 1 PPT submissions from teams. Click "View" to download or preview.
                    </p>

                    {teams.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No submissions yet.
                        </p>
                    ) : (
                        teams.map((team) => (
                            <div key={team.team_id} className="submission-card">
                                <div className="submission-info">
                                    {/* Clean UI Style: TeamName (TeamID) */}
                                    <p className="submission-team">
                                        {team.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({team.team_id})</span>
                                    </p>
                                    <p className="submission-meta">
                                        File: <strong>{team.file_name || 'N/A'}</strong> · Submitted: {formatDate(team.submitted_at)}
                                    </p>
                                </div>
                                <div className="submission-actions">
                                    {team.file_path && (
                                        <>
                                            <a
                                                href={team.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-small"
                                            >
                                                View PPT
                                            </a>
                                            <a
                                                href={team.file_path}
                                                download
                                                className="btn-small"
                                            >
                                                Download
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
