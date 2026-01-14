import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import UserSidebar from './UserSidebar'; // Imported from Logic Source
import strangerThingsBg from '../../assets/StrangerThings-bg.png'; // Imported from UI Source

const DashboardView = ({
    selectedPS,
    isPPTSubmitted,
    isGithubSubmitted,
    setActiveTab,
    activeTab,
    teamName = "THE AVENGERS",
    teamMembers = ["Member 01", "Member 02", "Member 03", "Member 04"],
    isSidebarOpen, // Prop from Logic Source
    setIsSidebarOpen // Prop from Logic Source
}) => {
    // --- LOGIC SECTION (From Source B) ---
    const [roundStatus, setRoundStatus] = useState(null);
    const [currentRound, setCurrentRound] = useState(null);
    const [teamInfo, setTeamInfo] = useState(null);
    const [hackerrankStatus, setHackerrankStatus] = useState(null);

    // Fetch team info
    useEffect(() => {
        const fetchTeamInfo = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/user-info', { credentials: 'include' });
                const data = await res.json();
                if (data.success) setTeamInfo(data);
            } catch (err) {
                console.error('Error fetching team info:', err);
            }
        };
        fetchTeamInfo();
    }, []);

    // Fetch Hackerrank status
    useEffect(() => {
        const fetchHackerrankStatus = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/check-hackerrank-submission', { credentials: 'include' });
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

    // Fetch round status
    useEffect(() => {
        const fetchRoundStatus = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/round-status', { credentials: 'include' });
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

    // WebSocket Listeners
    useEffect(() => {
        const handleRoundChange = (data) => {
            fetch('http://localhost:5000/api/round-status', { credentials: 'include' })
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

    useEffect(() => {
        const handleApprovalUpdate = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/check-hackerrank-submission', { credentials: 'include' });
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

    // Logic to determine current round
    useEffect(() => {
        if (roundStatus && hackerrankStatus !== null) {
            determineCurrentRound(roundStatus);
        }
    }, [hackerrankStatus]);

    const determineCurrentRound = (rounds) => {
        if (!rounds) return;

        const roundList = [
            { id: 'hackerrank_submission', number: 1, name: 'Hackerrank Protocol', color: '#22c55e', state: rounds.hackerrank_submission },
            { id: 'ps_selection', number: 2, name: 'Problem Statement', color: '#60a5fa', state: rounds.ps_selection },
            { id: 'ppt_upload', number: 2, name: 'PPT Submission', color: '#60a5fa', state: rounds.ppt_upload },
            { id: 'github_submission', number: 3, name: 'GitHub Submission', color: '#a78bfa', state: rounds.github_submission }
        ];

        const liveRound = roundList.find(r => r.state === 'live');
        if (liveRound) {
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

        const closedRound = [...roundList].reverse().find(r => r.state === 'closed');
        if (closedRound) {
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

        const notStartedRound = roundList.find(r => r.state === 'not_started');
        if (notStartedRound) {
            setCurrentRound({ ...notStartedRound, status: 'NOT STARTED' });
            return;
        }

        setCurrentRound({ number: 1, name: 'Hackerrank Protocol', color: '#22c55e', status: 'UNKNOWN' });
    };

    // --- UI RENDER SECTION (Merged) ---
    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'row', // Logic B: Flex row for sidebar
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            position: 'relative',
            overflow: 'hidden',
            background: '#0a0a0a',
            fontFamily: '"Courier New", Courier, monospace', // UI A: Font
            boxSizing: 'border-box'
        }}>

            {/* SIDEBAR (Logic B) */}
            <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <UserSidebar activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setIsSidebarOpen(false);
                }} />
                {isSidebarOpen && (
                    <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 1002 }}>✕</div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflowY: 'auto',
                zIndex: 2,
                padding: '20px'
            }}>
                {/* Background (UI A) */}
                <div style={{
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
                }} />

                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'radial-gradient(circle at 40% 70%, transparent 10%, rgba(20, 16, 16, 0.42) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }} />

                {/* CSS (UI A + Sidebar Logic from B) */}
                <style>{`
                    /* Sidebar Logic (B) */
                    @media (max-width: 992px) {
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

                    /* UI Styles (A) */
                    @keyframes liveShimmer {
                        0%, 100% { opacity: 0.5; text-shadow: 0 0 5px #00d4ff; }
                        50% { opacity: 1; text-shadow: 0 0 20px #8b5cf6; }
                    }
                    .bubbles {
                        --c1: #0a0a0a;
                        --c2: #dc2626;
                        --size-letter: 14px;
                        padding: 16px 0;
                        width: 100%;
                        max-width: 340px;
                        font-size: var(--size-letter);
                        background-color: transparent;
                        border: 2px solid var(--c2);
                        border-radius: 100px;
                        cursor: pointer;
                        overflow: hidden;
                        position: relative;
                        transition: 300ms cubic-bezier(0.83, 0, 0.17, 1);
                        font-family: 'Orbitron', sans-serif;
                        font-weight: 900;
                        letter-spacing: 3px;
                        text-transform: uppercase;
                        margin: 30px 0;
                        z-index: 5;
                        box-shadow: 0 0 15px rgba(220, 38, 38, 0.4);
                    }
                    .bubbles > .text {
                        font-weight: 900;
                        color: var(--c2);
                        position: relative;
                        z-index: 1;
                        transition: color 700ms cubic-bezier(0.83, 0, 0.17, 1);
                    }
                    .bubbles::before, .bubbles::after {
                        content: "";
                        width: 150%;
                        aspect-ratio: 1/1;
                        scale: 0;
                        transition: 1000ms cubic-bezier(0.76, 0, 0.24, 1);
                        background-color: var(--c2);
                        border-radius: 50%;
                        position: absolute;
                        translate: -50% -50%;
                    }
                    .bubbles::before { top: 0; left: 0; }
                    .bubbles::after { top: 100%; left: 100%; }
                    .bubbles:hover { box-shadow: 0 0 30px rgba(220, 38, 38, 0.8); }
                    .bubbles:hover > .text { color: var(--c1); }
                    .bubbles:hover::before, .bubbles:hover::after { scale: 1; }
                    .bubbles:active { scale: 0.98; filter: brightness(0.9); }

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

                    .team-roster-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        text-align: left;
                    }
                    @media (max-width: 768px) {
                        .team-roster-grid { grid-template-columns: 1fr; }
                        .main-glass-box { padding: 35px 25px; width: 95%; text-align: left; }
                        h1 { font-size: 2.8rem !important; text-align: left !important; line-height: 1.1 !important; }
                    }
                    @media (max-width: 480px) {
                         .main-glass-box { padding: 28px 20px; border-radius: 6px; text-align: left; }
                         h1 { font-size: 2.2rem !important; }
                         .bubbles { width: 100%; font-size: 12px; padding: 14px 0; }
                    }

                    .leader-card {
                        background: rgba(25, 25, 25, 0.3);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(59, 130, 246, 0.4);
                        border-radius: 6px;
                        padding: 28px;
                        margin-bottom: 20px;
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
                `}</style>

                {/* Content Container (UI A) */}
                <div className="main-glass-box">

                    {/* ROUND STATUS – REUSED FROM SECOND CODE */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '30px',
                            width: '100%',
                        }}
                    >
                        {currentRound ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    padding: '10px 20px',
                                    background: `${currentRound.color}15`,
                                    borderRadius: '12px',
                                    border: `1px solid ${currentRound.color}40`,
                                }}
                            >
                                <div
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: currentRound.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        fontWeight: '900',
                                        color: '#0a0a0a',
                                    }}
                                >
                                    R{currentRound.number}
                                </div>

                                <div
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        color: currentRound.color,
                                        letterSpacing: '1.5px',
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {currentRound.name}
                                    <span
                                        style={{
                                            background:
                                                currentRound.status === 'LIVE'
                                                    ? '#22c55e'
                                                    : currentRound.status === 'APPROVED'
                                                        ? '#22c55e'
                                                        : currentRound.status === 'REVIEW PENDING'
                                                            ? '#eab308'
                                                            : '#ef4444',
                                            color: '#fff',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                        }}
                                    >
                                        {currentRound.status}
                                    </span>
                                </div>
                            </div>
                        ) : roundStatus ? (
                            <div className="live-badge" style={{ background: '#ef4444' }}>
                                NO ACTIVE ROUNDS
                            </div>
                        ) : (
                            <div className="live-badge">LOADING STATUS...</div>
                        )}
                    </div>

                    {/* Welcome Header (UI A) */}
                    <h1 style={{
                        fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', fontWeight: '700', color: '#dc2626', lineHeight: '1', margin: '0 0 12px 0',
                        textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
                        fontFamily: '"Della Respira", serif', fontStyle: 'normal'
                    }}>
                        WELCOME,<br />
                        <span style={{ color: '#dc2626', textShadow: '0 0 15px rgba(220, 38, 38, 0.7)' }}>{teamInfo?.team_name || teamName}</span>
                    </h1>

                    {/* Team ID (UI A) */}
                    {teamInfo?.team_id && (
                        <div style={{
                            fontSize: '1.3rem', color: '#fff', marginBottom: '35px', letterSpacing: '0.5px',
                            textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Rajdhani", sans-serif'
                        }}>
                            TEAM ID: <span style={{ color: '#fff', fontWeight: '700' }}>{teamInfo.team_id}</span>
                        </div>
                    )}

                    {/* Team Display (UI A) */}
                    {teamInfo && (teamInfo.leader || (teamInfo.members && teamInfo.members.length > 0)) && (
                        <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                            <div style={{
                                fontSize: '1.1rem', color: '#fff', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '30px', marginTop: '10px',
                                fontWeight: '700', textAlign: 'center', position: 'relative', padding: '18px 0', fontFamily: '"Rajdhani", sans-serif'
                            }}>
                                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: 'rgba(255,255,255,0.25)', zIndex: 0 }}></div>
                                <span style={{
                                    background: 'rgba(20, 20, 20, 0.3)', backdropFilter: 'blur(10px)', padding: '0 25px', position: 'relative',
                                    zIndex: 1, display: 'inline-block', fontFamily: '"Rajdhani", sans-serif', fontWeight: '700'
                                }}>TEAM ROSTER</span>
                            </div>

                            {/* Leader (UI A) */}
                            {teamInfo.leader && (
                                <div className="leader-card">
                                    <div className="leader-info">
                                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', marginBottom: '8px', letterSpacing: '0.5px', fontFamily: '"Rajdhani", sans-serif' }}>
                                            {teamInfo.leader.fullName}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem', color: '#3b82f6', fontWeight: '900', letterSpacing: '1.5px', marginTop: '8px', textTransform: 'uppercase',
                                            display: 'inline-block', padding: '3px 10px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '3px', fontFamily: '"Rajdhani", sans-serif'
                                        }}>
                                            TEAM LEADER
                                        </div>
                                    </div>
                                    <div className="leader-details" style={{ fontSize: '1rem', fontFamily: '"Rajdhani", sans-serif', marginTop: '15px' }}>
                                        <div>
                                            <div style={{ color: 'rgba(59, 130, 246, 0.75)', fontSize: '0.9rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email:</div>
                                            <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '500', fontSize: '1.1rem' }}>{teamInfo.leader.email}</div>
                                        </div>
                                        {teamInfo.leader.sapid && (
                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ color: 'rgba(59, 130, 246, 0.75)', fontSize: '0.9rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SAP ID:</div>
                                                <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '500', fontSize: '1.1rem' }}>{teamInfo.leader.sapid}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Members (UI A) */}
                            {teamInfo.members && teamInfo.members.length > 0 && (
                                <div className="team-roster-grid">
                                    {teamInfo.members.map((member, index) => (
                                        <div key={index} className="member-card">
                                            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '10px', letterSpacing: '0.5px', fontFamily: '"Rajdhani", sans-serif' }}>
                                                {member.fullName}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '16px', textTransform: 'uppercase', fontFamily: '"Rajdhani", sans-serif' }}>
                                                MEMBER
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1rem', fontFamily: '"Rajdhani", sans-serif' }}>
                                                <div>
                                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email:</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.95)', marginTop: '2px', fontWeight: '500', fontSize: '1rem' }}>{member.email}</div>
                                                </div>
                                                {member.sapid && (
                                                    <div>
                                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SAP ID:</div>
                                                        <div style={{ color: 'rgba(255,255,255,0.95)', marginTop: '2px', fontWeight: '500', fontSize: '1rem' }}>{member.sapid}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Button (UI A + Logic B) */}
                    {!selectedPS && (
                        <div style={{ marginTop: '35px', paddingTop: '25px' }}>
                            <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px', textAlign: 'center', fontWeight: '500', letterSpacing: '0.3px', fontFamily: '"Rajdhani", sans-serif' }}>
                                The gate is open. Check the walkie channels and get the crew ready for the Upside Down run.
                            </p>
                            <div style={{ textAlign: 'center' }}>
                                <button className="bubbles" onClick={() => setActiveTab('hackerrank-submission')}>
                                    <span className="text">OPEN THE GATE</span>
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