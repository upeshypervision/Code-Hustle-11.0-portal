import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import GlobalNavbar from '../components/GlobalNavbar';
import UserSidebar from '../components/user_dash/UserSidebar';
import PSGallery from '../components/user_dash/prob_stmt';
import DashboardView from '../components/user_dash/DashboardView';
import PPTSubmission from '../components/user_dash/PPTSubmission';
import GitHubSubmission from '../components/user_dash/GitHubSubmission';
import HackerrankSubmission from '../components/user_dash/HackerrankSubmission';
import './UserPortal.css';

export default function UserPortal() {
    const navigate = useNavigate(); // Hook for redirection
    const [activeTab, setActiveTab] = useState(() => {
        // Initialize from localStorage, default to 'dashboard' if not found
        return localStorage.getItem('userPortalActiveTab') || 'dashboard';
    });
    const [selectedPS, setSelectedPS] = useState(null);
    const [isPPTSubmitted, setIsPPTSubmitted] = useState(false);
    const [isGithubSubmitted, setIsGithubSubmitted] = useState(false);

    // Add a specific loading state for the authentication check
    const [isLoading, setIsLoading] = useState(true);
    const [teamInfo, setTeamInfo] = useState({ login_id: '' });

    // Hoisted state for sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Menu items for mobile menu (matching UserSidebar)
    const userMenuItems = [
        { id: 'dashboard', label: 'Dashboard', active: activeTab === 'dashboard' },
        { id: 'hackerrank-submission', label: 'Hackerrank Protocol', active: activeTab === 'hackerrank-submission' },
        { id: 'ps-selection', label: 'Problem Statement', active: activeTab === 'ps-selection' },
        { id: 'ppt-submission', label: 'PPT Submission', active: activeTab === 'ppt-submission' },
        { id: 'github-submission', label: 'GitHub Link Submission', active: activeTab === 'github-submission' },
    ];

    const handleMenuItemClick = (item) => {
        setActiveTab(item.id);
        setIsSidebarOpen(false); // Close sidebar if open
    };

    // Persist activeTab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('userPortalActiveTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        // CHECK YOUR PORT: Is your backend on 5001?
        // Ensure this matches your Flask/Node server console.
        fetch('http://localhost:5000/api/user-info', {
            method: 'GET',
            credentials: 'include' // Crucial for cookies
        })
            .then(res => {
                // If server says Unauthorized (401) or Forbidden (403)
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    setTeamInfo({ login_id: data.team_name });
                    setIsLoading(false); // Stop loading, show dashboard
                } else {
                    // API returned success: false
                    console.error("Session invalid:", data.error);
                    navigate('/login'); // Redirect to login
                }
            })
            .catch(err => {
                console.error('Error fetching team info:', err);
                // If fetch fails (e.g., server down or 401), go to login
                navigate('/login');
            });
    }, [navigate]);

    const handlePSSelect = (ps) => {
        setSelectedPS(ps);
        setActiveTab('dashboard');
    };

    // 1. Prevent "Blinking": Don't render the dashboard until we confirm the user is logged in
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
                <p>Verifying Session...</p>
            </div>
        );
    }

    // 2. Main Render
    return (
        <div className="dashboard-page" style={{ background: 'transparent', minHeight: '100vh' }}>
            <GlobalNavbar
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                menuItems={userMenuItems}
                onMenuItemClick={handleMenuItemClick}
                userInfo={
                    <div className="team-name-badge">
                        <span className="team-name-label">TEAM:</span>
                        <span className="team-name-value">{teamInfo.login_id}</span>
                    </div>
                }
                showContactUs={true}
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
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
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
                    <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                        <UserSidebar
                            activeTab={activeTab}
                            setActiveTab={(tab) => {
                                setActiveTab(tab);
                                setIsSidebarOpen(false); // Close sidebar on selection
                            }}
                        />
                        {/* Close button for non-dashboard tabs */}
                        {isSidebarOpen && (
                            <div
                                onClick={() => setIsSidebarOpen(false)}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    color: '#fff',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    zIndex: 1002
                                }}
                            >
                                ✕
                            </div>
                        )}
                    </div>

                    <div className="main-content-wrapper"
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '0',
                            background: 'transparent',
                            position: 'relative',
                            boxSizing: 'border-box',
                        }}>
                        {activeTab === 'ps-selection' && (
                            <PSGallery
                                onSelect={handlePSSelect}
                                teamName={teamInfo.login_id}
                            />
                        )}

                        {activeTab === 'hackerrank-submission' && (
                            <div className="card-inner" style={{ width: '100%', maxWidth: '100%', margin: 'auto' }}>
                                <HackerrankSubmission teamName={teamInfo.login_id} />
                            </div>
                        )}

                        {activeTab === 'ppt-submission' && (
                            <div className="card-inner submission-container-responsive">
                                <PPTSubmission
                                    selectedPS={selectedPS}
                                    isSubmitted={isPPTSubmitted}
                                    onUploadSuccess={() => setIsPPTSubmitted(true)}
                                />
                            </div>
                        )}

                        {activeTab === 'github-submission' && (
                            <div className="card-inner" style={{ width: '100%', maxWidth: '100%', margin: 'auto' }}>
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
            )
            }
        </div >
    );
}