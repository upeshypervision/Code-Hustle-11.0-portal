import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import './Registration.css'; 
import './CreateTeam.css'; 

const CreateTeam = () => { 
const navigate = useNavigate(); 
const [step, setStep] = useState(1); 
const [valErrors, setValErrors] = useState({}); 
const [formData, setFormData] = useState({ 
tName: '', tBio: '', lName: '', sap: '', phone: '', email: '', universityType: '', 
m1: { fullName: '', sapid: '', email: '', phone: '', universityType: '' }, 
m2: { fullName: '', sapid: '', email: '', phone: '', universityType: '' }, 
m3: { fullName: '', sapid: '', email: '', phone: '', universityType: '' } 
}); 

const validateField = (name, value, uType, currentMemberKey) => { 
if (!value) return "Required Field"; 
if (name === 'email' && !value.includes("@")) return "Invalid format"; 
if (name === 'phone' && value.length !== 10) return "10 digits required"; 
if (name.includes('sap')) { 
if (uType === 'UPES' && value.length !== 9) return "Must be 9 digits"; 
const allSaps = [ 
{ key: 'leader', val: formData.sap }, 
{ key: 'm1', val: formData.m1.sapid }, 
{ key: 'm2', val: formData.m2.sapid }, 
{ key: 'm3', val: formData.m3.sapid } 
]; 
const duplicate = allSaps.find(s => s.val === value && s.key !== currentMemberKey); 
if (duplicate) return "Already used"; 
} 
return ""; 
}; 

const handleBlur = (field, value, uType, mKey) => { 
const error = validateField(field, value, uType, mKey); 
setValErrors(prev => ({ ...prev, [`${mKey}_${field}`]: error })); 
}; 

const isMemberValid = (m, currentKey) => { 
const emailErr = validateField('email', m.email); 
const phoneErr = validateField('phone', m.phone); 
const sapErr = validateField('sap', m.sapid, m.universityType, currentKey); 
return m.fullName && !emailErr && !phoneErr && !sapErr; 
}; 

const isStepValid = () => { 
if (step === 1) return formData.tName.trim() !== '' && formData.tBio.trim() !== ''; 
if (step === 2) { 
const err = validateField('sap', formData.sap, formData.universityType, 'leader'); 
return formData.lName.trim() !== '' && formData.universityType !== '' && !err; 
} 
if (step === 3) return formData.phone.length === 10 && formData.email.includes("@"); 
if (step === 5) return isMemberValid(formData.m1, 'm1'); 
if (step === 6) return isMemberValid(formData.m2, 'm2'); 
if (step === 7) return isMemberValid(formData.m3, 'm3'); 
return true; 
}; 

const nextNode = () => { if (isStepValid()) setStep(step + 1); }; 
const prevNode = () => { if (step > 1) setStep(step === 5 ? 4 : step - 1); }; 

const updateMember = (mKey, field, value) => { 
setFormData({ ...formData, [mKey]: { ...formData[mKey], [field]: value } }); 
}; 

const renderMemberNode = (mKey, nodeNum, label) => ( 
<div className="neural-node node-materialize"> 
<span className="label-detail">{label}</span> 
<div className="input-group"> 
<div className="label-row"><span>FULL NAME <span className="v-tag">*</span></span></div> 
<div className="glow-input-container"> 
<input className="glow-input" placeholder="Member Name..." value={formData[mKey].fullName} onChange={(e) => updateMember(mKey, 'fullName', e.target.value)} /> 
</div> 
</div> 
<div className="input-group" style={{ marginTop: '12px', zIndex: 10 }}> 
<div className="label-row"><span>UNIVERSITY <span className="v-tag">*</span></span></div> 
<div className="glow-input-container"> 
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
<div className={`glow-input-container ${valErrors[`${mKey}_sap`] ? 'error-border' : ''}`}> 
<input className="glow-input" placeholder={formData[mKey].universityType === 'UPES' ? '9 Digits' : 'Name'} value={formData[mKey].sapid} 
onChange={(e) => updateMember(mKey, 'sapid', e.target.value)} 
onBlur={(e) => handleBlur('sap', e.target.value, formData[mKey].universityType, mKey)} /> 
</div> 
{valErrors[`${mKey}_sap`] && <p className="error-message-inline">{valErrors[`${mKey}_sap`]}</p>} 
</div> 
)} 
<div className="input-group" style={{ marginTop: '12px' }}> 
<div className="label-row"><span>COMMUNICATION DETAILS <span className="v-tag">*</span></span></div> 
<div className={`dual-glow-capsule ${(valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]) ? 'error-border' : ''}`} style={{ display: 'flex', alignItems: 'center' }}> 
<input className="capsule-input-left" style={{ flex: 1, minWidth: 0 }} placeholder="Email Address" value={formData[mKey].email} 
onChange={(e) => updateMember(mKey, 'email', e.target.value)} 
onBlur={(e) => handleBlur('email', e.target.value, null, mKey)} /> 
<div className="capsule-divider"></div> 
<input className="capsule-input-right" style={{ flex: 1, minWidth: 0 }} placeholder="Phone" value={formData[mKey].phone} 
onChange={(e) => updateMember(mKey, 'phone', e.target.value)} 
onBlur={(e) => handleBlur('phone', e.target.value, null, mKey)} /> 
</div> 
{(valErrors[`${mKey}_email`] || valErrors[`${mKey}_phone`]) && <p className="error-message-inline">Check formats</p>} 
</div> 

