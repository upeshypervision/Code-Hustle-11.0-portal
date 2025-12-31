import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ adminId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Inside AdminLogin.js - Updating handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CRITICAL: This allows the browser to receive and store the cookie
        credentials: 'include',
        body: JSON.stringify({
          login_id: formData.adminId,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Access granted. Redirecting...' });
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
    <main className="page-wrapper">
      <section className="card">
        <div className="card-inner">
          <div className="heading-badge">
            <span className="heading-badge-dot"></span>
            ADMIN CONTROL
          </div>
          <h1 className="heading-main">Hypervision Console</h1>
          <p className="heading-subtitle">
            Restricted area for organizing team members only.
          </p>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <label className="form-label" htmlFor="adminId">
                Admin ID
              </label>
              <input
                id="adminId"
                name="adminId"
                className={`form-input ${errors.adminId ? 'error' : ''}`}
                type="text"
                value={formData.adminId}
                onChange={handleChange}
                placeholder="e.g., hypervision-core"
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Admin password"
              />
            </div>

            {message.text && (
              <div className={`message-box ${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              Enter Admin Panel
            </button>
          </form>

          <div className="status-row">
            <Link to="/userlogin" className="text-link">
              Go to student login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
