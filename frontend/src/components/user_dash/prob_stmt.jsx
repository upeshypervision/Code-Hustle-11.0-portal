// prob_stmt.jsx
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
            elaboration: "Design an end-to-end framework to optimize intra-campus logistics using real-time sensor data and autonomous fleet management logic. The system should focus on reducing latency and improving security."
        },
        {
            id: "PS-02",
            title: "Cyber-Sentinel AI",
            track: "CYBERSECURITY",
            difficulty: "Expert",
            elaboration: "Develop a neural-network-based IDS that predicts zero-day exploits by analyzing packet entropy and temporal anomaly detection. This requires deep learning models capable of processing high-velocity network streams."
        },
        {
            id: "PS-03",
            title: "Bio-Sync Health Mesh",
            track: "HEALTH-TECH",
            difficulty: "Intermediate",
            elaboration: "A decentralized mesh network for emergency patient data transmission in low-connectivity zones using P2P syncing. The architecture must prioritize data integrity and offline functionality."
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
        <div className="ps-container" style={{ 
            color: '#fff', 
            position: 'relative', 
            minHeight: '100vh', 
            width: '150%',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '40px 0',
            background: 'transparent'
        }}>
            
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundImage: `url('https://wallpapers.com/images/featured/money-heist-99r9899128919191.jpg')`,
                backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2,
            }} />
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(5px)', zIndex: -1,
            }} />
            
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)'
                }}>
                    <div style={{
                        width: '420px', padding: '40px', background: '#0a0a0a', border: '2px solid #dc2626', borderRadius: '4px',
                        boxShadow: '0 0 50px rgba(220, 38, 38, 0.4)', textAlign: 'center', position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }}></div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }}></div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '900', letterSpacing: '5px', marginBottom: '10px' }}>CONFIRMATION REQUIRED</div>
                        <h2 style={{ color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', fontStyle: 'italic' }}>LOCK TARGET?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '25px 0', lineHeight: '1.6', fontSize: '14px' }}>
                            You are about to commit to <strong style={{color: '#dc2626'}}>{pendingPs?.id}</strong>. Once breached, the vault stays locked.
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '14px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>ABORT</button>
                            <button onClick={confirmLock} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '14px', borderRadius: '2px', cursor: 'pointer', fontWeight: '900', fontSize: '12px', boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)' }}>INITIALIZE LOCK</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ width: '100%', padding: '0 40px', zIndex: 1 }}>
                <div style={{ borderLeft: '4px solid #dc2626', background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, transparent 100%)', padding: '15px 25px', marginBottom: '35px', borderRadius: '0 4px 4px 0', animation: 'pulseBorder 2s infinite' }}>
                    <p style={{ fontSize: '11px', fontWeight: '900', color: '#dc2626', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        <span style={{ marginRight: '10px' }}>⚠️</span> CAUTION: Track allocation is final. Review technical dossiers before initializing lock.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {problemStatements.map((ps) => {
                        const count = psStatus.counts[ps.id] || 0;
                        const target = 30; 
                        const barWidth = Math.min((count / target) * 100, 100);

                        return (
                            <div key={ps.id} className="ps-card" style={{
                                background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '30px',
                                position: 'relative',
                                width: '100%',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                                transition: 'all 0.4s ease',
                                overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ color: '#fff', background: '#dc2626', padding: '2px 8px', fontSize: '10px', fontWeight: '900', borderRadius: '2px' }}>{ps.id}</span>
                                            <span style={{ color: '#dc2626', fontSize: '10px', fontWeight: '900', letterSpacing: '2px' }}>{ps.track}</span>
                                            <span className="diff-tag">// {ps.difficulty.toUpperCase()}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.8rem', margin: '0 0 20px 0', color: '#fff', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' }}>
                                            {ps.title}
                                        </h3>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                                        <button onClick={() => setExpandedId(expandedId === ps.id ? null : ps.id)} className="view-btn">
                                            {expandedId === ps.id ? 'CLOSE DOSSIER' : 'VIEW DOSSIER'}
                                        </button>

                                        <div className="heat-gauge-container">
                                            <div className="heat-label">
                                                <span className="heat-text">CONFLICT LEVEL</span>
                                                <span className="heat-value">{count}/{target} UNITS</span>
                                            </div>
                                            <div className="heat-bar-wrapper">
                                                <div className="heat-bar-fill" style={{ width: `${barWidth}%` }}>
                                                    <div className="heat-glitch"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {expandedId === ps.id && (
                                    <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(220, 38, 38, 0.2)', animation: 'fadeIn 0.5s ease' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div className="dossier-text">
                                                <div style={{ color: '#dc2626', fontSize: '10px', fontWeight: '900', marginBottom: '5px' }}>ELABORATION</div>
                                                <p style={{ color: '#eee', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>{ps.elaboration}</p>
                                            </div>
                                        </div>
                                        
                                        <button onClick={() => triggerLockSequence(ps)} className="lock-shine-btn">
                                            INITIALIZE TARGET LOCK
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes pulseBorder { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes glitchSweep { 0% { left: -100%; } 100% { left: 100%; } }
                .ps-card:hover { border-color: rgba(220, 38, 38, 0.6); transform: translateY(-5px); box-shadow: 0 15px 50px rgba(220, 38, 38, 0.2); }
                .diff-tag { color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.5); font-size: 10px; font-weight: 700; }
                .heat-gauge-container { width: 180px; display: flex; flex-direction: column; gap: 6px; }
                .heat-label { display: flex; justify-content: space-between; align-items: center; }
                .heat-text { font-size: 8px; font-weight: 900; color: rgba(255,255,255,0.4); letter-spacing: 1px; }
                .heat-value { font-size: 10px; font-weight: 900; color: #dc2626; text-shadow: 0 0 8px rgba(220,38,38,0.6); }
                .heat-bar-wrapper { height: 4px; width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(220,38,38,0.2); padding: 1px; overflow: hidden; position: relative; }
                .heat-bar-fill { height: 100%; background: linear-gradient(90deg, #ff4d4d, #dc2626); box-shadow: 0 0 10px #dc2626; transition: width 1.5s cubic-bezier(0.23, 1, 0.32, 1); position: relative; }
                .heat-glitch { position: absolute; top: 0; height: 100%; width: 30px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: glitchSweep 2s infinite linear; }
                .view-btn { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 10px 24px; font-weight: 900; font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: 0.3s; text-transform: uppercase; }
                .view-btn:hover { background: #fff; color: #000; box-shadow: 0 0 20px #fff; border-color: #fff; }
                .lock-shine-btn { width: 100%; padding: 22px; margin-top: 30px; border: none; font-weight: 900; font-size: 14px; letter-spacing: 5px; cursor: pointer; position: relative; overflow: hidden; background: #dc2626; color: #fff; box-shadow: 0 0 20px rgba(220, 38, 38, 0.4); }
                .lock-shine-btn::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%); animation: rotateShine 4s linear infinite; }
                @keyframes rotateShine { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}