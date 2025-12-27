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
  const [errorBadge, setErrorBadge] = useState("");
  const [valErrors, setValErrors] = useState({});
  const [finalPrice, setFinalPrice] = useState(450); 
  const [isDiscounted, setIsDiscounted] = useState(false);
  const [hyperMemberData, setHyperMemberData] = useState(null);
  
  const API_BASE = "http://localhost:5000/api";

  const [team, setTeam] = useState({
    team_name: '', 
    leader: { fullName: '', sapid: '', email: '', phone: '' },
    m1: { fullName: '', sapid: '', email: '', phone: '' },
    m2: { fullName: '', sapid: '', email: '', phone: '' },
    m3: { fullName: '', sapid: '', email: '', phone: '' }
  });

  const [discount, setDiscount] = useState({ hyperId: "", verifySapId: "" });

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);

  const validate = (name, value) => {
    if (!value) return ""; 
    if (name === 'sapid') {
      if (value.length !== 9) return "SAP ID must be 9 digits";
    }
    if (name === 'email' && !value.includes("@")) return "Invalid email format";
    if (name === 'phone' && value.length !== 10) return "Phone must be 10 digits";
    return "";
  };

  const handleBlur = (member, name, value) => {
    const error = validate(name, value);
    setValErrors(prev => ({ ...prev, [`${member}_${name}`]: error }));
  };

  const isStepValid = (memberKey) => {
    if (memberKey === 'leader') {
      const m = team.leader;
      return team.team_name && m.fullName && m.sapid.length === 9 && m.email.includes("@") && m.phone.length === 10;
    }
    const m = team[memberKey];
    return m.fullName && m.sapid.length === 9 && m.email.includes("@") && m.phone.length === 10;
  };

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
        setFinalPrice(data.amount);
        setHyperMemberData(data.member);
        setIsDiscounted(true);
      } else {
        setErrorBadge("Invalid Hypervision ID or Credentials");
        setFinalPrice(450);
        setIsDiscounted(false);
      }
    } catch (err) {
      setErrorBadge("Verification service unavailable");
    }
    setLoading(false);
  };

  const savePayment = async (payment_id, order_id, amount, teamPayload) => {
    setLoading(true);
    try {
      const payRes = await fetch(`${API_BASE}/save-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...teamPayload,
          payment_id: payment_id, 
          order_id: order_id,
          amount: amount
        }),
      });
      const data = await payRes.json();
      if (data.success) setSubmitted(true);
      else setErrorBadge("Error saving: " + data.error);
    } catch (err) {
      setErrorBadge("Network Error: Could not reach server to save payment.");
    }
    setLoading(false);
  };

  const openRazorpay = async (order_id, finalAmount, key_id, teamPayload) => {
    const options = {
      key: key_id,
      amount: finalAmount * 100,
      currency: "INR",
      name: "CodeHustle Hackathon",
      description: "Team Registration",
      order_id: order_id,
      handler: function (response) {
        savePayment(response.razorpay_payment_id, order_id, finalAmount, teamPayload);
      },
      prefill: {
        name: teamPayload.leader.fullName,
        email: teamPayload.leader.email,
        contact: teamPayload.leader.phone,
      },
      theme: { color: "#38bdf8" },
    };
    const rz = new window.Razorpay(options);
    rz.open();
  };

  const handleRegistrationFlow = async () => {
    if (!isStepValid('m1')) {
        setErrorBadge("⚠️ Member 1 details are mandatory before payment.");
        setStep(2);
        return;
    }

    const membersList = [team.m1, team.m2, team.m3].filter(m => m.fullName !== "");
    
    setLoading(true);
    setErrorBadge("");
    try {
      const teamPayload = {
        team_name: team.team_name,
        leader: team.leader,
        members: membersList,
        hypervision_member: hyperMemberData,
        amount: finalPrice,
      };

      const res = await fetch(`${API_BASE}/register-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamPayload)
      });
      const data = await res.json();
      if (data.success) {
        await openRazorpay(data.order_id, data.amount, data.key_id, {
          ...teamPayload,
          team_id: data.team_id,
          password_plain: data.password_plain,
        });
      } else {
        setErrorBadge(data.error || "Registration failed");
      }
    } catch (err) {
      setErrorBadge("Server unreachable during registration.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (member, name, label, placeholder) => {
    let val = "";
    if (member === 'root') val = team[name];
    else if (member === 'discount') val = discount[name];
    else val = team[member][name];

    return (
      <div className="input-group">
        <div className="label-row"><span>{label}</span></div>
        <div className={`glow-input-container ${valErrors[`${member}_${name}`] ? 'error-border' : ''}`}>
          <input className="glow-input" placeholder={placeholder} 
            value={val} 
            onChange={(e) => {
              const inputVal = (member === 'discount' && name === 'hyperId') ? e.target.value.toUpperCase() : e.target.value;
              if (member === 'root') setTeam({...team, [name]: inputVal});
              else if (member === 'discount') setDiscount({...discount, [name]: inputVal});
              else setTeam({...team, [member]: {...team[member], [name]: inputVal}});
            }}
            onBlur={(e) => (member !== 'root' && member !== 'discount') && handleBlur(member, name, e.target.value)} />
        </div>
        {valErrors[`${member}_${name}`] && <p className="error-message-inline">{valErrors[`${member}_${name}`]}</p>}
      </div>
    );
  };

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

          {step === 1 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="label-detail">TEAM SETUP</span>
              {renderInput('root', 'team_name', 'Team Name', 'The Avengers')}
              
              <span className="label-detail" style={{marginTop:'12px'}}>TEAM LEADER</span>
              {renderInput('leader', 'fullName', 'Full Name', 'Name')}
              {renderInput('leader', 'sapid', 'SAP ID', '5900XXXXX')}
              {renderInput('leader', 'email', 'Email Address', 'Email')}
              {renderInput('leader', 'phone', 'Phone Number', 'Phone')}
              
              <button className={`neon-shade-btn next-glow ${!isStepValid('leader') ? 'btn-locked' : ''}`} 
                style={{marginTop: '15px'}}
                disabled={!isStepValid('leader')} onClick={() => setStep(2)}>NEXT</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in">
              <span className="label-detail">MEMBER 1 (MANDATORY)</span>
              {renderInput('m1', 'fullName', 'Full Name', 'Name')}
              {renderInput('m1', 'sapid', 'SAP ID', '5900XXXXX')}
              {renderInput('m1', 'email', 'Email Address', 'Email')}
              {renderInput('m1', 'phone', 'Phone Number', 'Phone')}
              <div className="dual-button-row" style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button 
                    className={`secondary-add-btn ${!isStepValid('m1') ? 'btn-locked' : ''}`} 
                    style={{flex:1, height:'50px', borderRadius:'30px', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:'10px', fontWeight:800}} 
                    disabled={!isStepValid('m1')}
                    onClick={() => setStep(3)}>+ MEMBER 2</button>
                <button 
                    className={`neon-shade-btn next-glow ${!isStepValid('m1') ? 'btn-locked' : ''}`} 
                    style={{flex:1, marginTop:0}} 
                    disabled={!isStepValid('m1')} 
                    onClick={() => setStep(6)}>PROCEED</button>
              </div>
              <p className="signin-link" style={{marginTop:'15px', textAlign:'center', cursor:'pointer'}} onClick={() => setStep(1)}>← BACK</p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in">
              <span className="label-detail">MEMBER 2 (OPTIONAL)</span>
              {renderInput('m2', 'fullName', 'Full Name', 'Name')}
              {renderInput('m2', 'sapid', 'SAP ID', '5900XXXXX')}
              {renderInput('m2', 'email', 'Email Address', 'Email')}
              {renderInput('m2', 'phone', 'Phone Number', 'Phone')}
              <div className="dual-button-row" style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button className="secondary-add-btn" style={{flex:1, height:'50px', borderRadius:'30px', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:'10px', fontWeight:800}} onClick={() => setStep(4)}>+ MEMBER 3</button>
                <button className="neon-shade-btn next-glow" style={{flex:1, marginTop:0}} onClick={() => setStep(6)}>PROCEED</button>
              </div>
              <p className="signin-link" style={{marginTop:'15px', textAlign:'center', cursor:'pointer'}} onClick={() => setStep(2)}>← BACK</p>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in">
              <span className="label-detail">MEMBER 3 (OPTIONAL)</span>
              {renderInput('m3', 'fullName', 'Full Name', 'Name')}
              {renderInput('m3', 'sapid', 'SAP ID', '5900XXXXX')}
              {renderInput('m3', 'email', 'Email Address', 'Email')}
              {renderInput('m3', 'phone', 'Phone Number', 'Phone')}
              <button className="neon-shade-btn next-glow" onClick={() => setStep(6)}>PROCEED TO PAY</button>
              <p className="signin-link" style={{marginTop:'15px', textAlign:'center', cursor:'pointer'}} onClick={() => setStep(3)}>← BACK</p>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in">
              <span className="label-detail">DISCOUNT & PAYMENT</span>
              {renderInput('discount', 'hyperId', 'HV ID (Optional)', 'HV-XXXX')}
              {renderInput('discount', 'verifySapId', 'Verify Member SAP ID', '5900XXXXX')}
              
              <button className="secondary-add-btn" style={{width:'100%', padding:'12px', border:'1px solid #38bdf8', color:'#38bdf8', marginBottom:'15px', borderRadius:'30px', background:'rgba(56, 189, 248, 0.1)', fontWeight:800}} onClick={handleVerifyDiscount}>APPLY DISCOUNT</button>

              <div style={{textAlign:'center', margin:'15px 0', padding:'15px', background:'rgba(255,255,255,0.05)', borderRadius:'15px', border:'1px solid rgba(255,255,255,0.1)'}}>
                 <p style={{fontSize:'12px', opacity:0.6}}>Total Payable:</p>
                 <h2 style={{fontSize:'28px', color: isDiscounted ? '#10b981' : '#fff'}}>
                    {isDiscounted ? <><span style={{textDecoration:'line-through', opacity:0.4, fontSize:'16px', marginRight:'10px'}}>₹450</span>₹{finalPrice}</> : `₹${finalPrice}`}
                 </h2>
              </div>

              <button className="neon-shade-btn next-glow" disabled={loading} onClick={handleRegistrationFlow}>{loading ? "PROCESSING..." : "REGISTER & PAY"}</button>
              <p className="signin-link" style={{marginTop:'15px', textAlign:'center', cursor:'pointer'}} onClick={() => setStep(2)}>← BACK</p>
            </div>
          )}

          <footer className="footer-links"><a href="#" className="signin-link">Already registered? Sign In</a></footer>
        </div>
      ) : (
        <div className="portal-card animate-in success-layout" style={{textAlign:'center'}}>
            <h2 className="syncopate-font" style={{color: '#38bdf8', fontSize: '1.2rem'}}>REGISTRATION CONFIRMED!</h2>
            <p style={{marginTop: '20px', opacity: 0.8, lineHeight: '1.6', fontSize: '14px'}}>
              Payment verified.<br/>Access credentials and event details will be dispatched to your registered email shortly.
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