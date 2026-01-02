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

    const handleUploadSuccess = () => {
        setIsPPTSubmitted(true);
    };

    const handleGithubSuccess = () => {
        setIsGithubSubmitted(true);
        setActiveTab('dashboard');
    };

    const handleHostedSuccess = () => {
        setIsHostedSubmitted(true);
        setActiveTab('dashboard');
    };

    return (
        <div className="dashboard-page">
            <Navbar
                userInfo={
                    <div className="team-name-badge">
                        <span className="team-name-label">TEAM:</span>
                        <span className="team-name-value">{teamInfo.login_id}</span>
                    </div>
                }
            />

            <div className="dashboard-main">
                <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                <main className="panel">
                    {activeTab === 'dashboard' && (
                        <DashboardView
                            selectedPS={selectedPS}
                            isPPTSubmitted={isPPTSubmitted}
                            isGithubSubmitted={isGithubSubmitted}
                            isHostedSubmitted={isHostedSubmitted}
                            setActiveTab={setActiveTab}
                        />
                    )}

                    {activeTab === 'ps-selection' && (
                        <div className="card-inner" style={{ padding: '20px', width: '100%' }}>
                            <PSGallery onSelect={handlePSSelect} />
                        </div>
                    )}

                    {activeTab === 'ppt-submission' && (
                        <div className="card-inner" style={{ padding: '20px', width: '100%' }}>
                            <PPTSubmission
                                selectedPS={selectedPS}
                                isSubmitted={isPPTSubmitted}
                                onUploadSuccess={handleUploadSuccess}
                            />
                        </div>
                    )}

                    {activeTab === 'github-submission' && (
                        <div className="card-inner" style={{ padding: '20px', width: '100%' }}>
                            <GitHubSubmission
                                isSubmitted={isGithubSubmitted}
                                onUpload={handleGithubSuccess}
                            />
                        </div>
                    )}

                    {activeTab === 'hosted-link' && (
                        <div className="card-inner" style={{ padding: '20px', width: '100%' }}>
                            <HostedLinkSub 
                                isSubmitted={isHostedSubmitted}
                                onUpload={handleHostedSuccess}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}