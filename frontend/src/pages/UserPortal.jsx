import { useState } from 'react';
import Navbar from '../components/Navbar';
import UserSidebar from '../components/user_dash/UserSidebar';
import PSGallery from '../components/user_dash/prob_stmt';
import Modal from '../components/Modal'; 
import PPTSubmission from '../components/user_dash/PPTSubmission';
import GitHubSubmission from '../components/user_dash/GitHubSubmission';

export default function UserPortal() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPS, setSelectedPS] = useState(null);
    const [viewingPS, setViewingPS] = useState(null);
    
    const [isSubmitted, setIsSubmitted] = useState(false); // PPT Status
    const [isGithubSubmitted, setIsGithubSubmitted] = useState(false); // GitHub Status

    const handlePSPreview = (ps) => {
        setViewingPS(ps);
        setIsModalOpen(true); //updated//
    };

    const handleConfirmSelection = () => {
        setSelectedPS(viewingPS);
        setIsModalOpen(false);
        setActiveTab('dashboard'); 
    };

    const handleUploadSuccess = () => {
        setIsSubmitted(true);
        setActiveTab('dashboard'); 
    };

    const handleGithubSuccess = () => {
        setIsGithubSubmitted(true);
        setActiveTab('dashboard');
    };

    const getProgressWidth = () => {
        if (isGithubSubmitted) return '100%';
        if (isSubmitted) return '60%';
        if (selectedPS) return '15%';
        return '0%';
    };

    const getProgressColor = () => {
        if (isGithubSubmitted) return '#10b981';
        return '#3b82f6';
    };

    // CUSTOM BRIGHT NAVBAR
    const BrightNavbar = () => (
        <nav style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 40px', 
            background: 'linear-gradient(90deg, #1e293b 0%, #3b82f6 50%, #6366f1 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            position: 'sticky', top: 0, zIndex: 1000
        }}>
            {/* Left Corner: Strictly Intact */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '35px', height: '35px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#3b82f6' }}>CH</div>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>CODE HUSTLE</h1>
            </div>

            {/* Right Side: Contact Us & Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                    style={{ 
                        background: '#fff', color: '#3b82f6', border: 'none', padding: '8px 20px', 
                        borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem',
                        transition: '0.3s', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    CONTACT US
                </button>
                <button 
                    style={{ 
                        background: '#44b6efff', color: '#fff', border: 'none', padding: '8px 20px', 
                        borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem',
                        transition: '0.3s', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    onClick={() => window.location.reload()}
                >
                    LOGOUT
                </button>
            </div>
        </nav>
    );

    const InternalHeader = () => (
        <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 24px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px', marginBottom: '25px', backdropFilter: 'blur(10px)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '4px 12px', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900', color: '#fff' }}>PS_ID</div>
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '700' }}>
                    {selectedPS ? selectedPS.id : "AWAITING_LOCK"}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: '800' }}>STATUS:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="status-indicator-pulse" style={{ background: selectedPS ? '#10b981' : '#f59e0b' }}></div>
                    <span style={{ color: selectedPS ? '#10b981' : '#f59e0b', fontSize: '0.75rem', fontWeight: '900' }}>
                        {selectedPS ? 'ACTIVE' : 'INITIALIZATION_REQUIRED'}
                    </span>
                </div>
            </div>
        </div>
    );

    const ModuleLocked = ({ title, description, color, icon }) => (
        <div className="locked-module-container" style={{ border: `1px solid ${color}33`, borderLeft: `5px solid ${color}` }}>
            <div className="grid-bg-overlay"></div>
            <div style={{ zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{icon}</div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px' }}>{title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '10px', maxWidth: '400px', margin: '10px auto' }}>{description}</p>
                <button className="cyber-action-btn" style={{ marginTop: '25px', background: color, border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', padding: '12px 30px' }} onClick={() => setActiveTab('ps-selection')}>
                    Go To Problem Statement Selection →
                </button>
            </div>
        </div>
    );

    return (
        <div className="dashboard-page">
            <BrightNavbar />

            <div className="dashboard-main" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '20px' }}>
                <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                <main className="panel" style={{ flex: 1 }}>
                    <div className="panel-inner" style={{ minHeight: '80vh' }}>
                        <InternalHeader />

                        {activeTab === 'dashboard' && (
                            <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
                                {selectedPS ? (
                                    <div className="active-project-card" style={{ position: 'relative', padding: '40px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <div className="watermark-text">{selectedPS.id}</div>
                                        <span className="sub-tag">Active Project Track</span>
                                        <h1 className="project-heading">{selectedPS.title}</h1>
                                        <div className="meta-grid">
                                            <div className="meta-item">
                                                <p className="meta-label">CLASSIFICATION</p>
                                                <p className="meta-value" style={{ color: '#fbbf24' }}>{selectedPS.track}</p>
                                            </div>
                                            <div className="meta-separator"></div>
                                            <div className="meta-item">
                                                <p className="meta-label">TECHNICAL RANK</p>
                                                <p className="meta-value" style={{ color: '#3b82f6' }}>{selectedPS.difficulty}</p>
                                            </div>
                                        </div>
                                        <p className="ps-description">{selectedPS.description}</p>
                                        <div className="progress-container">
                                            <div className="progress-info">
                                                <span>MISSION EVOLUTION</span>
                                                <span style={{ color: getProgressColor() }}>{getProgressWidth()} COMPLETE</span>
                                            </div>
                                            <div className="progress-track">
                                                <div className="progress-fill" style={{ width: getProgressWidth(), background: getProgressColor() }}></div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                                            <button className="cyber-action-btn" style={{ padding: '12px 30px', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', background: isSubmitted ? '#10b981' : '#3b82f6' }} onClick={() => setActiveTab('ppt-submission')}>
                                                {isSubmitted ? 'VIEW PPT SUBMISSION ✓' : 'ADD PPT SUBMISSION →'}
                                            </button>
                                            {isSubmitted && (
                                                <button className="cyber-action-btn" style={{ padding: '12px 30px', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', background: isGithubSubmitted ? '#10b981' : '#f59e0b' }} onClick={() => setActiveTab('github-submission')}>
                                                    {isGithubSubmitted ? 'VIEW GITHUB LINK ✓' : 'ADD GITHUB LINK →'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-dashboard-landing">
                                        <div className="grid-bg-overlay"></div>
                                        <div className="landing-content-wrapper">
                                            <div className="round-live-tag">ROUND 01 IS LIVE NOW</div>
                                            <p className="team-details-label">TEAM DETAILS</p>
                                            <h1 className="hero-text"> WELCOME,<br/><span>TEAM ALPHA</span></h1>
                                            <p className="hero-subtext">Congratulations! Your team has been formally selected for <strong>Round 01</strong>. Please initialize your project track and complete the required team documentation.</p>
                                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                <button className="cyber-action-btn-main" onClick={() => setActiveTab('ps-selection')}>
                                                    <span className="btn-glow"></span>START PROJECT SELECTION →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ps-selection' && (
                            <div className="card-inner">
                                {!selectedPS ? (
                                    <PSGallery onSelect={handlePSPreview} />
                                ) : (
                                    <ModuleLocked color="#3b82f6" icon="🔒" title="PROBLEM STATEMENT LOCKED" description="Your team has already committed to a Problem Statement. Initial project parameters are active." />
                                )}
                            </div>
                        )}

                        {activeTab === 'ppt-submission' && (
                            <div className="card-inner">
                                {selectedPS ? (
                                    <PPTSubmission selectedPS={selectedPS} isSubmitted={isSubmitted} onUpload={handleUploadSuccess} templateFile="linux_classactivity.pdf" />
                                ) : (
                                    <ModuleLocked color="#0ea5e9" icon="📂" title="PPT_SUBMISSION_LOCKED" description="Encryption protocols active. Submission parameters unlock after track selection." />
                                )}
                            </div>
                        )}

                        {activeTab === 'github-submission' && (
                            <div className="card-inner">
                                {selectedPS ? (
                                    <GitHubSubmission isSubmitted={isGithubSubmitted} onUpload={handleGithubSuccess} />
                                ) : (
                                    <ModuleLocked 
                                        color="#f59e0b" 
                                        icon={
                                            <div className="radar-container">
                                                <div className="radar-circle circle-1"></div>
                                                <div className="radar-circle circle-2"></div>
                                                <div className="radar-sweep"></div>
                                            </div>
                                        } 
                                        title="GITHUB_SUBMISSION_LOCKED" 
                                        description="Repository link cannot be submitted until a track is selected." 
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .round-live-tag { background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 6px 16px; border-radius: 20px; font-size: 0.7rem; font-weight: 900; margin-bottom: 20px; display: inline-block; animation: pulseGlow 2s infinite; }
                @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 5px #10b981; } 50% { box-shadow: 0 0 15px #10b981; } }
                .empty-dashboard-landing { height: 520px; border-radius: 32px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #0f172a; border: 1px solid rgba(59, 130, 246, 0.15); text-align: center; }
                .team-details-label { color: #3b82f6; font-weight: 900; letter-spacing: 3px; margin-bottom: 10px; }
                .hero-text { font-size: 3.5rem; color: #fff; font-weight: 900; line-height: 1.1; margin-bottom: 20px; }
                .hero-text span { background: linear-gradient(90deg, #3b82f6, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .hero-subtext { color: #94a3b8; max-width: 550px; margin: 0 auto 40px; line-height: 1.7; }
                .cyber-action-btn-main { padding: 18px 50px; border: none; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #3b82f6); background-size: 200% auto; color: white; font-weight: 900; cursor: pointer; transition: 0.4s; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); }
                .cyber-action-btn-main:hover { background-position: right center; transform: translateY(-3px); }
                .btn-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%); animation: rotate 4s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .active-project-card { overflow: hidden; }
                .watermark-text { position: absolute; right: 40px; top: 40px; opacity: 0.05; font-size: 6rem; font-weight: 900; color: #fff; pointer-events: none; }
                .sub-tag { color: #3b82f6; font-weight: 800; font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; }
                .project-heading { color: #fff; font-size: 2.5rem; margin: 10px 0 30px; font-weight: 900; }
                .meta-grid { display: flex; gap: 40px; margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .meta-label { color: #64748b; font-size: 0.7rem; font-weight: 800; margin-bottom: 5px; }
                .meta-value { font-weight: 700; font-size: 1rem; }
                .meta-separator { width: 1px; background: rgba(255,255,255,0.1); }
                .ps-description { color: #94a3b8; line-height: 1.6; font-size: 1rem; margin-bottom: 40px; }
                .progress-container { margin-top: 20px; }
                .progress-info { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 900; letter-spacing: 1px; margin-bottom: 10px; color: #64748b; }
                .progress-track { height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
                .progress-fill { height: 100%; transition: 1s ease-in-out; }
                .locked-module-container { height: 450px; display: flex; align-items: center; justify-content: center; background: rgba(30, 41, 59, 0.5); border-radius: 20px; position: relative; overflow: hidden; }
                .grid-bg-overlay { position: absolute; inset: 0; background-image: radial-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px); background-size: 20px 20px; pointer-events: none; }
                .cyber-action-btn { transition: 0.3s; }
                .cyber-action-btn:hover { opacity: 0.8; transform: translateY(-2px); }

                /* Radar Animation */
                .radar-container { position: relative; width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
                .radar-circle { position: absolute; border: 2px solid #f59e0b; border-radius: 50%; opacity: 0; }
                .circle-1 { width: 40px; height: 40px; animation: radarPulse 2s infinite; }
                .circle-2 { width: 80px; height: 80px; animation: radarPulse 2s infinite 1s; }
                .radar-sweep { position: absolute; width: 40px; height: 40px; border-right: 2px solid #f59e0b; border-radius: 0 100% 0 0; background: conic-gradient(from 0deg, rgba(245, 158, 11, 0.2), transparent 90deg); transform-origin: bottom left; animation: radarSweep 2s linear infinite; top: 0; left: 40px; }
                @keyframes radarPulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(1.2); opacity: 0; } }
                @keyframes radarSweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Selection">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '25px' }}>PROBLEM STATEMENT: <strong>{viewingPS?.title}</strong>?</p>
                    <p>NOTE:- Selection Finalization: Once locked, further modifications will be restricted.</p>
                    <br></br>
                    <button className="cyber-action-btn-main" style={{ width: '100%', padding: '18px 50px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #3b82f6)', color: 'white', fontWeight: '900', cursor: 'pointer' }} onClick={handleConfirmSelection}>LOCK & SUBMIT</button>
                </div>
            </Modal>
        </div>
    );
}