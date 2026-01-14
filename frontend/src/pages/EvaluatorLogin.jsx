import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Registration.css"; // Reusing established styles

export default function EvaluatorLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        "http://localhost:5000/api/evaluator-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Access granted. Redirecting..." });
        // Redirect to a dashboard or home for now, as specific dashboard wasn't requested yet
        setTimeout(() => navigate("/evaluator-dashboard"), 900);
      } else {
        setMessage({ type: "error", text: data.error || "Login failed" });
        setIsSubmitting(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-viewport">
      <div className="cosmic-bg">
        <div className="nebula-cloud-blue"></div>
        <div className="nebula-cloud-purple"></div>
        <div className="starfield"></div>
      </div>

      <div className="portal-card animate-in">
        <header className="brand-header">
          <div className="hypervision-badge">HYPERVISION</div>
          <p className="presents-text">EVALUATION</p>
          <h1 className="main-logo syncopate-font">
            EVALUATOR <span className="v-tag">PORTAL</span>
          </h1>
        </header>

        {message.text && (
          <div
            className="global-error-banner"
            style={{
              backgroundColor:
                message.type === "success"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              borderColor: message.type === "success" ? "#10b981" : "#ef4444",
              color: message.type === "success" ? "#10b981" : "#ef4444",
            }}
          >
            {message.text}
          </div>
        )}

        <div className="animate-in">
          <span className="label-detail">SECURE ACCESS</span>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="label-row">
                <span>Username</span>
              </div>
              <div
                className={`glow-input-container ${
                  errors.username || message.type === "error"
                    ? "error-border"
                    : ""
                }`}
              >
                <input
                  className="glow-input"
                  name="username"
                  type="text"
                  placeholder="Evaluator Username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <span>Password</span>
              </div>
              <div
                className={`glow-input-container ${
                  errors.password || message.type === "error"
                    ? "error-border"
                    : ""
                }`}
              >
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

            <button
              type="submit"
              className="neon-shade-btn next-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "AUTHENTICATING..." : "ACCESS PANEL"}
            </button>
          </form>
        </div>

        <footer className="footer-links">
          <Link to="/admin-login" className="footer-btn">
            Admin Login
          </Link>
          <Link to="/" className="footer-btn">
            Home
          </Link>
        </footer>
      </div>
    </div>
  );
}
