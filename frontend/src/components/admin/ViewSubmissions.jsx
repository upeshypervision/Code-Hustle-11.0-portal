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
            const res = await fetch('http://localhost:5000/api/admin/teams', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setTeams(data.teams);
            } else {
                setError(data.error || 'Failed to fetch teams');
            }
        } catch (err) {
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-section"><p>Loading Submissions...</p></div>;
    if (error) return <div className="admin-section" style={{ color: '#ef4444' }}>Error: {error}</div>;

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

                    {teams.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No teams registered yet.
                        </p>
                    ) : (
                        teams.map((team, index) => (
                            <div key={team.team_id} className="submission-card">
                                <div className="submission-info">
                                    {/* Clean UI Style: TeamName (TeamID) */}
                                    <p className="submission-team">
                                        {team.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({team.team_id})</span>
                                    </p>
                                    <p className="submission-meta">
                                        {/* Mock Data for now as requested */}
                                        PS: <strong>{index % 2 === 0 ? 'PS001' : 'PS005'}</strong> · File: {index % 3 === 0 ? 'solution.pptx' : 'pitch_deck_v2.pdf'} · Submitted: Dec 28, 2025
                                    </p>
                                </div>
                                <div className="submission-actions">
                                    <button className="btn-small">View PPT</button>
                                    <button className="btn-small">Download</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