<div className="forge-btn-group" style={{ marginTop: '20px', flexDirection: 'column', gap: '15px' }}> 
<div style={{ display: 'flex', gap: '10px', width: '100%' }}>
<button className="neon-shade-btn" style={{ background: 'rgba(255,255,255,0.05)', flex: 0.3 }} onClick={prevNode}>BACK</button> 
<button className={`neon-shade-btn next-glow ${!isStepValid() ? 'btn-locked' : ''}`} style={{ flex: 1 }} onClick={nextNode}> 
{nodeNum === 7 ? "FINALIZE ❯" : "NEXT MEMBER ❯"} 
</button> 

</div>

<br></br>

{isStepValid() && (

<button className="liquid-btn connect-btn-shimmer" style={{ width: '100%', padding: '30px' }} onClick={() => setStep(8)}>
SUBMIT & CONNECT SQUAD ❯
</button>
)}
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
<br></br>
</header> 

<div className="forge-progress-track"> 
<div className="forge-progress-glow" style={{ width: `${(step / 8) * 100}%` }}></div> 
</div> 

<div className="morph-interface"> 
{step === 1 && ( 
<div className="neural-node node-materialize"> 
<span className="label-detail">NODE_01: TEAM DETAILS</span> 
<div className="input-group"> 
<div className="label-row"><span>TEAM NAME <span className="v-tag">*</span></span></div> 
<div className="glow-input-container"> 
<input className="glow-input" autoFocus placeholder="Enter Team Name..." value={formData.tName} onChange={(e) => setFormData({ ...formData, tName: e.target.value })} /> 
</div> 
</div> 
<div className="input-group" style={{ marginTop: '12px' }}> 
<div className="label-row"><span>TEAM VISION <span className="v-tag">*</span></span></div> 
<div className="glow-input-container"> 
<textarea className="glow-input" rows="2" placeholder="Enter team Vision..." value={formData.tBio} onChange={(e) => setFormData({ ...formData, tBio: e.target.value })}></textarea> 
</div> 
</div> 
<button className={`neon-shade-btn next-glow ${!isStepValid() ? 'btn-locked' : ''}`} onClick={nextNode}>PROCEED ❯</button> 
</div> 
)} 

{step === 2 && ( 
<div className="neural-node node-materialize"> 
<span className="label-detail">NODE_02: LEADER DETAILS</span> 
<div className="input-group"> 
<div className="label-row"><span>FULL NAME <span className="v-tag">*</span></span></div> 
<div className="glow-input-container"> 
<input className="glow-input" placeholder="Leader Name..." value={formData.lName} onChange={(e) => setFormData({ ...formData, lName: e.target.value })} /> 
</div> 
</div> 
<div className="input-group" style={{ marginTop: '12px' }}> 
<div className="label-row"><span>UNIVERSITY <span className="v-tag">*</span></span></div> 
<div className="glow-input-container"> 
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
<div className={`glow-input-container ${valErrors['leader_sap'] ? 'error-border' : ''}`}> 
<input className="glow-input" placeholder={formData.universityType === 'UPES' ? '9 Digits' : 'Name'} value={formData.sap} 
onChange={(e) => setFormData({ ...formData, sap: e.target.value })} 
onBlur={(e) => handleBlur('sap', e.target.value, formData.universityType, 'leader')} /> 
</div> 
{valErrors['leader_sap'] && <p className="error-message-inline">{valErrors['leader_sap']}</p>} 
</div> 
)} 
<div className="forge-btn-group"><button className="neon-shade-btn" style={{ background: 'rgba(255,255,255,0.05)', flex: 0.3 }} onClick={prevNode}>BACK</button><button className={`neon-shade-btn next-glow ${!isStepValid() ? 'btn-locked' : ''}`} style={{ flex: 1 }} onClick={nextNode}>PROCEED ❯</button></div> 
</div> 
)} 

