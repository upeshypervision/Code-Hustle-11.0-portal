import React, { useState } from 'react';

export default function PSGallery({ onSelect }) {
    const [expandedId, setExpandedId] = useState(null);

    const problemStatements = [
        {
            id: "PS-01",
            title: "Smart Campus Mobility",
            track: "IOT & URBAN TECH",
            difficulty: "Advanced",
            selections: 12,
            tags: ["#React", "#Node.js", "#Arduino"],
            description: "Design an end-to-end framework to optimize intra-campus logistics. The solution must integrate real-time sensor data to minimize wait times and maximize vehicle utility.",
            technical_brief: "System must interface with distributed sensor nodes via MQTT. High priority on developing a heuristic-based load balancing algorithm for autonomous fleet management.",
            constraints: ["Max latency < 200ms", "End-to-end encryption", "Low-power edge nodes"]
        },
        {
            id: "PS-02",
            title: "Dev Productivity Insights",
            track: "DEVELOPER TOOLS",
            difficulty: "Intermediate",
            selections: 8,
            tags: ["#Python", "#Git API", "#LLMs"],
            description: "Analyze behavioral patterns in version control systems to generate actionable insights for engineering leads to reduce technical debt and burnout.",
            technical_brief: "Integrate with GitHub REST/GraphQL APIs to ingest commit history. Implement NLP models to categorize commit messages and sentiment for developer wellness tracking.",
            constraints: ["OAuth2 compliance", "Scalable data ingestion", "Privacy-first processing"]
        },
        {
            id: "PS-03",
            title: "Green Energy Monitor",
            track: "SUSTAINABILITY",
            difficulty: "Expert",
            selections: 15,
            tags: ["#Data Science", "#Sensors", "#AWS"],
            description: "A predictive maintenance system for distributed energy resources. Use historical weather data to forecast energy output and detect hardware anomalies.",
            technical_brief: "Utilization of Time-Series Forecasting (LSTM/Prophet) to model energy decay. Data must be aggregated via AWS Kinesis and visualized for maintenance field crews.",
            constraints: ["99.9% prediction accuracy", "Edge gateway reliability", "Solar IR sensor integration"]
        }
    ];

    return (
        <div className="ps-container" style={{ color: '#fff', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <div style={{ 
                borderLeft: '4px solid #3b82f6', 
                background: 'rgba(59, 130, 246, 0.1)', 
                padding: '12px 20px', 
                marginBottom: '25px',
                borderRadius: '4px'
            }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    <span style={{ color: '#3b82f6' }}>IMPORTANT:</span>Project selection is final and limited to one track. Review all dossiers carefully before confirming.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {problemStatements.map((ps) => (
                    <div key={ps.id} style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                {/* Title Area */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <span style={{ color: '#fbbf24', fontSize: '0.7rem', border: '1px solid #fbbf24', padding: '2px 8px', borderRadius: '10px' }}>{ps.track}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>• {ps.difficulty}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px 0' }}>{ps.id}: {ps.title}</h3>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {ps.tags.map(tag => (
                                            <span key={tag} style={{ color: '#94a3b8', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Stats & Button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>{ps.selections}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Teams Joined</div>
                                    <div style={{ width: '60px', height: '3px', background: '#334155', marginTop: '5px' }}>
                                        <div style={{ width: '60%', height: '100%', background: '#3b82f6' }}></div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setExpandedId(expandedId === ps.id ? null : ps.id)}
                                    style={{
                                        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {expandedId === ps.id ? 'CLOSE SPECS ↑' : 'VIEW DETAILS →'}
                                </button>
                            </div>
                        </div>

                        {/* Detailed Expanded Info */}
                        {expandedId === ps.id && (
                            <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                                    <div>
                                        <h4 style={{ color: '#3b82f6', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>Core Objective</h4>
                                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>{ps.description}</p>
                                        
                                        <h4 style={{ color: '#3b82f6', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '20px', marginBottom: '10px' }}>Technical Requirement</h4>
                                        <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                            {ps.technical_brief}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ color: '#3b82f6', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>Operational Constraints</h4>
                                        <ul style={{ paddingLeft: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {ps.constraints.map(c => <li key={c} style={{ marginBottom: '8px' }}>{c}</li>)}
                                        </ul>

                                        <button 
                                            onClick={() => onSelect(ps)}
                                            style={{
                                                marginTop: '20px',
                                                width: '100%',
                                                padding: '16px',
                                                background: 'rgba(59, 130, 246, 0.05)', // Subtle transparent blue
                                                color: '#3b82f6', // Neon blue text
                                                border: '1px solid #3b82f6', // Sharp neon border
                                                borderRadius: '4px',
                                                fontWeight: '800',
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '2px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)', // Soft initial glow
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = '#3b82f6';
                                                e.target.style.color = '#fff';
                                                e.target.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(59, 130, 246, 0.05)';
                                                e.target.style.color = '#3b82f6';
                                                e.target.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.2)';
                                                e.target.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            Choose this Problem Statement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}