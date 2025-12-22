import { useState, useEffect } from "react";
import "./Registration.css";

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

export default function StudentRegistration() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const API_BASE = "http://127.0.0.1:5000/api";

  const [team, setTeam] = useState({
    leader: { name: "", sapid: "", email: "", phone: "" },
    member2: { name: "", sapid: "", email: "", phone: "" },
    member3: { name: "", sapid: "", email: "", phone: "" },
    member4: { name: "", sapid: "", email: "", phone: "" },
  });

  const [discount, setDiscount] = useState({ hyperId: "", sapId: "" });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const validateField = (data) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const sapRegex = /^\d{9}$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nameRegex.test(data.name)) return "Invalid Name";
    if (!sapRegex.test(data.sapid)) return "SAP ID must be 9 digits";
    if (!emailRegex.test(data.email)) return "Invalid Email";
    if (!phoneRegex.test(data.phone)) return "Phone must be 10 digits";
    return null;
  };

  const handleInputChange = (memberKey, field, value) => {
    setTeam(prev => ({ ...prev, [memberKey]: { ...prev[memberKey], [field]: value } }));
  };

  const handleNext = () => {
    const leaderErr = validateField(team.leader);
    const m2Err = validateField(team.member2);
    if (leaderErr) { alert(`Leader: ${leaderErr}`); return; }
    if (m2Err) { alert(`Member 2: ${m2Err}`); return; }
    setPage(2);
  };

  const openRazorpay = async (order_id, finalAmount, key_id, teamPayload) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Check your internet.");
      return;
    }

    const options = {
      key: key_id,
      amount: finalAmount * 100,
      currency: "INR",
      name: "CodeHustle 11.0",
      order_id: order_id,
      handler: async (response) => {
        try {
          const payRes = await fetch(`${API_BASE}/save-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...teamPayload,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              password_plain: teamPayload.password_plain 
            }),
          });
          const data = await payRes.json();
          if (data.success) setSubmitted(true);
        } catch (err) {
          alert("Payment verified but failed to update database.");
        }
      },
      prefill: { name: team.leader.name, email: team.leader.email },
      theme: { color: "#32CCFF" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalAmount = 450;
      let hyperMemberData = null;

      if (discount.hyperId && discount.sapId) {
        const hRes = await fetch(`${API_BASE}/validate-hypervision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hypervision_id: discount.hyperId, sapid: discount.sapId }),
        });
        const hData = await hRes.json();
        if (hData.is_hypervision) { 
          finalAmount = hData.amount; 
          hyperMemberData = { sapid: discount.sapId, name: hData.member.name }; 
        }
      }

      const teamPayload = { 
        leader: team.leader, 
        members: [team.member2, team.member3, team.member4].filter(m => m.name !== ""), 
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
        await openRazorpay(orderData.order_id, orderData.amount, orderData.key_id, {
          ...teamPayload,
          password_plain: orderData.password_plain,
          team_id: orderData.team_id
        });
      }
    } catch (err) { alert("Could not reach server."); }
    setLoading(false);
  };

  const renderFields = (key) => (
    <div className="field-grid">
      <div className="input-wrapper"><span className="field-icon">👤</span><input type="text" placeholder="Full Name" value={team[key].name} onChange={(e) => handleInputChange(key, 'name', e.target.value)} /></div>
      <div className="input-wrapper"><span className="field-icon">🆔</span><input type="text" placeholder="SAP ID" value={team[key].sapid} onChange={(e) => handleInputChange(key, 'sapid', e.target.value)} /></div>
      <div className="input-wrapper"><span className="field-icon">📧</span><input type="email" placeholder="Email" value={team[key].email} onChange={(e) => handleInputChange(key, 'email', e.target.value)} /></div>
      <div className="input-wrapper"><span className="field-icon">📱</span><input type="text" placeholder="Phone" value={team[key].phone} onChange={(e) => handleInputChange(key, 'phone', e.target.value)} /></div>
    </div>
  );

  return (
    <div className="app-viewport">
      <div className="stars-layer"></div>
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }}></div>
      <div className="nebula blue"></div><div className="nebula purple"></div>
      
      {!submitted ? (
        <div className="glass-card mobile-shape animate-in">
          <header className="brand-header">
            <div className="hypervision-badge">HYPERVISION</div>
            <p className="presents-text">PRESENTS</p>
            <h1 className="syncopate-font main-logo">CODE HUSTLE <span className="v-tag">11.0</span></h1>
          </header>

          <form onSubmit={handleFinalSubmit} className="form-body">
            {page === 1 ? (
              <div className="section-stack">
                <div className="input-group"><label className="label-detail">TEAM LEADER</label>{renderFields('leader')}</div>
                <div className="input-group"><label className="label-detail">2ND MEMBER</label>{renderFields('member2')}</div>
                <button type="button" className="neon-shade-btn" onClick={handleNext}>NEXT</button>
              </div>
            ) : (
              <div className="section-stack">
                <div className="input-group"><label className="label-detail">3RD MEMBER (OPTIONAL)</label>{renderFields('member3')}</div>
                <div className="input-group"><label className="label-detail">4TH MEMBER (OPTIONAL)</label>{renderFields('member4')}</div>
                <div className="discount-area">
                  <label className="gold-text syncopate-font">HYPERVISION DISCOUNT</label>
                  <div className="field-grid">
                    <input className="disc-input" type="text" placeholder="Hypervision ID" value={discount.hyperId} onChange={(e) => setDiscount(prev => ({...prev, hyperId: e.target.value}))} />
                    <input className="disc-input" type="text" placeholder="Verify SAP ID" value={discount.sapId} onChange={(e) => setDiscount(prev => ({...prev, sapId: e.target.value}))} />
                  </div>
                </div>
                <div className="btn-footer">
                  <button type="button" className="back-btn" onClick={() => setPage(1)}>BACK</button>
                  <button type="submit" className="neon-shade-btn" disabled={loading}>{loading ? "PROCESSING..." : "REGISTER & PAY"}</button>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* REFRAMED SUCCESS PAGE - CENTERED CONTENT */
        <div className="glass-card mobile-shape success-layout animate-in">
          <div className="success-content-centered">
            <div className="success-ring">✓</div>
            <h2 className="syncopate-font green-text">REGISTERED!</h2>
            <div className="status-message-box">
              <p className="status-text-main">Payment received successfully.</p>
              <p className="status-text-sub">REGISTRATION CONFIRMED! Payment verified. Access credentials and event details will be dispatched to your registered email shortly.</p>
            </div>
            <button className="neon-shade-btn" onClick={() => window.location.reload()}>ACKNOWLEDGE</button>
          </div>
        </div>
      )}
    </div>
  );
}