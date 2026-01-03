import React, { useState, useEffect } from 'react';
import './ViewSubmissions.css';

export default function ViewSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    // --- Fetch ONLY submitted teams ---
    const fetchSubmissions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/admin/submissions', {
                method: 'GET',
                credentials: 'include',
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

    // --- View PPT using presigned URL ---
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

    // --- Download PPT using presigned URL ---
    const handleDownload = async (teamId, fileName) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/submission/${teamId}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok && data.success) {
                const link = document.createElement('a');
                link.href = data.url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert(`Failed to download file: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Download submission error:', err);
            alert('Server connection failed.');
        }
    };

    if (loading) {
        return (
            <div className="admin-section">
                <p>Loading Submissions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-section" style={{ color: '#ef4444' }}>
                Error: {error}
            </div>
        );
    }

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
                        submissions.map((submission, index) => (
                            <div
                                key={`${submission.team_id}-${index}`}
                                className="submission-card"
                            >
                                <div className="submission-info">
                                    <p className="submission-team">
                                        {submission.team_name}{' '}
                                        <span style={{ opacity: 0.5, fontWeight: 400 }}>
                                            ({submission.team_id})
                                        </span>
                                    </p>
                                    <p className="submission-meta">
                                        File: <strong>{submission.file_name}</strong> · Submitted:{' '}
                                        {new Date(submission.submitted_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="submission-actions">
                                    <button
                                        className="btn-small"
                                        onClick={() => handleView(submission.team_id)}
                                    >
                                        View PPT
                                    </button>

                                    <button
                                        className="btn-small"
                                        onClick={() =>
                                            handleDownload(submission.team_id, submission.file_name)
                                        }
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
