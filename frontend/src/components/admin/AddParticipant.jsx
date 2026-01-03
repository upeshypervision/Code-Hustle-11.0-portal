import { useState } from 'react';
import './AddParticipant.css';

export default function AddParticipant() {
    const [teamName, setTeamName] = useState('');
    const [team, setTeam] = useState({
        leader: { fullName: '', sapid: '', email: '', phone: '' },
        m1: { fullName: '', sapid: '', email: '', phone: '' },
        m2: { fullName: '', sapid: '', email: '', phone: '' },
        m3: { fullName: '', sapid: '', email: '', phone: '' }
    });

    const [participantMessage, setParticipantMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdTeam, setCreatedTeam] = useState(null);

    const handleTeamChange = (memberKey, field, value) => {
        setTeam(prev => ({
            ...prev,
            [memberKey]: { ...prev[memberKey], [field]: value }
        }));
    };

    const handleAddParticipant = async (e) => {
        e.preventDefault();
        setParticipantMessage({ type: '', text: '' });
        setCreatedTeam(null);

        // Basic Validation
        if (!teamName.trim()) {
            setParticipantMessage({ type: 'error', text: 'Team Name is required.' });
            return;
        }
        if (!team.leader.fullName || !team.leader.sapid || !team.leader.email || !team.leader.phone) {
            setParticipantMessage({ type: 'error', text: 'Team Leader details are incomplete.' });
            return;
        }
        if (!team.m1.fullName || !team.m1.sapid || !team.m1.email || !team.m1.phone) {
            setParticipantMessage({ type: 'error', text: 'At least Member 1 details are required.' });
            return;
        }

        setIsSubmitting(true);

        const membersList = [team.m1, team.m2, team.m3].filter(m => m.fullName.trim() !== "");

        const payload = {
            team_name: teamName,
            leader: team.leader,
            members: membersList
        };

        try {
            const response = await fetch('http://localhost:5001/api/admin/add-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important for sending admin cookie
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setParticipantMessage({
                    type: 'success',
                    text: `Team "${teamName}" registered successfully!`
                });
                setCreatedTeam({
                    teamId: data.team_id,
                    password: data.password
                });
                // Reset form
                setTeamName('');
                setTeam({
                    leader: { fullName: '', sapid: '', email: '', phone: '' },
                    m1: { fullName: '', sapid: '', email: '', phone: '' },
                    m2: { fullName: '', sapid: '', email: '', phone: '' },
                    m3: { fullName: '', sapid: '', email: '', phone: '' }
                });
            } else {
                setParticipantMessage({ type: 'error', text: data.error || 'Failed to add team.' });
            }
        } catch (err) {
            setParticipantMessage({ type: 'error', text: 'Server connection failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderMemberInputs = (key, label) => (
        <div className="member-section">
            <span className="section-label">{label}</span>
            <div className="input-row">
                <div className="cosmic-input-group">
                    <label className="cosmic-label">Full Name</label>
                    <div className="cosmic-input-container">
                        <input className="cosmic-input" type="text" placeholder="e.g. John Doe"
                            value={team[key].fullName} onChange={(e) => handleTeamChange(key, 'fullName', e.target.value)} />
                    </div>
                </div>
                <div className="cosmic-input-group">
                    <label className="cosmic-label">SAP ID</label>
                    <div className="cosmic-input-container">
                        <input className="cosmic-input" type="text" placeholder="e.g. 5000XXXX"
                            value={team[key].sapid} onChange={(e) => handleTeamChange(key, 'sapid', e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="input-row">
                <div className="cosmic-input-group">
                    <label className="cosmic-label">Email Address</label>
                    <div className="cosmic-input-container">
                        <input className="cosmic-input" type="email" placeholder="email@domain.com"
                            value={team[key].email} onChange={(e) => handleTeamChange(key, 'email', e.target.value)} />
                    </div>
                </div>
                <div className="cosmic-input-group">
                    <label className="cosmic-label">Phone Number</label>
                    <div className="cosmic-input-container">
                        <input className="cosmic-input" type="text" placeholder="10-digit number"
                            value={team[key].phone} onChange={(e) => handleTeamChange(key, 'phone', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-cosmic-wrapper">
            <header className="admin-cosmic-header">
                <h2 className="cosmic-title">Manual Team Entry</h2>
                <p className="cosmic-subtitle">Bypass payment gateway and add teams directly to the database.</p>
            </header>

            <div className="cosmic-card">
                <form onSubmit={handleAddParticipant} className="form-grid">

                    {/* Team Name */}
                    <div className="member-section" style={{ borderColor: '#38bdf840' }}>
                        <span className="section-label" style={{ color: '#fff' }}>TEAM IDENTIFIER</span>
                        <div className="cosmic-input-group">
                            <label className="cosmic-label">Team Name <span style={{ color: '#f87171' }}>*</span></label>
                            <div className="cosmic-input-container">
                                <input
                                    className="cosmic-input"
                                    type="text"
                                    style={{ fontSize: '16px', fontWeight: 'bold' }}
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Enter Unique Team Name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Leader */}
                    {renderMemberInputs('leader', 'TEAM LEADER (Required)')}

                    {/* Member 1 */}
                    {renderMemberInputs('m1', 'MEMBER 1 (Required)')}

                    {/* Member 2 */}
                    {renderMemberInputs('m2', 'MEMBER 2 (Optional)')}

                    {/* Member 3 */}
                    {renderMemberInputs('m3', 'MEMBER 3 (Optional)')}

                    {participantMessage.text && (
                        <div className={`cosmic-msg ${participantMessage.type}`}>
                            {participantMessage.type === 'success' ? '✅' : '⚠️'}
                            {participantMessage.text}
                        </div>
                    )}

                    {createdTeam && (
                        <div className="success-credentials">
                            <h3 style={{ color: '#34d399', margin: '0 0 10px 0' }}>🎉 Team Created!</h3>
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>Credentials sent via email (if enabled).</p>

                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                <div className="cred-box">
                                    <span className="cred-label">TEAM ID</span>
                                    <span className="cred-value">{createdTeam.teamId}</span>
                                </div>
                                <div className="cred-box">
                                    <span className="cred-label">PASSWORD</span>
                                    <span className="cred-value">{createdTeam.password}</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '10px' }}>
                                Please share these details with the team leader if email delivery fails.
                            </p>
                        </div>
                    )}

                    <button type="submit" className="cosmic-btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing Registration...' : 'REGISTER TEAM NOW'}
                    </button>

                </form>
            </div>
        </div>
    );
}
