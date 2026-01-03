import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    <main className="page-wrapper">
      <section className="card">
        <div className="card-inner">
          <div className="heading-badge">
            <span className="heading-badge-dot"></span>
            STUDENT ACCESS
          </div>
          <h1 className="heading-main">Enter the Arena</h1>
          <p className="heading-subtitle">
            Use your <strong>Team ID</strong> and the password sent to your
            leader email to enter the arena.
          </p>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <label className="form-label" htmlFor="teamId">
                Team ID
              </label>
              <input
                id="teamId"
                name="teamId"
                className={`form-input ${errors.teamId ? "error" : ""}`}
                type="text"
                value={formData.teamId}
                onChange={handleChange}
                placeholder="e.g., CH-TEAM-001"
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                className={`form-input ${errors.password ? "error" : ""}`}
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Team password"
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
              Secure · Team Access
            </span>
            <Link to="/" className="text-link">
              Register New Team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
