import React from 'react';

const DashboardView = ({ selectedPS, isPPTSubmitted, isGithubSubmitted, setActiveTab }) => {

    const getProgressWidth = () => {
        if (isGithubSubmitted) return '100%';
        if (isPPTSubmitted) return '60%';
        if (selectedPS) return '15%';
        return '0%';
    };

    const getProgressColor = () => {
        if (isGithubSubmitted) return '#10b981'; // Green if complete
        return '#3b82f6'; // Blue otherwise
    };

    return (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            {selectedPS ? (
                <div className="active-project-card" style={{ position: 'relative', padding: '40px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div className="watermark-text">{selectedPS.id}</div>
                    <span className="sub-tag">Active Project Track</span>
                    <h1 className="project-heading">{selectedPS.title}</h1>
                    <div className="meta-grid">
                        <div className="meta-item">
                            <p className="meta-label">CLASSIFICATION</p>
                            <p className="meta-value" style={{ color: '#fbbf24' }}>{selectedPS.track}</p>
                        </div>
                        <div className="meta-separator"></div>
                        <div className="meta-item">
                            <p className="meta-label">TECHNICAL RANK</p>
                            <p className="meta-value" style={{ color: '#3b82f6' }}>{selectedPS.difficulty}</p>
                        </div>
                    </div>
                    <p className="ps-description">{selectedPS.description}</p>
                    <div className="progress-container">
                        <div className="progress-info">
                            <span>MISSION EVOLUTION</span>
                            <span style={{ color: getProgressColor() }}>{getProgressWidth()} COMPLETE</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: getProgressWidth(), background: getProgressColor() }}></div>
                        </div>
                    </div>
                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                        <button
                            className="cyber-action-btn"
                            style={{
                                padding: '12px 30px',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: '700',
                                cursor: isPPTSubmitted ? 'default' : 'pointer',
                                background: isPPTSubmitted ? '#10b981' : '#3b82f6'
                            }}
                            onClick={() => isPPTSubmitted ? null : setActiveTab('ppt-submission')}
                        >
                            {isPPTSubmitted ? 'PPT SUBMITTED ✓' : 'ADD PPT SUBMISSION →'}
                        </button>
                        {isPPTSubmitted && (
                            <button
                                className="cyber-action-btn"
                                style={{
                                    padding: '12px 30px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontWeight: '700',
                                    cursor: isGithubSubmitted ? 'default' : 'pointer',
                                    background: isGithubSubmitted ? '#10b981' : '#f59e0b'
                                }}
                                onClick={() => isGithubSubmitted ? null : setActiveTab('github-submission')}
                            >
                                {isGithubSubmitted ? 'GITHUB LINK SUBMITTED ✓' : 'ADD GITHUB LINK →'}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="empty-dashboard-landing">
                    <div className="grid-bg-overlay"></div>
                    <div className="landing-content-wrapper">
                        <div className="round-live-tag">ROUND 01 IS LIVE NOW</div>
                        <p className="team-details-label">TEAM DETAILS</p>
                        <h1 className="hero-text"> WELCOME,<br /><span>TEAM ALPHA</span></h1>
                        <p className="hero-subtext">Congratulations! Your team has been formally selected for <strong>Round 01</strong>. Please initialize your project track and complete the required team documentation.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <button className="cyber-action-btn-main" onClick={() => setActiveTab('ps-selection')}>
                                <span className="btn-glow"></span>START PROJECT SELECTION →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;
