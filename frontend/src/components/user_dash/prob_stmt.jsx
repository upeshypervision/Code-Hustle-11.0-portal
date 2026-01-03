// prob_stmt.jsx
import React, { useState, useEffect } from 'react';
import socket from "../../socket";

export default function PSGallery() {
    const [expandedId, setExpandedId] = useState(null);
    const [problemStatements, setProblemStatements] = useState([]);

    // UI-ONLY modal state
    const [showModal, setShowModal] = useState(false);
    const [pendingPs, setPendingPs] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/student/getallproblem-statements', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProblemStatements(data.problem_statements);
                }
            })
            .catch(err => console.error(err));
    }, []);
    
    useEffect(() => {
        const handlePsSelected = () => {
            fetch('http://localhost:5000/api/student/getallproblem-statements', {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setProblemStatements(data.problem_statements);
                    }
                })
                .catch(err => console.error(err));
        };
    
        socket.on("ps_selected", handlePsSelected);
    
        return () => {
            socket.off("ps_selected", handlePsSelected);
        };
    }, []);
    
    const openLockPopup = (ps) => {
        setPendingPs(ps);
        setShowModal(true);
    };

    const abortLock = () => {
        setShowModal(false);
        setPendingPs(null);
    };

    const confirmLock = async () => {
        if (!pendingPs) return;
    
        console.log("CONFIRMING PS:", pendingPs.problem_statement_id);
    
        try {
            const res = await fetch(
                "http://localhost:5000/api/student/select-problem-statement",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        problem_statement_id: pendingPs.problem_statement_id,
                    }),
                }
            );
    
            const data = await res.json();
            console.log("SELECT RESPONSE:", data);
    
            if (!res.ok) {
                alert(data.error || "Selection failed");
                return;
            }
    
            // ✅ Refresh THIS student's UI immediately
            const refresh = await fetch(
                "http://localhost:5000/api/student/getallproblem-statements",
                { credentials: "include" }
            );
            const refreshedData = await refresh.json();
            if (refreshedData.success) {
                setProblemStatements(refreshedData.problem_statements);
            }
    
            setShowModal(false);
            setPendingPs(null);
    
        } catch (err) {
            console.error("SELECT ERROR:", err);
        }
    };
    

    return (
        <div className="ps-container" style={{
            color: '#fff',
            position: 'relative',
            minHeight: '100vh',
            width: '150%',
            padding: '40px 0'
        }}>

            {/* BACKGROUND */}
            <div style={{
                position: 'fixed', inset: 0,
                backgroundImage: `url('https://wallpapers.com/images/featured/money-heist-99r9899128919191.jpg')`,
                backgroundSize: 'cover',
                zIndex: -2
            }} />
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.88)',
                backdropFilter: 'blur(5px)',
                zIndex: -1
            }} />

            {/* LOCK MODAL */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.92)',
                    backdropFilter: 'blur(15px)'
                }}>
                    <div style={{
                        width: '420px',
                        padding: '40px',
                        background: '#0a0a0a',
                        border: '2px solid #dc2626',
                        boxShadow: '0 0 50px rgba(220,38,38,0.4)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#dc2626',
                            fontWeight: '900',
                            letterSpacing: '4px',
                            marginBottom: '12px'
                        }}>
                            CONFIRMATION REQUIRED
                        </div>

                        <h2 style={{
                            fontStyle: 'italic',
                            textTransform: 'uppercase'
                        }}>
                            LOCK TARGET?
                        </h2>

                        <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            margin: '25px 0',
                            lineHeight: '1.6',
                            fontSize: '14px'
                        }}>
                            You are about to lock
                            <strong style={{ color: '#dc2626' }}>
                                {" "}{pendingPs?.problem_statement_id}
                            </strong>
                        </p>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={abortLock}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '14px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                }}
                            >
                                ABORT
                            </button>

                            <button
                                onClick={confirmLock}
                                style={{
                                    flex: 1,
                                    background: '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '14px',
                                    fontWeight: '900',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 15px rgba(220,38,38,0.5)'
                                }}
                            >
                                LOCK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT */}
            <div style={{ padding: '0 40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {problemStatements.map(ps => {
                        const count = ps.selections || 0;
                        const target = ps.max_count || 1;
                        const barWidth = Math.min((count / target) * 100, 100);

                        return (
                            <div key={ps.problem_statement_id} className="ps-card" style={{
                                background: 'rgba(20,20,20,0.7)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '30px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                                            <span style={{ background: '#dc2626', padding: '2px 8px', fontSize: '10px' }}>
                                                {ps.problem_statement_id}
                                            </span>
                                            <span style={{ fontSize: '10px', color: '#dc2626' }}>
                                                {ps.track}
                                            </span>
                                            <span style={{ fontSize: '10px' }}>
                                                // {ps.difficulty.toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            fontSize: '1.6rem',
                                            fontWeight: '900',
                                            fontStyle: 'italic'
                                        }}>
                                            {ps.title}
                                        </h3>
                                    </div>

                                    <div style={{ width: '180px' }}>
                                        <div style={{ fontSize: '10px', marginBottom: '6px' }}>
                                            {count}/{target} TEAMS
                                        </div>
                                        <div style={{
                                            height: '4px',
                                            background: 'rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${barWidth}%`,
                                                background: '#dc2626'
                                            }} />
                                        </div>

                                        <button
                                            onClick={() =>
                                                setExpandedId(
                                                    expandedId === ps.problem_statement_id
                                                        ? null
                                                        : ps.problem_statement_id
                                                )
                                            }
                                            style={{
                                                marginTop: '12px',
                                                background: 'transparent',
                                                border: '1px solid #fff',
                                                color: '#fff',
                                                padding: '8px',
                                                fontSize: '10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {expandedId === ps.problem_statement_id
                                                ? 'CLOSE DOSSIER'
                                                : 'VIEW DOSSIER'}
                                        </button>
                                    </div>
                                </div>

                                {expandedId === ps.problem_statement_id && (
                                    <div style={{ marginTop: '25px' }}>
                                        <p style={{ lineHeight: '1.8', fontSize: '15px' }}>
                                            {ps.description}
                                        </p>

                                        {/* 🔥 SUBMIT BUTTON */}
                                        <button
                                            onClick={() => openLockPopup(ps)}
                                            style={{
                                                width: '100%',
                                                marginTop: '30px',
                                                padding: '18px',
                                                background: '#dc2626',
                                                color: '#fff',
                                                border: 'none',
                                                fontWeight: '900',
                                                letterSpacing: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            SUBMIT
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
