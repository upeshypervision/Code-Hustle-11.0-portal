// frontend/src/pages/UserPortal.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UserSidebar from '../components/user_dash/UserSidebar';
import PSGallery from '../components/user_dash/prob_stmt';
import DashboardView from '../components/user_dash/DashboardView';
import PPTSubmission from '../components/user_dash/PPTSubmission';
import GitHubSubmission from '../components/user_dash/GitHubSubmission';
import HostedLinkSub from '../components/user_dash/HostedLinkSub';
import './UserPortal.css';

export default function UserPortal() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedPS, setSelectedPS] = useState(null);
    const [isPPTSubmitted, setIsPPTSubmitted] = useState(false);
    const [isGithubSubmitted, setIsGithubSubmitted] = useState(false);
    const [isHostedSubmitted, setIsHostedSubmitted] = useState(false);
    const [teamInfo, setTeamInfo] = useState({ login_id: 'Loading...' });

    useEffect(() => {
        fetch('http://localhost:5000/api/user-info', {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTeamInfo({ login_id: data.team_name });
                }
            })
            .catch(err => console.error('Error fetching team info:', err));
    }, []);

    const handlePSSelect = (ps) => {
        setSelectedPS(ps);
        setActiveTab('dashboard');
    };

    return (
        <div className="dashboard-page" style={{ background: 'transparent', minHeight: '100vh' }}>
            <Navbar
                userInfo={
                    <div className="team-name-badge">
                        <span className="team-name-label">TEAM:</span>
                        <span className="team-name-value">{teamInfo.login_id}</span>
                    </div>
                }
            />

            {activeTab === 'dashboard' && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: 'calc(100vh - 70px)'
                }}>
                    <DashboardView
                        selectedPS={selectedPS}
                        isPPTSubmitted={isPPTSubmitted}
                        isGithubSubmitted={isGithubSubmitted}
                        isHostedSubmitted={isHostedSubmitted}
                        setActiveTab={setActiveTab}
                        teamName={teamInfo.login_id}
                        activeTab={activeTab}
                    />
                </div>
            )}

            {activeTab !== 'dashboard' && (
                <div className="dashboard-main" style={{ background: 'transparent', display: 'flex' }}>
                    <UserSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    <div style={{ 
                        flex: 1, 
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0',
                        background: 'transparent'
                    }}>
                        {activeTab === 'ps-selection' && (
                            <div style={{ width: '100%' }}>
                                <PSGallery
                                    onSelect={handlePSSelect}
                                    teamName={teamInfo.login_id}
                                />
                            </div>
                        )}

                        {activeTab === 'ppt-submission' && (
                            <div className="card-inner" style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}>
                                <PPTSubmission
                                    selectedPS={selectedPS}
                                    isSubmitted={isPPTSubmitted}
                                    onUploadSuccess={() => setIsPPTSubmitted(true)}
                                />
                            </div>
                        )}

                        {activeTab === 'github-submission' && (
                            <div className="card-inner" style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}>
                                <GitHubSubmission
                                    isSubmitted={isGithubSubmitted}
                                    onUpload={() => {
                                        setIsGithubSubmitted(true);
                                        setActiveTab('dashboard');
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'hosted-link' && (
                            <div className="card-inner" style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}>
                                <HostedLinkSub
                                    isSubmitted={isHostedSubmitted}
                                    onUpload={() => {
                                        setIsHostedSubmitted(true);
                                        setActiveTab('dashboard');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}