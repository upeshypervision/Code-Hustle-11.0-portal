import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Registration.css";
import "./Team_Regi.css";

const Team_Regi = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [valErrors, setValErrors] = useState({});

  // --- 1. NEW STATE TO PREVENT DOUBLE CLICK ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW STATE FOR PER-PAGE TERMS AGREEMENT ---
  const [agreements, setAgreements] = useState({
    leader: false,
    m1: false,
    m2: false,
    m3: false,
  });

  // --- NEW EFFECT: RESET AGREEMENTS ON STEP CHANGE ---
  useEffect(() => {
    setAgreements({
      leader: false,
      m1: false,
      m2: false,
      m3: false,
    });
  }, [step]);

  // Initial state for Leader + 3 Members
  const [formData, setFormData] = useState({
    tName: "",
    tBio: "",
    lName: "",
    lAbout: "",
    sap: "",
    phone: "",
    email: "",
    universityType: "",
    m1: {
      fullName: "",
      sapid: "",
      email: "",
      phone: "",
      universityType: "",
      bio: "",
    },
    m2: {
      fullName: "",
      sapid: "",
      email: "",
      phone: "",
      universityType: "",
      bio: "",
    },
    m3: {
      fullName: "",
      sapid: "",
      email: "",
      phone: "",
      universityType: "",
      bio: "",
    },
  });

  const API_BASE = "http://localhost:5001";

  // --- UPDATED VALIDATION LOGIC ---
  const validateField = (name, value, uType, currentMemberKey) => {
    if (!value) return "Required Field";

    // 1. Email Format & Uniqueness Check
    if (name === "email") {
      if (!value.includes("@")) return "Invalid format";

      const allEmails = [
        { key: "leader", val: formData.email },
        { key: "m1", val: formData.m1.email },
        { key: "m2", val: formData.m2.email },
        { key: "m3", val: formData.m3.email },
      ];

      const duplicate = allEmails.find(
        (item) =>
          item.val.toLowerCase() === value.toLowerCase() &&
          item.val !== "" &&
          item.key !== currentMemberKey
      );

      if (duplicate) return "Email already used in team";
    }

    // 2. Phone Length & Uniqueness Check
    if (name === "phone") {
      if (value.length !== 10) return "10 digits required";

      const allPhones = [
        { key: "leader", val: formData.phone },
        { key: "m1", val: formData.m1.phone },
        { key: "m2", val: formData.m2.phone },
        { key: "m3", val: formData.m3.phone },
      ];

      const duplicate = allPhones.find(
        (item) =>
          item.val === value && item.val !== "" && item.key !== currentMemberKey
      );

      if (duplicate) return "Phone already used in team";
    }

    // 3. SAP ID Uniqueness Check (Only if University is UPES)
    if (name === "sap" || name === "sapid") {
      if (uType === "UPES") {
        if (value.length !== 9) return "Must be 9 digits";

        const allSaps = [
          { key: "leader", val: formData.sap },
          { key: "m1", val: formData.m1.sapid },
          { key: "m2", val: formData.m2.sapid },
          { key: "m3", val: formData.m3.sapid },
        ];
        const duplicate = allSaps.find(
          (s) => s.val === value && s.val !== "" && s.key !== currentMemberKey
        );
        if (duplicate) return "SAP ID already used";
      }
    }
    return "";
  };

  const handleBlur = (field, value, uType, mKey) => {
    const error = validateField(field, value, uType, mKey);
    setValErrors((prev) => ({ ...prev, [`${mKey}_${field}`]: error }));
  };

  const isMemberValid = (mKey) => {
    const m = formData[mKey];
    const emailErr = validateField("email", m.email, null, mKey);
    const phoneErr = validateField("phone", m.phone, null, mKey);
    const sapErr = validateField("sapid", m.sapid, m.universityType, mKey);

    return (
      m.fullName &&
      m.bio &&
      m.universityType &&
      m.sapid &&
      !emailErr &&
      !phoneErr &&
      !sapErr
    );
  };

  const isInitialFormValid = () => {
    const sapErr = validateField(
      "sap",
      formData.sap,
      formData.universityType,
      "leader"
    );
    const emailErr = validateField("email", formData.email, null, "leader");
    const phoneErr = validateField("phone", formData.phone, null, "leader");

    return (
      formData.tName.trim() !== "" &&
      formData.tBio.trim() !== "" &&
      formData.lName.trim() !== "" &&
      formData.lAbout.trim() !== "" &&
      formData.universityType !== "" &&
      !sapErr &&
      !emailErr &&
      !phoneErr
    );
  };

  const updateMember = (mKey, field, value) => {
    setFormData({ ...formData, [mKey]: { ...formData[mKey], [field]: value } });
  };

  const submitCreateTeam = async () => {
    if (isSubmitting) return;

    const currentKey =
      step === 1 ? "leader" : step === 4 ? "m1" : step === 5 ? "m2" : "m3";
    if (!agreements[currentKey]) return;

    if (step === 1 && !isInitialFormValid()) return;
    if (step > 1 && !isMemberValid(currentKey)) return;

    setIsSubmitting(true);

    try {
      const payloadToSend = {
        tName: formData.tName.trim(),
        tBio: formData.tBio.trim(),
        lName: formData.lName.trim(),
        lAbout: formData.lAbout.trim(),
        universityType: formData.universityType,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        sap: formData.sap.trim(),
        m1: formData.m1,
        m2: formData.m2,
        m3: formData.m3,
      };

      const response = await fetch(`${API_BASE}/api/create-team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsSubmitting(false);
        alert(data.error || "Something went wrong");
        return;
      }

      setStep(8);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert("Server not reachable");
    }
  };

  const renderMemberPage = (mKey, label, nextStep) => (
    <div className="neural-node node-materialize animate-in">
      <span className="label-detail">{label}</span>
      <div className="input-group">
        <div className="label-row">
          <span>
            FULL NAME <span className="v-tag">*</span>
          </span>
        </div>
        <div
          className={`glow-input-container animated-field ${
            valErrors[`${mKey}_fullName`] ? "error-border" : ""
          }`}
        >
          <input
            className="glow-input"
            placeholder="Member Name..."
            value={formData[mKey].fullName}
            maxLength={100}
            onChange={(e) => updateMember(mKey, "fullName", e.target.value)}
            onBlur={(e) => handleBlur("fullName", e.target.value, null, mKey)}
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
          {valErrors[`${mKey}_fullName`] ? (
            <p className="error-message-inline" style={{ margin: 0 }}>
              {valErrors[`${mKey}_fullName`]}
            </p>
          ) : (
            <span></span>
          )}
          <span
            style={{
              fontSize: "0.7rem",
              color:
                formData[mKey].fullName.length >= 100
                  ? "#ef4444"
                  : "rgba(255,255,255,0.3)",
            }}
          >
            {formData[mKey].fullName.length}/100
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
            valErrors[`${mKey}_bio`] ? "error-border" : ""
          }`}
        >
          <textarea
            className="glow-input"
            rows="2"
            placeholder="Technical stack, skills..."
            value={formData[mKey].bio}
            maxLength={500}
            onChange={(e) => updateMember(mKey, "bio", e.target.value)}
            onBlur={(e) => handleBlur("bio", e.target.value, null, mKey)}
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
          {valErrors[`${mKey}_bio`] ? (
            <p className="error-message-inline" style={{ margin: 0 }}>
              {valErrors[`${mKey}_bio`]}
            </p>
          ) : (
            <span></span>
          )}
          <span
            style={{
              fontSize: "0.7rem",
              color:
                formData[mKey].bio.length >= 500
                  ? "#ef4444"
                  : "rgba(255,255,255,0.3)",
            }}
          >
            {formData[mKey].bio.length}/500
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
            value={formData[mKey].universityType}
            onChange={(e) =>
              updateMember(mKey, "universityType", e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="UPES">UPES</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      {formData[mKey].universityType && (
        <div className="input-group" style={{ marginTop: "12px" }}>
          <div className="label-row">
            <span>
              {formData[mKey].universityType === "UPES"
                ? "SAP ID"
                : "UNIVERSITY NAME"}{" "}
              <span className="v-tag">*</span>
            </span>
          </div>
          <div
            className={`glow-input-container animated-field ${
              valErrors[`${mKey}_sapid`] ? "error-border" : ""
            }`}
          >
            <input
              className="glow-input"
              placeholder={
                formData[mKey].universityType === "UPES"
                  ? "Enter Your SAP ID"
                  : "Enter your University Name"
              }
              value={formData[mKey].sapid}
              maxLength={formData[mKey].universityType === "UPES" ? 9 : 200}
              onChange={(e) => updateMember(mKey, "sapid", e.target.value)}
              onBlur={(e) =>
                handleBlur(
                  "sapid",
                  e.target.value,
                  formData[mKey].universityType,
                  mKey
                )
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
            {valErrors[`${mKey}_sapid`] ? (
              <p className="error-message-inline" style={{ margin: 0 }}>
                {valErrors[`${mKey}_sapid`]}
              </p>
            ) : (
              <span></span>
            )}
            <span
              style={{
                fontSize: "0.7rem",
                color:
                  formData[mKey].sapid.length >=
                  (formData[mKey].universityType === "UPES" ? 9 : 200)
                    ? "#ef4444"
                    : "rgba(255,255,255,0.3)",
              }}
            >
              {formData[mKey].sapid.length}/
              {formData[mKey].universityType === "UPES" ? 9 : 200}
            </span>
          </div>
        </div>
      )}

      <div className="input-group" style={{ marginTop: "12px" }}>
        <div className="label-row">
          <span>
            CONTACT <span className="v-tag">*</span>
          </span>
        </div>
        <div
          className={`dual-glow-capsule animated-field ${
            valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]
              ? "error-border"
              : ""
          }`}
          style={{ display: "flex", alignItems: "center" }}
        >
          <input
            className="capsule-input-left"
            placeholder="Email"
            value={formData[mKey].email}
            maxLength={100}
            onChange={(e) => updateMember(mKey, "email", e.target.value)}
            onBlur={(e) => handleBlur("email", e.target.value, null, mKey)}
          />
          <div className="capsule-divider"></div>
          <input
            className="capsule-input-right"
            placeholder="Phone"
            value={formData[mKey].phone}
            maxLength={10}
            onChange={(e) => updateMember(mKey, "phone", e.target.value)}
            onBlur={(e) => handleBlur("phone", e.target.value, null, mKey)}
          />
        </div>
        {(valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]) && (
          <p className="error-message-inline">
            {valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]}
          </p>
        )}
      </div>

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
          id={`agree-${mKey}`}
          style={{ width: "18px", height: "18px", cursor: "pointer" }}
          checked={agreements[mKey]}
          onChange={(e) =>
            setAgreements({ ...agreements, [mKey]: e.target.checked })
          }
        />
        <label
          htmlFor={`agree-${mKey}`}
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

      <div
        className="forge-btn-group"
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="liquid-btn"
            style={{ flex: nextStep ? 0.3 : 1 }}
            onClick={() => {
              setStep((prev) => (prev === 4 ? 1 : prev - 1));
            }}
          >
            BACK
          </button>

          {nextStep && (
            <button
              className={`liquid-btn animated-btn ${
                !isMemberValid(mKey) ? "btn-locked" : ""
              }`}
              style={{ flex: 1 }}
              onClick={() => {
                if (isMemberValid(mKey)) {
                  setStep(nextStep);
                }
              }}
            >
              NEXT MEMBER ❯
            </button>
          )}
        </div>

        <button
          className={`liquid-btn animated-btn submit-connect-btn ${
            !isMemberValid(mKey) || isSubmitting || !agreements[mKey]
              ? "btn-locked"
              : ""
          }`}
          style={{
            width: "100%",
            padding: "15px",
            cursor:
              isSubmitting || !isMemberValid(mKey) || !agreements[mKey]
                ? "not-allowed"
                : "pointer",
          }}
          onClick={submitCreateTeam}
          disabled={isSubmitting || !isMemberValid(mKey) || !agreements[mKey]}
        >
          {isSubmitting ? "PROCESSING..." : "SUBMIT & CONNECT TEAM ❯"}
        </button>
      </div>
    </div>
  );

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

        <div className="forge-progress-track">
          <div
            className="forge-progress-glow"
            style={{ width: `${(step / 8) * 100}%` }}
          ></div>
        </div>

        <div className="morph-interface">
          {step === 1 && (
            <div className="neural-node node-materialize">
              <span className="label-detail">NODE: LEADER CORE</span>
              <div className="input-group">
                <div className="label-row">
                  <span>
                    TEAM NAME <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`glow-input-container animated-field ${
                    valErrors["leader_tName"] ? "error-border" : ""
                  }`}
                >
                  <input
                    className="glow-input"
                    autoFocus
                    placeholder="Enter Your Team Name..."
                    value={formData.tName}
                    maxLength={100}
                    onChange={(e) =>
                      setFormData({ ...formData, tName: e.target.value })
                    }
                    onBlur={(e) =>
                      handleBlur("tName", e.target.value, null, "leader")
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
                  {valErrors["leader_tName"] ? (
                    <p className="error-message-inline" style={{ margin: 0 }}>
                      {valErrors["leader_tName"]}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        formData.tName.length >= 100
                          ? "#ef4444"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {formData.tName.length}/100
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "12px" }}>
                <div className="label-row">
                  <span>
                    TEAM VISION <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`glow-input-container animated-field ${
                    valErrors["leader_tBio"] ? "error-border" : ""
                  }`}
                >
                  <textarea
                    className="glow-input"
                    rows="2"
                    placeholder="What is your team goal?"
                    value={formData.tBio}
                    maxLength={1000}
                    onChange={(e) =>
                      setFormData({ ...formData, tBio: e.target.value })
                    }
                    onBlur={(e) =>
                      handleBlur("tBio", e.target.value, null, "leader")
                    }
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
                  {valErrors["leader_tBio"] ? (
                    <p className="error-message-inline" style={{ margin: 0 }}>
                      {valErrors["leader_tBio"]}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        formData.tBio.length >= 1000
                          ? "#ef4444"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {formData.tBio.length}/1000
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "12px" }}>
                <div className="label-row">
                  <span>
                    LEADER NAME <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`glow-input-container animated-field ${
                    valErrors["leader_lName"] ? "error-border" : ""
                  }`}
                >
                  <input
                    className="glow-input"
                    placeholder="Full Name..."
                    value={formData.lName}
                    maxLength={100}
                    onChange={(e) =>
                      setFormData({ ...formData, lName: e.target.value })
                    }
                    onBlur={(e) =>
                      handleBlur("lName", e.target.value, null, "leader")
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
                  {valErrors[`leader_lName`] ? (
                    <p className="error-message-inline" style={{ margin: 0 }}>
                      {valErrors[`leader_lName`]}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        formData.lName.length >= 100
                          ? "#ef4444"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {formData.lName.length}/100
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "12px" }}>
                <div className="label-row">
                  <span>
                    ABOUT LEADER <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`glow-input-container animated-field ${
                    valErrors["leader_lAbout"] ? "error-border" : ""
                  }`}
                >
                  <textarea
                    className="glow-input"
                    rows="2"
                    placeholder="Bio & Technical skills..."
                    value={formData.lAbout}
                    maxLength={500}
                    onChange={(e) =>
                      setFormData({ ...formData, lAbout: e.target.value })
                    }
                    onBlur={(e) =>
                      handleBlur("lAbout", e.target.value, null, "leader")
                    }
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
                  {valErrors["leader_lAbout"] ? (
                    <p className="error-message-inline" style={{ margin: 0 }}>
                      {valErrors["leader_lAbout"]}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        formData.lAbout.length >= 500
                          ? "#ef4444"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {formData.lAbout.length}/500
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
                      setFormData({
                        ...formData,
                        universityType: e.target.value,
                        sap: "",
                      })
                    }
                  >
                    <option value="">Select</option>
                    <option value="UPES">UPES</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {formData.universityType && (
                <div className="input-group" style={{ marginTop: "12px" }}>
                  <div className="label-row">
                    <span>
                      {formData.universityType === "UPES"
                        ? "SAP ID"
                        : "UNIVERSITY NAME"}{" "}
                      <span className="v-tag">*</span>
                    </span>
                  </div>
                  <div
                    className={`glow-input-container animated-field ${
                      valErrors["leader_sap"] ? "error-border" : ""
                    }`}
                  >
                    <input
                      className="glow-input"
                      placeholder={
                        formData.universityType === "UPES"
                          ? "Enter Your SAP ID"
                          : "Enter Your University Name"
                      }
                      value={formData.sap}
                      maxLength={formData.universityType === "UPES" ? 9 : 200}
                      onChange={(e) =>
                        setFormData({ ...formData, sap: e.target.value })
                      }
                      onBlur={(e) =>
                        handleBlur(
                          "sap",
                          e.target.value,
                          formData.universityType,
                          "leader"
                        )
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
                    {valErrors["leader_sap"] ? (
                      <p className="error-message-inline" style={{ margin: 0 }}>
                        {valErrors["leader_sap"]}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color:
                          formData.sap.length >=
                          (formData.universityType === "UPES" ? 9 : 200)
                            ? "#ef4444"
                            : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {formData.sap.length}/
                      {formData.universityType === "UPES" ? 9 : 200}
                    </span>
                  </div>
                </div>
              )}

              <div className="input-group" style={{ marginTop: "20px" }}>
                <div className="label-row">
                  <span>
                    CONTACT INFO <span className="v-tag">*</span>
                  </span>
                </div>
                <div
                  className={`dual-glow-capsule animated-field ${
                    valErrors["leader_email"] || valErrors["leader_phone"]
                      ? "error-border"
                      : ""
                  }`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <input
                    className="capsule-input-left"
                    placeholder="Email"
                    value={formData.email}
                    maxLength={100}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onBlur={(e) =>
                      handleBlur("email", e.target.value, null, "leader")
                    }
                  />
                  <div className="capsule-divider"></div>
                  <input
                    className="capsule-input-right"
                    placeholder="Phone"
                    value={formData.phone}
                    maxLength={10}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    onBlur={(e) =>
                      handleBlur("phone", e.target.value, null, "leader")
                    }
                  />
                </div>
                {(valErrors["leader_email"] || valErrors["leader_phone"]) && (
                  <p className="error-message-inline">
                    {valErrors["leader_email"] || valErrors["leader_phone"]}
                  </p>
                )}
              </div>

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
                  id="agree-leader"
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  checked={agreements.leader}
                  onChange={(e) =>
                    setAgreements({ ...agreements, leader: e.target.checked })
                  }
                />
                <label
                  htmlFor="agree-leader"
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

              {isInitialFormValid() && (
                <div
                  className="neural-node node-materialize animate-in"
                  style={{ marginTop: "20px", border: "none", padding: 0 }}
                >
                  <div className="shining-choice-row">
                    <button
                      className="liquid-btn animated-btn"
                      onClick={() => setStep(4)}
                    >
                      ADD MEMBERS
                    </button>
                    <button
                      className={`liquid-btn connect-btn-shimmer animated-btn ${
                        isSubmitting || !agreements.leader ? "btn-locked" : ""
                      }`}
                      style={{
                        cursor:
                          isSubmitting || !agreements.leader
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onClick={submitCreateTeam}
                      disabled={isSubmitting || !agreements.leader}
                    >
                      {isSubmitting ? "CREATING..." : "CREATE TEAM"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 &&
            renderMemberPage("m1", "NODE_02: MEMBER 02 DETAILS", 5)}
          {step === 5 &&
            renderMemberPage("m2", "NODE_03: MEMBER 03 DETAILS", 6)}
          {step === 6 &&
            renderMemberPage("m3", "NODE_04: MEMBER 04 DETAILS", null)}

          {step === 8 && (
            <div className="neural-node node-materialize animate-in success-node">
              <div
                className="completion-vfx"
                style={{ textAlign: "center", padding: "20px 0" }}
              >
                <h2 className="glow-status-text">TEAM CREATED SUCCESSFULLY!</h2>
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
                    Team credentials
                  </strong>{" "}
                  have been sent to the leader's registered email address.
                </p>
              </div>
              <div className="forge-btn-group" style={{ marginTop: "30px" }}>
                <button
                  className="liquid-btn animated-btn"
                  style={{ width: "100%", padding: "18px" }}
                  onClick={() => navigate("/team-login")}
                >
                  LOGIN ❯
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team_Regi;