{step === 3 && ( 
<div className="neural-node node-materialize"> 
<span className="label-detail">NODE_03: CONTACT DETAILS</span> 
<div className="input-group"> 
<div className="label-row"><span>CONTACT INFO <span className="v-tag">*</span></span></div> 
<div className={`dual-glow-capsule ${(valErrors['leader_email'] || valErrors['leader_phone']) ? 'error-border' : ''}`} style={{ display: 'flex', alignItems: 'center' }}> 
<input className="capsule-input-left" style={{ flex: 1, minWidth: 0 }} placeholder="Email" value={formData.email} 
onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
onBlur={(e) => handleBlur('email', e.target.value, null, 'leader')} /> 
<div className="capsule-divider"></div> 
<input className="capsule-input-right" style={{ flex: 1, minWidth: 0 }} placeholder="Phone" value={formData.phone} 
onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
onBlur={(e) => handleBlur('phone', e.target.value, null, 'leader')} /> 
</div> 
{(valErrors['leader_email'] || valErrors['leader_phone']) && <p className="error-message-inline">Check email/phone formats</p>} 
</div> 
<div className="forge-btn-group" style={{ marginTop: '20px' }}> 
<button className="neon-shade-btn" style={{ background: 'rgba(255,255,255,0.05)', flex: 0.3 }} onClick={prevNode}>BACK</button> 
<button className={`neon-shade-btn next-glow ${!isStepValid() ? 'btn-locked' : ''}`} style={{ flex: 1 }} onClick={nextNode}>CREATE TEAM ❯</button> 
</div> 
</div> 
)} 

{step === 4 && ( 
<div className="neural-node node-materialize"> 
<span className="label-detail">NODE_04: SQUAD FORMATION</span> 
<div className="completion-vfx"><h2 className="glow-status-text">FORGE COMPLETE</h2> 
<br></br>
<p className="sub-hint">GET STARTED!</p></div>
<br></br>
<br></br>

<div className="shining-choice-row" style={{ marginTop: '20px' }}> 
<button className="liquid-btn add-btn-shimmer" onClick={() => setStep(5)}>ADD MEMBERS</button> 
<button className="liquid-btn connect-btn-shimmer" onClick={() => setStep(8)}>CONNECT PEOPLE</button> 
</div> 
</div> 
)} 

{step === 5 && renderMemberNode('m1', 5, "NODE_05: ADD MEMBER 02")} 
{step === 6 && renderMemberNode('m2', 6, "NODE_06: ADD MEMBER 03")} 
{step === 7 && renderMemberNode('m3', 7, "NODE_07: ADD MEMBER 04")} 

{step === 8 && ( 
<div className="neural-node node-materialize final-aura"> 
<div className="completion-vfx"><h2 className="glow-status-text">CONNECT TO COMPLETE YOUR SQUAD</h2>
<br></br>
<p className="sub-hint">TAP TO FIND YOUR TEAMMATE</p></div> 
<br></br>
<br></br>
<div className="kinetic-connector-zone"> 
<div className="neural-pulse-ring"></div> 
<button className="kinetic-shimmer-btn" onClick={() => navigate('/connect')}> 
<span className="shimmer-text">CONNECT</span> 
<div className="shimmer-sweep"></div> 
</button> 
</div> 
</div> 
)} 
</div> 

<footer className="footer-links-clean" style={{ marginTop: '50px' }}> 
<button className="back-link-forge" onClick={() => navigate('/')}>[ ABORT_TO_GATEWAY ]</button> 
</footer> 
</div> 
</div> 
); 
}; 

export default CreateTeam;