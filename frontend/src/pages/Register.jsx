import { useState } from "react";
import { API_BASE } from "../config";
import "./Registration.css";

const loadScript = (src) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function StudentRegistration() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hyperId, setHyperId] = useState("");
  const [hyperSapid, setHyperSapid] = useState("");

  const [team, setTeam] = useState({
    leader: { name: "", sapid: "", email: "", phone: "" },
    member1: { name: "", sapid: "", email: "", phone: "" },
    member2: { name: "", sapid: "", email: "", phone: "" },
    member3: { name: "", sapid: "", email: "", phone: "" },
  });

  const handleChange = (member, field, value) => {
    setTeam((prev) => ({ ...prev, [member]: { ...prev[member], [field]: value } }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        leader: team.leader,
        members: [team.member1, team.member2, team.member3].filter(m => m.name),
        hypervision_member: { sapid: hyperSapid || team.leader.sapid },
        amount: 500,
      };

      const res = await fetch(`${API_BASE}/register_team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) throw new Error("Razorpay SDK failed");

      const options = {
        key: data.key_id,
        amount: data.amount * 100,
        currency: "INR",
        name: "CodeHustle 11.0",
        description: `Team: ${data.team_id}`,
        order_id: data.order_id,
        handler: async (response) => {
          await fetch(`${API_BASE}/save-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                ...payload, 
                payment_id: response.razorpay_payment_id, 
                order_id: data.order_id, 
                team_id: data.team_id 
            }),
          });
          setSubmitted(true);
        },
        theme: { color: "#00f2ff" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="hustle-universe">
        <div className="glass-terminal success-view" style={{ textAlign: 'center', padding: '50px 30px' }}>
          <div style={{ color: '#00f2ff', marginBottom: '20px' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="hologram-title">REGISTRATION CONFIRMED</h1>
          <div style={{ margin: '30px 0', borderTop: '1px solid rgba(0, 242, 255, 0.2)', borderBottom: '1px solid rgba(0, 242, 255, 0.2)', padding: '20px 0' }}>
            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '10px' }}>Thank you for registering for CodeHustle 11.0.</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Your transaction has been processed successfully. <br />
              A formal confirmation email containing your Team ID, Credentials, and event guidelines will be dispatched shortly.
            </p>
          </div>
          <button className="super-shine-btn" style={{ width: '180px' }} onClick={() => window.location.reload()}>ACKNOWLEDGE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hustle-universe">
      <main className="glass-terminal">
        <header className="brand-section">
          <p className="organized-by">HYPERVISION PRESENTS</p>
          <h1 className="hologram-title">CODEHUSTLE 11.0</h1>
        </header>
        <form onSubmit={handleRegister}>
          {page === 1 ? (
            <>
              {["leader", "member1"].map((m) => (
                <div className="member-module" key={m}>
                  <div className="module-tag">{m === "leader" ? "TEAM LEADER *" : "MEMBER 1 *"}</div>
                  <div className="member-grid">
                    {["name", "sapid", "email", "phone"].map((f) => (
                      <input key={f} placeholder={f.toUpperCase()} value={team[m][f]} onChange={(e) => handleChange(m, f, e.target.value)} required />
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" className="super-shine-btn" onClick={() => team.leader.name && setPage(2)}>NEXT STEP</button>
            </>
          ) : (
            <>
              {["member2", "member3"].map((m) => (
                <div className="member-module" key={m}>
                  <div className="module-tag">{m.toUpperCase()} (OPTIONAL)</div>
                  <div className="member-grid">
                    {["name", "sapid", "email", "phone"].map((f) => (
                      <input key={f} placeholder={f.toUpperCase()} value={team[m][f]} onChange={(e) => handleChange(m, f, e.target.value)} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="member-module">
                <div className="module-tag">HYPERVISION DISCOUNT</div>
                <input placeholder="HYPERVISION ID" value={hyperId} onChange={(e) => setHyperId(e.target.value)} />
                <input placeholder="SAP ID" value={hyperSapid} onChange={(e) => setHyperSapid(e.target.value)} />
              </div>
              <div className="btn-group">
                <button type="button" className="back-link" onClick={() => setPage(1)}>BACK</button>
                <button type="submit" className="super-shine-btn" disabled={loading}>{loading ? "PROCESSING..." : "REGISTER & PAY"}</button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  );
}