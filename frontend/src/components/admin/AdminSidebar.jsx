import React from 'react';

export default function AdminSidebar({ activeSection, setActiveSection }) {
    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2 className="admin-sidebar-title">Admin Console</h2>
                <p className="admin-sidebar-subtitle">Code Hustle Management</p>
            </div>

            <ul className="admin-nav-menu">
                <li className="admin-nav-item">
                    <a
                        className={`admin-nav-link ${activeSection === 'rounds' ? 'active' : ''}`}
                        onClick={() => setActiveSection('rounds')}
                    >
                        <span className="admin-nav-icon">🎯</span>
                        <span>Round Management</span>
                    </a>
                </li>

                <li className="admin-nav-item">
                    <a
                        className={`admin-nav-link ${activeSection === 'problem-statements' ? 'active' : ''}`}
                        onClick={() => setActiveSection('problem-statements')}
                    >
                        <span className="admin-nav-icon">📋</span>
                        <span>Problem Statements</span>
                    </a>
                </li>

                <li className="admin-nav-item">
                    <a
                        className={`admin-nav-link ${activeSection === 'add-participant' ? 'active' : ''}`}
                        onClick={() => setActiveSection('add-participant')}
                    >
                        <span className="admin-nav-icon">➕</span>
                        <span>Add Participant</span>
                    </a>
                </li>

                <li className="admin-nav-item">
                    <a
                        className={`admin-nav-link ${activeSection === 'edit-teams' ? 'active' : ''}`}
                        onClick={() => setActiveSection('edit-teams')}
                    >
                        <span className="admin-nav-icon">✏️</span>
                        <span>Edit Teams</span>
                    </a>
                </li>

                <li className="admin-nav-item">
                    <a
                        className={`admin-nav-link ${activeSection === 'submissions' ? 'active' : ''}`}
                        onClick={() => setActiveSection('submissions')}
                    >
                        <span className="admin-nav-icon">📁</span>
                        <span>View Submissions</span>
                    </a>
                </li>
            </ul>
        </aside>
    );
}
