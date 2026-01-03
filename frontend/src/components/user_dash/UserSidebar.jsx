import React from 'react';

export default function UserSidebar({ activeTab, setActiveTab }) {
    const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'ps-selection', label: 'Problem Statement Selection' },
    { id: 'ppt-submission', label: 'PPT Submission' },
    { id: 'github-submission', label: 'GitHub Link Submission' },
];


    return (
        <aside style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="nav-logout"
                    style={{
                        textAlign: 'left',
                        width: '100%',
                        background: activeTab === item.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                        borderColor: activeTab === item.id ? 'var(--primary)' : 'rgba(148,163,184,0.3)',
                        color: activeTab === item.id ? 'var(--text)' : 'var(--text-muted)'
                    }}
                >
                    {item.label}
                </button>
            ))}
        </aside>
    );
}
