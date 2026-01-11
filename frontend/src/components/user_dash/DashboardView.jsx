import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import UserStatus from './UserStatus';
import strangerThingsBg from '../../assets/StrangerThings-bg.png';

const DashboardView = ({
    selectedPS,
    isPPTSubmitted,
    isGithubSubmitted,
    setActiveTab,
    activeTab,
    teamName = "THE AVENGERS",
    teamMembers = ["Member 01", "Member 02", "Member 03", "Member 04"]
}) => {
    const [roundStatus, setRoundStatus] = useState(null);
    const [currentRound, setCurrentRound] = useState(null);
    const [teamInfo, setTeamInfo] = useState(null);
    const [hackerrankStatus, setHackerrankStatus] = useState(null);

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

    // Fetch Hackerrank submission status on mount
    useEffect(() => {
        const fetchHackerrankStatus = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/check-hackerrank-submission', {
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
                const res = await fetch('http://localhost:5000/api/check-hackerrank-submission', {
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

    return (
        <div
            style={{
                width: '100%',
                minHeight: 'calc(100vh - 70px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: '#0a0a0a',
                fontFamily: '"Courier New", Courier, monospace',
                boxSizing: 'border-box',
                padding: '20px'
            }}
        >
            {/* MAIN CONTENT AREA */}
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
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
                        backgroundImage: `url(${strangerThingsBg})`,
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
                        background: linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                        border: 1px solid rgba(220, 38, 38, 0.2);
                        border-radius: 4px;
                        padding: 45px 50px;
                        width: 100%;
                        max-width: 1100px;
                        text-align: left;
                        z-index: 10;
                        position: relative;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
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
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        text-align: left;
                    }
                    @media (max-width: 768px) {
                        .team-roster-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                    .leader-card {
                        background: rgba(25, 25, 25, 0.3);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(59, 130, 246, 0.4);
                        border-radius: 6px;
                        padding: 28px;
                        marginBottom: 20px;
                        text-align: left;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
                    }
                    .member-card {
                        background: rgba(25, 25, 25, 0.28);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 6px;
                        padding: 22px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                    }
                    .member-card:hover {
                        transform: translateY(-2px);
                        background: rgba(30, 30, 30, 0.35);
                        border-color: rgba(255, 255, 255, 0.25);
                        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
                    }

                    @media (max-width: 768px) {
                        .main-glass-box {
                            padding: 35px 25px;
                            width: 95%;
                            text-align: left;
                        }
                        .team-roster-grid {
                            grid-template-columns: 1fr !important;
                            gap: 15px;
                        }
                        h1 {
                            font-size: 2.8rem !important;
                            text-align: left !important;
                            line-height: 1.1 !important;
                        }
                        .leader-card {
                            text-align: left;
                            padding: 22px;
                        }
                        .member-card {
                            text-align: left;
                            padding: 18px;
                        }
                    }
                    @media (max-width: 480px) {
                         .main-glass-box {
                            padding: 28px 20px;
                            border-radius: 6px;
                            text-align: left;
                        }
                        h1 {
                            font-size: 2.2rem !important;
                            line-height: 1.1 !important;
                            letter-spacing: '0.5px' !important;
                        }
                        .initiate-btn {
                            width: 100%;
                            max-width: 100%;
                            font-size: 12px;
                            padding: 14px 0;
                        }
                        .leader-card {
                            padding: 18px;
                            margin-bottom: 15px;
                        }
                        .member-card {
                            padding: 16px;
                        }
                    }

                `}</style>

                <div className="main-glass-box">
                    {/* Round Badge Section - Exact Match from Image */}
                    {currentRound && (currentRound.status === 'LIVE' || currentRound.id === 'hackerrank_submission') ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                background: '#22c55e',
                                color: '#000',
                                padding: '6px 14px',
                                borderRadius: '3px',
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)',
                                fontFamily: '"Orbitron", sans-serif'
                            }}>
                                R1
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '800',
                                color: '#22c55e',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontFamily: '"Orbitron", sans-serif'
                            }}>
                                HACKERRANK PROTOCOL
                                <span style={{
                                    background: '#22c55e',
                                    color: '#000',
                                    padding: '3px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    fontWeight: '900',
                                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    LIVE
                                </span>
                            </div>
                        </div>
                    ) : currentRound ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                background: currentRound.color || '#6b7280',
                                color: '#fff',
                                padding: '6px 14px',
                                borderRadius: '3px',
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}>
                                R{currentRound.number}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '800',
                                color: currentRound.color || '#6b7280',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase'
                            }}>
                                {currentRound.name} - {currentRound.status}
                            </div>
                        </div>
                    ) : null}

                    {/* Welcome Section - Exact Match from Image */}
                    <h1 style={{
                        fontSize: 'clamp(3.5rem, 7vw, 6rem)',
                        fontWeight: '700',
                        color: '#dc2626',
                        lineHeight: '1',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        textShadow: '0 0 25px rgba(220, 38, 38, 1), 0 0 50px rgba(220, 38, 38, 0.7), 0 0 75px rgba(220, 38, 38, 0.4)',
                        fontFamily: '"Orbitron", sans-serif',
                        fontStyle: 'normal'
                    }}>
                        WELCOME,<br />
                        <span style={{
                            color: '#dc2626',
                            textShadow: '0 0 30px rgba(220, 38, 38, 1.2), 0 0 60px rgba(220, 38, 38, 0.8)'
                        }}>{teamInfo?.team_name || teamName}</span>
                    </h1>

                    {/* Team ID Display - Exact Match from Image */}
                    {teamInfo?.team_id && (
                        <div style={{
                            fontSize: '0.9rem',
                            color: '#fff',
                            marginBottom: '35px',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            fontWeight: '500'
                        }}>
                            TEAM ID: <span style={{ color: '#fff', fontWeight: '700' }}>{teamInfo.team_id}</span>
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
                                color: '#fff',
                                letterSpacing: '2.5px',
                                textTransform: 'uppercase',
                                marginBottom: '30px',
                                marginTop: '10px',
                                fontWeight: '600',
                                textAlign: 'center',
                                position: 'relative',
                                padding: '18px 0'
                            }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '50%', 
                                    left: '0', 
                                    right: '0', 
                                    height: '1px', 
                                    background: 'rgba(255,255,255,0.25)', 
                                    zIndex: 0 
                                }}></div>
                                <span style={{ 
                                    background: 'rgba(20, 20, 20, 0.3)', 
                                    backdropFilter: 'blur(10px)',
                                    padding: '0 25px', 
                                    position: 'relative', 
                                    zIndex: 1,
                                    display: 'inline-block',
                                    fontFamily: '"Orbitron", sans-serif',
                                    fontWeight: '700'
                                }}>TEAM ROSTER</span>
                            </div>

                            {/* Leader - Exact Match from Image */}
                            {teamInfo.leader && (
                                <div className="leader-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontSize: '1.15rem', 
                                                fontWeight: '700', 
                                                color: '#fff', 
                                                marginBottom: '8px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {teamInfo.leader.fullName}
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.7rem', 
                                                color: '#3b82f6', 
                                                fontWeight: '900', 
                                                letterSpacing: '1.5px', 
                                                marginTop: '8px',
                                                textTransform: 'uppercase',
                                                display: 'inline-block',
                                                padding: '3px 10px',
                                                background: 'rgba(59, 130, 246, 0.2)',
                                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                                borderRadius: '3px'
                                            }}>
                                                TEAM LEADER
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                                        <div>
                                            <div style={{ color: 'rgba(59, 130, 246, 0.75)', fontSize: '0.75rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email:</div>
                                            <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '400', fontSize: '0.9rem' }}>{teamInfo.leader.email}</div>
                                        </div>
                                        {teamInfo.leader.sapid && (
                                            <div>
                                                <div style={{ color: 'rgba(59, 130, 246, 0.75)', fontSize: '0.75rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SAP ID:</div>
                                                <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '400', fontSize: '0.9rem' }}>{teamInfo.leader.sapid}</div>
                                            </div>
                                        )}
                                        {teamInfo.leader.phone && (
                                            <div>
                                                <div style={{ color: 'rgba(59, 130, 246, 0.75)', fontSize: '0.75rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact:</div>
                                                <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '400', fontSize: '0.9rem' }}>{teamInfo.leader.phone}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Members - Exact Match from Image (2 column grid) */}
                            {teamInfo.members && teamInfo.members.length > 0 && (
                                <div className="team-roster-grid">
                                    {teamInfo.members.map((member, index) => (
                                        <div key={index} className="member-card">
                                            <div style={{ 
                                                fontSize: '1rem', 
                                                fontWeight: '700', 
                                                color: '#fff', 
                                                marginBottom: '10px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {member.fullName}
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.68rem', 
                                                color: 'rgba(255,255,255,0.55)', 
                                                fontWeight: '700', 
                                                letterSpacing: '1.5px', 
                                                marginBottom: '16px', 
                                                textTransform: 'uppercase'
                                            }}>
                                                MEMBER
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                                                <div>
                                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email:</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.95)', marginTop: '2px', fontWeight: '400', fontSize: '0.88rem' }}>{member.email}</div>
                                                </div>
                                                {member.sapid && (
                                                    <div>
                                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SAP ID:</div>
                                                        <div style={{ color: 'rgba(255,255,255,0.95)', marginTop: '2px', fontWeight: '400', fontSize: '0.88rem' }}>{member.sapid}</div>
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
                        <div style={{ marginTop: '35px', paddingTop: '25px' }}>
                            <p style={{ 
                                color: '#fff', 
                                fontSize: '0.95rem', 
                                lineHeight: '1.6', 
                                marginBottom: '25px',
                                textAlign: 'left',
                                fontWeight: '400',
                                letterSpacing: '0.3px'
                            }}>
                                The vault is synchronized. Review team credentials and initiate the heist sequence.
                            </p>
                            <div style={{ textAlign: 'center' }}>
                                <button className="initiate-btn" onClick={() => setActiveTab('ps-selection')}>
                                    INITIATE OPERATION
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;