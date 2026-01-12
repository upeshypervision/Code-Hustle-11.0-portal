import { useState, useRef, useEffect } from 'react';
import socket from '../../socket';
import strangerThingsBg from '../../assets/StrangerThings-bg.png';

export default function PPTSubmission({ selectedPS, isSubmitted, onUploadSuccess }) {
    // --- STATE & REFS ---
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [submittedFile, setSubmittedFile] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [localIsSubmitted, setLocalIsSubmitted] = useState(false);
    const [roundActive, setRoundActive] = useState(true);
    const [checkingRound, setCheckingRound] = useState(true);
    const [hackerrankStatus, setHackerrankStatus] = useState(null);
    const [checkingHackerrank, setCheckingHackerrank] = useState(true);
    const fileInputRef = useRef(null);

    // --- CHECK SUBMISSION STATUS ---
    useEffect(() => {
        const checkSubmissionStatus = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/check-ppt-submission", {
                    credentials: "include",
                });
                const data = await res.json();

                if (data.success && data.is_submitted) {
                    setLocalIsSubmitted(true);
                    setSubmittedFile(data.submission);
                }
            } catch (err) {
                console.error("Error checking submission status:", err);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkSubmissionStatus();
    }, []);

    // Check Hackerrank approval status
    useEffect(() => {
        const checkHackerrankStatus = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/check-hackerrank-submission", {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success && data.is_submitted) {
                    setHackerrankStatus(data.submission.approval_status);
                } else {
                    setHackerrankStatus("not_submitted");
                }
            } catch (err) {
                console.error("Error checking Hackerrank status:", err);
            } finally {
                setCheckingHackerrank(false);
            }
        };
        checkHackerrankStatus();
    }, []);

    // Listen for Hackerrank approval updates
    useEffect(() => {
        const handleApprovalUpdate = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/check-hackerrank-submission", {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success && data.is_submitted) {
                    setHackerrankStatus(data.submission.approval_status);
                }
            } catch (err) {
                console.error("Error refetching Hackerrank status:", err);
            }
        };
        socket.on("hackerrank_approval_updated", handleApprovalUpdate);
        return () => socket.off("hackerrank_approval_updated", handleApprovalUpdate);
    }, []);

    // Listen for PPT approval updates
    useEffect(() => {
        const handlePPTApprovalUpdate = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/check-ppt-submission", {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success && data.is_submitted) {
                    setSubmittedFile(data.submission);
                }
            } catch (err) {
                console.error("Error refetching PPT status:", err);
            }
        };
        socket.on("ppt_approval_updated", handlePPTApprovalUpdate);
        return () => socket.off("ppt_approval_updated", handlePPTApprovalUpdate);
    }, []);

    // --- CHECK ROUND STATUS ---
    useEffect(() => {
        const checkRoundStatus = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/round-status", {
                    credentials: "include",
                });
                const data = await res.json();

                if (data.success) {
                    // Check if round is 'live' (enum state: 'live', 'closed', 'not_started')
                    setRoundActive(data.rounds.ppt_upload === 'live');
                }
            } catch (err) {
                console.error("Error checking round status:", err);
            } finally {
                setCheckingRound(false);
            }
        };

        checkRoundStatus();
    }, []);

    // --- SOCKET LISTENER ---
    useEffect(() => {
        const handleRoundChange = (data) => {
            if (data.round_type === 'ppt_upload') {
                // data.state is enum: 'live', 'closed', 'not_started'
                setRoundActive(data.state === 'live');
            }
        };

        socket.on("round_status_changed", handleRoundChange);
        return () => socket.off("round_status_changed", handleRoundChange);
    }, []);

    // --- HANDLERS ---
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
                setLocalIsSubmitted(true);
                setSubmittedFile({
                    file_name: pendingFile.name,
                    submitted_at: new Date().toISOString()
                });
                onUploadSuccess();
                setPendingFile(null);
                setMessage({ type: '', text: '' });
            } else {
                if (res.status === 403) {
                    setMessage({
                        type: 'error',
                        text: data.error || 'Submission round closed.'
                    });
                } else {
                    setMessage({ type: 'error', text: data.error || 'Submission failed' });
                }
            }
        } catch (err) {
            console.error('Submission error:', err);
            setMessage({ type: 'error', text: 'Server connection failed.' });
        } finally {
            setIsUploading(false);
        }
    };

    // Helper to consolidate submission status
    const hasUserSubmitted = localIsSubmitted || isSubmitted;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            padding: '20px 20px 40px 20px',
            boxSizing: 'border-box',
            position: 'relative',
            minHeight: '100vh',
        }}>

            {/* --- BACKGROUNDS --- */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundImage: `url(${strangerThingsBg})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: '1',
                zIndex: 0,
                pointerEvents: 'none',
            }} />

            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'radial-gradient(circle at 40% 70%, transparent 10%, rgba(20, 16, 16, 0.42) 100%)',
                zIndex: 1,
                pointerEvents: 'none',
            }} />

            {/* --- RENDERING LOGIC --- */}

            {checkingRound || checkingStatus ? (
                /* 1. Loading State */
                <div className="ppt-container-main" style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'rgba(255,255,255,0.6)',
                    width: '100%',
                    maxWidth: '800px',
                    minHeight: '50vh',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p>Loading...</p>
                </div>
            ) : (hackerrankStatus && hackerrankStatus !== 'approved' && !hasUserSubmitted) ? (
                /* 2. Not Allowed (Round 1 Not Approved) */
                <div className="ppt-container-main" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '8px',
                    animation: 'fadeIn 0.5s ease-out',
                    width: '100%',
                    maxWidth: '800px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚫</div>
                    <h2 style={{
                        color: '#ef4444',
                        fontWeight: '900',
                        fontSize: '2.5rem',
                        letterSpacing: '3px',
                        marginBottom: '15px'
                    }}>
                        NOT ALLOWED
                    </h2>
                    <p style={{
                        color: '#fff',
                        fontSize: '1.2rem',
                        marginBottom: '15px',
                        maxWidth: '600px'
                    }}>
                        Sorry, you are not allowed in this round.
                    </p>
                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '1rem'
                    }}>
                        You must be approved in Round 1 (Hackerrank) to submit PPT.
                    </p>
                </div>
            ) : (!roundActive && !hasUserSubmitted) ? (
                /* 3. Round Closed UI */
                <div className="ppt-container-main" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '8px',
                    animation: 'fadeIn 0.5s ease-out',
                    width: '100%',
                    maxWidth: '800px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🔒</div>
                    <h2 style={{
                        color: '#ef4444',
                        fontWeight: '900',
                        fontSize: '2.5rem',
                        letterSpacing: '3px',
                        marginBottom: '15px'
                    }}>
                        ROUND CLOSED
                    </h2>
                    <p style={{
                        color: '#fff',
                        fontSize: '1.2rem',
                        marginBottom: '15px',
                        maxWidth: '600px'
                    }}>
                        PPT Submission is currently not available.
                    </p>
                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '1rem'
                    }}>
                        ⏳ Please wait for the organizing committee to activate this round.
                    </p>
                </div>
            ) : (
                /* 3. Main Content Card */
                <div className="ppt-container-main" style={{
                    animation: 'fadeIn 0.5s ease-out',
                    width: '100%',
                    maxWidth: '800px',
                    position: 'relative',
                    background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '8px',
                    padding: '40px',
                    minHeight: '50vh',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)'
                }}>

                    {selectedPS && (
                        <div style={{
                            position: 'absolute', top: '15px', right: '20px',
                            background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626',
                            padding: '5px 15px', borderRadius: '2px', fontSize: '0.75rem',
                            color: '#dc2626', fontWeight: '900', letterSpacing: '1.5px', zIndex: 10
                        }}>
                            TARGET ID: {selectedPS.id}
                        </div>
                    )}

                    <h2 style={{
                        color: '#fff',
                        fontFamily: '"Della Respira", serif',
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        margin: 0,
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        paddingBottom: '15px'
                    }}>
                        <span style={{ marginRight: '10px' }}>📄</span> PROBLEM STATEMENT PROTOCOL
                    </h2>

                    {/* --- SECTION 1: TEMPLATE --- */}
                    <div className="ppt-section" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ width: '4px', height: '20px', background: '#dc2626' }}></div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>01. CHECK PPT TEMPLATE</h3>
                        </div>

                        <div className="responsive-flex-card" style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            borderRadius: '4px', padding: '20px', display: 'flex', alignItems: 'center', gap: '30px',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div className="template-card-visual">
                                <div className="card-glare"></div>
                                <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px #dc2626)' }}>📄</div>
                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                    <div style={{ height: '2px', width: '30px', background: '#dc2626', margin: '0 auto 5px' }}></div>
                                    <span style={{ fontSize: '0.6rem', color: '#dc2626', fontWeight: '800', textTransform: 'uppercase' }}>Protocol_v2.1</span>
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '15px' }}>
                                    Review the <strong style={{ color: '#fff' }}>Phase 01 Submission Protocol</strong> before starting.
                                </p>
                                <button className="download-btn-creative" onClick={handleDownloadTemplate}>
                                    DOWNLOAD DOSSIER ↓
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- SECTION 2: UPLOAD --- */}
                    <div className="ppt-section" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ width: '4px', height: '20px', background: hasUserSubmitted ? '#10b981' : '#dc2626' }}></div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>02. UPLOAD YOUR PPT</h3>
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleFileAction}
                            style={{
                                border: hasUserSubmitted
                                    ? (submittedFile?.approval_status === 'approved' ? '2px solid #10b981'
                                        : submittedFile?.approval_status === 'rejected' ? '2px solid #ef4444'
                                            : '2px solid #eab308')
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px', padding: '15px', textAlign: 'center',
                                background: dragActive ? 'rgba(220, 38, 38, 0.05)'
                                    : hasUserSubmitted
                                        ? (submittedFile?.approval_status === 'approved' ? 'rgba(16, 185, 129, 0.05)'
                                            : submittedFile?.approval_status === 'rejected' ? 'rgba(239, 68, 68, 0.05)'
                                                : 'rgba(234, 179, 8, 0.05)')
                                        : 'rgba(0,0,0,0.3)',
                                transition: 'all 0.4s ease',
                                cursor: hasUserSubmitted ? 'default' : 'pointer'
                            }}
                            // Only allow click if NOT submitted
                            onClick={() => !hasUserSubmitted && !pendingFile && fileInputRef.current.click()}
                        >
                            {/* Inner Dotted Box */}
                            <div style={{
                                border: hasUserSubmitted ? 'none' : dragActive ? '2px dotted #dc2626' : '1px dotted rgba(220, 38, 38, 0.6)',
                                padding: '30px',
                                borderRadius: '2px',
                                background: 'rgba(0,0,0,0.2)'
                            }}>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileAction} />

                                {hasUserSubmitted ? (
                                    /* --- SUCCESS UI WITH APPROVAL STATUS --- */
                                    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                                        <div style={{
                                            fontSize: "3rem",
                                            color: submittedFile?.approval_status === 'approved' ? '#22c55e' :
                                                submittedFile?.approval_status === 'rejected' ? '#ef4444' : '#eab308',
                                            marginBottom: '15px'
                                        }}>
                                            {submittedFile?.approval_status === 'approved' ? '🎉' :
                                                submittedFile?.approval_status === 'rejected' ? '❌' : '⏳'}
                                        </div>
                                        <h4 style={{
                                            color: submittedFile?.approval_status === 'approved' ? "#22c55e" :
                                                submittedFile?.approval_status === 'rejected' ? "#ef4444" : "#eab308",
                                            fontWeight: '900',
                                            fontSize: '1.5rem',
                                            marginBottom: '10px',
                                            letterSpacing: '1px'
                                        }}>
                                            {submittedFile?.approval_status === 'approved' ? 'CONGRATS! APPROVED' :
                                                submittedFile?.approval_status === 'rejected' ? 'SORRY, NOT SELECTED' :
                                                    'REVIEW PENDING'}
                                        </h4>
                                        {submittedFile?.approval_status === 'approved' && (
                                            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", margin: "0 0 10px 0" }}>
                                                Your PPT has been verified and approved!
                                            </p>
                                        )}
                                        {submittedFile?.approval_status === 'pending' && (
                                            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", margin: "0 0 10px 0" }}>
                                                Your submission is currently under review by our team.
                                            </p>
                                        )}
                                        {submittedFile?.approval_status === 'rejected' && (
                                            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", margin: "0 0 10px 0" }}>
                                                Unfortunately, your submission did not meet the criteria.
                                            </p>
                                        )}
                                        {submittedFile && (
                                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '10px' }}>
                                                <strong style={{ color: '#fff' }}>File:</strong> {submittedFile.file_name}
                                            </p>
                                        )}
                                    </div>
                                ) : checkingStatus ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                                        <p>Checking submission status...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* --- PENDING FILE UI --- */}
                                        {pendingFile ? (
                                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                                <div className="upload-icon-wrapper">
                                                    <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>📄</div>
                                                </div>

                                                <h4 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '5px', fontWeight: '600' }}>{pendingFile.name}</h4>
                                                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '30px', fontWeight: 'bold', letterSpacing: '2px' }}>FILE READY FOR UPLINK</p>

                                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                                                            style={{
                                                                background: 'transparent', border: '1px solid #ef4444',
                                                                color: '#ef4444', padding: '12px 25px', borderRadius: '2px',
                                                                cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                                                                letterSpacing: '1px'
                                                            }}
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
                                            </div>
                                        ) : (
                                            /* --- DEFAULT UPLOAD UI --- */
                                            <>
                                                <div style={{ fontSize: '3.5rem', opacity: 0.4 }}>📤</div>
                                                <h4 className="upload-text-responsive" style={{ color: '#fff', textTransform: 'uppercase', marginTop: '15px' }}>
                                                    Drop Your PPT here or <span style={{ color: '#dc2626', textDecoration: 'underline' }}>browse</span>
                                                </h4>
                                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '20px', letterSpacing: '1px' }}>Accepted Formats: PDF, PPTX (Max 15MB)</p>

                                                <button className="uplink-btn-red" style={{ marginTop: '10px' }}>SELECT FILE</button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- STYLES --- */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                    .ppt-section { margin-bottom: 20px; }

                    @media (max-width: 992px) {
                        aside, .sidebar-container {}
                        .responsive-flex-card { 
                            flex-direction: column !important; 
                            text-align: center !important; 
                            padding: 20px !important;
                            gap: 20px !important;
                        }
                        .uplink-btn-red { width: 100%; padding: 16px 20px !important; }
                    }
                    .template-card-visual { 
                        width: 140px; height: 110px; 
                        background: rgba(10, 10, 10, 0.8); 
                        border: 1px solid rgba(220, 38, 38, 0.3); 
                        border-radius: 4px; flex-shrink: 0; 
                        display: flex; flex-direction: column; align-items: center; justify-content: center; 
                        position: relative; overflow: hidden; 
                    }
                    .card-glare { 
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                        background: linear-gradient(45deg, transparent 45%, rgba(220,38,38,0.05) 50%, transparent 55%); 
                    }
                    .download-btn-creative { 
                        background: transparent; border: 1px solid #dc2626; color: #dc2626; 
                        padding: 10px 20px; cursor: pointer; font-weight: 800; font-size: 0.8rem; 
                        letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s ease;
                        border-radius: 2px;
                    }
                    .download-btn-creative:hover { 
                        background: #dc2626; 
                        color: #fff; 
                        box-shadow: 0 0 15px rgba(220, 38, 38, 0.4); 
                    }
                    
                    .uplink-btn-red { 
                        padding: 16px 40px; 
                        background: linear-gradient(90deg, #991b1b, #dc2626, #991b1b);
                        background-size: 200% auto;
                        border: none; color: #fff; 
                        font-weight: 900; border-radius: 2px; letter-spacing: 1px; cursor: pointer; 
                        box-shadow: 0 0 20px rgba(220, 38, 38, 0.4); text-transform: uppercase; font-size: 0.9rem; 
                        transition: all 0.3s ease;
                        animation: shine-red 3s linear infinite;
                    }
                    .uplink-btn-red:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(220, 38, 38, 0.6) !important; background-position: right center; }
                    .uplink-btn-red:disabled { opacity: 0.7; cursor: not-allowed; background: #222; animation: none; box-shadow: none; color: #555; }
                    
                    @keyframes shine-red { to { background-position: 200% center; } }

                    .success-check-ring { 
                        width: 70px; height: 70px; border: 3px solid #10b981; border-radius: 50%; 
                        display: flex; align-items: center; justify-content: center; 
                        color: #10b981; font-size: 2.5rem; margin: 0 auto 20px; 
                    }
                    
                    .upload-icon-wrapper { animation: float 3s infinite ease-in-out; }
                    
                    .ppt-container-main {
                        transform: translateX(-100px);
                    }
                    
                    @media (max-width: 768px) {
                        .ppt-container-main {
                            transform: translateX(0);
                        }
                    }
                    
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `}} />
                </div>
            )}
        </div>
    );
}