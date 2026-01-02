import React from 'react';

export default function UserStatus({ selectedPS, isPPTSubmitted, isGithubSubmitted }) {
    const steps = [
        { label: 'TARGET SELECTED', done: !!selectedPS },
        { label: 'INTEL UPLOADED', done: isPPTSubmitted },
        { label: 'NETWORK LINKED', done: isGithubSubmitted },
    ];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            padding: '12px 25px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '4px',
                            background: step.done ? '#dc2626' : 'rgba(255, 255, 255, 0.39)',
                            border: `1px solid ${step.done ? '#ff4444' : 'rgba(255, 255, 255, 0.36)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '9px', fontWeight: 'bold',
                            boxShadow: step.done ? '0 0 15px rgba(220, 38, 38, 0.4)' : 'none',
                            transform: 'rotate(45deg)' /* Unique diamond shape */
                        }}>
                            <div style={{ transform: 'rotate(-45deg)' }}>
                                {step.done ? '✓' : index + 1}
                            </div>
                        </div>
                        <span style={{ 
                            fontSize: '8px', 
                            fontWeight: '900', 
                            color: step.done ? '#fff' : '#666', 
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase'
                        }}>
                            {step.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div style={{ 
                            width: '20px', 
                            height: '1px', 
                            background: step.done && steps[index+1].done ? '#dc2626' : 'rgba(255,255,255,0.1)' 
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}