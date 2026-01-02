import React, { useState } from 'react';

export default function GitHubSubmission({ onUpload, isSubmitted }) {
    const [link, setLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (link.trim()) {
            onUpload();
        }
    };

    return (
        <div
            style={{
                padding: '60px 40px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '30px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
        >
            {/* Ambient Glow */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '220px',
                    height: '220px',
                    background:
                        'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 0
                }}
            />

            {/* GitHub Icon */}
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 25px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 0 20px rgba(59,130,246,0.2)'
                }}
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            </div>

            <h2
                style={{
                    color: '#fff',
                    fontSize: '1.8rem',
                    letterSpacing: '2px',
                    marginBottom: '15px',
                    fontWeight: '900',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                TRANSMIT REPOSITORY
            </h2>

            <p
                style={{
                    color: '#94a3b8',
                    marginBottom: '40px',
                    maxWidth: '500px',
                    margin: '0 auto 40px auto',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                }}
            >
                Submit your GitHub repository for verification. The repository
                must be <strong>public</strong>.
            </p>

            {isSubmitted ? (
                <div
                    style={{
                        padding: '30px',
                        background: 'rgba(16,185,129,0.08)',
                        borderRadius: '20px',
                        border: '1px solid #10b981',
                        animation: 'fadeIn 0.5s ease-out'
                    }}
                >
                    <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>
                        ✅
                    </div>
                    <p
                        style={{
                            color: '#10b981',
                            fontWeight: '800',
                            letterSpacing: '1px'
                        }}
                    >
                        REPOSITORY RECEIVED
                    </p>
                    <p
                        style={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                            marginTop: '6px'
                        }}
                    >
                        Submitted at {new Date().toLocaleTimeString()}
                    </p>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '22px',
                        maxWidth: '600px',
                        margin: '0 auto',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <input
                        type="url"
                        placeholder="https://github.com/username/repository"
                        required
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="cyber-input"
                        style={{
                            width: '100%',
                            padding: '20px 25px',
                            borderRadius: '15px',
                            background: '#0a0f1e',
                            border:
                                '2px solid rgba(59,130,246,0.35)',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '1rem',
                            fontFamily: 'monospace',
                            transition: 'all 0.3s ease'
                        }}
                    />

                    <button
                        type="submit"
                        className="shiny-button"
                        disabled={!link.trim()}
                    >
                        SUBMIT LINK →
                    </button>

                    <div
                        style={{
                            marginTop: '10px',
                            fontSize: '0.7rem',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}
                    >
                        System Status: Awaiting Input
                    </div>
                </form>
            )}

            <style>{`
                .cyber-input:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 20px rgba(59,130,246,0.4);
                    background: #0f172a !important;
                }

                .shiny-button {
                    position: relative;
                    padding: 18px;
                    border-radius: 16px;
                    border: none;
                    cursor: pointer;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: #fff;
                    background: linear-gradient(
                        120deg,
                        #2563eb,
                        #3b82f6,
                        #6366f1,
                        #3b82f6
                    );
                    background-size: 300% 300%;
                    animation: gradientFlow 6s ease infinite, glowPulse 2.5s ease-in-out infinite;
                    box-shadow: 0 0 25px rgba(59,130,246,0.5);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    overflow: hidden;
                }

                .shiny-button::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -60%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(
                        120deg,
                        transparent,
                        rgba(255,255,255,0.45),
                        transparent
                    );
                    transform: skewX(-20deg);
                    animation: shineSweep 3s infinite;
                }

                .shiny-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 40px rgba(99,102,241,0.9);
                }

                .shiny-button:active {
                    transform: scale(0.97);
                }

                .shiny-button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    animation: none;
                    box-shadow: none;
                }

                @keyframes gradientFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes glowPulse {
                    0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.4); }
                    50% { box-shadow: 0 0 40px rgba(99,102,241,0.9); }
                }

                @keyframes shineSweep {
                    0% { left: -60%; }
                    60% { left: 120%; }
                    100% { left: 120%; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
