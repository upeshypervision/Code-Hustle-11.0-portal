import React from 'react';

export default function UserSidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'DASHBOARD' },
        { id: 'ps-selection', label: 'PROBLEM STATEMENT SUBMISSION' },
        { id: 'ppt-submission', label: 'PPT SUBMISSION' },
        { id: 'github-submission', label: 'GITHUB LINK SUBMISSION' },    ];

    return (
        <aside style={{ 
            width: '100%',
            maxWidth: '280px', 
            minHeight: '100vh',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            padding: '30px 20px',
            background: 'rgba(5, 5, 5, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRight: '2px solid rgba(220, 38, 38, 0.4)',
            flexShrink: 0,
            zIndex: 10,
            position: 'relative',
            boxShadow: '20px 0 50px rgba(0, 0, 0, 0.7)'
        }}>
            {/* SHINING FIELD PATTERN */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
                zIndex: -1
            }} />

            <style>{`
                @keyframes scanner-line {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 0.8; height: 3px; }
                    100% { top: 100%; opacity: 0; }
                }
                .side-nav-btn {
                    position: relative;
                    text-align: left;
                    padding: 18px 20px;
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    border: 5px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                    background: rgba(15, 15, 15, 0.6);
                    color: rgba(255, 255, 255, 0.3);
                    text-transform: uppercase;
                    overflow: hidden;
                }
                .side-nav-btn:hover {
                    color: #fff;
                    background: rgba(220, 38, 38, 0.2);
                    border-color: rgba(220, 38, 38, 0.5);
                    transform: translateX(8px);
                }
                .side-nav-btn.active {
                    background: linear-gradient(90deg, rgba(220, 38, 38, 0.4) 0%, transparent 100%);
                    color: #fff;
                    border-left: 5px solid #dc2626;
                    box-shadow: 0 0 25px rgba(220, 38, 38, 0.3);
                }
                .side-nav-btn.active::after {
                    content: "";
                    position: absolute;
                    left: 0; width: 100%; height: 4px;
                    background: #ba3030ff;
                    box-shadow: 0 0 10px #ff4444;
                    animation: scanner-line 2.5s infinite linear;
                }
            `}</style>

            <div style={{ 
                color: '#ac7e7eff', 
                fontSize: '11px', 
                fontWeight: '900', 
                marginBottom: '30px', 
                letterSpacing: '6px',
                textAlign: 'center',
                border: '5px solid rgba(0, 0, 0, 0.4)',
                padding: '12px',
                background: 'rgba(220, 38, 38, 0.05)',
                textShadow: '0 0 8px rgba(196, 193, 193, 0.8)'
            }}>
                LA_CASA_ACCESS
            </div>

            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`side-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                >
                    {item.label}
                </button>
            ))}

            <div style={{ marginTop: 'auto', textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '7px', color: '#555', letterSpacing: '3px' }}>
                    DATA_STREAM: ENCRYPTED
                </div>
            </div>
        </aside>
    );
}
