import { useState, useRef } from 'react';

export default function PPTSubmission({ selectedPS, isSubmitted, onUploadSuccess }) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

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
        /* UPDATED WRAPPER FOR FULL SCREEN HEIGHT */
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(100vh - 80px)', 
            width: '150%',
            padding: '40px',
            boxSizing: 'border-box'
        }}>
            <div style={{ animation: 'fadeIn 0.5s ease-out', width: '100%', maxWidth: '900px', position: 'relative' }}>

                {selectedPS && (
                    <div style={{
                        position: 'absolute', top: '-25px', right: '0',
                        background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626',
                        padding: '5px 15px', borderRadius: '2px', fontSize: '0.65rem',
                        color: '#dc2626', fontWeight: '900', letterSpacing: '1.5px', zIndex: 10
                    }}>
                        TARGET ID: {selectedPS.id}
                    </div>
                )}

                {/* --- SECTION 1: TEMPLATE --- */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '8px', height: '24px', background: '#dc2626' }}></div>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>01. CHECK PPT TEMPLATE</h3>
                    </div>

                    <div style={{
                        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        borderRadius: '4px',
                        padding: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '40px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                    }}>
                        <div className="template-card-visual">
                            <div className="card-glare"></div>
                            <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px #dc2626)' }}>📄</div>
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <div style={{ height: '3px', width: '40px', background: '#dc2626', margin: '0 auto 5px' }}></div>
                                <span style={{ fontSize: '0.6rem', color: '#dc2626', fontWeight: '800', textTransform: 'uppercase' }}>Protocol_v2.1</span>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
                                Prior to initialization, participants are strictly required to review the <strong style={{ color: '#fff' }}>Phase 01 Submission Protocol</strong>. 
                                This dossier contains essential formatting rules, architectural requirements, and evaluation criteria necessary for a successful uplink.
                            </p>
                            <button className="download-btn-creative" onClick={handleDownloadTemplate}>
                                DOWNLOAD DOSSIER ↓
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2: UPLOAD --- */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '8px', height: '24px', background: isSubmitted ? '#10b981' : '#dc2626' }}></div>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>02. UPLOAD YOUR PPT</h3>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleFileAction}
                        style={{
                            border: isSubmitted ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '20px',
                            textAlign: 'center',
                            background: dragActive ? 'rgba(220, 38, 38, 0.05)' : isSubmitted ? 'rgba(16, 185, 129, 0.05)' : 'linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.4s ease',
                            cursor: isSubmitted ? 'default' : 'pointer',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                        }}
                        onClick={() => !isSubmitted && !pendingFile && fileInputRef.current.click()}
                    >
                        {/* INNER DOTTED BOX */}
                        <div style={{
                            border: isSubmitted ? 'none' : dragActive ? '2px dotted #dc2626' : '1px dotted rgba(220, 38, 38, 0.6)',
                            padding: '40px 20px',
                            borderRadius: '2px',
                            height: '100%',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
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
                                            <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '30px', fontWeight: 'bold', letterSpacing: '2px' }}>FILE READY FOR UPLINK</p>

                                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                                    className="uplink-btn-red"
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? 'SYNCHRONIZING...' : 'CONFIRM & SUBMIT'}
                                                </button>
                                                {!isUploading && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setPendingFile(null); }}
                                                        style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 20px', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                                    >
                                                        ABORT
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
                                            <h4 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', fontStyle: 'italic' }}>Drop Your PPT here or <span style={{ color: '#dc2626', textDecoration: 'underline' }}>browse</span></h4>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '30px', letterSpacing: '1px' }}>Accepted Formats: PDF, PPTX (Max 15MB)</p>

                                            <button className="uplink-btn-red">
                                                SELECT FILE
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                                    <div className="success-check-ring">✓</div>
                                    <h4 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '10px', fontWeight: '800' }}>PPT SUBMITTED SUCCESSFULLY</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>The vault is closed. Documentation has been locked for evaluation.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .template-card-visual {
                        width: 160px; height: 130px;
                        background: rgba(10, 10, 10, 0.8);
                        border: 1px solid rgba(220, 38, 38, 0.3);
                        border-radius: 4px;
                        flex-shrink: 0;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        position: relative; overflow: hidden;
                    }
                    .card-glare {
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        background: linear-gradient(45deg, transparent 45%, rgba(220,38,38,0.05) 50%, transparent 55%);
                    }
                    .download-btn-creative {
                        background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff;
                        padding: 12px 25px; border-radius: 2px; cursor: pointer;
                        font-weight: 900; font-size: 10px; letter-spacing: 2px;
                        transition: all 0.3s ease; text-transform: uppercase;
                    }
                    .download-btn-creative:hover { background: #fff !important; color: #000 !important; box-shadow: 0 0 20px #fff; border-color: #fff; }
                    
                    .uplink-btn-red {
                        padding: 16px 50px; background: #dc2626; border: none; color: #fff; 
                        font-weight: 900; border-radius: 2px; letter-spacing: 2px; cursor: pointer;
                        box-shadow: 0 0 20px rgba(220, 38, 38, 0.4); transition: all 0.3s ease;
                        text-transform: uppercase; font-size: 12px;
                    }
                    .uplink-btn-red:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(220, 38, 38, 0.6) !important; background: #b91c1c !important; }
                    
                    .upload-icon-wrapper { animation: float 3s infinite ease-in-out; }
                    .success-check-ring { width: 70px; height: 70px; border: 3px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 2.5rem; margin: 0 auto 20px; }
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}} />
            </div>
        </div>
    );
}