import { useState } from "react";
import "./Registration.css";

export default function StudentRegistration() {
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [team, setTeam] = useState({
    leader: { name: "", sapid: "", email: "", phone: "" },
    member1: { name: "", sapid: "", email: "", phone: "" },
    member2: { name: "", sapid: "", email: "", phone: "" },
    member3: { name: "", sapid: "", email: "", phone: "" },
  });

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const renderFields = (memberKey) => {
    return (
      <div className="member-grid">
        {['name', 'sapid', 'email', 'phone'].map((f) => (
          <div className="cyber-input-box" key={`${memberKey}-${f}`}>
            <input 
              placeholder=" " 
              value={team[memberKey][f]}
              onChange={(e) => setTeam({...team, [memberKey]: {...team[memberKey], [f]: e.target.value}})} 
            />
            <label>{f.toUpperCase()}</label>
            <div className="input-bar"></div>
          </div>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="hustle-universe">
        <div className="moving-grid-v2"></div>
        <div className="nebula-blue"></div>
        <div className="nebula-purple"></div>
        <div className="glass-terminal success-view">
          <h1 className="hologram-title">SUCCESS</h1>
          <p className="success-msg">
            Rest of the credentials will be shared through the mail. <br/>
            Thank you for your interest.
          </p>
          <button className="super-shine-btn" onClick={() => window.location.reload()}>
            FINISH
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hustle-universe">
      <div className="moving-grid-v2"></div>
      <div className="nebula-blue"></div>
      <div className="nebula-purple"></div>

      <main className="glass-terminal">
        <header className="brand-section">
          <p className="organized-by">HYPERVISION PRESENTS</p>
          <h1 className="hologram-title">CODEHUSTLE 11.0</h1>
          <div className="title-underline"></div>
        </header>

        <form onSubmit={handleRegister}>
          {page === 1 ? (
            <div className="page-transition">
              <div className="member-module">
                <div className="module-tag">TEAM LEADER</div>
                {renderFields('leader')}
              </div>
              <div className="member-module">
                <div className="module-tag">MEMBER 1</div>
                {renderFields('member1')}
              </div>
              <button type="button" className="super-shine-btn" onClick={() => setPage(2)}>
                NEXT STEP
                <div className="shine-swipe"></div>
              </button>
            </div>
          ) : (
            <div className="page-transition">
              <div className="member-module">
                <div className="module-tag">MEMBER 2</div>
                {renderFields('member2')}
              </div>
              <div className="member-module">
                <div className="module-tag">MEMBER 3</div>
                {renderFields('member3')}
              </div>
              <div className="btn-group">
                <button type="button" className="back-link" onClick={() => setPage(1)}>BACK</button>
                <button type="submit" className="super-shine-btn">
                  {loading ? "PROCESSING..." : "REGISTER NOW"}
                  <div className="shine-swipe"></div>
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}