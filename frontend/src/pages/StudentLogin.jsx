import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Registration.css"; // Reusing the same CSS for consistency

export default function StudentLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ teamId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.teamId.trim()) {
      newErrors.teamId = true;
    }
    if (!formData.password || formData.password.length < 5) {
      newErrors.password = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({
        type: "error",
        text: "Please enter a valid Team ID and Password.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5001/api/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          team_id: formData.teamId,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Login successful. Entering the arena...",
        });
        setTimeout(() => {
          navigate("/Arena");
        }, 800);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Invalid credentials",
        });
        setIsSubmitting(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Unable to connect to server." });
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
          <p className="presents-text">PRESENTS</p>
          <h1 className="main-logo syncopate-font">
            CODE HUSTLE <span className="v-tag">11.0</span>
          </h1>
        </header>

        {message.text && (
          <div
            className={`global-error-banner`}
            style={{
              borderColor: message.type === "success" ? "#10b981" : "#ff4d4d",
              color: message.type === "success" ? "#10b981" : "#ff4d4d",
              background:
                message.type === "success"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(255, 77, 77, 0.1)",
            }}
          >
            {message.text}
          </div>
        )}

        <div className="animate-in">
          <span className="label-detail">ENTER YOUR ARENA</span>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="label-row">
                <span>Team ID</span>
              </div>
              <div
                className={`glow-input-container ${
                  errors.teamId ? "error-border" : ""
                }`}
              >
                <input
                  className="glow-input"
                  name="teamId"
                  placeholder="e.g., CodeHustleXXX"
                  value={formData.teamId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <span>Password</span>
              </div>
              <div
                className={`glow-input-container ${
                  errors.password ? "error-border" : ""
                }`}
              >
                <input
                  className="glow-input"
                  name="password"
                  type="password"
                  placeholder="Team password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="neon-shade-btn next-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "ENTERING..." : "LOGIN TO DASHBOARD"}
            </button>
          </form>
        </div>

        <footer className="footer-links">
          <Link to="/register" className="footer-btn">
            Register New Team
          </Link>
          <a
            href="https://code-hustle-11.vercel.app/#contact"
            className="footer-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact Us
          </a>
        </footer>
      </div>
    </div>
  );
}
