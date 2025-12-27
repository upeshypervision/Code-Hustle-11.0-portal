import Navbar from '../components/Navbar';

export default function UserPortal() {
    return (
        <div className="dashboard-page">
            <Navbar
                userInfo={
                    <>
                        Role: <strong>Team Leader</strong> · Code Hustle 11
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
