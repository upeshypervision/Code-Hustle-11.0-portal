import { useState, useEffect } from "react";

export default function PaymentValidation() {
  const [validationState, setValidationState] = useState("not_started");
  const [pendingTeams, setPendingTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPaymentValidationStatus();
    fetchPendingTeams();
  }, []);

  const fetchPaymentValidationStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/payment-validation-status', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setValidationState(data.status || "not_started");
    } catch (err) { console.error('Error:', err); }
  };

  const fetchPendingTeams = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/pending-payments', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setPendingTeams(data.teams || []);
    } catch (err) { console.error('Error:', err); } 
    finally { setLoading(false); }
  };

  const updateValidationStatus = async (newState) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/payment-validation-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ state: newState })
      });
      const data = await res.json();
      if (data.success) {
        setValidationState(newState);
        showNotification('success', data.message);
      }
    } catch (err) { showNotification('error', 'Update Failed'); }
  };

  const validatePayment = async (teamId, isValid) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/validate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ team_id: teamId, is_valid: isValid })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `${isValid ? 'Approved' : 'Rejected'} ${teamId}`);
        fetchPendingTeams();
      }
    } catch (err) { showNotification('error', 'Validation Failed'); }
  };

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) return (
    <div className="admin-loader">
        <div className="cyber-spinner"></div>
    </div>
  );

  return (
    <div className="cyber-admin-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`cyber-toast ${notification.type}`}>
          {notification.text}
        </div>
      )}

      {/* Global Toggle Panel */}
      <section className="queue-section">
        <h3 className="panel-title">Verification Queue ({pendingTeams.length})</h3>
        
        {pendingTeams.length === 0 ? (
          <div className="empty-state">NO PENDING TRANSACTIONS FOUND</div>
        ) : (
          <div className="grid-container">
            {pendingTeams.map((team, idx) => (
              <div key={idx} className="team-card animate-in">
                <div className="card-header">
                  <span className="team-id">{team.team_id}</span>
                  <span className="team-price">₹{team.amount}</span>
                </div>
                
                <div className="card-body">
                  <h4>{team.team_name}</h4>
                  <p>Leader: {team.leader?.fullName || 'N/A'}</p>
                  
                  {team.payment_screenshot ? (
                <a 
                    href={`http://localhost:5000/api/admin/payment-screenshot/${team.team_id}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="view-link"
                >
                  VIEW SCREENSHOT ↗
                </a>
                  ) : (
                    <span className="no-file">NO SCREENSHOT</span>
                  )}
                </div>

                <div className="card-actions">
                  <button className="action-btn approve" onClick={() => validatePayment(team.team_id, true)}>APPROVE</button>
                  <button className="action-btn reject" onClick={() => validatePayment(team.team_id, false)}>REJECT</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .cyber-admin-container {
          padding: 30px;
          min-height: 100vh;
          background: #020617;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        .glow-text {
          font-family: 'Syncopate', sans-serif;
          letter-spacing: 4px;
          text-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
          color: #38bdf8;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-bottom: 1px solid rgba(56, 189, 248, 0.2);
          padding-bottom: 20px;
        }

        .status-badge {
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid;
        }
        .status-badge[data-status='live'] { background: rgba(34,197,94,0.1); color: #4ade80; border-color: #22c55e; }
        .status-badge[data-status='not_started'] { background: rgba(245,158,11,0.1); color: #fbbf24; border-color: #f59e0b; }
        .status-badge[data-status='closed'] { background: rgba(239,68,68,0.1); color: #f87171; border-color: #ef4444; }

        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 25px;
          border-radius: 16px;
          margin-bottom: 30px;
        }

        .panel-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }

        .toggle-group {
          display: flex;
          gap: 15px;
        }

        .toggle-btn {
          flex: 1;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .toggle-btn.active[data-state='not_started'] { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.1); box-shadow: 0 0 15px rgba(245,158,11,0.2); }
        .toggle-btn.active[data-state='live'] { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,0.1); box-shadow: 0 0 15px rgba(34,197,94,0.2); }
        .toggle-btn.active[data-state='closed'] { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.1); box-shadow: 0 0 15px rgba(239,68,68,0.2); }

        /* Grid Layout for Team Cards */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .team-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 20px;
          transition: transform 0.2s;
        }

        .team-card:hover {
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(30, 41, 59, 0.8);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .team-id { color: #38bdf8; font-family: monospace; font-size: 0.9rem; }
        .team-price { color: #4ade80; font-weight: 800; }

        .card-body h4 { margin: 0 0 5px 0; font-size: 1.1rem; color: #fff; }
        .card-body p { margin: 0; color: #94a3b8; font-size: 0.85rem; }

        .view-link {
          display: inline-block;
          margin-top: 15px;
          color: #38bdf8;
          font-size: 0.75rem;
          text-decoration: none;
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 5px 10px;
          border-radius: 4px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .action-btn {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .approve { background: #059669; color: white; }
        .reject { background: #dc2626; color: white; }

        .cyber-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 25px;
          border-radius: 8px;
          z-index: 1000;
          animation: slideIn 0.3s forwards;
          font-weight: 600;
        }
        .cyber-toast.success { background: #065f46; border: 1px solid #10b981; color: #d1fae5; }
        .cyber-toast.error { background: #7f1d1d; border: 1px solid #ef4444; color: #fee2e2; }

        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}