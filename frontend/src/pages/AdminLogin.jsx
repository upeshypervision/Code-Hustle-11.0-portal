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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.adminId.trim()) {
      newErrors.adminId = true;
    }
    if (!formData.password || formData.password.length < 10) {
      newErrors.password = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({
        type: 'error',
        text: 'Please provide a valid admin ID and sufficiently strong password.'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: 'success', text: 'Admin login successful. Redirecting…' });
    setTimeout(() => {
      navigate('/admin-panel');
    }, 900);
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
            <span className="status-chip">
              <span className="status-dot-live"></span>
              Access logged · Prototype
            </span>
            <Link to="/student-login" className="text-link">
              Go to student login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
