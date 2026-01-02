import React from 'react';
import UserStatus from './UserStatus';
import UserSidebar from './UserSidebar';

const DashboardView = ({
    selectedPS,
    isPPTSubmitted,
    isGithubSubmitted,
    setActiveTab,
    activeTab, // Added to track state in sidebar
    teamName = "THE AVENGERS"
}) => {
    return (
        <div
            style={{
                width: '100%',
                minHeight: '100vh', 
                display: 'flex',
                flexDirection: 'row', // Layout to accommodate sidebar
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                position: 'relative',
                overflow: 'hidden', 
                background: '#0a0a0a',
                fontFamily: '"Inter", sans-serif',
                boxSizing: 'border-box'
            }}
        >
            {/* 1. SIDEBAR INTEGRATION */}
            <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* MAIN CONTENT AREA */}
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
                {/* 1. BACKGROUND LAYER - UPDATED WITH PHOTO CODE */}
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
                        filter: 'grayscale(30%) brightness(30%) contrast(150%) sepia(100%) hue-rotate(-50deg) saturate(600%)',
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                />

                {/* 2. GLOW OVERLAY */}
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, transparent 10%, rgba(200, 80, 71, 0.42) 100%)',
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
                        width: 95%;
                        max-width: 500px;
                        text-align: center;
                        z-index: 2;
                        position: relative;
                        box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
                        margin: auto;
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
                        <span style={{ width: '8px', height: '2px', background: '#be9090ff' }} />
                        EST. PHASE 01
                        <span style={{ width: '8px', height: '2px', background: '#dc2626' }} />
                    </div>

                    <h1
                        style={{
                            fontSize: 'clamp(2rem, 10vw, 4rem)',
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
                        Track project progress and ensure completion of all required details.
                    </p>

                    <button
                        className="initiate-btn"
                        onClick={() => setActiveTab('ps-selection')}
                    >
                        INITIATE OPERATION
                    </button>

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
        </div>
    );
};

export default DashboardView;