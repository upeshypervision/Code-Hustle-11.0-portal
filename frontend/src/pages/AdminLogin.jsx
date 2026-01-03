import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Registration.css'; // Reusing consistency

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/admin-panel');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-viewport">
      <div className="cosmic-bg"><div className="nebula-cloud-blue"></div><div className="nebula-cloud-purple"></div><div className="starfield"></div></div>

      <div className="portal-card animate-in">
        <header className="brand-header">
          <div className="hypervision-badge">HYPERVISION</div>
          <p className="presents-text">ADMINISTRATION</p>
          <h1 className="main-logo syncopate-font">ADMIN <span className="v-tag">PORTAL</span></h1>
        </header>

        {error && (
          <div className="global-error-banner">
            {error}
          </div>
        )}

        <div className="animate-in">
          <span className="label-detail">SECURE LOGIN</span>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="label-row"><span>Username</span></div>
              <div className={`glow-input-container ${error ? 'error-border' : ''}`}>
                <input
                  className="glow-input"
                  name="username"
                  placeholder="Admin Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row"><span>Password</span></div>
              <div className={`glow-input-container ${error ? 'error-border' : ''}`}>
                <input
                  className="glow-input"
                  name="password"
                  type="password"
                  placeholder="Secret Key"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="neon-shade-btn next-glow" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
            </button>
          </form>
        </div>

        <footer className="footer-links">
          <Link to="/userlogin" className="footer-btn">Student Login</Link>
          <Link to="/" className="footer-btn">Home</Link>
        </footer>
      </div>
    </div>
  );
}
