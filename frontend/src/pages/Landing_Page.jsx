import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing_Page.css';

const Landing_Page = () => {
  const navigate = useNavigate();

  return (
    <div className="app-viewport forge-container">
      {/* Cosmic Background  */}
      <div className="cosmic-bg">
        <div className="nebula-cloud-blue"></div>
        <div className="nebula-cloud-purple"></div>
        <div className="starfield"></div>
      </div>

      {/* Added 'forge-card' and adjusted wrapper to match Registration pages */}
      <div className="portal-card animate-in forge-card">
        {/* Header Branding */}
        <header className="brand-header">
          <div className="hypervision-badge">HYPERVISION</div>
          <p className="presents-text">PRESENTS</p>
          <h1 className="main-logo syncopate-font">CODE HUSTLE <span className="v-tag">11.0</span></h1>
        </header>

        <div className="interaction-container">
          <div className="step-block animate-in">
            <div className="input-group">
              <div className="label-row" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <span>How do you intend to navigate the Arena?</span>
              </div>
              <div className="dual-button-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  className="liquid-btn animated-btn"
                  style={{ marginTop: 0, flex: 1, padding: '15px' }}
                  onClick={() => navigate('/Indiregi')}
                >
                  JOIN TEAM
                </button>
                <button
                  className="liquid-btn animated-btn"
                  style={{ marginTop: 0, flex: 1, padding: '15px' }}
                  onClick={() => navigate('/create-team')}
                >
                  CREATE TEAM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer-links-clean">
          <a 
            href="https://codehustle11.upeshypervision.in/#terms-conditions" 
            className="terms-link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </a>
          <p className="protocol-text">SECURE ENTRY PROTOCOL ACTIVE</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing_Page;