import { useState } from 'react';

export default function AddParticipant() {
    const [newParticipant, setNewParticipant] = useState({
        fullName: '', sapId: '', email: '', phone: ''
    });
    const [participantMessage, setParticipantMessage] = useState({ type: '', text: '' });

    const handleAddParticipant = (e) => {
        e.preventDefault();
        if (!newParticipant.fullName || !newParticipant.sapId || !newParticipant.email) {
            setParticipantMessage({ type: 'error', text: 'Name, SAP ID, and Email are required.' });
            return;
        }
        setParticipantMessage({
            type: 'success',
            text: `Participant ${newParticipant.fullName} added successfully! Team ID and password will be generated.`
        });
        setNewParticipant({ fullName: '', sapId: '', email: '', phone: '' });
    };

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">Add Participant/Team</h2>
            </div>

            <div className="panel">
                <div className="panel-inner">
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                        Manually add a participant. Team ID and password will be auto-generated and sent via email.
                    </p>

                    <form onSubmit={handleAddParticipant} className="form">
                        <div className="form-row">
                            <label className="form-label" htmlFor="fullName">
                                Full Name
                                <span className="form-hint">As per university records</span>
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                className="form-input"
                                type="text"
                                value={newParticipant.fullName}
                                onChange={(e) => setNewParticipant({ ...newParticipant, fullName: e.target.value })}
                                placeholder="e.g., Ananya Sharma"
                            />
                        </div>

                        <div className="form-row">
                            <label className="form-label" htmlFor="sapId">
                                SAP ID
                                <span className="form-hint">Used as primary identifier</span>
                            </label>
                            <input
                                id="sapId"
                                name="sapId"
                                className="form-input"
                                type="text"
                                value={newParticipant.sapId}
                                onChange={(e) => setNewParticipant({ ...newParticipant, sapId: e.target.value })}
                                placeholder="e.g., 5000XXXX"
                            />
                        </div>

                        <div className="form-row">
                            <label className="form-label" htmlFor="email">
                                University Email
                                <span className="form-hint">Login details will be sent here</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                className="form-input"
                                type="email"
                                value={newParticipant.email}
                                onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                                placeholder="yourname@stu.upes.ac.in"
                            />
                        </div>

                        <div className="form-row">
                            <label className="form-label" htmlFor="phone">
                                Phone Number
                                <span className="form-hint">WhatsApp preferred</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                className="form-input"
                                type="tel"
                                value={newParticipant.phone}
                                onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                                placeholder="10-digit contact number"
                            />
                        </div>

                        {participantMessage.text && (
                            <div className={`message-box ${participantMessage.type}`}>
                                {participantMessage.text}
                            </div>
                        )}

                        <button type="submit" className="button-primary">
                            Add Participant
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
