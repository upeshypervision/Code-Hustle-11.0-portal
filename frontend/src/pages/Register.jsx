import React, { useState, useEffect } from 'react';
import './Registration.css';

// Import Assets (QR Codes)
import qr380 from '../assets/380.png';
import qr400 from '../assets/400.png';

const Registration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorBadge, setErrorBadge] = useState("");
  const [valErrors, setValErrors] = useState({});
  
  // Default price is now 400 (Standard)
  const [finalPrice, setFinalPrice] = useState(400); 
  const [isDiscounted, setIsDiscounted] = useState(false);
  const [hyperMemberData, setHyperMemberData] = useState(null);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // New state for payment screenshot file
  const [screenshot, setScreenshot] = useState(null);

  // Reset terms agreement on step change
  useEffect(() => {
    setAgreedToTerms(false);
  }, [step]);

  const API_BASE = "http://localhost:5000/api";

  const [team, setTeam] = useState({
    leader: { fullName: '', sapid: '', email: '', phone: '', universityType: '' },
    m1: { fullName: '', sapid: '', email: '', phone: '', universityType: '' },
    m2: { fullName: '', sapid: '', email: '', phone: '', universityType: '' },
    m3: { fullName: '', sapid: '', email: '', phone: '', universityType: '' },
    m4: { fullName: '', sapid: '', email: '', phone: '', universityType: '' }
  });

  const [teamName, setTeamName] = useState("");
  const [discount, setDiscount] = useState({ hyperId: "", verifySapId: "" });

  // --- VALIDATION LOGIC ---
  const validate = (name, value, memberData) => {
    if (!value && name !== 'sapid') return ""; 
    if (name === 'sapid') {
      if (!value) return memberData.universityType === 'UPES' ? "SAP ID is required" : "University Name is required";
      if (memberData.universityType === 'UPES' && value.length !== 9) return "SAP ID must be 9 digits";
    }
    if (name === 'email' && !value.includes("@")) return "Invalid email format";
    if (name === 'phone' && value.length !== 10) return "Phone must be 10 digits";
    return "";
  };

  const handleBlur = (member, name, value) => {
    const error = validate(name, value, team[member]);
    setValErrors(prev => ({ ...prev, [`${member}_${name}`]: error }));
  };

  const isStepValid = (memberKey) => {
    const m = team[memberKey];
    const isSapValid = m.universityType === 'UPES' ? m.sapid.length === 9 : (m.universityType === 'Others' ? m.sapid.length > 0 : false);
    return m.fullName && m.universityType && isSapValid && m.email.includes("@") && m.phone.length === 10;
  };

  // --- DISCOUNT LOGIC ---
  const handleVerifyDiscount = async () => {
    if (!discount.hyperId || !discount.verifySapId) {
      setErrorBadge("Enter HV ID and SAP ID first");
      return;
    }
    setLoading(true);
    setErrorBadge("");
    try {
      const res = await fetch(`${API_BASE}/validate-hypervision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hypervision_id: discount.hyperId.trim(), sapid: discount.verifySapId.trim() })
      });
      const data = await res.json();
      if (data.is_hypervision) {
        setFinalPrice(380); // Set Discounted Price
        setHyperMemberData(data.member);
        setIsDiscounted(true);
      } else {
        setErrorBadge("Invalid Hypervision ID or Credentials");
        setFinalPrice(400); // Reset to Standard Price
        setIsDiscounted(false);
      }
    } catch (err) {
      setErrorBadge("Verification service unavailable");
    }
    setLoading(false);
  };

  // --- STEP 1 CHECK ---
  const handleStep1Next = async () => {
    if (!teamName.trim()) {
      setErrorBadge("Please enter a Team Name");
      return;
    }
    setErrorBadge("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/check-team-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_name: teamName })
      });
      const data = await res.json();
      if (data.exists) {
        setErrorBadge("Team name already taken. Choose another.");
      } else {
        setStep(2);
      }
    } catch (err) {
      setErrorBadge("Could not validate team name. Server error.");
    } finally {
      setLoading(false);
    }
  };

  // --- FILE HANDLER ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setScreenshot(e.target.files[0]);
        setErrorBadge("");
    }
  };

  // --- MANUAL REGISTRATION FLOW ---
  const handleManualRegistration = async () => {
    if (!agreedToTerms) {
      setErrorBadge("Please agree to the terms and conditions");
      return;
    }

    if (!screenshot) {
        setErrorBadge("Please upload payment screenshot.");
        return;
    }

    const membersList = [team.m1, team.m2, team.m3, team.m4].filter(m => m.fullName !== "");
    if (membersList.length < 2) {
      setErrorBadge("⚠️ You need at least 2 Team Members besides the Leader (Total 3).");
      return;
    }

    setLoading(true); // Locks the button
    setErrorBadge("");
    
    try {
      // Create FormData to send file + JSON
      const formData = new FormData();
      const teamPayload = {
        leader: team.leader,
        members: membersList,
        team_name: teamName,
        hypervision_member: hyperMemberData,
        amount: finalPrice
      };

      formData.append('data', JSON.stringify(teamPayload));
      formData.append('payment_screenshot', screenshot);

      // Sending to manual registration endpoint
      const res = await fetch(`${API_BASE}/register-team`, {
        method: "POST",
        body: formData // Browser sets boundary automatically
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true); // Shows success screen
      } else {
        setErrorBadge(data.error || "Registration failed");
      }
    } catch (err) {
      setErrorBadge("Server unreachable during registration.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderInput = (member, name, label, placeholder) => {
    const maxLengths = {
      fullName: 100, email: 100, phone: 10,
      sapid: name === 'sapid' && team[member].universityType === 'UPES' ? 9 : 200
    };

    return (
      <div className="input-group">
        <div className="label-row"><span>{label}</span></div>
        <div className={`glow-input-container ${valErrors[`${member}_${name}`] ? 'error-border' : ''}`}>
          <input
            className="glow-input"
            placeholder={placeholder}
            value={team[member][name]}
            maxLength={maxLengths[name] || 200}
            onChange={(e) => setTeam({ ...team, [member]: { ...team[member], [name]: e.target.value } })}
            onBlur={(e) => handleBlur(member, name, e.target.value)}
          />
        </div>
        {valErrors[`${member}_${name}`] && <p className="error-message-inline">{valErrors[`${member}_${name}`]}</p>}
      </div>
    );
  };

  const renderUniversitySection = (member) => (
    <>
      <div className="input-group">
        <div className="label-row"><span>Choose University</span></div>
        <div className="glow-input-container">
          <select className="glow-input" value={team[member].universityType}
            onChange={(e) => {
              const newType = e.target.value;
              setTeam(prev => ({ ...prev, [member]: { ...prev[member], universityType: newType, sapid: '' } }));
              setValErrors(prev => ({ ...prev, [`${member}_sapid`]: "" }));
            }}>
            <option value="" disabled>Select</option>
            <option value="UPES">UPES</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>
      {team[member].universityType === 'UPES' && renderInput(member, 'sapid', 'SAP ID', '5900XXXXX')}
      {team[member].universityType === 'Others' && renderInput(member, 'sapid', 'University Name', 'Enter University Name')}
    </>
  );

  return (
    <div className="app-viewport">
      <div className="cosmic-bg"><div className="nebula-cloud-blue"></div><div className="nebula-cloud-purple"></div><div className="starfield"></div></div>

      {!submitted ? (
        <div className="portal-card animate-in">
          <header className="brand-header">
            <div className="hypervision-badge">HYPERVISION</div>
            <p className="presents-text">PRESENTS</p>
            <h1 className="main-logo syncopate-font">CODE HUSTLE <span className="v-tag">11.0</span></h1>
          </header>

          {errorBadge && <div className="global-error-banner">{errorBadge}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-in">
              <span className="label-detail">TEAM NAME</span>
              <div className="input-group">
                <div className="label-row"><span>Team Name</span></div>
                <div className="glow-input-container">
                  <input
                    className="glow-input"
                    placeholder="Enter Team Name"
                    value={teamName}
                    maxLength={100}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
              </div>

              <span className="label-detail">TEAM LEADER</span>
              {renderInput('leader', 'fullName', 'Full Name', 'Name')}
              {renderUniversitySection('leader')}
              {renderInput('leader', 'email', 'Email Address', 'Email')}
              {renderInput('leader', 'phone', 'Phone Number', 'Phone')}
              <button className={`neon-shade-btn next-glow ${(!isStepValid('leader') || !teamName) ? 'btn-locked' : ''}`} disabled={!isStepValid('leader') || !teamName} onClick={handleStep1Next}>{loading ? "Checking..." : "NEXT"}</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-in">
              <span className="label-detail">MEMBER 2</span>
              {renderInput('m1', 'fullName', 'Full Name', 'Name')}
              {renderUniversitySection('m1')}
              {renderInput('m1', 'email', 'Email Address', 'Email')}
              {renderInput('m1', 'phone', 'Phone Number', 'Phone')}
              <button className={`neon-shade-btn next-glow ${!isStepValid('m1') ? 'btn-locked' : ''}`} disabled={!isStepValid('m1')} onClick={() => setStep(3)}>+ MEMBER 3</button>
              <p className="signin-link" style={{ marginTop: '15px', textAlign: 'center', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => setStep(1)}>← BACK</p>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-in">
              <span className="label-detail">MEMBER 3</span>
              {renderInput('m2', 'fullName', 'Full Name', 'Name')}
              {renderUniversitySection('m2')}
              {renderInput('m2', 'email', 'Email Address', 'Email')}
              {renderInput('m2', 'phone', 'Phone Number', 'Phone')}
              <div className="dual-button-row" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="neon-shade-btn next-glow" style={{ flex: 1, marginTop: 0 }} onClick={() => setStep(4)}>+ MEMBER 4</button>
                <button className={`neon-shade-btn next-glow ${!isStepValid('m2') ? 'btn-locked' : ''}`} style={{ flex: 1, marginTop: 0 }} disabled={!isStepValid('m2')} onClick={() => setStep(6)}>PROCEED</button>
              </div>
              <p className="signin-link" style={{ marginTop: '15px', textAlign: 'center', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => setStep(2)}>← BACK</p>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="animate-in">
              <span className="label-detail">MEMBER 4 (OPTIONAL)</span>
              {renderInput('m3', 'fullName', 'Full Name', 'Name')}
              {renderUniversitySection('m3')}
              {renderInput('m3', 'email', 'Email Address', 'Email')}
              {renderInput('m3', 'phone', 'Phone Number', 'Phone')}
              <div className="dual-button-row" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="neon-shade-btn next-glow" style={{ flex: 1, marginTop: 0 }} onClick={() => setStep(5)}>+ MEMBER 5</button>
                <button className="neon-shade-btn next-glow" style={{ flex: 1, marginTop: 0 }} onClick={() => setStep(6)}>PROCEED</button>
              </div>
              <p className="signin-link" style={{ marginTop: '15px', textAlign: 'center', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => setStep(3)}>← BACK</p>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="animate-in">
              <span className="label-detail">MEMBER 5 (OPTIONAL)</span>
              {renderInput('m4', 'fullName', 'Full Name', 'Name')}
              {renderUniversitySection('m4')}
              {renderInput('m4', 'email', 'Email Address', 'Email')}
              {renderInput('m4', 'phone', 'Phone Number', 'Phone')}
              <button className="neon-shade-btn next-glow" onClick={() => setStep(6)}>PROCEED TO PAY</button>
              <p className="signin-link" style={{ marginTop: '15px', textAlign: 'center', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => setStep(4)}>← BACK</p>
            </div>
          )}

          {/* STEP 6: PAYMENT & SUBMISSION */}
          {step === 6 && (
            <div className="animate-in">
              <span className="label-detail">DISCOUNT & PAYMENT</span>
              {(team.leader.universityType === 'UPES' || team.m1.universityType === 'UPES' || team.m2.universityType === 'UPES' || (team.m3.fullName && team.m3.universityType === 'UPES') || (team.m4.fullName && team.m4.universityType === 'UPES')) && (
                <>
                  <div className="input-group">
                    <div className="label-row"><span>HV ID (Optional)</span></div>
                    <div className="glow-input-container"><input className="glow-input" placeholder="HV-XXXX" value={discount.hyperId} maxLength={20} onChange={(e) => setDiscount({ ...discount, hyperId: e.target.value.toUpperCase() })} /></div>
                  </div>
                  <div className="input-group">
                    <div className="label-row"><span>Verify Member SAP ID</span></div>
                    <div className="glow-input-container"><input className="glow-input" placeholder="5900XXXXX" value={discount.verifySapId} maxLength={9} onChange={(e) => setDiscount({ ...discount, verifySapId: e.target.value })} /></div>
                  </div>

                  <button className="secondary-add-btn" style={{ width: '100%', padding: '12px', border: '1px solid #38bdf8', color: '#38bdf8', marginBottom: '15px', borderRadius: '30px', background: 'rgba(56, 189, 248, 0.1)', fontWeight: 800 }} onClick={handleVerifyDiscount}>APPLY DISCOUNT</button>
                </>
              )}

              <div style={{ textAlign: 'center', margin: '15px 0', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '12px', opacity: 0.6 }}>Total Payable:</p>
                <h2 style={{ fontSize: '28px', color: isDiscounted ? '#10b981' : '#fff' }}>
                  {isDiscounted ? <><span style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: '16px', marginRight: '10px' }}>₹400</span>₹{finalPrice}</> : `₹${finalPrice}`}
                </h2>
              </div>

              {/* QR Code Display Logic */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img 
                    src={isDiscounted ? qr380 : qr400} 
                    alt={`QR Code for ₹${finalPrice}`}
                    style={{ 
                        width: '200px', 
                        height: '200px', 
                        borderRadius: '10px',
                        border: '2px solid #38bdf8',
                        boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
                    }} 
                />
              </div>

              {/* File Upload Logic */}
              <div className="input-group">
                <div className="label-row"><span>Upload Payment Screenshot</span></div>
                <div className="glow-input-container" style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ color: '#fff', fontSize: '13px' }}
                    />
                </div>
                {screenshot && <p style={{ fontSize: '11px', color: '#10b981', marginTop: '5px' }}>✓ File selected: {screenshot.name}</p>}
              </div>

              {/* Terms Checkbox */}
              <div className="input-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <input 
                      type="checkbox" 
                      id="agree-reg"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <label htmlFor="agree-reg" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer', fontFamily: 'Orbitron' }}>
                    I AGREE TO ALL <a href="https://codehustle11.upeshypervision.in/#terms-conditions" target="_blank" rel="noopener noreferrer" style={{color: '#38bdf8', textDecoration: 'underline'}}>TERMS AND CONDITIONS</a>.
                  </label>
              </div>

              <button 
                className={`neon-shade-btn next-glow ${(loading || !agreedToTerms || !screenshot) ? 'btn-locked' : ''}`} 
                disabled={loading || !agreedToTerms || !screenshot} 
                onClick={handleManualRegistration}
              >
                {loading ? "PROCESSING..." : "SUBMIT PAYMENT"}
              </button>
              <p className="signin-link" style={{ marginTop: '15px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setStep(2)}>← BACK</p>
            </div>
          )}

          <footer className="footer-links">
            <a href="/userlogin" className="footer-btn">Sign In</a>
          </footer>
        </div>
      ) : (
        // SUCCESS SCREEN
        <div className="portal-card animate-in success-layout" style={{ textAlign: 'center' }}>
          <h2 className="syncopate-font" style={{ color: '#10b981', fontSize: '1.4rem' }}>✅ SUBMISSION SUCCESSFUL!</h2>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '30px', borderRadius: '12px', border: '2px solid rgba(16, 185, 129, 0.5)', margin: '30px 0' }}>
            <p style={{ fontSize: '14px', color: '#fff', opacity: 0.9, lineHeight: '1.8' }}>
              Your registration request has been received.<br />
              <strong style={{ color: '#10b981' }}>Credentials</strong> will be sent to your email after admin verification.
            </p>
          </div>

          <p style={{ marginTop: '20px', opacity: 0.7, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
            Please check your inbox periodically.
          </p>
          <button className="neon-shade-btn next-glow" onClick={() => window.location.href = '/userlogin'} style={{ marginTop: '25px' }}>
            GO TO LOGIN →
          </button>
        </div>
      )}
    </div>
  );
};

export default Registration;