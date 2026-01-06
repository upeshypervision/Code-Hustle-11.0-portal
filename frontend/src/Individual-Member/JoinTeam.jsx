import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Registration.css";
import "../pages/CreateTeam.css";

const JoinTeam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    university: "",
    sapId: "",
    mobile: "",
    email: "",
    vision: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, validation and API call would go here
    // For now, pass data to the dashboard via state
    navigate("/individual-member/dashboard", {
      state: { userDetails: formData },
    });
  };

  return (
    <div className="app-viewport forge-container">
      <div className="cosmic-bg">
        <div className="nebula-cloud-blue"></div>
        <div className="nebula-cloud-purple"></div>
        <div className="starfield"></div>
      </div>

      <div className="portal-card animate-in forge-card">
        <header className="brand-header">
          <div className="hypervision-badge">HYPERVISION</div>
          <p className="presents-text">CODE-HUSTLE-11.0</p>
          <h2 style={{ marginTop: "20px", color: "#fff" }}>Join a Team</h2>
        </header>

        <div className="morph-interface">
          <div className="neural-node node-materialize">
            <span className="label-detail">ENTER YOUR DETAILS</span>

            <div className="input-group">
              <div className="label-row">
                <span>
                  FULL NAME <span className="v-tag">*</span>
                </span>
              </div>
              <div className="glow-input-container">
                <input
                  className="glow-input"
                  name="fullName"
                  placeholder="Enter Your Name..."
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: "12px" }}>
              <div className="label-row">
                <span>
                  UNIVERSITY <span className="v-tag">*</span>
                </span>
              </div>
              <div className="glow-input-container">
                <input
                  className="glow-input"
                  name="university"
                  placeholder="University Name..."
                  value={formData.university}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: "12px" }}>
              <div className="label-row">
                <span>
                  SAP ID / ROLL NO <span className="v-tag">*</span>
                </span>
              </div>
              <div className="glow-input-container">
                <input
                  className="glow-input"
                  name="sapId"
                  placeholder="ID..."
                  value={formData.sapId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: "12px" }}>
              <div className="label-row">
                <span>
                  CONTACT DETAILS <span className="v-tag">*</span>
                </span>
              </div>
              <div
                className="dual-glow-capsule"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  className="capsule-input-left"
                  style={{ flex: 1, minWidth: 0 }}
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <div className="capsule-divider"></div>
                <input
                  className="capsule-input-right"
                  style={{ flex: 1, minWidth: 0 }}
                  name="mobile"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: "12px" }}>
              <div className="label-row">
                <span>
                  YOUR VISION <span className="v-tag">*</span>
                </span>
              </div>
              <div className="glow-input-container">
                <textarea
                  className="glow-input"
                  rows="2"
                  name="vision"
                  placeholder="What are you looking for?"
                  value={formData.vision}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <button
              className="neon-shade-btn next-glow"
              onClick={handleSubmit}
              style={{ marginTop: "20px", width: "100%" }}
            >
              FIND TEAMS ❯
            </button>
          </div>
        </div>
        <footer className="footer-links-clean" style={{ marginTop: "30px" }}>
          <button className="back-link-forge" onClick={() => navigate("/")}>
            [ ABORT_TO_GATEWAY ]
          </button>
        </footer>
      </div>
    </div>
  );
};

export default JoinTeam;
