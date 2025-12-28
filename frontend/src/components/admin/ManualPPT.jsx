import { useState, useEffect } from 'react';
import './ManualPPT.css';

/**
 * ManualPPT Component
 * 
 * Allows admins to manually submit PPTs for teams.
 * Fetches all registered teams and displays a button to submit.
 */
export default function ManualPPT() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // MOCK DATA: List of team IDs that have "already submitted"
    // In a real scenario, this would come from a database query
    const [mockSubmittedTeams, setMockSubmittedTeams] = useState([
        'T-101', 'T-105' // Example IDs
    ]);

    useEffect(() => {
        fetchTeams();
    }, []);

    /**
     * Fetches all registered teams using the existing /api/admin/teams endpoint.
     */
    const fetchTeams = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/teams', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok) {
                // Filter out teams that are in the mockSubmittedTeams list
                // This ensures we only show pending teams
                const pendingTeams = data.teams.filter(t => !mockSubmittedTeams.includes(t.team_id));
                setTeams(pendingTeams);
            } else {
                setError(data.error || 'Failed to fetch teams');
            }
        } catch (err) {
            console.error(err);
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle Manual PPT Submission
     * @param {string} teamId - The ID of the team to submit for
     */
    const handleManualSubmit = (teamId) => {
        // Here you would normally make an API call to save the submission
        // For now, we just update the mock state to hide the team
        if (window.confirm(`Confirm PPT submission for Team ${teamId}?`)) {
            alert(`PPT Submited manually for ${teamId} `)
            setMockSubmittedTeams(prev => [...prev, teamId]);
            // Remove from current view
            setTeams(prev => prev.filter(t => t.team_id !== teamId));
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

            <div className="ppt-list">
                {teams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        All active teams have submitted their PPTs.
                    </div>
                ) : (
                    teams.map((team) => (
                        <div key={team.team_id} className="ppt-row">
                            {/* Team Details */}
                            <div className="ppt-info">
                                <p className="ppt-team-header">
                                    {team.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({team.team_id})</span>
                                </p>
                            </div>

                            {/* Actions */}
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
