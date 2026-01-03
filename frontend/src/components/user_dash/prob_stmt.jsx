import React, { useState, useEffect } from 'react';
import socket from "../../socket";

export default function PSGallery() {
    // --- STATE ---
    const [expandedId, setExpandedId] = useState(null);
    const [problemStatements, setProblemStatements] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pendingPs, setPendingPs] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // --- FETCH DATA FUNCTION ---
    const fetchProblemStatements = () => {
        fetch('http://localhost:5000/api/student/getallproblem-statements', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProblemStatements(data.problem_statements);
                }
            })
            .catch(err => console.error("Fetch error:", err));
    };

    // Initial load
    useEffect(() => {
        fetchProblemStatements();
    }, []);

    // Socket listener for real-time updates from other users
    useEffect(() => {
        socket.on("ps_selected", fetchProblemStatements);
        return () => {
            socket.off("ps_selected", fetchProblemStatements);
        };
    }, []);

    // --- HANDLERS ---
    const triggerLockSequence = (ps) => {
        setPendingPs(ps);
        setShowModal(true);
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 5000);
    };

    const confirmLock = async () => {
        if (!pendingPs) return;

        try {
            const res = await fetch('http://localhost:5000/api/student/select-problem-statement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    problem_statement_id: pendingPs.problem_statement_id
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setShowModal(false);
                setPendingPs(null);
                showNotification('success', 'Target Locked! Problem statement selected successfully.');
                // Refresh local state immediately
                fetchProblemStatements();
            } else {
                setShowModal(false);
                showNotification('error', data.error || 'Failed to select problem statement');
            }
        } catch (err) {
            console.error('Selection error:', err);
            setShowModal(false);
            showNotification('error', 'Server connection failed');
        }
    };

    return (
        <div className="ps-container" style={{
            color: '#fff', position: 'relative', minHeight: '100vh', width: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', background: 'transparent'
        }}>

            {/* BACKGROUND LAYERS */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXTTXyjjTv3OLCLxQKpvGjTLR7eavmcPelAA&s')`,
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: '0.2',
                filter: 'grayscale(100%) brightness(30%) contrast(150%) sepia(100%) hue-rotate(-50deg) saturate(1000%)', zIndex: -2,
            }} />
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(0, 0, 0, 0.9) 100%), radial-gradient(circle at 50% 50%, transparent 10%, rgba(220, 38, 38, 0.1) 100%)',
                zIndex: -1,
            }} />

            {/* CONFIRMATION MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)' }}>
                    <div style={{ width: '420px', padding: '40px', background: '#0a0a0a', border: '2px solid #dc2626', borderRadius: '4px', boxShadow: '0 0 50px rgba(220, 38, 38, 0.4)', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }}></div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }}></div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '900', letterSpacing: '5px', marginBottom: '10px' }}>CONFIRMATION REQUIRED</div>
                        <h2 style={{ color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', fontStyle: 'italic' }}>LOCK TARGET?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '25px 0', lineHeight: '1.6', fontSize: '14px' }}>
                            You are about to commit to <strong style={{ color: '#dc2626' }}>{pendingPs?.problem_statement_id}</strong>. Once breached, the vault stays locked.
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '14px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>ABORT</button>
                            <button onClick={confirmLock} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '14px', borderRadius: '2px', cursor: 'pointer', fontWeight: '900', fontSize: '12px', boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)' }}>INITIALIZE LOCK</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATION UI */}
            {notification.show && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ width: '450px', padding: '40px', background: notification.type === 'success' ? 'linear-gradient(145deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15))' : 'linear-gradient(145deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.15))', border: `3px solid ${notification.type === 'success' ? '#22c55e' : '#dc2626'}`, borderRadius: '12px', boxShadow: `0 20px 60px ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(220, 38, 38, 0.5)'}`, backdropFilter: 'blur(20px)', textAlign: 'center', position: 'relative' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>{notification.type === 'success' ? '✅' : '❌'}</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>{notification.message}</div>
                    </div>
                </div>
            )}

            <div style={{ width: '90%', maxWidth: '1200px', zIndex: 1 }}>
                <div style={{ borderLeft: '4px solid #dc2626', background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, transparent 100%)', padding: '15px 25px', marginBottom: '35px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '900', color: '#dc2626', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        ⚠️ Caution: Modifications will be restricted once the problem statement is locked.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {problemStatements.map((ps) => {
                        const count = ps.selections || 0;
                        const target = ps.max_count || 30;
                        const barWidth = Math.min((count / target) * 100, 100);

                        return (
                            <div key={ps.problem_statement_id} className="ps-card" style={{
                                background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
                                backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '30px', position: 'relative', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ color: '#fff', background: '#dc2626', padding: '2px 8px', fontSize: '10px', fontWeight: '900', borderRadius: '2px' }}>{ps.problem_statement_id}</span>
                                            <span style={{ color: '#dc2626', fontSize: '10px', fontWeight: '900', letterSpacing: '2px' }}>{ps.track}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.8rem', margin: '0 0 20px 0', color: '#fff', fontWeight: '900', textTransform: 'uppercase' }}>{ps.title}</h3>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                                        <button onClick={() => setExpandedId(expandedId === ps.problem_statement_id ? null : ps.problem_statement_id)} className="view-btn">
                                            {expandedId === ps.problem_statement_id ? 'CLOSE DOSSIER' : 'VIEW DOSSIER'}
                                        </button>
                                        <div className="heat-gauge-container">
                                            <div className="heat-label">
                                                <span className="heat-text">CONFLICT LEVEL</span>
                                                <span className="heat-value">{count}/{target} UNITS</span>
                                            </div>
                                            <div className="heat-bar-wrapper">
                                                <div className="heat-bar-fill" style={{ width: `${barWidth}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {expandedId === ps.problem_statement_id && (
                                    <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(220, 38, 38, 0.2)' }}>
                                        <p style={{ color: '#eee', lineHeight: '1.8', fontSize: '15px' }}>{ps.description}</p>
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
                .ps-card:hover { border-color: rgba(220, 38, 38, 0.6); transform: translateY(-5px); transition: 0.3s; }
                .heat-gauge-container { width: 180px; display: flex; flex-direction: column; gap: 6px; }
                .heat-text { font-size: 8px; font-weight: 900; color: rgba(255,255,255,0.4); }
                .heat-value { font-size: 10px; font-weight: 900; color: #dc2626; }
                .heat-bar-wrapper { height: 4px; width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(220,38,38,0.2); }
                .heat-bar-fill { height: 100%; background: linear-gradient(90deg, #ff4d4d, #dc2626); transition: width 1s ease; }
                .view-btn { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 10px 24px; font-weight: 900; font-size: 10px; cursor: pointer; }
                .view-btn:hover { background: #fff; color: #000; }
                .lock-shine-btn { width: 100%; padding: 20px; margin-top: 20px; border: none; font-weight: 900; background: #dc2626; color: #fff; cursor: pointer; letter-spacing: 2px; }
            `}</style>
        </div>
    );
}