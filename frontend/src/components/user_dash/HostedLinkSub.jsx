import React from 'react';

export default function HostedLinkSub({ isSubmitted, onUpload }) {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '60px'
        }}>
            <style>{`
                .deployment-input:focus {
                    border-color: #f472b6 !important;
                    box-shadow: 0 0 15px rgba(244, 114, 182, 0.3);
                    background: rgba(244, 114, 182, 0.05) !important;
                }
                @keyframes shine-text {
                    to { background-position: 200% center; }
                }
            `}</style>

            {/* Added Heading */}
            <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '900', 
                color: '#fff', 
                marginBottom: '30px', 
                textAlign: 'center',
                letterSpacing: '-1px'
            }}>
                <span style={{ 
                    background: 'linear-gradient(90deg, #818cf8, #f472b6, #818cf8)',
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% auto',
                    animation: 'shine-text 4s linear infinite',
                    textTransform: 'uppercase'
                }}>
                    Hosted Link Submission
                </span>
            </h2>
            
            <div style={{ 
                width: '100%', 
                maxWidth: '550px', 
                background: 'rgba(15, 23, 42, 0.6)', 
                padding: '40px', 
                borderRadius: '32px', 
                border: '1px solid rgba(244, 114, 182, 0.2)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <input 
                    type="text" 
                    placeholder="https://your-project.vercel.app" 
                    className="deployment-input"
                    style={{
                        width: '100%',
                        background: '#0a0f1e',
                        border: '1px solid #1e293b',
                        padding: '18px',
                        borderRadius: '16px',
                        color: '#fff',
                        marginBottom: '25px',
                        outline: 'none',
                        fontSize: '15px',
                        fontFamily: 'monospace',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                    }}
                />
                
                <button 
                    style={{ 
                        width: '100%', 
                        padding: '18px',
                        background: isSubmitted ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(90deg, #6366f1, #f472b6)',
                        border: isSubmitted ? '1px solid #10b981' : 'none',
                        color: isSubmitted ? '#10b981' : '#fff',
                        borderRadius: '16px',
                        fontWeight: '900',
                        fontSize: '13px',
                        letterSpacing: '2px',
                        cursor: 'pointer',
                        transition: '0.4s',
                        textTransform: 'uppercase'
                    }} 
                    onClick={onUpload}
                >
                    {isSubmitted ? 'SUBMITTED ✓' : 'SUBMIT DEPLOYMENT LINK'}
                </button>
            </div>
        </div>
    );
}