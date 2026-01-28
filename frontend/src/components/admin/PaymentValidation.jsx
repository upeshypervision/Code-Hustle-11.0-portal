import React, { useState, useEffect } from 'react';
import socket from '../../socket'; // Make sure this socket connection exists
import './PaymentValidation.css'; // Add this CSS file

export default function PaymentValidation() {
    // 1. STATE: Using the structure from the Logic code
    const [pendingTeams, setPendingTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchPendingTeams();
    }, []);

    // Socket listener for new payment submissions (if you have one)
    useEffect(() => {
        socket.on("payment_submitted", fetchPendingTeams);
        return () => {
            socket.off("payment_submitted", fetchPendingTeams);
        };
    }, []);

    // 2. LOGIC: Fetch function for pending payment teams
    const fetchPendingTeams = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/admin/pending-payments', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok) {
                // Logic code expects data.teams
                setPendingTeams(data.teams || []);
            } else {
                setError(data.error || 'Failed to fetch pending payments');
            }
        } catch (err) {
            console.error('Fetch pending payments error:', err);
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    // 3. LOGIC: Handle Payment Validation from the Logic code
    const handlePaymentValidation = async (teamId, isValid) => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/validate-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    team_id: teamId, 
                    is_valid: isValid 
                }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showNotification('success', `${isValid ? 'Approved' : 'Rejected'} team ${teamId}: ${data.message}`);
                fetchPendingTeams(); // Refresh the list
            } else {
                if (res.status === 401 || res.status === 403) {
                    showNotification('error', "Your session has expired. Please log in again.");
                    // window.location.href = '/admin-login'; // Uncomment if you have routing setup
                } else {
                    showNotification('error', `${isValid ? 'Approve' : 'Reject'} failed: ${data.error || 'Unknown error'}`);
                }
            }
        } catch (err) {
            console.error('Validate payment error:', err);
            showNotification('error', 'Server connection failed.');
        }
    };

    // 4. LOGIC: Handle Screenshot View (using the same pattern as ViewSubmissions)
    const handleScreenshotView = async (teamId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/payment-screenshot/${teamId}?disposition=inline`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok && data.success) {
                window.open(data.url, '_blank');
            } else {
                if (res.status === 401 || res.status === 403) {
                    showNotification('error', "Your session has expired. Please log in again.");
                    // window.location.href = '/admin-login'; // Uncomment if you have routing setup
                } else {
                    showNotification('error', `View screenshot failed: ${data.error || 'Unknown error'}`);
                }
            }
        } catch (err) {
            console.error('View screenshot error:', err);
            showNotification('error', 'Server connection failed.');
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Helper: Date formatter from your UI code
    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) return (
        <div className="admin-section">
            <p>Loading Pending Payments...</p>
        </div>
    );

    if (error) return (
        <div className="admin-section" style={{ color: '#ef4444' }}>
            Error: {error}
        </div>
    );

    return (
        <div className="admin-section">
            {/* Notification Toast */}
            {notification && (
                <div className={`notification-toast ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="admin-section-header">
                <h2 className="admin-section-title">Payment Validation</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "5px" }}>
                    {pendingTeams.length} team{pendingTeams.length !== 1 ? "s" : ""} awaiting payment validation
                </p>
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        Teams that have submitted payment screenshots. Click "View Screenshot" to review, then approve or reject.
                    </p>

                    {pendingTeams.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                            No pending payment validations.
                        </p>
                    ) : (
                        // Mapping over the pending teams data
                        pendingTeams.map((team) => (
                            <div key={team.team_id} className="submission-card">
                                <div className="submission-info">
                                    {/* Team Name & ID */}
                                    <p className="submission-team">
                                        {team.team_name} <span style={{ opacity: 0.5, fontWeight: 400 }}>({team.team_id})</span>
                                    </p>

                                    {/* Meta Data */}
                                    <p className="submission-meta">
                                        Leader: <strong>{team.leader?.fullName || 'N/A'}</strong> · Amount: ₹{team.amount}
                                    </p>
                                    
                                    {/* Payment Screenshot Link */}
                                    <p className="submission-meta">
                                        Screenshot: 
                                        {team.payment_screenshot ? (
                                            <button
                                                className="btn-small btn-secondary"
                                                onClick={() => handleScreenshotView(team.team_id)}
                                                style={{ marginLeft: '8px' }}
                                            >
                                                View Screenshot
                                            </button>
                                        ) : (
                                            <span style={{ marginLeft: '8px', color: '#ef4444' }}>No screenshot</span>
                                        )}
                                    </p>
                                </div>

                                <div className="submission-actions">
                                    {/* Approve/Reject Buttons */}
                                    <button
                                        className="btn-small btn-success"
                                        onClick={() => handlePaymentValidation(team.team_id, true)}
                                    >
                                        Approve Payment
                                    </button>

                                    <button
                                        className="btn-small btn-danger"
                                        onClick={() => handlePaymentValidation(team.team_id, false)}
                                        style={{ marginLeft: '8px' }}
                                    >
                                        Reject Payment
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}