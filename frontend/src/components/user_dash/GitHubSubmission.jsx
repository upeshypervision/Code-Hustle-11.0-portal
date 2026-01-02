import React, { useState } from 'react';

export default function GitHubSubmission({ onUpload, isSubmitted }) {
    const [link, setLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (link.trim()) {
            // In a real scenario, you'd perform an API call here
            onUpload(); 
        }
    };

    return (
        <div style={{ 
            padding: '40px', 
            background: 'rgba(30, 41, 59, 0.4)', 
            borderRadius: '24px', 
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
        }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', fontWeight: '900' }}>GITHUB REPOSITORY SUBMISSION</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                Please provide the public URL of your project repository to finalize the mission.
            </p>

            {isSubmitted ? (
                <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid #10b981' }}>
                    <p style={{ color: '#10b981', fontWeight: '700' }}>✓ GITHUB LINK SECURED AND VERIFIED</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', margin: '0 auto' }}>
                    <input 
                        type="url" 
                        placeholder="https://github.com/username/repository" 
                        required
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        style={{
                            padding: '15px',
                            borderRadius: '8px',
                            background: '#0f172a',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" className="cyber-action-btn-main">
                        SUBMIT REPOSITORY LINK
                    </button>
                </form>
            )}
        </div>
    );
}