import React, { useState } from 'react';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            {/* MOBILE HAMBURGER - Now hides when menu is open */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hamburger-btn"
                style={{
                    display: isMenuOpen ? 'none' : 'none', // Controlled by Media Query + State
                    position: 'fixed',
                    top: '80px',       
                    left: '20px',      
                    zIndex: 1001,
                    background: 'transparent',
                    border: '1px solid rgba(220, 38, 38, 0.5)',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(5px)'
                }}
            >
                <div style={{ width: '18px', height: '2px', background: '#fff', margin: '3px 0' }}></div>
                <div style={{ width: '18px', height: '2px', background: '#fff', margin: '3px 0' }}></div>
                <div style={{ width: '18px', height: '2px', background: '#fff', margin: '3px 0' }}></div>
            </button>

            {/* SIDEBAR WRAPPER */}
            <div className={`sidebar-wrapper ${isMenuOpen ? 'open' : ''}`}>
                <UserSidebar activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setIsMenuOpen(false);
                }} />
                
                {/* Close Button Inside Sidebar for better UX (Optional) */}
                {/* {isMenuOpen && (
                    // <div 
                    //     onClick={() => setIsMenuOpen(false)}
                    //     style={{
                    //         position: 'absolute',
                    //         top: '20px',
                    //         right: '20px',
                    //         color: '#fff',
                    //         fontSize: '20px',
                    //         cursor: 'pointer',
                    //         zIndex: 1002
                    //     }}
                    // >
                    //     ✕
                    // </div>
                )} */}
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative',
                overflowY: 'auto',
                zIndex: 2
            }}>
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url('https://www.hollywoodreporter.com/wp-content/uploads/2018/12/MoneyHeist.jpg?w=1296&h=730&crop=1')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: '1', 
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                />

                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(circle at 40% 70%, transparent 10%, rgba(20, 16, 16, 0.42) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }} />

                <style>{`
                    @keyframes neonPulse {
                        0%, 100% { box-shadow: 0 0 15px #dc2626, inset 0 0 10px #dc2626; border-color: #dc2626; transform: scale(1); }
                        50% { box-shadow: 0 0 40px #ff0000, inset 0 0 20px #ff0000; border-color: #fff; transform: scale(1.02); }
                    }
                    @keyframes liveShimmer {
                        0%, 100% { opacity: 0.5; text-shadow: 0 0 5px #ff0000; }
                        50% { opacity: 1; text-shadow: 0 0 20px #ff0000; }
                    }
                    .initiate-btn {
                        background: linear-gradient(180deg, rgba(220, 38, 38, 1) 0%, rgba(153, 27, 27, 1) 100%);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: #fff;
                        padding: 16px 0;
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
                        margin: 30px 0;
                    }
                    .main-glass-box {
                        background: linear-gradient(145deg, rgba(0, 0, 0, 0.37) 0%, rgba(10, 10, 10, 0.95) 100%);
                        backdrop-filter: blur(25px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-top: 1px solid rgba(220, 38, 38, 0.5);
                        border-radius: 40px;
                        padding: 60px 40px;
                        width: 95%;
                        max-width: 500px;
                        text-align: center;
                        z-index: 10;
                        position: relative;
                        box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
                        box-sizing: border-box;
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                    }
                    .live-badge {
                        background: #dc2626;
                        color: white;
                        padding: 4px 12px;
                        font-size: 10px;
                        font-weight: 900;
                        letter-spacing: 2px;
                        border-radius: 4px;
                        animation: liveShimmer 1.5s infinite;
                        display: inline-block;
                        margin-bottom: 20px;
                    }

                    @media (max-width: 992px) {
                        /* Only show button if menu is NOT open */
                        .hamburger-btn { display: ${isMenuOpen ? 'none' : 'block'} !important; }
                        
                        .sidebar-wrapper {
                            position: fixed;
                            left: -280px;
                            top: 0;
                            height: 100vh;
                            z-index: 1000;
                            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .sidebar-wrapper.open { left: 0; }
                    }
                `}</style>

                <div className="main-glass-box">
                    <div className="live-badge">PHASE 01 LIVE</div>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 10vw, 3.5rem)',
                        fontWeight: '900',
                        color: '#fff',
                        lineHeight: '1.1',
                        margin: '0 0 15px 0',
                        textTransform: 'uppercase',
                        fontStyle: 'italic',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                    }}>
                        WELCOME,<br />
                        <span style={{ 
                            color: '#dc2626',
                            background: 'linear-gradient(to bottom, #ff4444, #991b1b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block',
                            maxWidth: '100%',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto'
                        }}>{teamName}</span>
                    </h1>

                    {!selectedPS ? (
                        <>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', maxWidth: '320px', margin: '0 auto 10px auto' }}>
                                The vault is synchronized. Review team credentials and initiate the heist sequence.
                            </p>
                            <button className="initiate-btn" onClick={() => setActiveTab('ps-selection')}>
                                INITIATE OPERATION
                            </button>
                        </>
                    ) : (
                        <div style={{ marginTop: '20px', textAlign: 'left' }}>
                            <div style={{ color: '#dc2626', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px' }}>TEAM MEMBERS</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                                {teamMembers.map((m, i) => (
                                    <span key={i} style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid #dc2626', color: '#fff', padding: '5px 12px', borderRadius: '4px', fontSize: '11px' }}>{m}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '20px', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
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