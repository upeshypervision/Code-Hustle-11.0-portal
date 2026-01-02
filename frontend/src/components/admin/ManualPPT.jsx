// frontend/src/components/admin/ManualPPT.jsx
import { useState, useEffect } from 'react';
import './ManualPPT.css';

/**
 * ManualPPT Component
 * Allows admins to manually submit PPTs for teams.
 * Fetches ONLY teams that have NOT YET submitted from the backend.
 * This ensures the list is always accurate and up-to-date.
 */
export default function ManualPPT() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [file, setFile] = useState(null);

    // --- CRITICAL CHANGE: Fetch ONLY pending teams from the new backend endpoint ---
    const fetchTeams = async () => {
        setLoading(true);
        setError('');
        try {
            // Use the new, filtered endpoint that returns only teams without submissions
            const res = await fetch('http://localhost:5000/api/admin/teams/pending-submission', {
                method: 'GET',
                credentials: 'include', // Important for admin cookie
            });
            const data = await res.json();
            if (res.ok) {
                setTeams(data.teams || []);
            } else {
                setError(data.error || 'Failed to fetch teams');
            }
        } catch (err) {
            console.error('Fetch teams error:', err);
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleTeamChange = (e) => {
        setSelectedTeamId(e.target.value);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleManualSubmit = async () => {
        if (!selectedTeamId) {
            setMessage({ type: 'error', text: 'Please select a team.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }

        // Confirm action
        if (!window.confirm(`Confirm PPT submission for Team ${selectedTeamId}?`)) {
            return;
        }

        // Create FormData object to send file and team_id
        const formData = new FormData();
        formData.append('file', file);
        formData.append('team_id', selectedTeamId); // Append the selected team ID

        try {
            const res = await fetch('http://localhost:5000/api/submit-ppt', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                // Clear selections after successful submission
                setSelectedTeamId('');
                setFile(null);
                // --- CRITICAL: Refetch the list to update the UI immediately ---
                fetchTeams();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (err) {
            console.error('Manual submission error:', err);
            setMessage({ type: 'error', text: 'Server connection failed.' });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    if (loading) return <div className="manual-ppt-container">Loading Teams...</div>;
    if (error) return <div className="manual-ppt-container" style={{ color: '#ef4444' }}>Error: {error}</div>;

    return (
        <div className="manual-ppt-container">
            <header className="ppt-header">
                <div>
                    <h2 className="ppt-title">Manual PPT Submission</h2>
                    <p className="ppt-subtitle">Submit presentations for teams encountering technical issues.</p>
                </div>
                {/* Display count of pending teams for clarity */}
                <div style={{
                    fontSize: '16px',
                    color: '#64748b',
                    background: '#0f172a',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #1e293b'
                }}>
                    Pending: <strong>{teams.length}</strong>
                </div>
            </header>

            {message.text && (
                <div className={`message-box ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* New Manual Submission Form */}
            <div style={{ padding: '20px', border: '1px solid #1e293b', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ color: '#e2e8f0', marginBottom: '15px' }}>Submit PPT for a Team</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <select
                        value={selectedTeamId}
                        onChange={handleTeamChange}
                        style={{ padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}
                    >
                        <option value="">Select Team</option>
                        {teams.map(t => (
                            <option key={t.team_id} value={t.team_id}>
                                {t.team_name} ({t.team_id})
                            </option>
                        ))}
                    </select>
                    <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={handleFileChange}
                        style={{ color: '#cbd5e1' }}
                    />
                    <button
                        className="btn-submit-ppt"
                        onClick={handleManualSubmit}
                        disabled={!selectedTeamId || !file}
                    >
                        Submit PPT for Selected Team
                    </button>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>
                    Select a team from the list, choose a PDF/PPT/PPTX file (max 5MB), and submit.
                </p>
            </div>

            {/* List of teams that need manual submission (now accurate) */}
            <div className="ppt-list">
                <h3 style={{ color: '#e2e8f0', marginBottom: '15px' }}>Teams Awaiting Manual Submission</h3>
                {teams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        All active teams have submitted their PPTs.
                    </div>
                ) : (
                    teams.map((team) => (
                        <div key={team.team_id} className="ppt-row">
                            <div className="ppt-info">
                                <p className="ppt-team-header">{team.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({team.team_id})</span></p>
                                {/* This count should now always be 0, which is correct */}
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                                    Submissions: {team.submissions?.length || 0}
                                </p>
                            </div>
                            <div className="ppt-action">
                                <button
                                    className="btn-submit-ppt"
                                    onClick={() => handleManualSubmit(team.team_id)}
                                >
                                    Submit PPT
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Add styles for the message box if not already present in ManualPPT.css
// Example additions to ManualPPT.css:
/*
.message-box {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
}

.message-box.success {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid #10b981;
}

.message-box.error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-submit-ppt {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit-ppt:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.btn-submit-ppt:disabled {
  background: #475569;
  cursor: not-allowed;
}
*/