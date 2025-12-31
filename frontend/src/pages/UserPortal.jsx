import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function UserPortal() {
    const [userInfo, setUserInfo] = useState({ team_name: 'Loading...', team_id: '' });

    useEffect(() => {
        // Fetch user info on component mount
        fetch('http://localhost:5000/api/user-info', {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.role === 'student') {
                    setUserInfo({ team_name: data.team_name, team_id: data.team_id });
                }
            })
            .catch(err => console.error('Error fetching user info:', err));
    }, []);
    return (
        <div className="dashboard-page">
            <Navbar
                userInfo={
                    <>
                        Team: <strong>{userInfo.team_name}</strong>
                    </>
                }
                isAdmin={false}
            />

            <main className="dashboard-main" style={{ display: 'block' }}>
                <div className="panel">
                    <div className="panel-inner">
                        <div className="panel-header">
                            <h2 className="panel-title">Your Team Dashboard</h2>
                            <span className="status-pill pass">Active</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                            Welcome to the participant portal. Here you will be able to submit your solutions and track your progress.
                        </p>

                        <div style={{ marginTop: '30px', padding: '20px', border: '1px dashed #334155', borderRadius: '8px', textAlign: 'center' }}>
                            <p>Selection Round is <strong>LIVE</strong></p>
                            <button className="button-primary" style={{ width: 'auto' }}>Select Problem Statement</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
