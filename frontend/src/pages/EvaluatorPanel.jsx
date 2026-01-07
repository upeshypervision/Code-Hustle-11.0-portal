import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed import "../components/admin/AdminPanel.css"; as it doesn't exist
import EvaluatorDashboard from "../components/evaluator/EvaluatorDashboard";

export default function EvaluatorPanel() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [evaluatorInfo, setEvaluatorInfo] = useState({ username: "Evaluator" });
    const navigate = useNavigate();

    const handleLogout = () => {
        // Logic for clearing cookie can be added here
        navigate("/evaluator-login");
    };

    return (
        <div className="dashboard-page">
            {/* Simplified Top Bar for Evaluator */}
            <div style={{
                height: '64px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                justifyContent: 'space-between',
                background: 'rgba(10, 10, 10, 0.5)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.2rem', color: '#fff' }}>
                    HYPERVISION <span style={{ color: '#3b82f6', fontSize: '0.8em' }}>EVALUATOR</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: '#94a3b8' }}>{evaluatorInfo.username}</span>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="admin-content-full" style={{ padding: '20px', width: '100%' }}>
                <main className="admin-content-wrapper">
                    <header className="admin-header">
                        <h1 className="admin-page-title">
                            {activeSection === "dashboard" && "Evaluation Dashboard"}
                        </h1>
                    </header>

                    <div className="admin-content-inner">
                        {activeSection === "dashboard" && <EvaluatorDashboard />}
                    </div>
                </main>
            </div>
        </div>
    );
}
