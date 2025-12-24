import React, { useState, useEffect } from 'react';
import './Registration.css';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Registration = () => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const API_BASE = "http://localhost:5000/api"; 

  const [team, setTeam] = useState({
    leader: { fullName: '', sapid: '', email: '', phone: '' },
    m1: { fullName: '', sapid: '', email: '', phone: '' },
    m2: { fullName: '', sapid: '', email: '', phone: '' },
    m3: { fullName: '', sapid: '', email: '', phone: '' }
  });

  const [discount, setDiscount] = useState({ hyperId: "", verifySapId: "" });

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);

  const handleInputChange = (member, e) => {
    const { name, value } = e.target;
    setTeam(prev => ({
      ...prev,
      [member]: { ...prev[member], [name]: value }
    }));
  };

  const isSapMatching = () => {
    const enteredSaps = [team.leader.sapid, team.m1.sapid, team.m2.sapid, team.m3.sapid];
    return enteredSaps.includes(discount.verifySapId);
  };

  const openRazorpay = async (order_id, finalAmount, key_id, teamPayload) => {
    const options = {
      key: key_id,
      amount: finalAmount * 100,
      currency: "INR",
      name: "CodeHustle 11.0",
      order_id: order_id,
      handler: async (response) => {
        const payRes = await fetch(`${API_BASE}/save-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...teamPayload, 
            payment_id: response.razorpay_payment_id, 
            order_id: response.razorpay_order_id 
          }),
        });
        const data = await payRes.json();
        if (data.success) setSubmitted(true);
      },
      prefill: { name: team.leader.fullName, email: team.leader.email },
      theme: { color: "#38bdf8" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleRegistrationFlow = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let finalAmount = 450;
      let hyperMemberData = null;

      if (discount.hyperId && discount.verifySapId) {
        if (!isSapMatching()) {
          alert("Verification SAP ID must match a team member.");
          setLoading(false); return;
        }
        const hRes = await fetch(`${API_BASE}/validate-hypervision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hypervision_id: discount.hyperId, sapid: discount.verifySapId }),
        });
        const hData = await hRes.json();
        if (hData.is_hypervision) {
          finalAmount = hData.amount;
          hyperMemberData = hData.member;
        }
      }

      const teamPayload = {
        leader: team.leader,
        members: [team.m1, team.m2, team.m3].filter(m => m.fullName !== ""),
        hypervision_member: hyperMemberData,
        amount: finalAmount
      };

      const orderRes = await fetch(`${API_BASE}/register-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamPayload)
      });
      const orderData = await orderRes.json();
      if (orderData.success) {
        openRazorpay(orderData.order_id, orderData.amount, orderData.key_id, { 
          ...teamPayload, 
          team_id: orderData.team_id 
        });
      }
    } catch (err) { alert("Server error."); }
    setLoading(false);
  };

  const renderFields = (memberKey, label, isOptional = false) => (
    <form onSubmit={(e) => { e.preventDefault(); setStep(step + 1); }} className="animate-in">
      <span className="label-detail">{label} {isOptional && "(OPTIONAL)"}</span>
      <div className="input-group">
        <div className="label-row"><span>Full Name</span></div>
        <input type="text" name="fullName" className="glow-input" placeholder="Name" required={!isOptional}
          value={team[memberKey].fullName} onChange={(e) => handleInputChange(memberKey, e)} />
      </div>
      <div className="input-group">
        <div className="label-row"><span>SAP ID</span></div>
        <input type="text" name="sapid" className="glow-input" placeholder="5900XXXXX" required={!isOptional} pattern="\d{9}"
          value={team[memberKey].sapid} onChange={(e) => handleInputChange(memberKey, e)} />
      </div>
      <div className="input-group">
        <div className="label-row"><span>Email Address</span></div>
        <input type="email" name="email" className="glow-input" placeholder="email@example.com" required={!isOptional}
          value={team[memberKey].email} onChange={(e) => handleInputChange(memberKey, e)} />
      </div>
      <div className="input-group">
        <div className="label-row"><span>Phone Number</span></div>
        <input type="tel" name="phone" className="glow-input" placeholder="Contact number" required={!isOptional} pattern="\d{10}"
          value={team[memberKey].phone} onChange={(e) => handleInputChange(memberKey, e)} />
      </div>
      <button type="submit" className="neon-shade-btn next-glow">NEXT</button>
      <p className="signin-link" style={{marginTop: '15px', cursor: 'pointer', textAlign: 'center'}} onClick={() => setStep(step === 4 ? 3 : step - 1)}>
        ← Go Back
      </p>
    </form>
  );

  return (
    <div className="app-viewport">
      <div className="cosmic-bg">
        <div className="nebula-cloud-blue"></div><div className="nebula-cloud-purple"></div><div className="starfield"></div>
      </div>

      {!submitted ? (
        <div className="portal-card animate-in">
          <header className="brand-header">
            <div className="hypervision-badge">HYPERVISION</div>
            <p className="presents-text">PRESENTS</p>
            <h1 className="main-logo syncopate-font">CODE HUSTLE <span className="v-tag">11.0</span></h1>
          </header>

          {step === 1 && renderFields('leader', 'TEAM LEADER')}
          {step === 2 && renderFields('m1', 'MEMBER 1')}

          {step === 3 && (
            <div className="animate-in">
              <span className="label-detail">DISCOUNT & PAY</span>
              <div className="input-group">
                <div className="label-row"><span>Hypervision ID (Optional)</span></div>
                <input type="text" className="glow-input" placeholder="HV-XXXX" 
                  value={discount.hyperId} onChange={(e) => setDiscount({...discount, hyperId: e.target.value})} />
              </div>
              <div className="input-group">
                <div className="label-row"><span>Verify Member SAP ID</span></div>
                <input type="text" className="glow-input" placeholder="5900XXXXX" 
                  value={discount.verifySapId} onChange={(e) => setDiscount({...discount, verifySapId: e.target.value})} />
              </div>
              
              <button className="neon-shade-btn next-glow" disabled={loading} onClick={handleRegistrationFlow} style={{marginTop: '45px'}}>
                {loading ? "PROCESSING..." : "REGISTER & PAY NOW"}
              </button>

              <div style={{margin: '25px 0', fontSize: '11px', opacity: 0.4, textAlign:'center'}}>OR</div>

              <button className="glow-input" style={{cursor: 'pointer', border: '1px solid #38bdf8'}} onClick={() => setStep(4)}>
                ADD MORE MEMBERS (M2 & M3)
              </button>
              
              <p className="signin-link" style={{marginTop: '15px', cursor: 'pointer', textAlign: 'center'}} onClick={() => setStep(2)}>← Back to Member 1</p>
            </div>
          )}

          {step === 4 && renderFields('m2', 'MEMBER 2', true)}
          {step === 5 && (
             <div className="animate-in">
                {renderFields('m3', 'MEMBER 3', true)}
                <style>{`.animate-in button[type="submit"] { display: none; }`}</style>
                <button className="neon-shade-btn next-glow" disabled={loading} onClick={handleRegistrationFlow} style={{marginTop: '45px'}}>
                   {loading ? "PROCESSING..." : "FINALIZE & PAY"}
                </button>
             </div>
          )}

          <footer className="footer-links">
            <a href="#" className="signin-link">Already registered? Sign In</a>
          </footer>
        </div>
      ) : (
        /* --- ORIGINAL ACKNOWLEDGEMENT PAGE (GAYAB NAHI HUA) --- */
        <div className="portal-card animate-in success-layout">
            <h2 className="syncopate-font" style={{color: '#38bdf8', fontSize: '1.5rem'}}>SUCCESS!</h2>
            <p style={{marginTop: '20px', opacity: 0.8, lineHeight: '1.6'}}>
              Registration Confirmed.<br/>Check your email for login credentials.
            </p>
            <button className="neon-shade-btn next-glow" onClick={() => window.location.reload()} style={{marginTop: '30px'}}>
              ACKNOWLEDGE
            </button>
        </div>
      )}
    </div>
  );
};

export default Registration;