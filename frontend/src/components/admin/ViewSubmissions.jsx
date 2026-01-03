import React, { useState, useEffect } from 'react';
import './ViewSubmissions.css'; 

export default function ViewSubmissions() {
    // State for completed submissions and pending teams
    const [submissions, setSubmissions] = useState([]);
    const [pendingTeams, setPendingTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Execute both requests in parallel for performance
            const [submissionsRes, teamsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/submissions', {
                    method: 'GET',
                    credentials: 'include',
                }),
                fetch('http://localhost:5000/api/admin/teams', {
                    method: 'GET',
                    credentials: 'include',
                })
            ]);

            const submissionsData = await submissionsRes.json();
            const teamsData = await teamsRes.json();

            // Handle Submissions Data
            if (submissionsRes.ok) {
                setSubmissions(submissionsData.submissions || []);
            } else {
                throw new Error(submissionsData.error || 'Failed to fetch submissions');
            }

            // Handle Pending Teams Data
            if (teamsRes.ok) {
                // Filter teams that do not have a ppt_url
                const notSubmitted = teamsData.teams.filter(team => !team.ppt_url);
                setPendingTeams(notSubmitted);
            } else {
                throw new Error(teamsData.error || 'Failed to fetch teams');
            }

        } catch (err) {
            console.error('Data fetch error:', err);
            setError(err.message || 'Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    // --- Actions for Submitted Files (from Snippet 2) ---

    const handleDownload = (file_path, fileName) => {
        const link = document.createElement('a');
        link.href = file_path;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = async (teamId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/submission/${teamId}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok && data.success) {
                window.open(data.url, '_blank');
            } else {
                alert(`Failed to load file: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('View submission error:', err);
            alert('Server connection failed.');
        }
    };

    if (loading) {
        return <div className="admin-section"><p>Loading Dashboard Data...</p></div>;
    }

    if (error) {
        return <div className="admin-section" style={{ color: '#ef4444' }}>Error: {error}</div>;
    }

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">Round 1 PPT Dashboard</h2>
            </div>

            {/* --- SECTION 1: RECEIVED SUBMISSIONS --- */}
            <div className="panel" style={{ marginBottom: '30px' }}>
                <div className="panel-inner">
                    <h3 className="panel-title" style={{ marginBottom: '10px', color: '#10b981' }}>
                        ✅ Received Submissions ({submissions.length})
                    </h3>
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        Teams that have successfully submitted their PPTs.
                    </p>

                    {submissions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No teams have submitted their PPTs yet.
                        </p>
                    ) : (
                        submissions.map((submission) => (
                            <div key={submission.team_id} className="submission-card">
                                <div className="submission-info">
                                    <p className="submission-team">
                                        {submission.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({submission.team_id})</span>
                                    </p>
                                    <p className="submission-meta">
                                        File: <strong>{submission.file_name}</strong> · Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="submission-actions">
                                    <button 
                                        className="btn-small" 
                                        onClick={() => handleView(submission.team_id)}
                                    >
                                        View
                                    </button>
                                    <button 
                                        className="btn-small" 
                                        onClick={() => handleDownload(submission.file_path, submission.file_name)}
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}