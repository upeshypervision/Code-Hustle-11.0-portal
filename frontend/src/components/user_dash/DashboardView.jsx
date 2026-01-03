import React from 'react';
import UserStatus from './UserStatus';
import UserSidebar from './UserSidebar';

const DashboardView = ({
    selectedPS,
    isPPTSubmitted,
    isGithubSubmitted,
    setActiveTab,
    activeTab,
    teamName = "THE AVENGERS",
    teamMembers = ["Member 01", "Member 02", "Member 03", "Member 04"]
}) => {
    return (
        <div
            style={{
                width: '100%',
                minHeight: '100vh', 
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                position: 'relative',
                overflow: 'hidden', 
                background: '#0a0a0a',
                fontFamily: '"Inter", sans-serif',
                boxSizing: 'border-box'
            }}
        >
            <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative',
                overflowY: 'auto'
            }}>
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4otxGPqIii92wFJAksBcqA97drEL-EvYZjw&s')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: '0.4', 
                        zIndex: 0,
                        pointerEvents: 'none',
                        filter: 'grayscale(100%) brightness(30%) contrast(120%)'
                    }}
                />

                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, transparent 10%, rgba(200, 80, 71, 0.2) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }} />

                <style>{`
                    @keyframes neonPulse {
                        0%, 100% { box-shadow: 0 0 15px #dc2626, inset 0 0 10px #dc2626; border-color: #dc2626; transform: scale(1); }
                        50% { box-shadow: 0 0 40px #ff0000, inset 0 0 20px #ff0000; border-color: #fff; transform: scale(1.02); }
                    }
                    @keyframes liveShimmer {
                        0% { opacity: 0.5; text-shadow: 0 0 5px #ff0000; }
                        50% { opacity: 1; text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000; }
                        100% { opacity: 0.5; text-shadow: 0 0 5px #ff0000; }
                    }
                    @keyframes scanline {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }
                    .live-badge {
                        background: #dc2626;
                        color: white;
                        padding: 4px 12px;
                        font-size: 10px;
                        font-weight: 900;
                        letter-spacing: 2px;
                        border-radius: 4px;
                        position: relative;
                        overflow: hidden;
                        animation: liveShimmer 1.5s infinite;
                        box-shadow: 0 0 15px rgba(220, 38, 38, 0.6);
                    }
                    .live-badge::after {
                        content: "";
                        position: absolute;
                        top: 0; left: 0; width: 100%; height: 2px;
                        background: rgba(255,255,255,0.8);
                        animation: scanline 2s linear infinite;
                    }
                    .initiate-btn {
                        background: linear-gradient(180deg, rgba(220, 38, 38, 1) 0%, rgba(153, 27, 27, 1) 100%);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: #fff;
                        padding: 16px 32px;
                        width: 100%;
                        max-width: 340px;
                        font-size: 14px;
                        font-weight: 900;
                        letter-spacing: 3px;
                        border-radius: 100px;
                        cursor: pointer;
                        text-transform: uppercase;
                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        animation: neonPulse 3s infinite;
                        z-index: 5;
                        margin: 20px 0;
                    }
                    .main-glass-box {
                        background: linear-gradient(145deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.98) 100%);
                        backdrop-filter: blur(25px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-top: 1px solid rgba(220, 38, 38, 0.5);
                        border-radius: 40px;
                        padding: 40px;
                        width: 95%;
                        max-width: ${selectedPS ? '800px' : '500px'};
                        text-align: center;
                        z-index: 2;
                        position: relative;
                        box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
                        transition: max-width 0.5s ease;
                    }
                    .member-tag {
                        background: rgba(220, 38, 38, 0.1);
                        border: 1px solid rgba(220, 38, 38, 0.3);
                        color: #fff;
                        padding: 8px 15px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }
                    .action-card {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 20px;
                        border-radius: 15px;
                        flex: 1;
                        cursor: pointer;
                        transition: 0.3s;
                    }
                    .action-card:hover {
                        background: rgba(220, 38, 38, 0.1);
                        border-color: #dc2626;
                    }
                `}</style>

                <div className="main-glass-box">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #dc2626)' }}></div>
                        <div className="live-badge">ROUND 01 LIVE</div>
                        <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, #dc2626, transparent)' }}></div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: '900', color: '#fff', margin: 0, textTransform: 'uppercase', fontStyle: 'italic' }}>
                            {teamName}
                        </h1>
                    </div>

                    {!selectedPS ? (
                        <>
                            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', maxWidth: '320px', margin: '0 auto 30px auto' }}>
                                Awaiting mission parameters. Initialize the system to select your target problem statement.
                            </p>
                            <button className="initiate-btn" onClick={() => setActiveTab('ps-selection')}>
                                INITIATE OPERATION
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '900', marginBottom: '15px', letterSpacing: '2px' }}>TEAM ROSTER</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {teamMembers.map((m, i) => (
                                        <div key={i} className="member-tag">{m}</div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderLeft: '4px solid #dc2626', paddingLeft: '20px' }}>
                                <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '900', letterSpacing: '2px' }}>LOCKED TARGET</div>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: '5px 0', textTransform: 'uppercase' }}>{selectedPS.title || selectedPS.id}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>{selectedPS.track}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <div className="action-card" onClick={() => setActiveTab('ppt-submission')}>
                                    <div style={{ color: isPPTSubmitted ? '#22c55e' : '#dc2626', fontSize: '20px', marginBottom: '10px' }}>{isPPTSubmitted ? '✓' : '⇪'}</div>
                                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '12px' }}>PPT DOSSIER</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{isPPTSubmitted ? 'UPLOADED' : 'PENDING'}</div>
                                </div>
                                <div className="action-card" onClick={() => setActiveTab('github-submission')}>
                                    <div style={{ color: isGithubSubmitted ? '#22c55e' : '#dc2626', fontSize: '20px', marginBottom: '10px' }}>{isGithubSubmitted ? '✓' : '🔗'}</div>
                                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '12px' }}>SOURCE CODE</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{isGithubSubmitted ? 'LINKED' : 'PENDING'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ 
                        marginTop: '30px', 
                        width: '100%',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <UserStatus
                            selectedPS={selectedPS}
                            isPPTSubmitted={isPPTSubmitted}
                            isGithubSubmitted={isGithubSubmitted}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;