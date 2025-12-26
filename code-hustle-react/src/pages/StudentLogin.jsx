import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ sapId: '', password: '' });
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

    if (!/^[0-9]{8,12}$/.test(formData.sapId.trim())) {
      newErrors.sapId = true;
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({
        type: 'error',
        text: 'Invalid credentials format. Check SAP ID and password length.'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: 'success', text: 'Login successful. Redirecting…' });
    setTimeout(() => {
      navigate('/student-dashboard');
    }, 900);
  };

  return (
    <main className="page-wrapper">
      <section className="card">
        <div className="card-inner">
          <div className="heading-badge">
            <span className="heading-badge-dot"></span>
            STUDENT ACCESS
          </div>
          <h1 className="heading-main">Enter the Arena</h1>
          <p className="heading-subtitle">
            Use your SAP ID and the password sent to your university email.
            Never share your password publicly or in screenshots.
          </p>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <label className="form-label" htmlFor="sapId">
                SAP ID
              </label>
              <input
                id="sapId"
                name="sapId"
                className={`form-input ${errors.sapId ? 'error' : ''}`}
                type="text"
                value={formData.sapId}
                onChange={handleChange}
                placeholder="SAP ID"
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
                placeholder="Portal password"
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
              Login to Dashboard
            </button>
          </form>

          <div className="status-row">
            <span className="status-chip">
              <span className="status-dot-live"></span>
              Secure session · Prototype
            </span>
            <Link to="/" className="text-link">
              Need to register first?
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
