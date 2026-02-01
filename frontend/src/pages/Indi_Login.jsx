import { useState } from "react";
import { useNavigate } from "react-router-dom";
import indiLoginBg from "../assets/indi-login-bg.png";
import "./Registration.css"; // Reusing the same CSS for consistency

export default function Indi_Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ individualId: "", password: "" });
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

    if (!formData.individualId.trim()) {
      newErrors.individualId = true;
    }
    if (!formData.password || formData.password.length < 5) {
      newErrors.password = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({
        type: "error",
        text: "Please enter a valid Individual ID and Password.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        "http://localhost:5000/api/individual-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            individual_id: formData.individualId,
            password: formData.password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Login successful. Redirecting...",
        });
        setTimeout(() => {
          navigate("/indimember");
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
      <div
        className="cosmic-bg"
        style={{
          backgroundImage: `url(${indiLoginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div
        className="portal-card animate-in"
        style={{ backgroundColor: "#0f172a" }}
      >
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
          <span className="label-detail">INDIVIDUAL ACCESS TERMINAL</span>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="label-row">
                <span>Individual ID</span>
              </div>
              <div
                className={`glow-input-container ${
                  errors.individualId ? "error-border" : ""
                }`}
              >
                <input
                  className="glow-input"
                  name="individualId"
                  placeholder="e.g., IND001"
                  value={formData.individualId}
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
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="neon-shade-btn next-glow"
              style={{
                background: "linear-gradient(270deg, #2563eb 0%, #dc2626 100%)",
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "VERIFYING..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
