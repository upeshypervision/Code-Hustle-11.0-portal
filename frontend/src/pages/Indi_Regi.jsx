import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registration.css";
import "./Team_Regi.css";
import "./Indi_Regi.css";

const Indi_Regi = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valErrors, setValErrors] = useState({});

  // --- NEW STATE FOR TERMS AGREEMENT ---
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    universityType: "",
    sapid: "",
    email: "",
    phone: "",
    hypervisionId: "",
  });

  const API_BASE = "http://localhost:5001";

  const validateField = (name, value, uType) => {
    if (!value.trim() && name !== "hypervisionId") return "Required Field";

    if (name === "email" && !value.includes("@")) return "Invalid email";

    if (name === "phone" && value.length !== 10) return "10 digits required";

    if (name === "sapid" && uType === "upes") {
      if (!/^\d{9}$/.test(value)) return "SAP ID must be 9 digits";
    }

    return "";
  };

  const handleBlur = (field, value) => {
    const error = validateField(
      field,
      value,
      formData.universityType.toLowerCase()
    );
    setValErrors((prev) => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    const uType = formData.universityType.toLowerCase();

    if (!formData.fullName.trim()) return false;
    if (!formData.bio.trim()) return false;
    if (!uType) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;

    // CHECKBOX VALIDATION
    if (!agreedToTerms) return false;

    if (uType === "upes") {
      if (!formData.sapid.trim()) return false;
      if (validateField("sapid", formData.sapid, uType)) return false;
    } else {
      if (!formData.sapid.trim()) return false;
    }

    if (validateField("email", formData.email, uType)) return false;
    if (validateField("phone", formData.phone, uType)) return false;
    if (validateField("hypervisionId", formData.hypervisionId, uType))
      return false;

    return true;
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!isFormValid()) {
      console.log("Form is invalid according to current rules");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        about: formData.bio.trim(),
        universityType: formData.universityType.toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        hypervisionId: formData.hypervisionId.trim(),
      };

      if (payload.universityType === "upes") {
        payload.sapid = formData.sapid.trim();
      } else {
        payload.collegeName = formData.sapid.trim();
      }

      console.log("Sending payload:", payload);

      const response = await fetch(`${API_BASE}/api/register-individual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      const result = await response.json();
      console.log("Response ", result);

      if (response.ok && result.success) {
        // Print credentials to console
        console.log("Individual ID:", result.individual_id);
        console.log("Password:", result.password);

        setIsSubmitted(true);
      } else {
        const errorMsg =
          result.error ||
          `Registration failed. Server responded with status: ${response.status}`;

        // Map backend errors to field errors
        if (errorMsg.toLowerCase().includes("phone")) {
          setValErrors((prev) => ({ ...prev, phone: errorMsg }));
        } else if (errorMsg.toLowerCase().includes("sap id")) {
          setValErrors((prev) => ({ ...prev, sapid: errorMsg }));
        }

        alert(errorMsg);
      }
    } catch (error) {
      console.error("Error joining individually:", error);
      alert("An unexpected error occurred during joining. Please try again.");
    } finally {
      if (!isSubmitted) {
        setIsSubmitting(false);
      }
    }
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
        </header>

        <div className="morph-interface">
          {!isSubmitted ? (
            <div className="neural-node node-materialize animate-in">
              <span className="label-detail">NODE: PARTICIPANT PROFILE</span>

              <div className="input-group">
                <div className="label-row">
                  <span>
                    FULL NAME <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`glow-input-container animated-field ${
                    valErrors.fullName ? "error-border" : ""
                  }`}
                >
                  <input
                    className="glow-input"
                    placeholder="Enter your name..."
                    value={formData.fullName}
                    maxLength={100}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    onBlur={(e) => handleBlur("fullName", e.target.value)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "4px",
                  }}
                >
                  {valErrors.fullName ? (
                    <p className="error-message-inline" style={{ margin: 0 }}>
                      {valErrors.fullName}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        formData.fullName.length >= 100
                          ? "#ef4444"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {formData.fullName.length}/100
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "12px" }}>
                <div className="label-row">
                  <span>
                    ABOUT & SKILLS <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`glow-input-container animated-field ${
                    valErrors.bio ? "error-border" : ""
                  }`}
                >
                  <textarea
                    className="glow-input"
                    rows="3"
                    placeholder="Tell us about your technical stack and skills..."
                    value={formData.bio}
                    maxLength={500}
                    onChange={(e) => updateField("bio", e.target.value)}
                    onBlur={(e) => handleBlur("bio", e.target.value)}
                  ></textarea>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "4px",
                  }}
                >
                  {valErrors.bio ? (
                    <p className="error-message-inline" style={{ margin: 0 }}>
                      {valErrors.bio}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        formData.bio.length >= 500
                          ? "#ef4444"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {formData.bio.length}/500
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "12px" }}>
                <div className="label-row">
                  <span>
                    UNIVERSITY <span className="v-tag">*</span>
                  </span>
                </div>
                <div className="glow-input-container animated-field">
                  <select
                    className="glow-input"
                    value={formData.universityType}
                    onChange={(e) =>
                      updateField(
                        "universityType",
                        e.target.value.toLowerCase()
                      )
                    }
                  >
                    <option value="">Select</option>
                    <option value="upes">UPES</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>

              {formData.universityType && (
                <div className="input-group" style={{ marginTop: "12px" }}>
                  <div className="label-row">
                    <span>
                      {formData.universityType === "upes"
                        ? "SAP ID"
                        : "UNIVERSITY NAME"}
                      <span className="v-tag">*</span>
                    </span>
                  </div>
                  <div
                    className={`glow-input-container animated-field ${
                      valErrors.sapid ? "error-border" : ""
                    }`}
                  >
                    <input
                      className="glow-input"
                      placeholder={
                        formData.universityType === "upes"
                          ? "9 Digits"
                          : "Enter University Name"
                      }
                      value={formData.sapid}
                      maxLength={formData.universityType === "upes" ? 9 : 200}
                      onChange={(e) => updateField("sapid", e.target.value)}
                      onBlur={(e) => handleBlur("sapid", e.target.value)}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "4px",
                    }}
                  >
                    {valErrors.sapid ? (
                      <p className="error-message-inline" style={{ margin: 0 }}>
                        {valErrors.sapid}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color:
                          formData.sapid.length >=
                          (formData.universityType === "upes" ? 9 : 200)
                            ? "#ef4444"
                            : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {formData.sapid.length}/
                      {formData.universityType === "upes" ? 9 : 200}
                    </span>
                  </div>
                </div>
              )}

              <div className="input-group" style={{ marginTop: "12px" }}>
                <div className="label-row">
                  <span>HYPERVISION ID (Optional)</span>
                </div>
                <div
                  className={`glow-input-container animated-field ${
                    valErrors.hypervisionId ? "error-border" : ""
                  }`}
                >
                  <input
                    className="glow-input"
                    placeholder="HYPEXXXX"
                    value={formData.hypervisionId}
                    maxLength={8}
                    onChange={(e) =>
                      updateField("hypervisionId", e.target.value)
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "4px",
                  }}
                >
                  {formData.hypervisionId && valErrors.hypervisionId ? (
                    <p className="error-message-inline" style={{ margin: 0 }}>
                      {valErrors.hypervisionId}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        formData.hypervisionId.length >= 8
                          ? "#ef4444"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {formData.hypervisionId.length}/8
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "12px" }}>
                <div className="label-row">
                  <span>
                    CONTACT DETAILS <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`dual-glow-capsule animated-field ${
                    valErrors.email || valErrors.phone ? "error-border" : ""
                  }`}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <input
                    className="capsule-input-left"
                    placeholder="Email Address"
                    value={formData.email}
                    maxLength={100}
                    onChange={(e) => updateField("email", e.target.value)}
                    onBlur={(e) => handleBlur("email", e.target.value)}
                  />
                  <div className="capsule-divider"></div>
                  <input
                    className="capsule-input-right"
                    placeholder="Phone"
                    value={formData.phone}
                    maxLength={10}
                    onChange={(e) => updateField("phone", e.target.value)}
                    onBlur={(e) => handleBlur("phone", e.target.value)}
                  />
                </div>
                {(valErrors.email || valErrors.phone) && (
                  <p className="error-message-inline">
                    {valErrors.email || valErrors.phone}
                  </p>
                )}
              </div>

              {/* --- TERMS CHECKBOX--- */}
              <div
                className="input-group"
                style={{
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="agree-indi"
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label
                  htmlFor="agree-indi"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontFamily: "Orbitron",
                  }}
                >
                  I AGREE TO ALL{" "}
                  <a
                    href="https://codehustle11.upeshypervision.in/#terms-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#38bdf8", textDecoration: "underline" }}
                  >
                    TERMS AND CONDITIONS
                  </a>
                  .
                </label>
              </div>

              <div className="forge-btn-group" style={{ marginTop: "30px" }}>
                <button
                  className={`liquid-btn animated-btn ${
                    !isFormValid() || isSubmitting ? "btn-locked" : ""
                  }`}
                  style={{ width: "100%", padding: "18px" }}
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                >
                  {isSubmitting ? "JOINING..." : "JOIN & CONNECT ❯"}
                </button>
              </div>
            </div>
          ) : (
            /* SUCCESS PAGE VIEW */
            <div className="neural-node node-materialize animate-in success-node">
              <div
                className="completion-vfx"
                style={{ textAlign: "center", padding: "20px 0" }}
              >
                <h2 className="glow-status-text">JOINED SUCCESSFULLY!</h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#fff",
                    opacity: 0.9,
                    lineHeight: "1.8",
                  }}
                >
                  Your registration is complete!
                  <br />
                  <strong style={{ color: "#10b981" }}>
                    Individual credentials
                  </strong>{" "}
                  have been sent to your registered email address.
                </p>
                <p
                  style={{
                    marginTop: "10px",
                    opacity: 0.7,
                    fontSize: "13px",
                    color: "#cbd5e1",
                    lineHeight: "1.6",
                  }}
                >
                  Use them to login to the User Portal.
                </p>
              </div>
              <div className="forge-btn-group" style={{ marginTop: "30px" }}>
                <button
                  className="liquid-btn animated-btn"
                  style={{ width: "100%", padding: "18px" }}
                  onClick={() => navigate("/individual-login")}
                >
                  LOG IN ❯
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Indi_Regi;
