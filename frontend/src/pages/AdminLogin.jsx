import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Registration.css'; // Ensuring we keep the good UI styles

export default function AdminLogin() {
  const navigate = useNavigate();
  
  // 1. STATE: Using the robust state management from your "Good Logic" file
  const [formData, setFormData] = useState({ adminId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. HANDLER: Handling changes and clearing specific field errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear global message when user types
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  // 3. SUBMIT: The robust API call with credentials and specific body mapping
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CRITICAL: Allows browser to store the cookie
        credentials: 'include', 
        body: JSON.stringify({
          login_id: formData.adminId, // Mapping adminId to login_id as per backend requirement
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Access granted. Redirecting...' });
        // Small delay so user sees the success message before redirect
        setTimeout(() => navigate('/admin-panel'), 900);
      } else {
        setMessage({ type: 'error', text: data.error || 'Login failed' });
        setIsSubmitting(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-viewport">
      {/* Background Elements */}
      <div className="cosmic-bg">
        <div className="nebula-cloud-blue"></div>
        <div className="nebula-cloud-purple"></div>
        <div className="starfield"></div>
      </div>

      <div className="portal-card animate-in">
        <header className="brand-header">
          <div className="hypervision-badge">HYPERVISION</div>
          <p className="presents-text">ADMINISTRATION</p>
          <h1 className="main-logo syncopate-font">ADMIN <span className="v-tag">PORTAL</span></h1>
        </header>

        {/* Global Message Banner (Success or Error) */}
        {message.text && (
          <div 
            className="global-error-banner" 
            style={{ 
              backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderColor: message.type === 'success' ? '#10b981' : '#ef4444',
              color: message.type === 'success' ? '#10b981' : '#ef4444'
            }}
          >
            {message.text}
          </div>
        )}

        <div className="animate-in">
          <span className="label-detail">SECURE LOGIN</span>

          <form onSubmit={handleSubmit}>
            {/* Admin ID Input */}
            <div className="input-group">
              <div className="label-row"><span>Admin ID</span></div>
              <div className={`glow-input-container ${errors.adminId || message.type === 'error' ? 'error-border' : ''}`}>
                <input
                  className="glow-input"
                  name="adminId" // Matches state name
                  type="text"
                  placeholder="e.g., hypervision-core"
                  value={formData.adminId}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="label-row"><span>Password</span></div>
              <div className={`glow-input-container ${errors.password || message.type === 'error' ? 'error-border' : ''}`}>
                <input
                  className="glow-input"
                  name="password"
                  type="password"
                  placeholder="Secret Key"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="neon-shade-btn next-glow" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
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