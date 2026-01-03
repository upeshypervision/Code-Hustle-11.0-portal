// frontend/src/components/admin/ManualPPT.jsx
import { useState, useEffect } from 'react';
import './ManualPPT.css';

/**
 * ManualPPT Component
 * Allows admins to manually submit PPTs for teams.
 * Fetches all registered teams and displays a form to select a team and upload a file.
 */
export default function ManualPPT() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [file, setFile] = useState(null);

    const fetchTeams = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5001/api/admin/teams-without-ppt', {
                method: 'GET',
                credentials: 'include',
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
            const res = await fetch('http://localhost:5001/api/submit-ppt', { // Use the same route
                method: 'POST',
                body: formData, // Send FormData
                credentials: 'include', // Important for admin cookie
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                // Clear selections after successful submission
                setSelectedTeamId('');
                setFile(null);
                // Refresh teams list to remove the submitted team
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
                    <p className="ppt-subtitle">
                        Submit presentations for teams encountering technical issues.
                        <strong style={{ color: '#3b82f6', marginLeft: '8px' }}>
                            {teams.length} team{teams.length !== 1 ? 's' : ''} pending
                        </strong>
                    </p>
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
                        className="btn-submit-ppt" // Using existing CSS class if available, or define a new one
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

            {/* Optional: List of teams that might need manual submission */}
            {/* This part can be kept or modified based on specific admin needs */}
            <div className="ppt-list">
                <h3 style={{ color: '#e2e8f0', marginBottom: '15px' }}>All Registered Teams</h3>
                {teams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No teams registered yet.
                    </div>
                ) : (
                    teams.map((team) => (
                        <div key={team.team_id} className="ppt-row">
                            {/* Team Details */}
                            <div className="ppt-info">
                                <p className="ppt-team-header">{team.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({team.team_id})</span></p>
                                {/* Optionally show submission count or status */}
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                                    Submissions: {team.submissions?.length || 0}
                                </p>
                            </div>
                            {/* Actions - Could add more specific actions here if needed */}
                            <div className="ppt-action">
                                {/* Example: Button to view team details */}
                                <button
                                    className="btn-small" // Using existing CSS class
                                    onClick={() => console.log("View team details for", team.team_id)}
                                >
                                    View Details
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