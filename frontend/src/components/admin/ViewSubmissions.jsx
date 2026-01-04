import React, { useState, useEffect } from 'react';
// Make sure this CSS file exists and contains the styles from your UI project
import './ViewSubmissions.css';

export default function ViewSubmissions() {
    // 1. STATE: Using the structure from the Logic code
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    // 2. LOGIC: Fetch function from the Logic code (Port 5000)
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
                // Logic code expects data.submissions
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

    // 3. LOGIC: Handle Action from the Logic code
    // This replaces the direct href links with secure backend calls
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
                    // Try to use the filename from the response if available, or a default
                    link.download = '';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } else {
                if (res.status === 401 || res.status === 403) {
                    alert("Your session has expired. Please log in again.");
                    // window.location.href = '/admin-login'; // Uncomment if you have routing setup
                } else {
                    alert(`${action === 'view' ? 'View' : 'Download'} failed: ${data.error || 'Unknown error'}`);
                }
            }
        } catch (err) {
            console.error(`${action} submission error:`, err);
            alert('Server connection failed.');
        }
    };

    // Helper: Date formatter from your UI code
    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) return (
        <div className="admin-section">
            <p>Loading Submissions...</p>
        </div>
    );

    if (error) return (
        <div className="admin-section" style={{ color: '#ef4444' }}>
            Error: {error}
        </div>
    );

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">PPT Submissions</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "5px" }}>
                    {submissions.length} submission{submissions.length !== 1 ? "s" : ""} received
                </p>
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        All Round 1 PPT submissions from teams. Click "View" to download or preview.
                    </p>

                    {submissions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No submissions received yet.
                        </p>
                    ) : (
                        // Mapping over the submissions data
                        submissions.map((submission) => (
                            <div key={submission.team_id} className="submission-card">
                                <div className="submission-info">
                                    {/* UI: Team Name & ID */}
                                    <p className="submission-team">
                                        {submission.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({submission.team_id})</span>
                                    </p>

                                    {/* UI: Meta Data */}
                                    <p className="submission-meta">
                                        File: <strong>{submission.file_name}</strong> · Submitted: {formatDate(submission.submitted_at)}
                                    </p>
                                </div>

                                <div className="submission-actions">
                                    {/* UI BUTTONS with LOGIC HANDLERS
                                      We replaced the <a> tags with <button> tags
                                      that call handleAction()
                                    */}
                                    <button
                                        className="btn-small"
                                        onClick={() => handleAction(submission.team_id, 'view')}
                                    >
                                        View PPT
                                    </button>

                                    <button
                                        className="btn-small"
                                        onClick={() => handleAction(submission.team_id, 'download')}
                                        style={{ marginLeft: '8px' }}
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