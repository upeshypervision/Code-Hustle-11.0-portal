import React from 'react';

export default function UserSidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'DASHBOARD' },
        { id: 'ps-selection', label: 'PROBLEM SELECTION' },
        { id: 'ppt-submission', label: 'PPT SUBMISSION' },
        { id: 'github-submission', label: 'GITHUB LINK' },
        { id: 'hosted-link', label: 'HOSTED LINK (OPTIONAL)' },
    ];

    return (
        <aside style={{ 
            width: '100%',
            maxWidth: '280px', 
            minHeight: '100vh',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            padding: '30px 20px',
            background: 'rgba(5, 5, 5, 0.26)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(220, 38, 38, 0.3)',
            flexShrink: 0,
            zIndex: 10,
            boxShadow: '20px 0 50px rgba(0, 0, 0, 0.33)'
        }}>
            <style>{`
                @keyframes scanner-line {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { top: 100%; opacity: 0; }
                }
                .side-nav-btn {
                    position: relative;
                    text-align: left;
                    padding: min(2vh, 18px) 20px;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    background: rgba(20, 20, 20, 0.18);
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    overflow: hidden;
                }
                .side-nav-btn:hover {
                    color: #fff;
                    background: rgba(220, 38, 38, 0.3);
                    border-color: rgba(220, 38, 38, 0.5);
                    transform: scale(1.02);
                }
                .side-nav-btn.active {
                    background: linear-gradient(90deg, rgba(220, 38, 38, 0.25) 0%, transparent 100%);
                    color: #fff;
                    border-left: 4px solid #dc2626;
                    border-right: 1px solid rgba(220, 38, 38, 0.3);
                    box-shadow: 0 0 20px rgba(220, 38, 38, 0.43);
                }
                .side-nav-btn.active::before {
                    content: "";
                    position: absolute;
                    left: 0; width: 100%; height: 2px;
                    background: #dc2626;
                    animation: scanner-line 3s linear infinite;
                }
                @media (max-width: 1024px) {
                    aside { maxWidth: 220px; padding: 20px 15px; }
                }
            `}</style>

            <div style={{ 
                color: '#cc6b6bff', 
                fontSize: '9px', 
                fontWeight: '900', 
                marginBottom: '25px', 
                letterSpacing: '5px',
                textAlign: 'center',
                padding: '10px',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                background: 'rgba(220, 38, 38, 0)'
            }}>
                SYSTEM_ACCESS_V.01
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

            <div style={{ marginTop: 'auto', padding: '10px', textAlign: 'center' }}>
                <div style={{ width: '100%', height: '1px', background: 'rgba(220, 38, 38, 0.2)', marginBottom: '10px' }} />
                <span style={{ fontSize: '8px', color: '#444', letterSpacing: '2px' }}>SECURE_CONNECTION: ESTABLISHED</span>
            </div>
        </aside>
    );
}