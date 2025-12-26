import { useState } from 'react';

export default function RoundManagement() {
    const [round1Active, setRound1Active] = useState(true);
    const [round2Active, setRound2Active] = useState(false);

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">Round Management</h2>
            </div>

            <div className="control-group">
                <label className="toggle-label">
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={round1Active}
                            onChange={(e) => setRound1Active(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </div>
                    <span>
                        <strong>Round 1: PS Selection & PPT Upload</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {round1Active ? 'Currently OPEN - Participants can select PS and upload PPT' : 'Currently CLOSED'}
                        </div>
                    </span>
                </label>

                <label className="toggle-label">
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={round2Active}
                            onChange={(e) => setRound2Active(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </div>
                    <span>
                        <strong>Round 2: GitHub Link & Physical Round</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {round2Active ? 'Currently VISIBLE - Qualified teams can see round 2 details (MAC Building)' : 'Currently HIDDEN'}
                        </div>
                    </span>
                </label>
            </div>

            <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Round Details</h3>
                <div className="panel">
                    <div className="panel-inner">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Round 1</td>
                                    <td>
                                        <span className={`status-pill ${round1Active ? 'pass' : 'pending'}`}>
                                            {round1Active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>PS Selection & PPT Upload</td>
                                    <td>Online Portal</td>
                                </tr>
                                <tr>
                                    <td>Round 2</td>
                                    <td>
                                        <span className={`status-pill ${round2Active ? 'pass' : 'pending'}`}>
                                            {round2Active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>GitHub Submission & Physical Coding</td>
                                    <td>MAC Building, UPES</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
