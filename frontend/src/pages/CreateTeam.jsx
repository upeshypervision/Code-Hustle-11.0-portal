import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';
import './CreateTeam.css';

const CreateTeam = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [valErrors, setValErrors] = useState({});
    const [formData, setFormData] = useState({
        tName: '', tBio: '', lName: '', lAbout: '', sap: '', phone: '', email: '', universityType: '',
        m1: { fullName: '', sapid: '', email: '', phone: '', universityType: '', bio: '' },
        m2: { fullName: '', sapid: '', email: '', phone: '', universityType: '', bio: '' },
        m3: { fullName: '', sapid: '', email: '', phone: '', universityType: '', bio: '' },
        m4: { fullName: '', sapid: '', email: '', phone: '', universityType: '', bio: '' }
    });

    // Define the backend API base URL
    const API_BASE = "http://localhost:5000"; // Or your backend server's address

    const validateField = (name, value, uType, currentMemberKey) => {
        if (!value) return "Required Field";
        if (name === 'email' && !value.includes("@")) return "Invalid format";
        if (name === 'phone' && value.length !== 10) return "10 digits required";
        if (name === 'sap' || name === 'sapid') {
            if (uType === 'UPES') {
                if (value.length !== 9) return "Must be 9 digits";

                const allSaps = [
                    { key: 'leader', val: formData.sap },
                    { key: 'm1', val: formData.m1.sapid },
                    { key: 'm2', val: formData.m2.sapid },
                    { key: 'm3', val: formData.m3.sapid },
                    { key: 'm4', val: formData.m4.sapid }
                ];
                const duplicate = allSaps.find(s => s.val === value && s.val !== '' && s.key !== currentMemberKey);
                if (duplicate) return "Already used";
            }
        }
        return "";
    };

    const handleBlur = (field, value, uType, mKey) => {
        const error = validateField(field, value, uType, mKey);
        setValErrors(prev => ({ ...prev, [`${mKey}_${field}`]: error }));
    };

    const isMemberValid = (mKey) => {
        const m = formData[mKey];
        const emailErr = validateField('email', m.email);
        const phoneErr = validateField('phone', m.phone);
        const sapErr = validateField('sapid', m.sapid, m.universityType, mKey);
        return m.fullName && m.bio && m.universityType && m.sapid && !emailErr && !phoneErr && !sapErr;
    };

    const isInitialFormValid = () => {
        const sapErr = validateField('sap', formData.sap, formData.universityType, 'leader');
        const emailErr = validateField('email', formData.email);
        const phoneErr = validateField('phone', formData.phone);

        return (
            formData.tName.trim() !== '' &&
            formData.tBio.trim() !== '' &&
            formData.lName.trim() !== '' &&
            formData.lAbout.trim() !== '' &&
            formData.universityType !== '' &&
            !sapErr && !emailErr && !phoneErr
        );
    };

    const updateMember = (mKey, field, value) => {
        setFormData({ ...formData, [mKey]: { ...formData[mKey], [field]: value } });
    };

    // --- NEW: submitCreateTeam function ---
    const submitCreateTeam = async () => {
        // Perform initial validation before sending
        if (!isInitialFormValid()) {
            console.log("Initial form is not valid");
            // You might want to show an error message here
            return;
        }

        // Check if at least one member is filled
        const hasValidMember = ['m1', 'm2', 'm3', 'm4'].some(key => isMemberValid(key));
        if (!hasValidMember) {
            console.log("At least one member is required");
            // You might want to show an error message here
            return;
        }

        try {
            // Prepare the payload to match the backend expected structure EXACTLY
            // Do NOT wrap members in an array. Send them as separate fields m1, m2, m3, m4.
            // Backend logic handles empty mX objects.
            const payloadToSend = {
                tName: formData.tName.trim(),
                tBio: formData.tBio.trim(),
                lName: formData.lName.trim(),
                lAbout: formData.lAbout.trim(),
                universityType: formData.universityType,
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                sap: formData.sap.trim(), // This field holds leader's SAP or college name depending on universityType
                // Send members as individual objects as expected by the backend
                m1: formData.m1,
                m2: formData.m2,
                m3: formData.m3,
                m4: formData.m4
            };

            console.log("Sending payload (exact backend format):", payloadToSend);

            const response = await fetch(`${API_BASE}/api/create-team`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payloadToSend) // Send the exact payload
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Something went wrong");
                return;
            }

            console.log("TEAM CREATED:", data);
            setStep(8); // Navigate to success screen (step 8)
        } catch (err) {
            console.error(err);
            alert("Server not reachable");
        }
    };
    // --- END NEW FUNCTION ---

    const renderMemberPage = (mKey, label, nextStep) => (
        <div className="neural-node node-materialize animate-in">
            <span className="label-detail">{label}</span>
            <div className="input-group">
                <div className="label-row"><span>FULL NAME <span className="v-tag">*</span></span></div>
                <div className={`glow-input-container animated-field ${valErrors[`${mKey}_fullName`] ? 'error-border' : ''}`}>
                    <input className="glow-input" placeholder="Member Name..." value={formData[mKey].fullName} onChange={(e) => updateMember(mKey, 'fullName', e.target.value)} onBlur={(e) => handleBlur('fullName', e.target.value, null, mKey)} />
                </div>
                {valErrors[`${mKey}_fullName`] && <p className="error-message-inline">{valErrors[`${mKey}_fullName`]}</p>}
            </div>

            <div className="input-group" style={{ marginTop: '12px' }}>
                <div className="label-row"><span>ABOUT & SKILLS <span className="v-tag">*</span></span></div>
                <div className={`glow-input-container animated-field ${valErrors[`${mKey}_bio`] ? 'error-border' : ''}`}>
                    <textarea className="glow-input" rows="2" placeholder="Technical stack, skills..." value={formData[mKey].bio} onChange={(e) => updateMember(mKey, 'bio', e.target.value)} onBlur={(e) => handleBlur('bio', e.target.value, null, mKey)}></textarea>
                </div>
                {valErrors[`${mKey}_bio`] && <p className="error-message-inline">{valErrors[`${mKey}_bio`]}</p>}
            </div>

            <div className="input-group" style={{ marginTop: '12px' }}>
                <div className="label-row"><span>UNIVERSITY <span className="v-tag">*</span></span></div>
                <div className="glow-input-container animated-field">
                    <select className="glow-input" value={formData[mKey].universityType} onChange={(e) => updateMember(mKey, 'universityType', e.target.value)}>
                        <option value="">Select</option>
                        <option value="UPES">UPES</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
            </div>

            {formData[mKey].universityType && (
                <div className="input-group" style={{ marginTop: '12px' }}>
                    <div className="label-row"><span>{formData[mKey].universityType === 'UPES' ? 'SAP ID' : 'UNI NAME'} <span className="v-tag">*</span></span></div>
                    <div className={`glow-input-container animated-field ${valErrors[`${mKey}_sapid`] ? 'error-border' : ''}`}>
                        <input className="glow-input" placeholder={formData[mKey].universityType === 'UPES' ? '9 Digits' : 'Name'} value={formData[mKey].sapid}
                            onChange={(e) => updateMember(mKey, 'sapid', e.target.value)}
                            onBlur={(e) => handleBlur('sapid', e.target.value, formData[mKey].universityType, mKey)} />
                    </div>
                    {valErrors[`${mKey}_sapid`] && <p className="error-message-inline">{valErrors[`${mKey}_sapid`]}</p>}
                </div>
            )}

            <div className="input-group" style={{ marginTop: '12px' }}>
                <div className="label-row"><span>CONTACT <span className="v-tag">*</span></span></div>
                <div className={`dual-glow-capsule animated-field ${(valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]) ? 'error-border' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                    <input className="capsule-input-left" placeholder="Email" value={formData[mKey].email} onChange={(e) => updateMember(mKey, 'email', e.target.value)} onBlur={(e) => handleBlur('email', e.target.value, null, mKey)} />
                    <div className="capsule-divider"></div>
                    <input className="capsule-input-right" placeholder="Phone" value={formData[mKey].phone} onChange={(e) => updateMember(mKey, 'phone', e.target.value)} onBlur={(e) => handleBlur('phone', e.target.value, null, mKey)} />
                </div>
                {(valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]) && <p className="error-message-inline">{valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]}</p>}
            </div>

            <div className="forge-btn-group" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="liquid-btn" style={{ flex: 0.3 }} onClick={() => setStep(prev => prev === 4 ? 1 : prev - 1)}>BACK</button>
                    <button
                        className={`liquid-btn animated-btn ${!isMemberValid(mKey) ? 'btn-locked' : ''}`}
                        style={{ flex: 1 }}
                        onClick={() => isMemberValid(mKey) && setStep(nextStep)}
                    >
                        {nextStep === 8 ? "FINALIZE ❯" : "NEXT MEMBER ❯"}
                    </button>
                </div>
                {/* ✅ FIXED: Call submitCreateTeam on the final member page button */}
                <button
                    className={`liquid-btn animated-btn submit-connect-btn ${!isMemberValid(mKey) ? 'btn-locked' : ''}`}
                    style={{ width: '100%', padding: '15px' }}
                    onClick={() => isMemberValid(mKey) && submitCreateTeam()} // Changed onClick to call submitCreateTeam
                >
                    SUBMIT & CONNECT TEAM ❯
                </button>
            </div>
        </div>
    );

    return (
        <div className="app-viewport forge-container">
            <div className="cosmic-bg"><div className="nebula-cloud-blue"></div><div className="nebula-cloud-purple"></div><div className="starfield"></div></div>

            <div className="portal-card animate-in forge-card">
                <header className="brand-header">
                    <div className="hypervision-badge">HYPERVISION</div>
                    <p className="presents-text">CODE-HUSTLE-11.0</p>
                </header>

                <div className="forge-progress-track">
                    <div className="forge-progress-glow" style={{ width: `${(step / 8) * 100}%` }}></div>
                </div>

                <div className="morph-interface">
                    {step === 1 && (
                        <div className="neural-node node-materialize">
                            <span className="label-detail">NODE: LEADER CORE</span>
                            <div className="input-group">
                                <div className="label-row"><span>TEAM NAME <span className="v-tag">*</span></span></div>
                                <div className={`glow-input-container animated-field ${valErrors['leader_tName'] ? 'error-border' : ''}`}>
                                    <input className="glow-input" autoFocus placeholder="The Avengers..." value={formData.tName} onChange={(e) => setFormData({ ...formData, tName: e.target.value })} onBlur={(e) => handleBlur('tName', e.target.value, null, 'leader')} />
                                </div>
                                {valErrors['leader_tName'] && <p className="error-message-inline">{valErrors['leader_tName']}</p>}
                            </div>

                            <div className="input-group" style={{ marginTop: '12px' }}>
                                <div className="label-row"><span>TEAM VISION <span className="v-tag">*</span></span></div>
                                <div className={`glow-input-container animated-field ${valErrors['leader_tBio'] ? 'error-border' : ''}`}>
                                    <textarea className="glow-input" rows="2" placeholder="What is your team goal?" value={formData.tBio} onChange={(e) => setFormData({ ...formData, tBio: e.target.value })} onBlur={(e) => handleBlur('tBio', e.target.value, null, 'leader')}></textarea>
                                </div>
                                {valErrors['leader_tBio'] && <p className="error-message-inline">{valErrors['leader_tBio']}</p>}
                            </div>

                            <div className="input-group" style={{ marginTop: '12px' }}>
                                <div className="label-row"><span>LEADER NAME <span className="v-tag">*</span></span></div>
                                <div className={`glow-input-container animated-field ${valErrors['leader_lName'] ? 'error-border' : ''}`}>
                                    <input className="glow-input" placeholder="Full Name..." value={formData.lName} onChange={(e) => setFormData({ ...formData, lName: e.target.value })} onBlur={(e) => handleBlur('lName', e.target.value, null, 'leader')} />
                                </div>
                                {valErrors['leader_lName'] && <p className="error-message-inline">{valErrors['leader_lName']}</p>}
                            </div>

                            <div className="input-group" style={{ marginTop: '12px' }}>
                                <div className="label-row"><span>ABOUT LEADER <span className="v-tag">*</span></span></div>
                                <div className={`glow-input-container animated-field ${valErrors['leader_lAbout'] ? 'error-border' : ''}`}>
                                    <textarea className="glow-input" rows="2" placeholder="Bio & Technical skills..." value={formData.lAbout} onChange={(e) => setFormData({ ...formData, lAbout: e.target.value })} onBlur={(e) => handleBlur('lAbout', e.target.value, null, 'leader')}></textarea>
                                </div>
                                {valErrors['leader_lAbout'] && <p className="error-message-inline">{valErrors['leader_lAbout']}</p>}
                            </div>

                            <div className="input-group" style={{ marginTop: '12px' }}>
                                <div className="label-row"><span>UNIVERSITY <span className="v-tag">*</span></span></div>
                                <div className="glow-input-container animated-field">
                                    <select className="glow-input" value={formData.universityType} onChange={(e) => setFormData({ ...formData, universityType: e.target.value, sap: '' })}>
                                        <option value="">Select</option>
                                        <option value="UPES">UPES</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>

                            {formData.universityType && (
                                <div className="input-group" style={{ marginTop: '12px' }}>
                                    <div className="label-row"><span>{formData.universityType === 'UPES' ? 'SAP ID' : 'UNI NAME'} <span className="v-tag">*</span></span></div>
                                    <div className={`glow-input-container animated-field ${valErrors['leader_sap'] ? 'error-border' : ''}`}>
                                        <input className="glow-input" placeholder={formData.universityType === 'UPES' ? '9 Digits' : 'Name'} value={formData.sap}
                                            onChange={(e) => setFormData({ ...formData, sap: e.target.value })}
                                            onBlur={(e) => handleBlur('sap', e.target.value, formData.universityType, 'leader')} />
                                    </div>
                                    {valErrors['leader_sap'] && <p className="error-message-inline">{valErrors['leader_sap']}</p>}
                                </div>
                            )}

                            <div className="input-group" style={{ marginTop: '20px' }}>
                                <div className="label-row"><span>CONTACT INFO <span className="v-tag">*</span></span></div>
                                <div className={`dual-glow-capsule animated-field ${(valErrors['leader_email'] || valErrors['leader_phone']) ? 'error-border' : ''}`} style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                    <input className="capsule-input-left" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onBlur={(e) => handleBlur('email', e.target.value, null, 'leader')} />
                                    <div className="capsule-divider"></div>
                                    <input className="capsule-input-right" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} onBlur={(e) => handleBlur('phone', e.target.value, null, 'leader')} />
                                </div>
                                {(valErrors['leader_email'] || valErrors['leader_phone']) && <p className="error-message-inline">{valErrors['leader_email'] || valErrors['leader_phone']}</p>}
                            </div>

                            {isInitialFormValid() && (
                                <div className="neural-node node-materialize animate-in" style={{ marginTop: '20px', border: 'none', padding: 0 }}>
                                    <div className="shining-choice-row">
                                        <button className="liquid-btn animated-btn" onClick={() => setStep(4)}>ADD MEMBERS</button>
                                        <button className="liquid-btn connect-btn-shimmer animated-btn" onClick={submitCreateTeam}>CREATE TEAM</button> {/* Changed onClick to call submitCreateTeam */}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && renderMemberPage('m1', 'NODE_02: MEMBER 02 DETAILS', 5)}
                    {step === 5 && renderMemberPage('m2', 'NODE_03: MEMBER 03 DETAILS', 6)}
                    {step === 6 && renderMemberPage('m3', 'NODE_04: MEMBER 04 DETAILS', 7)}
                    {step === 7 && renderMemberPage('m4', 'NODE_05: MEMBER 05 DETAILS', 8)}

                    {step === 8 && (
                        <div className="neural-node node-materialize final-aura success-node">
                            <div className="completion-vfx">
                                <h2 className="glow-status-text">TEAM CREATED SUCCESSFULLY!</h2>
                                <br></br>
                                <br></br>
                            </div>
                            <div className="forge-btn-group" style={{ marginTop: '30px' }}>
                                <button className="liquid-btn animated-btn" style={{ width: '100%' }} onClick={() => navigate('/connect')}>ACKNOWLEDGE</button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CreateTeam;