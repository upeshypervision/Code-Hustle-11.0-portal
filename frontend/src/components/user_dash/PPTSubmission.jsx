import { useState, useRef } from 'react';

export default function PPTSubmission({ selectedPS, isSubmitted, onUploadSuccess }) {
    // --- STATE & REFS - STRICTLY INTACT ---
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- HANDLERS - STRICTLY INTACT ---
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
            const res = await fetch('http://localhost:5001/api/submit-ppt-student', {
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
        /* FIX: Added overflowY: 'auto' and changed height logic to allow scrolling.
           The background is 'fixed', so it stays still while the content moves.
        */
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start', 
            height: '100vh',         // Lock viewport height
            width: '100%',
            padding: '100px 20px 60px 20px', 
            boxSizing: 'border-box',
            position: 'relative',
            overflowY: 'auto',       // ENABLE SCROLLING HERE
            overflowX: 'hidden'
        }}>
            
            {/* --- FIXED BACKGROUND - INTACT --- */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundImage: `url('https://www.hollywoodreporter.com/wp-content/uploads/2018/12/MoneyHeist.jpg?w=1296&h=730&crop=1')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'grayscale(0%) brightness(50%) contrast(70%)',
                zIndex: -2,
            }} />

            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.9) 100%)',
                zIndex: -1,
            }} />

            {/* HAMBURGER BUTTON - INTACT */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="heist-hamburger"
                style={{
                    display: 'none', position: 'fixed', top: '70px', left: '20px', zIndex: 1000,
                    background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #dc2626',
                    width: '45px', height: '45px', borderRadius: '4px', cursor: 'pointer',
                    flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '5px'
                }}
            >
                <div className={`line ${isMenuOpen ? 'cross-top' : ''}`} style={{ width: '25px', height: '2px', background: '#fff', transition: '0.3s' }}></div>
                <div className={`line ${isMenuOpen ? 'hide' : ''}`} style={{ width: '25px', height: '2px', background: '#fff', transition: '0.3s' }}></div>
                <div className={`line ${isMenuOpen ? 'cross-bottom' : ''}`} style={{ width: '25px', height: '2px', background: '#fff', transition: '0.3s' }}></div>
            </button>

            <div style={{ animation: 'fadeIn 0.5s ease-out', width: '100%', maxWidth: '900px', position: 'relative' }}>
                {selectedPS && (
                    <div style={{
                        position: 'absolute', top: '-35px', right: '0',
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
                    <div className="responsive-flex-card" style={{
                        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
                        backdropFilter: 'blur(10px)', border: '1px solid rgba(220, 38, 38, 0.2)',
                        borderRadius: '4px', padding: '30px', display: 'flex', alignItems: 'center', gap: '40px',
                        position: 'relative', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                    }}>
                        <div className="template-card-visual">
                            <div className="card-glare"></div>
                            <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px #dc2626)' }}>📄</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
                                Prior to initialization, review the <strong style={{ color: '#fff' }}>Phase 01 Submission Protocol</strong>.
                            </p>
                            <button className="download-btn-creative" onClick={handleDownloadTemplate}>DOWNLOAD DOSSIER ↓</button>
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
                            borderRadius: '4px', padding: '15px', textAlign: 'center',
                            background: dragActive ? 'rgba(220, 38, 38, 0.05)' : isSubmitted ? 'rgba(16, 185, 129, 0.05)' : 'linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
                            backdropFilter: 'blur(10px)', transition: 'all 0.4s ease', cursor: isSubmitted ? 'default' : 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                        }}
                        onClick={() => !isSubmitted && !pendingFile && fileInputRef.current.click()}
                    >
                        <div style={{ border: isSubmitted ? 'none' : dragActive ? '2px dotted #dc2626' : '1px dotted rgba(220, 38, 38, 0.6)', padding: '40px 20px', borderRadius: '2px' }}>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileAction} />
                            {!isSubmitted ? (
                                <>
                                    <div style={{ fontSize: '3.5rem', opacity: 0.4 }}>📤</div>
                                    <h4 className="upload-text-responsive" style={{ color: '#fff', textTransform: 'uppercase' }}>Drop Your PPT here or <span style={{ color: '#dc2626', textDecoration: 'underline' }}>browse</span></h4>
                                    <button className="uplink-btn-red" style={{ marginTop: '20px' }}>SELECT FILE</button>
                                </>
                            ) : (
                                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                                    <div className="success-check-ring">✓</div>
                                    <h4 style={{ color: '#10b981', fontWeight: '800' }}>PPT SUBMITTED</h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (max-width: 992px) {
                        .heist-hamburger { display: flex !important; }
                        aside, .sidebar-container { 
                            position: fixed !important; 
                            left: ${isMenuOpen ? '0' : '-300px'} !important; 
                            top: 0; height: 100vh; z-index: 999; 
                            transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .responsive-flex-card { flex-direction: column !important; text-align: center !important; }
                        .uplink-btn-red { width: 100%; padding: 16px 20px !important; }
                    }
                    .cross-top { transform: translateY(7px) rotate(45deg); }
                    .cross-bottom { transform: translateY(-7px) rotate(-45deg); }
                    .hide { opacity: 0; }
                    .template-card-visual { width: 160px; height: 130px; background: rgba(10, 10, 10, 0.8); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
                    .card-glare { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, transparent 45%, rgba(220,38,38,0.05) 50%, transparent 55%); }
                    .download-btn-creative { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 12px 25px; cursor: pointer; font-weight: 900; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; }
                    .uplink-btn-red { padding: 16px 50px; background: #dc2626; border: none; color: #fff; font-weight: 900; border-radius: 2px; letter-spacing: 2px; cursor: pointer; box-shadow: 0 0 20px rgba(220, 38, 38, 0.4); text-transform: uppercase; font-size: 12px; }
                    .success-check-ring { width: 70px; height: 70px; border: 3px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 2.5rem; margin: 0 auto 20px; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}} />
            </div>
        </div>
    );
}