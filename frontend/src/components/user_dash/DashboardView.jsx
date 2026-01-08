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
    const [hackerrankStatus, setHackerrankStatus] = useState(null);

    // Fetch team info on mount
    useEffect(() => {
        const fetchTeamInfo = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/user-info', {
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

    // Fetch Hackerrank submission status on mount
    useEffect(() => {
        const fetchHackerrankStatus = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/check-hackerrank-submission', {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success && data.is_submitted) {
                    setHackerrankStatus(data.submission.approval_status);
                }
            } catch (err) {
                console.error('Error fetching Hackerrank status:', err);
            }
        };
        fetchHackerrankStatus();
    }, []);


    // Fetch round status on mount
    useEffect(() => {
        const fetchRoundStatus = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/round-status', {
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
            fetch('http://localhost:5001/api/round-status', {
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

    // Re-determine current round when hackerrankStatus changes
    useEffect(() => {
        if (roundStatus && hackerrankStatus !== null) {
            determineCurrentRound(roundStatus);
        }
    }, [hackerrankStatus]);

    // Listen for Hackerrank approval status changes (real-time updates)
    useEffect(() => {
        const handleApprovalUpdate = async () => {
            // Refetch Hackerrank status when admin approves/rejects
            try {
                const res = await fetch('http://localhost:5001/api/check-hackerrank-submission', {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success && data.is_submitted) {
                    setHackerrankStatus(data.submission.approval_status);
                }
            } catch (err) {
                console.error('Error refetching Hackerrank status:', err);
            }
        };

        socket.on("hackerrank_approval_updated", handleApprovalUpdate);
        return () => socket.off("hackerrank_approval_updated", handleApprovalUpdate);
    }, []);

    // Determine which round is currently active
    const determineCurrentRound = (rounds) => {
        if (!rounds) return;

        const roundList = [
            { id: 'hackerrank_submission', number: 1, name: 'Hackerrank Protocol', color: '#22c55e', state: rounds.hackerrank_submission },
            { id: 'ps_selection', number: 2, name: 'Problem Statement', color: '#60a5fa', state: rounds.ps_selection },
            { id: 'ppt_upload', number: 2, name: 'PPT Submission', color: '#60a5fa', state: rounds.ppt_upload },
            { id: 'github_submission', number: 3, name: 'GitHub Submission', color: '#a78bfa', state: rounds.github_submission }
        ];

        // Priority 1: Live Rounds (Pick Earliest Live)
        const liveRound = roundList.find(r => r.state === 'live');
        if (liveRound) {
            // If it's Hackerrank and user has submitted, show approval status instead
            if (liveRound.id === 'hackerrank_submission' && hackerrankStatus) {
                const statusDisplay = hackerrankStatus === 'approved' ? 'APPROVED' :
                    hackerrankStatus === 'rejected' ? 'NOT SELECTED' : 'REVIEW PENDING';
                const statusColor = hackerrankStatus === 'approved' ? '#22c55e' :
                    hackerrankStatus === 'rejected' ? '#ef4444' : '#eab308';
                setCurrentRound({ ...liveRound, status: statusDisplay, color: statusColor });
            } else {
                setCurrentRound({ ...liveRound, status: 'LIVE' });
            }
            return;
        }

        // Priority 2: Last Closed Round (Show the last round that was closed)
        const closedRound = [...roundList].reverse().find(r => r.state === 'closed');
        if (closedRound) {
            // If it's Hackerrank and user has submitted, show approval status instead
            if (closedRound.id === 'hackerrank_submission' && hackerrankStatus) {
                const statusDisplay = hackerrankStatus === 'approved' ? 'APPROVED' :
                    hackerrankStatus === 'rejected' ? 'NOT SELECTED' : 'REVIEW PENDING';
                const statusColor = hackerrankStatus === 'approved' ? '#22c55e' :
                    hackerrankStatus === 'rejected' ? '#ef4444' : '#eab308';
                setCurrentRound({ ...closedRound, status: statusDisplay, color: statusColor });
            } else {
                setCurrentRound({ ...closedRound, status: 'CLOSED' });
            }
            return;
        }

        // Priority 3: Earliest Not Started (Fallback)
        const notStartedRound = roundList.find(r => r.state === 'not_started');
        if (notStartedRound) {
            setCurrentRound({ ...notStartedRound, status: 'NOT STARTED' });
            return;
        }

        // Final Fallback
        setCurrentRound({ number: 1, name: 'Hackerrank Protocol', color: '#22c55e', status: 'UNKNOWN' });
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
                    .initiate-btn:active {
                        transform: scale(0.95);
                    }
                    .main-glass-box {
                        background: linear-gradient(145deg, rgba(0, 0, 0, 0.6) 0%, rgba(10, 10, 10, 0.95) 100%);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-top: 1px solid rgba(220, 38, 38, 0.5);
                        border-radius: 24px;
                        padding: 40px 30px;
                        width: 100%;
                        max-width: 800px; /* Increased max-width for better desktop view */
                        text-align: center;
                        z-index: 10;
                        position: relative;
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
                        box-sizing: border-box;
                    }
                    .live-badge {
                        background: #dc2626;
                        color: white;
                        padding: 6px 16px;
                        font-size: 11px;
                        font-weight: 800;
                        letter-spacing: 2px;
                        border-radius: 4px;
                        animation: liveShimmer 1.5s infinite;
                        display: inline-block;
                        margin-bottom: 24px;
                        text-transform: uppercase;
                    }
                    .team-roster-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                        text-align: left;
                    }
                    .leader-card {
                        background: rgba(56, 189, 248, 0.1);
                        border: 1px solid rgba(56, 189, 248, 0.3);
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        text-align: left;
                    }
                    .member-card {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        padding: 16px;
                        transition: transform 0.2s ease;
                    }
                    .member-card:hover {
                        transform: translateY(-2px);
                        background: rgba(255, 255, 255, 0.05);
                    }

                    @media (max-width: 768px) {
                        .main-glass-box {
                            padding: 30px 20px;
                            width: 95%;
                        }
                        .team-roster-grid {
                            grid-template-columns: 1fr; /* Stack on mobile */
                        }
                        h1 {
                            font-size: 2.5rem !important;
                        }
                    }
                    @media (max-width: 480px) {
                         .main-glass-box {
                            padding: 25px 15px;
                            border-radius: 20px;
                        }
                        h1 {
                            font-size: 2rem !important;
                        }
                        .initiate-btn {
                            width: 100%;
                            font-size: 12px;
                            padding: 14px 0;
                        }
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
                            marginBottom: '25px',
                            padding: '10px 20px',
                            background: `${currentRound.color}15`,
                            borderRadius: '12px',
                            border: `1px solid ${currentRound.color}40`
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: currentRound.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                fontWeight: '900',
                                color: '#0a0a0a'
                            }}>
                                R{currentRound.number}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '800',
                                color: currentRound.color,
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {currentRound.name}
                                <span style={{
                                    background: currentRound.status === 'LIVE' ? '#22c55e' : '#ef4444',
                                    color: '#fff',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    {currentRound.status}
                                </span>
                            </div>
                        </div>
                    ) : roundStatus ? (
                        <div className="live-badge" style={{ background: '#ef4444' }}>NO ACTIVE ROUNDS</div>
                    ) : (
                        <div className="live-badge">LOADING STATUS...</div>
                    )}

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: '900',
                        color: '#fff',
                        lineHeight: '1.1',
                        margin: '0 0 20px 0',
                        textTransform: 'uppercase',
                        fontStyle: 'italic',
                        letterSpacing: '-1px',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        hyphens: 'auto',
                        maxWidth: '100%'
                    }}>
                        WELCOME,<br />
                        <span style={{
                            color: '#dc2626',
                            background: 'linear-gradient(to bottom, #ff4444, #991b1b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.3))',
                            display: 'inline-block',
                            maxWidth: '100%'
                        }}>{teamInfo?.team_name || teamName}</span>
                    </h1>

                    {/* Team ID Display */}
                    {teamInfo?.team_id && (
                        <div style={{
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '30px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            Team ID: <span style={{ color: '#60a5fa', fontWeight: '800' }}>{teamInfo.team_id}</span>
                        </div>
                    )}

                    {/* Team Members Display */}
                    {teamInfo && (teamInfo.leader || (teamInfo.members && teamInfo.members.length > 0)) && (
                        <div style={{
                            marginBottom: '30px',
                            textAlign: 'left'
                        }}>
                            <div style={{
                                fontSize: '0.85rem',
                                color: 'rgba(255,255,255,0.4)',
                                letterSpacing: '3px',
                                textTransform: 'uppercase',
                                marginBottom: '20px',
                                fontWeight: '700',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <span style={{ background: '#0d0d0d', padding: '0 15px', position: 'relative', zIndex: 1 }}>Team Roster</span>
                                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                            </div>

                            {/* Leader */}
                            {teamInfo.leader && (
                                <div className="leader-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                                                {teamInfo.leader.fullName}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '1px', marginTop: '4px' }}>
                                                TEAM LEADER
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
                                        <div>
                                            <div style={{ color: 'rgba(56, 189, 248, 0.6)', fontSize: '0.7rem' }}>Email</div>
                                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>{teamInfo.leader.email}</div>
                                        </div>
                                        {teamInfo.leader.sapid && (
                                            <div>
                                                <div style={{ color: 'rgba(56, 189, 248, 0.6)', fontSize: '0.7rem' }}>SAP ID</div>
                                                <div style={{ color: 'rgba(255,255,255,0.9)' }}>{teamInfo.leader.sapid}</div>
                                            </div>
                                        )}
                                        {teamInfo.leader.phone && (
                                            <div>
                                                <div style={{ color: 'rgba(56, 189, 248, 0.6)', fontSize: '0.7rem' }}>Contact</div>
                                                <div style={{ color: 'rgba(255,255,255,0.9)' }}>{teamInfo.leader.phone}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Members */}
                            {teamInfo.members && teamInfo.members.length > 0 && (
                                <div className="team-roster-grid">
                                    {teamInfo.members.map((member, index) => (
                                        <div key={index} className="member-card">
                                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e5e5e5', marginBottom: '8px' }}>
                                                {member.fullName}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>
                                                MEMBER
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                                                <div>
                                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Email: </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{member.email}</span>
                                                </div>
                                                {member.sapid && (
                                                    <div>
                                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>SAP ID: </span>
                                                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{member.sapid}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedPS && (
                        <>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.5', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                                The vault is synchronized. Review team credentials and initiate the heist sequence.
                            </p>
                            <button className="initiate-btn" onClick={() => setActiveTab('ps-selection')}>
                                INITIATE OPERATION
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;