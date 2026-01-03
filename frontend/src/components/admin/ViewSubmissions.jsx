// frontend/src/components/admin/ViewSubmissions.jsx
import React, { useState, useEffect } from 'react';
import './ViewSubmissions.css';

export default function ViewSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/admin/submissions', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setSubmissions(data.submissions || []);
            } else {
                setError(data.error || 'Failed to fetch submissions');
            }
        } catch (err) {
            console.error('Fetch submissions error:', err);
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (teamId, action) => {
        const disposition = action === 'view' ? 'inline' : 'attachment';
        try {
            const res = await fetch(`http://localhost:5000/api/admin/submission/${teamId}?disposition=${disposition}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok && data.success) {
                if (action === 'view') {
                    window.open(data.url, '_blank');
                } else if (action === 'download') {
                    const link = document.createElement('a');
                    link.href = data.url;
                    link.click();
                }
            } else {
                if (res.status === 401 || res.status === 403) {
                    alert("Your session has expired or you are not authorized. Please log in again.");
                    window.location.href = '/admin-login';
                } else {
                    alert(`${action === 'view' ? 'View' : 'Download'} failed: ${data.error || 'Unknown error'}`);
                }
            }
        } catch (err) {
            console.error(`${action} submission error:`, err);
            alert('Server connection failed.');
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
                        All received Round 1 PPT submissions from teams.
                    </p>

                    {submissions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No submissions received yet.
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
                                        onClick={() => handleAction(submission.team_id, 'view')}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="btn-small"
                                        onClick={() => handleAction(submission.team_id, 'download')}
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