import { useState, useRef } from 'react';

export default function PPTSubmission({ selectedPS, isSubmitted, onUploadSuccess }) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    // --- INTEGRATION: DOWNLOAD LOGIC ---
    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/assets/docs/linux_classactivity.pdf';
        link.download = 'linux_classactivity.pdf';
        link.click();
    };

    const handleFileAction = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
        if (file) {
            setPendingFile(file);
            setMessage({ type: '', text: '' });
        }
    };

    const handleUpload = async () => {
        if (!pendingFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', pendingFile);

        try {
            const res = await fetch('http://localhost:5000/api/submit-ppt-student', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                onUploadSuccess();
                setPendingFile(null);
            } else {
                setMessage({ type: 'error', text: data.error || 'Submission failed' });
            }
        } catch (err) {
            console.error('Submission error:', err);
            setMessage({ type: 'error', text: 'Server connection failed.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>

            {/* PROBLEM ID BADGE - Hide if no PS selected */}
            {selectedPS && (
                <div style={{
                    position: 'absolute', top: '-15px', right: '0',
                    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6',
                    padding: '5px 15px', borderRadius: '20px', fontSize: '0.65rem',
                    color: '#3b82f6', fontWeight: '900', letterSpacing: '1.5px', zIndex: 10
                }}>
                    ID: {selectedPS.id}
                </div>
            )}

            {/* --- SECTION 1: THE TECHNICAL BRIEF (TEMPLATE) --- */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '8px', height: '24px', background: '#3b82f6' }}></div>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '1px' }}>01. CHECK PPT TEMPLATE</h3>
                </div>

                <div style={{
                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.5))',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
                }}>
                    <div className="template-card-visual">
                        <div className="card-glare"></div>
                        <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px #3b82f6)' }}>📄</div>
                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <div style={{ height: '3px', width: '40px', background: '#3b82f6', margin: '0 auto 5px' }}></div>
                            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Protocol_v2.1</span>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
                            Prior to initialization, participants are strictly required to review the <strong style={{ color: '#fff' }}>Phase 01 Submission Protocol</strong>.
                            This document contains essential formatting rules, architectural requirements, and evaluation criteria necessary for a successful uplink.
                        </p>
                        <button className="download-btn-creative" onClick={handleDownloadTemplate}>
                            DOWNLOAD TEMPLATE ↓
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: THE UPLOAD BAY --- */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '8px', height: '24px', background: isSubmitted ? '#10b981' : '#3b82f6' }}></div>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '1px' }}>02. UPLOAD YOUR PPT</h3>
                </div>

                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleFileAction}
                    style={{
                        border: isSubmitted ? '2px solid #10b981' : dragActive ? '2px dashed #3b82f6' : '2px dashed #334155',
                        borderRadius: '24px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        background: dragActive ? 'rgba(59, 130, 246, 0.05)' : isSubmitted ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255,255,255,0.01)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: isSubmitted ? 'default' : 'pointer'
                    }}
                    onClick={() => !isSubmitted && !pendingFile && fileInputRef.current.click()}
                >
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileAction} />

                    {!isSubmitted ? (
                        <>
                            <div className="upload-icon-wrapper">
                                <div style={{ fontSize: '3.5rem', opacity: (dragActive || pendingFile) ? 1 : 0.4 }}>
                                    {pendingFile ? '📄' : '📤'}
                                </div>
                            </div>

                            {pendingFile ? (
                                <>
                                    <h4 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '5px', fontWeight: '600' }}>{pendingFile.name}</h4>
                                    <p style={{ color: '#3b82f6', fontSize: '0.85rem', marginBottom: '30px', fontWeight: 'bold' }}>FILE READY FOR UPLINK</p>

                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                            className="uplink-btn-neon"
                                            disabled={isUploading}
                                            style={{
                                                padding: '16px 40px',
                                                background: '#3b82f6',
                                                border: 'none',
                                                color: '#fff',
                                                fontWeight: '900',
                                                borderRadius: '6px',
                                                letterSpacing: '2px',
                                                cursor: 'pointer',
                                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                                            }}
                                        >
                                            {isUploading ? 'SYNCHRONIZING...' : 'CONFIRM & SUBMIT'}
                                        </button>
                                        {!isUploading && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPendingFile(null); }}
                                                style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                REMOVE
                                            </button>
                                        )}
                                    </div>
                                    {message.text && (
                                        <div style={{ marginTop: '20px', color: message.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                                            {message.text}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h4 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '10px', fontWeight: '600' }}>Drop Your PPT here or <span style={{ color: '#3b82f6', textDecoration: 'underline', textUnderlineOffset: '4px' }}>browse</span></h4>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '30px', letterSpacing: '0.5px' }}>Accepted Formats: PDF, PPTX (Max 15MB)</p>

                                    <button className="uplink-btn-neon" style={{ padding: '16px 50px', background: '#3b82f6', border: 'none', color: '#fff', fontWeight: '900', borderRadius: '6px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
                                        SELECT FILE
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                            <div className="success-check-ring">✓</div>
                            <h4 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '10px', fontWeight: '800' }}>PPT SUBMITTED SUCCESSFULLY</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Documentation has been locked and sent for evaluation.</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .template-card-visual {
                    width: 160px; height: 130px;
                    background: #1e293b;
                    border: 1px solid rgba(59, 130, 246, 0.4);
                    border-radius: 12px;
                    flex-shrink: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    position: relative; overflow: hidden;
                    box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1);
                }
                .card-glare {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.05) 50%, transparent 55%);
                }
                .download-btn-creative {
                    background: transparent; border: 1px solid #3b82f6; color: #3b82f6;
                    padding: 12px 25px; border-radius: 6px; cursor: pointer;
                    fontWeight: 800; fontSize: 0.75rem; letter-spacing: 1px;
                    transition: all 0.3s ease;
                }
                .download-btn-creative:hover { background: #3b82f6 !important; color: white !important; box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
                .uplink-btn-neon:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.6) !important; background: #2563eb !important; }
                .upload-icon-wrapper { animation: float 3s infinite ease-in-out; }
                .success-check-ring { width: 70px; height: 70px; border: 3px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 2.5rem; margin: 0 auto 20px; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}