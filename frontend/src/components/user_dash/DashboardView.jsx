import React from 'react';
import UserStatus from './UserStatus';

const DashboardView = ({
    selectedPS,
    isPPTSubmitted,
    isGithubSubmitted,
    setActiveTab,
    teamName = "THE AVENGERS"
}) => {
    return (
        <div
            style={{
                width: '100%',
                minHeight: '100vh', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', // Centers vertically for all screens
                padding: '20px', // Prevents box from touching edges on mobile
                position: 'relative',
                overflowY: 'auto', 
                background: '#0a0a0a',
                fontFamily: '"Inter", sans-serif',
                boxSizing: 'border-box'
            }}
        >
            {/* 1. BACKGROUND LAYER */}
            <div
                style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url('data:image/jpeg;base64,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')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: '0.5',
                    filter: 'grayscale(100%) brightness(60%) contrast(110%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />

            {/* 2. GLOW OVERLAY */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(185, 28, 28, 0.25) 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            <style>{`
                @keyframes neonPulse {
                    0%, 100% { box-shadow: 0 0 15px #dc2626, inset 0 0 10px #dc2626; border-color: #dc2626; transform: scale(1); }
                    50% { box-shadow: 0 0 40px #ff0000, inset 0 0 20px #ff0000; border-color: #fff; transform: scale(1.02); }
                }
                .initiate-btn {
                    background: linear-gradient(180deg, rgba(220, 38, 38, 1) 0%, rgba(153, 27, 27, 1) 100%);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: #fff;
                    padding: clamp(14px, 2vw, 20px) 0;
                    width: 100%;
                    max-width: 340px;
                    font-size: clamp(14px, 1.5vw, 16px);
                    font-weight: 900;
                    letter-spacing: 3px;
                    border-radius: 100px;
                    cursor: pointer;
                    text-transform: uppercase;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    animation: neonPulse 3s infinite;
                    z-index: 5;
                    margin: 30px 0;
                }
                .main-glass-box {
                    background: linear-gradient(145deg, rgba(40, 40, 40, 0.5) 0%, rgba(10, 10, 10, 0.95) 100%);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-top: 1px solid rgba(220, 38, 38, 0.5);
                    border-radius: clamp(20px, 5vw, 40px);
                    padding: clamp(30px, 6vw, 60px) clamp(15px, 4vw, 40px);
                    
                    /* RESPONSIVE LOGIC */
                    width: 95%; /* Mobile default */
                    max-width: 500px; /* Laptop/Desktop limit */
                    
                    text-align: center;
                    z-index: 2;
                    position: relative;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
                    margin: auto; /* Ensures centering within flex container */
                }
                ::-webkit-scrollbar { display: none; }
            `}</style>

            {/* 3. CENTERED CONTENT BOX */}
            <div className="main-glass-box">
                <div style={{
                    color: '#dc2626',
                    fontSize: '10px',
                    fontWeight: '900',
                    letterSpacing: '4px',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <span style={{ width: '8px', height: '2px', background: '#dc2626' }} />
                    EST. PHASE 01
                    <span style={{ width: '8px', height: '2px', background: '#dc2626' }} />
                </div>

                <h1
                    style={{
                        fontSize: 'clamp(2rem, 10vw, 4rem)', // Scalable font for all devices
                        fontWeight: '900',
                        color: '#fff',
                        lineHeight: '0.9',
                        margin: '0 0 15px 0',
                        textTransform: 'uppercase',
                        fontStyle: 'italic',
                        letterSpacing: '-1px'
                    }}
                >
                    WELCOME,<br />
                    <span style={{ 
                        color: '#dc2626',
                        background: 'linear-gradient(to bottom, #ff4444, #991b1b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{teamName}</span>
                </h1>

                <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 'clamp(12px, 1.2vw, 15px)',
                    lineHeight: '1.6',
                    maxWidth: '320px',
                    margin: '0 auto 10px auto',
                    fontWeight: '300'
                }}>
                    The vault is synchronized. Review team credentials and initiate the heist sequence.
                </p>

                <button
                    className="initiate-btn"
                    onClick={() => setActiveTab('ps-selection')}
                >
                    INITIATE OPERATION
                </button>

                {/* 4. STATUS STEPPER */}
                <div style={{ 
                    marginTop: '20px', 
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
    );
};

export default DashboardView;