// frontend/src/pages/UserPortal.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UserSidebar from '../components/user_dash/UserSidebar';
import PSGallery from '../components/user_dash/prob_stmt';
import DashboardView from '../components/user_dash/DashboardView';
import PPTSubmission from '../components/user_dash/PPTSubmission';
import GitHubSubmission from '../components/user_dash/GitHubSubmission'; 
import './UserPortal.css';

export default function UserPortal() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedPS, setSelectedPS] = useState(null);
    const [isPPTSubmitted, setIsPPTSubmitted] = useState(false);
    const [isGithubSubmitted, setIsGithubSubmitted] = useState(false);
    // isHostedSubmitted state removed as per your request
    const [teamInfo, setTeamInfo] = useState({ login_id: 'Loading...' });

    useEffect(() => {
        fetch('http://localhost:5001/api/user-info', {
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

            {/* DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
                <DashboardView
                    selectedPS={selectedPS}
                    isPPTSubmitted={isPPTSubmitted}
                    isGithubSubmitted={isGithubSubmitted}
                    setActiveTab={setActiveTab}
                    teamName={teamInfo.login_id}
                    activeTab={activeTab}
                />
            )}

            {/* OTHER TABS */}
            {activeTab !== 'dashboard' && (
                <div className="dashboard-main" style={{ 
                    background: 'transparent', 
                    display: 'flex',
                    flexDirection: 'row',
                    minHeight: 'calc(100vh - 70px)'
                }}>
                    <UserSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    <div style={{ 
                        flex: 1, 
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0',
                        background: 'transparent',
                        position: 'relative'
                    }}>
                        {activeTab === 'ps-selection' && (
                            <PSGallery
                                onSelect={handlePSSelect}
                                teamName={teamInfo.login_id}
                            />
                        )}

                        {activeTab === 'ppt-submission' && (
                            <div className="card-inner" style={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: '40px' }}>
                                <PPTSubmission
                                    selectedPS={selectedPS}
                                    isSubmitted={isPPTSubmitted}
                                    onUploadSuccess={() => setIsPPTSubmitted(true)}
                                />
                            </div>
                        )}

                        {activeTab === 'github-submission' && (
                            <div className="card-inner" style={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: '40px' }}>
                                <GitHubSubmission
                                    isSubmitted={isGithubSubmitted}
                                    onUpload={() => {
                                        setIsGithubSubmitted(true);
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