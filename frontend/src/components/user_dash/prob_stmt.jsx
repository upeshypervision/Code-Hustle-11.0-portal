import React, { useState, useEffect } from 'react';

export default function PSGallery({ onSelect, teamName }) {
    const [expandedId, setExpandedId] = useState(null);
    const [psStatus, setPsStatus] = useState({ isLocked: false, counts: {} });
    const [showModal, setShowModal] = useState(false);
    const [pendingPs, setPendingPs] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/ps-status')
            .then(res => res.json())
            .then(data => setPsStatus(data))
            .catch(err => console.error("Sync Error:", err));
    }, []);

    const problemStatements = [
        {
            id: "PS-01",
            title: "Smart Campus Mobility",
            track: "IOT & URBAN TECH",
            difficulty: "Advanced",
            tags: ["#React", "#Node.js", "#Arduino"],
            description: "Design an end-to-end framework to optimize intra-campus logistics using real-time sensor data and autonomous fleet management logic.",
            constraints: ["Max latency < 200ms", "End-to-end encryption", "Battery life > 48h"]
        },
        {
            id: "PS-02",
            title: "Cyber-Sentinel AI",
            track: "CYBERSECURITY",
            difficulty: "Expert",
            tags: ["#Python", "#TensorFlow", "#Scapy"],
            description: "Develop a neural-network-based IDS that predicts zero-day exploits by analyzing packet entropy and temporal anomaly detection.",
            constraints: ["99.9% Accuracy", "Real-time stream processing", "SOC Integration"]
        },
        {
            id: "PS-03",
            title: "Bio-Sync Health Mesh",
            track: "HEALTH-TECH",
            difficulty: "Intermediate",
            tags: ["#Flutter", "#Firebase", "#BLE"],
            description: "A decentralized mesh network for emergency patient data transmission in low-connectivity zones using P2P syncing.",
            constraints: ["HIPAA Compliant", "Mesh range > 50m", "Offline-first architecture"]
        }
    ];

    const triggerLockSequence = (ps) => {
        setPendingPs(ps);
        setShowModal(true);
    };

    const confirmLock = async () => {
        const ps = pendingPs;
        if (onSelect) onSelect(ps);
        setShowModal(false);
        fetch('http://localhost:5000/api/lock-team-ps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team_name: teamName, ps_id: ps.id })
        }).catch(err => console.error("Update failed:", err));
    };

    return (
        <div className="ps-container" style={{ color: '#fff', position: 'relative', minHeight: '500px', paddingBottom: '50px' }}>
            
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        width: '400px', padding: '30px', background: '#0f172a', border: '2px solid #f472b6', borderRadius: '20px',
                        boxShadow: '0 0 30px rgba(244, 114, 182, 0.3)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
                        <h2 style={{ color: '#f472b6', letterSpacing: '2px' }}>NOTE</h2>
                        <p style={{ color: '#94a3b8', margin: '20px 0', lineHeight: '1.5' }}>
                            Your Problem Statement is:- <strong style={{color: '#fff'}}>{pendingPs?.id}</strong> Once this problem statement is locked, any subsequent changes or alternative choices will be restricted.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, background: 'transparent', color: '#64748b', border: '1px solid #334155', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>ABORT</button>
                            <button onClick={confirmLock} style={{ flex: 1, background: 'linear-gradient(90deg, #f472b6, #6366f1)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>LOCK</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ borderLeft: '4px solid #f472b6', background: 'rgba(244, 114, 182, 0.05)', padding: '15px 20px', marginBottom: '25px', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f472b6' }}>
                    CAUTION: Track allocation is final. Review technical dossiers before initializing lock.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {problemStatements.map((ps) => {
                    const count = psStatus.counts[ps.id] || 0;
                    const target = 20; 
                    const barWidth = Math.min((count / target) * 100, 100);

                    return (
                        <div key={ps.id} style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(244, 114, 182, 0.1)',
                            borderRadius: '20px', padding: '24px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ color: '#f472b6', fontSize: '0.65rem', fontWeight: '800', border: '1px solid #f472b6', padding: '2px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>{ps.track}</span>
                                        <span style={{ color: '#6366f1', fontSize: '0.65rem' }}>• {ps.difficulty}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#fff', fontWeight: '800' }}>{ps.id}: {ps.title}</h3>
                                    
                                    <div style={{ width: '250px', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>
                                            <span>Global Interest Level</span>
                                            <span>{count} Teams Committed</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#1e293b', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{ 
                                                width: `${barWidth}%`, 
                                                height: '100%', 
                                                background: 'linear-gradient(90deg, #6366f1, #f472b6, #6366f1)',
                                                backgroundSize: '200% 100%',
                                                animation: 'shimmer 3s linear infinite',
                                                borderRadius: '10px',
                                                transition: 'width 1s ease-in-out'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setExpandedId(expandedId === ps.id ? null : ps.id)}
                                    style={{ background: expandedId === ps.id ? '#334155' : 'linear-gradient(135deg, #6366f1 0%, #f472b6 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {expandedId === ps.id ? 'CLOSE' : 'VIEW DETAILS'}
                                </button>
                            </div>

                            {expandedId === ps.id && (
                                <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '1rem', background: 'rgba(244, 114, 182, 0.03)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(244, 114, 182, 0.1)', marginBottom: '20px' }}>
                                        {ps.description}
                                    </p>
                                    
                                    {/* IMPROVED BUTTON WITH SHINE & LIFE */}
                                    <button onClick={() => triggerLockSequence(ps)}
                                        className="shine-button"
                                        style={{ 
                                            position: 'relative',
                                            overflow: 'hidden',
                                            width: '100%', 
                                            padding: '18px', 
                                            background: 'rgba(244, 114, 182, 0.1)', 
                                            color: '#f472b6', 
                                            border: '2px solid #f472b6', 
                                            borderRadius: '15px', 
                                            fontWeight: '900', 
                                            cursor: 'pointer', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '2px',
                                            animation: 'pulseGlow 2s infinite ease-in-out'
                                        }}>
                                        LOCK this Problem Statement
                                        <div className="shine-effect"></div>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes shimmer { 0% { background-position: 100% 0%; } 100% { background-position: -100% 0%; } }
                
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 5px rgba(244, 114, 182, 0.2); transform: scale(1); }
                    50% { box-shadow: 0 0 20px rgba(244, 114, 182, 0.5); transform: scale(1.01); }
                }

                .shine-button:hover .shine-effect {
                    left: 100%;
                    transition: 0.7s;
                }

                .shine-effect {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        90deg, 
                        transparent, 
                        rgba(255, 255, 255, 0.4), 
                        transparent
                    );
                    transform: skewX(-25deg);
                    transition: 0.7s;
                }
            `}</style>
        </div>
    );
}