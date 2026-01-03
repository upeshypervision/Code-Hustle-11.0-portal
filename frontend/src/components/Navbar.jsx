import { useNavigate } from 'react-router-dom';

export default function Navbar({ userInfo, isAdmin = false }) {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5001/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            navigate(isAdmin ? '/admin-login' : '/userlogin');
        }
    };

    return (
        <header className="top-nav">
            <div className="top-nav-inner">
                <div className="logo-container">
                    <img
                        src="/hypervision-logo.png"
                        alt="Hypervision Logo"
                        className="logo-img"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <div className="logo-mark" style={{ display: 'none' }}></div>
                    <div>
                        <div className="logo-text">Code Hustle</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                            {isAdmin ? 'Admin Panel' : 'Student Dashboard'}
                        </div>
                    </div>
                </div>
                <div className="nav-right">
                    <div className="nav-user">
                        {userInfo}
                    </div>
                    <button className="nav-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}