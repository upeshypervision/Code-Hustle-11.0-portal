import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing_Page.css';

const Landing_Page = () => {
  const navigate = useNavigate();
  const [hasTeam, setHasTeam] = useState(null);

  return (
    <div className="app-viewport">
      {/* Cosmic Background  */}
      <div className="cosmic-bg">
        <div className="nebula-cloud-blue"></div>
        <div className="nebula-cloud-purple"></div>
        <div className="starfield"></div>
      </div>

      <div className="portal-card animate-in">
        {/* Header Branding */}
        <header className="brand-header">
          <div className="hypervision-badge">HYPERVISION</div>
          <p className="presents-text">PRESENTS</p>
          <h1 className="main-logo syncopate-font">CODE HUSTLE <span className="v-tag">11.0</span></h1>
        </header>

        <div className="interaction-container">
          {/* PHASE 01: SQUAD VERIFICATION */}
          <div className="step-block">
            <span className="label-detail">PHASE 01: TEAM VERIFICATION</span>
            <div className="input-group">
              <div className="label-row" style={{ marginBottom: '15px' }}>
                <span>Do you have an established team?</span>
              </div>
              <div className="dual-button-row" style={{ display: 'flex', gap: '10px' }}>
                <button
                  className={`neon - shade - btn next - glow ${hasTeam === false ? 'btn-locked' : ''} `}
                  style={{ marginTop: 0 }}
                  onClick={() => navigate('/register')}
                >
                  YES
                </button>
                <button
                  className={`neon - shade - btn next - glow ${hasTeam === true ? 'btn-locked' : ''} `}
                  style={{ marginTop: 0, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
                  onClick={() => setHasTeam(false)}
                >
                  NO
                </button>
              </div>
            </div>
          </div>

          {/* PHASE 02: ROLE DESIGNATION - Only appears if "NO" is chosen */}
          {hasTeam === false && (
            <div className="step-block animate-in" style={{ marginTop: '25px' }}>
              <span className="label-detail">PHASE 02: ROLE DESIGNATION</span>
              <div className="input-group">
                <div className="label-row" style={{ marginBottom: '15px' }}>
                  <span>How do you intend to navigate the Arena?</span>
                </div>
                <div className="dual-button-row" style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="neon-shade-btn next-glow"
                    style={{ marginTop: 0, flex: 1 }}
                    onClick={() => navigate('/Indiregi')}
                  >
                    JOIN TEAM
                  </button>
                  <button
                    className="neon-shade-btn next-glow"
                    style={{ marginTop: 0, flex: 1 }}
                    onClick={() => navigate('/create-team')}
                  >
                    CREATE TEAM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - No box around Terms, Sign In removed */}
        <footer className="footer-links-clean">
          <a href="/terms" className="terms-link">Terms & Conditions</a>
          <p className="protocol-text">SECURE ENTRY PROTOCOL ACTIVE</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing_Page;