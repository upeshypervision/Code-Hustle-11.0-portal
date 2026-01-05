import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import UserStatus from './UserStatus';
import UserSidebar from './UserSidebar';

const DashboardView = ({
    selectedPS,
    isPPTSubmitted,
    isGithubSubmitted,
    setActiveTab,
    activeTab,
    teamName = "THE AVENGERS",
    teamMembers = ["Member 01", "Member 02", "Member 03", "Member 04"],
    isSidebarOpen, // Accept prop
    setIsSidebarOpen // Accept prop
}) => {
    const [roundStatus, setRoundStatus] = useState(null);
    const [currentRound, setCurrentRound] = useState(null);
    const [teamInfo, setTeamInfo] = useState(null);

    // Fetch team info on mount
    useEffect(() => {
        const fetchTeamInfo = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/user-info', {
                    credentials: 'include'
                });
                const data = await res.json();

                if (data.success) {
                    setTeamInfo(data);
                }
            } catch (err) {
                console.error('Error fetching team info:', err);
            }
        };

        fetchTeamInfo();
    }, []);


    // Fetch round status on mount
    useEffect(() => {
        const fetchRoundStatus = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/round-status', {
                    credentials: 'include'
                });
                const data = await res.json();

                if (data.success) {
                    setRoundStatus(data.rounds);
                    determineCurrentRound(data.rounds);
                }
            } catch (err) {
                console.error('Error fetching round status:', err);
            }
        };

        fetchRoundStatus();
    }, []);

    // Listen for round status changes via WebSocket
    useEffect(() => {
        const handleRoundChange = (data) => {
            // Fetch updated round status
            fetch('http://localhost:5000/api/round-status', {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setRoundStatus(data.rounds);
                        determineCurrentRound(data.rounds);
                    }
                })
                .catch(err => console.error('Error fetching round status:', err));
        };

        socket.on("round_status_changed", handleRoundChange);
        return () => socket.off("round_status_changed", handleRoundChange);
    }, []);

    // Determine which round is currently active
    const determineCurrentRound = (rounds) => {
        if (!rounds) return;

        // Priority: GitHub > PPT > PS (show the highest active round)
        if (rounds.github_submission) {
            setCurrentRound({ number: 3, name: 'GitHub Submission', color: '#a78bfa' });
        } else if (rounds.ppt_upload) {
            setCurrentRound({ number: 2, name: 'PPT Submission', color: '#60a5fa' });
        } else if (rounds.ps_selection) {
            setCurrentRound({ number: 1, name: 'Problem Statement Selection', color: '#10b981' });
        } else {
            setCurrentRound(null); // No rounds active
        }
    };

    // Removed internal isMenuOpen state

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
            {/* MOBILE HAMBURGER REMOVED - Controlled by Navbar now */}

            {/* SIDEBAR WRAPPER */}
            <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <UserSidebar activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setIsSidebarOpen(false); // Close sidebar on selection
                }} />

                {/* Close Button Inside Sidebar for better UX (Optional) */}
                {isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            color: '#fff',
                            fontSize: '20px',
                            cursor: 'pointer',
                            zIndex: 1002
                        }}
                    >
                        ✕
                    </div>
                )}
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
                        /* Hamburger controlled by Navbar */
                        
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
                    {currentRound ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                            padding: '12px 24px',
                            background: `${currentRound.color}20`,
                            borderRadius: '8px',
                            border: `2px solid ${currentRound.color}`
                        }}>
                            <div style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                background: currentRound.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: '900',
                                color: '#0a0a0a'
                            }}>
                                R{currentRound.number}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '900',
                                color: currentRound.color,
                                letterSpacing: '2px',
                                textTransform: 'uppercase'
                            }}>
                                {currentRound.name} - LIVE
                            </div>
                        </div>
                    ) : roundStatus ? (
                        <div className="live-badge" style={{ background: '#ef4444' }}>NO ACTIVE ROUNDS</div>
                    ) : (
                        <div className="live-badge">LOADING...</div>
                    )}

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
                        }}>{teamInfo?.team_name || teamName}</span>
                    </h1>

                    {/* Team ID Display */}
                    {teamInfo?.team_id && (
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '20px',
                            letterSpacing: '1px'
                        }}>
                            Team ID: <span style={{ color: '#60a5fa', fontWeight: '700' }}>{teamInfo.team_id}</span>
                        </div>
                    )}

                    {/* Team Members Display */}
                    {teamInfo && (teamInfo.leader || (teamInfo.members && teamInfo.members.length > 0)) && (
                        <div style={{
                            marginBottom: '25px',
                            padding: '20px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.6)',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                marginBottom: '15px',
                                fontWeight: '700'
                            }}>
                                Team Roster
                            </div>

                            {/* Leader */}
                            {teamInfo.leader && (
                                <div style={{
                                    marginBottom: '15px',
                                    padding: '15px',
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(56, 189, 248, 0.3)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '10px'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#fff',
                                                marginBottom: '4px'
                                            }}>
                                                {teamInfo.leader.fullName}
                                            </div>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                color: '#38bdf8',
                                                fontWeight: '700',
                                                letterSpacing: '1px',
                                                textTransform: 'uppercase'
                                            }}>
                                                LEADER
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                        gap: '8px',
                                        fontSize: '0.75rem'
                                    }}>
                                        <div>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>Email</div>
                                            <div style={{ color: '#fff' }}>{teamInfo.leader.email}</div>
                                        </div>
                                        {teamInfo.leader.sapid && (
                                            <div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>SAP ID</div>
                                                <div style={{ color: '#fff' }}>{teamInfo.leader.sapid}</div>
                                            </div>
                                        )}
                                        {teamInfo.leader.phone && (
                                            <div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>Contact</div>
                                                <div style={{ color: '#fff' }}>{teamInfo.leader.phone}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Members */}
                            {teamInfo.members && teamInfo.members.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {teamInfo.members.map((member, index) => (
                                        <div key={index} style={{
                                            padding: '12px',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(220, 38, 38, 0.2)'
                                        }}>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                fontWeight: '700',
                                                color: '#fff',
                                                marginBottom: '4px'
                                            }}>
                                                {member.fullName}
                                            </div>
                                            <div style={{
                                                fontSize: '0.65rem',
                                                color: 'rgba(255,255,255,0.4)',
                                                fontWeight: '600',
                                                letterSpacing: '1px',
                                                textTransform: 'uppercase',
                                                marginBottom: '8px'
                                            }}>
                                                MEMBER
                                            </div>
                                            <div style={{ fontSize: '0.7rem', marginBottom: '4px' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Email: </span>
                                                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{member.email}</span>
                                            </div>
                                            {member.sapid && (
                                                <div style={{ fontSize: '0.7rem', marginBottom: '4px' }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>SAP ID: </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{member.sapid}</span>
                                                </div>
                                            )}
                                            {member.phone && (
                                                <div style={{ fontSize: '0.7rem' }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Contact: </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{member.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                </div>
            </div>
        </div>
    );
};

export default DashboardView;