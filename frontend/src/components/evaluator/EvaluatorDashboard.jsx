import React, { useState, useEffect } from 'react';

export default function EvaluatorDashboard() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [marksInput, setMarksInput] = useState({}); // { teamId: marks_value }
    const [evaluatorStats, setEvaluatorStats] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignedSubmissions();
    }, []);

    const fetchAssignedSubmissions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/evaluator/assigned-submissions', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setSubmissions(data.submissions || []);
                setEvaluatorStats(data.evaluator_info);
            } else {
                setError(data.error || 'Failed to fetch assignments');
            }
        } catch (err) {
            console.error('Fetch assignments error:', err);
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
                    link.download = '';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } else {
                alert(`${action === 'view' ? 'View' : 'Download'} failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(`${action} submission error:`, err);
            alert('Server connection failed.');
        }
    };

    const handleMarksChange = (teamId, value) => {
        setMarksInput(prev => ({ ...prev, [teamId]: value }));
    };

    const submitAllMarks = async () => {
        const teamIdsToSubmit = Object.keys(marksInput);
        if (teamIdsToSubmit.length === 0) {
            alert("No marks entered to submit.");
            return;
        }

        if (!window.confirm(`Are you sure you want to submit marks for ${teamIdsToSubmit.length} teams?`)) {
            return;
        }

        setSubmitting(true);
        let successCount = 0;
        let failCount = 0;

        const promises = teamIdsToSubmit.map(async (teamId) => {
            const marks = marksInput[teamId];
            try {
                const res = await fetch('http://localhost:5000/api/evaluator/submit-marks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ team_id: teamId, marks: marks })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    successCount++;
                    return { teamId, success: true };
                } else {
                    failCount++;
                    return { teamId, success: false, error: data.error };
                }
            } catch (err) {
                failCount++;
                return { teamId, success: false, error: "Network error" };
            }
        });

        const results = await Promise.all(promises);

        setSubmissions(prev => prev.map(sub => {
            const result = results.find(r => r.teamId === sub.team_id);
            if (result && result.success) {
                return { ...sub, marks: marksInput[sub.team_id], marks_submitted: true };
            }
            return sub;
        }));

        setSubmitting(false);
        alert(`Submission Complete.\nSuccess: ${successCount}\nFailed: ${failCount}`);
    };

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    if (loading) return (
        <div className="admin-section">
            <style>{`
/* ViewSubmissions.css Embedded */
.admin-section {
    padding: 20px;
    width: 90%;
    max-width: 1000px; /* Constrain width to keep elements closer */
    margin: 0 auto;
}
.admin-section-header {
    margin-bottom: 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
}
.admin-section-title {
    color: #fff;
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0;
}
            `}</style>
            <p>Loading Assignments...</p>
        </div>
    );

    if (error) return (
        <div className="admin-section" style={{ color: '#ef4444' }}>
            <style>{`
/* ViewSubmissions.css Embedded */
.admin-section {
    padding: 20px;
    width: 90%;
    max-width: 1000px; /* Constrain width to keep elements closer */
    margin: 0 auto;
}
            `}</style>
            Error: {error}
        </div>
    );

    return (
        <div className="admin-section">
            <style>{`
/* ViewSubmissions.css Embedded */
.admin-section {
    padding: 20px;
    width: 90%;
    max-width: 1000px; /* Constrain width to keep elements closer */
    margin: 0 auto;
}

.admin-section-header {
    margin-bottom: 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
}

.admin-section-title {
    color: #fff;
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0;
}

.panel {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.panel-inner {
    padding: 20px;
}

.panel-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-top: 0;
}

.panel-subtitle {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0;
}

.submission-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: transform 0.2s ease, background 0.2s ease;
}

.submission-card:hover {
    background: rgba(15, 23, 42, 0.9);
    transform: translateX(5px);
    border-color: rgba(59, 130, 246, 0.3);
}

.submission-info {
    flex: 1;
}

.submission-team {
    color: #fff;
    font-weight: 700;
    font-size: 1.8rem; /* Increased from 1rem */
    margin: 0 0 5px 0;
}

.submission-meta {
    color: #94a3b8;
    font-size: 0.8rem;
    margin: 0;
}

.submission-actions {
    display: flex;
    gap: 10px;
}

.btn-small {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #3b82f6;
    color: white;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-small:hover {
    background: #2563eb;
}

.btn-small:disabled {
    background: #475569;
    cursor: not-allowed;
    opacity: 0.6;
}
            `}</style>

            <div className="admin-section-header">
                <h2 className="admin-section-title">My Assignments</h2>
                {evaluatorStats && (
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "5px" }}>
                        You have {evaluatorStats.assigned_count} Assigned Submissions (Total Pending: {evaluatorStats.total_pending})
                    </p>
                )}
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        Evaluate and grade the assigned PPT submissions.
                    </p>

                    {submissions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No pending submissions assigned to you.
                        </p>
                    ) : (
                        <div style={{ paddingBottom: '20px' }}>
                            {submissions.map((submission) => (
                                <div key={submission.team_id} className="submission-card" style={{
                                    borderLeft: submission.marks ? '4px solid #22c55e' : '4px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                    <div className="submission-info">
                                        <p className="submission-team">
                                            {submission.team_name} <span style={{ opacity: 0.7, fontSize: '0.9em', marginLeft: '6px' }}>({submission.team_id})</span>
                                            {submission.marks && (
                                                <span style={{
                                                    marginLeft: '12px',
                                                    background: '#22c55e',
                                                    color: '#000',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7em',
                                                    fontWeight: '600'
                                                }}>
                                                    ✓ EVALUATED
                                                </span>
                                            )}
                                        </p>
                                        <p className="submission-meta">
                                            File: <strong>{submission.file_name}</strong> · {formatDate(submission.submitted_at)}
                                            {submission.evaluated_by && (
                                                <span style={{ marginLeft: '10px', color: '#94a3b8' }}>
                                                    · Evaluated by: {submission.evaluated_by}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="submission-actions">
                                        <button className="btn-small" onClick={() => handleAction(submission.team_id, 'view')}>
                                            View PPT
                                        </button>

                                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <input
                                                type="number"
                                                placeholder="Marks"
                                                value={marksInput[submission.team_id] !== undefined ? marksInput[submission.team_id] : (submission.marks || '')}
                                                onChange={(e) => handleMarksChange(submission.team_id, e.target.value)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#fff',
                                                    width: '60px',
                                                    textAlign: 'center',
                                                    fontSize: '0.9rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Static Submit Button inside Panel */}
                {submissions.length > 0 && (
                    <div style={{
                        marginTop: '20px',
                        paddingTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <button
                            onClick={submitAllMarks}
                            disabled={submitting}
                            style={{
                                background: '#22c55e',
                                color: '#000',
                                border: 'none',
                                padding: '12px 60px', /* Wider button */
                                borderRadius: '8px', /* Less rounded */
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: submitting ? 'wait' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                            }}
                        >
                            {submitting ? 'Submitting...' : 'SUBMIT ALL EVALUATIONS'}
                        </button>
                    </div>
                )}
            </div>
        </div>



    );
}
