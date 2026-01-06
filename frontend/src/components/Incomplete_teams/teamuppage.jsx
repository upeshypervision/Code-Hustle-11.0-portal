import React from "react";
import Navbar from "../Navbar";
import "../../styles/global.css"; // Ensure global styles are available

import "./TeamUpPage.css";

const TeamUpPage = () => {
    const [selectedMember, setSelectedMember] = React.useState(null);
    const [selectedRequest, setSelectedRequest] = React.useState(null);
    const [chatTarget, setChatTarget] = React.useState(null);
    const [chatMessage, setChatMessage] = React.useState("");
    const [isChatExpanded, setIsChatExpanded] = React.useState(false);

    // Dummy Chat History
    // BACKEND INTEGRATION:
    // 1. DELETE this dummyChatHistory array.
    // 2. Fetch chat history from the backend using an API endpoint (e.g., GET /api/chat/:userId).
    // 3. This should be done inside a useEffect when 'chatTarget' changes.
    const dummyChatHistory = [
        { id: 1, sender: "them", text: "Hii!" },
        { id: 2, sender: "me", text: "Hey! Thanks for reaching out. What's your tech stack?" },
        { id: 3, sender: "them", text: "I work with React, Node.js, and MongoDB." },
        { id: 4, sender: "me", text: "That sounds perfect for our project!" }
    ];

    const handleChatOpen = (target) => {
        setChatTarget(target);
        if (selectedRequest) closeRequestModal();

        // BACKEND INTEGRATION:
        // 1. When chat opens, initiate a WebSocket room or fetch previous messages for 'target.id'.
        // 2. Example: socket.emit('join_room', { roomId: generatedRoomId(currentUser.id, target.id) });
        // 3. Example: fetch(`/api/messages/${target.id}`).then(res => setMessages(res.data));
    };

    const closeChatModal = () => {
        setChatTarget(null);
        setChatMessage("");
        setIsChatExpanded(false);
    };

    const toggleChatExpand = () => {
        setIsChatExpanded(!isChatExpanded);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        // BACKEND INTEGRATION:
        // 1. Emit the message via WebSocket for real-time delivery.
        //    Example: socket.emit('send_message', { to: chatTarget.id, message: chatMessage });
        // 2. Optimistically update the UI (append message to local state).
        // 3. Alternatively, make a POST request to save the message:
        //    fetch('/api/messages/send', { method: 'POST', body: ... })

        // console.log(`Sending message to ${chatTarget.name}: ${chatMessage}`);
        setChatMessage("");
    };

    // Dummy Data Initial State
    // BACKEND INTEGRATION:
    // 1. DELETE this initialTeamData object.
    // 2. Create a useEffect hook to fetch team data when the component mounts.
    //    useEffect(() => {
    //        fetch('/api/team/my-team')
    //            .then(res => res.json())
    //            .then(data => setTeamData(data));
    //    }, []);
    const initialTeamData = {
        teamName: "Power Rangers",
        teamVision:
            "To revolutionize the way developers collaborate by building a seamless, AI-driven platform that enhances productivity and innovation.",
        leader: {
            name: "Aryan Sharma",
            details: "Full Stack Developer & AI Enthusiast. Leading the vision and architecture of Nebula Nova."
        },
        members: [
            { id: 1, name: "Rohan Gupta", about: "Backend Developer & Algorithm Expert. Specializes in high-performance system design and data structures.", university: "UPES", email: "rohan.g@example.com", phone: "+91 98765 43210" },
            { id: 2, name: "Isha Malhotra", about: "Cloud Computing Engineer & Backend Specialist. Focused on scalable server-side architectures and API security.", university: "IIT Delhi", email: "isha.m@example.com", phone: "+91 91234 56789" },
            { id: 3, name: "Vikram Singh", about: "Frontend Developer & UI/UX Enthusiast. Passionate about creating immersive and responsive web experiences.", university: "BITS Pilani", email: "vikram.s@example.com", phone: "+91 99887 76655" }
        ],
        joinedMembers: [],
        joinRequests: [
            { id: 101, name: "Arjun Verma", about: "I am a passionate backend developer with experience in Node.js and MongoDB. I love solving complex algorithmic problems.", email: "arjun.v@example.com", university: "VIT Vellore", phone: "+91 88888 88888", isHypervision: true },
            { id: 102, name: "Sneha Reddy", about: "Frontend wizard who loves crafting beautiful user interfaces using React and Tailwind CSS. Open source contributor.", email: "sneha.r@example.com", university: "SRM University", phone: "+91 77777 77777", isHypervision: false },
            { id: 103, name: "Kavya Patel", about: "UI/UX Designer with a knack for creating intuitive and accessible designs. Proficient in Figma and Adobe XD.", email: "kavya.p@example.com", university: "Nirma University", phone: "+91 66666 66666" }
        ]
    };

    const [teamData, setTeamData] = React.useState(initialTeamData);

    const handleDeleteMember = (id) => {
        // BACKEND INTEGRATION:
        // 1. Make a DELETE request to remove the member.
        //    fetch(`/api/team/members/${id}`, { method: 'DELETE' })
        //        .then(() => removeMemberFromState(id));
        setTeamData(prev => ({
            ...prev,
            members: prev.members.filter(member => member.id !== id),
            joinedMembers: prev.joinedMembers.filter(member => member.id !== id)
        }));
    };

    const handleViewMember = (member) => {
        setSelectedMember(member);
    };

    const closeMemberModal = () => {
        setSelectedMember(null);
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
    };

    const closeRequestModal = () => {
        setSelectedRequest(null);
    };

    const handleAcceptRequest = (id) => {
        // BACKEND INTEGRATION:
        // 1. Make a POST request to accept the join request.
        //    fetch(`/api/team/requests/${id}/accept`, { method: 'POST' })
        //        .then(res => res.json())
        //        .then(newMember => updateStateWithNewMember(newMember));

        const requestToAccept = teamData.joinRequests.find(req => req.id === id);
        if (requestToAccept) {
            // Add to joinedMembers and remove from requests
            // Ensure we include all fields needed for a member
            setTeamData(prev => ({
                ...prev,
                joinedMembers: [...prev.joinedMembers, { ...requestToAccept, id: Date.now() }], // distinct ID
                joinRequests: prev.joinRequests.filter(req => req.id !== id)
            }));
        }
        closeRequestModal();
    };

    const handleRejectRequest = (id) => {
        // BACKEND INTEGRATION:
        // 1. Make a POST/DELETE request to reject the join request.
        //    fetch(`/api/team/requests/${id}/reject`, { method: 'POST' });

        setTeamData(prev => ({
            ...prev,
            joinRequests: prev.joinRequests.filter(req => req.id !== id)
        }));
        closeRequestModal();
    };

    const menuItems = [
        { id: "dashboard", label: "Dashboard", active: false },
        { id: "team", label: "My Team", active: true },
        { id: "settings", label: "Settings", active: false },
    ];

    return (
        <div className="dashboard-page team-up-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Navbar with transparent background to match page background */}
            <Navbar
                style={{
                    background: "transparent",
                    backdropFilter: "none",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    fontFamily: "'Orbitron', sans-serif",
                }}
                userInfo={
                    <>
                        User: <strong>Student</strong>
                    </>
                }
                isAdmin={false}
                menuItems={menuItems}
                onMenuItemClick={() => { }}
                showHamburger={false}
                hideSubtitle={true}
            />

            <main className="team-up-main">
                <div className="team-page-layout">
                    {/* Left Sidebar */}
                    <aside className="team-sidebar">
                        <div className="sidebar-content">
                            <h2 className="section-title">Your Team</h2>
                            <h1 className="team-name">
                                {teamData.teamName}
                            </h1>
                            <p className="team-vision">
                                {teamData.teamVision}
                            </p>
                        </div>
                        <div className="vertical-divider"></div>
                    </aside>

                    {/* Right Content */}
                    <div className="team-content">
                        {/* Leader Section */}
                        <div className="team-section">
                            <h2 className="section-title">Team Leader</h2>
                            <div className="leader-card">
                                <h3 className="leader-name">{teamData.leader.name}</h3>
                                <p className="leader-details">{teamData.leader.details}</p>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div className="team-section">
                            <h2 className="section-title">Team Members</h2>
                            <div className="members-list">
                                {teamData.members.map((member) => (
                                    <div key={member.id} className="member-item">
                                        <span className="member-name">{member.name}</span>
                                        <div className="member-actions">
                                            <button
                                                className="member-view-btn"
                                                onClick={() => handleViewMember(member)}
                                            >
                                                View Detail
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteMember(member.id)}
                                                aria-label={`Delete ${member.name}`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Joined Members Section */}
                            {
                                teamData.joinedMembers && teamData.joinedMembers.length > 0 && (
                                    <div className="team-section">
                                        <h2 className="section-title">Joined Members</h2>
                                        <div className="members-list">
                                            {teamData.joinedMembers.map((member) => (
                                                <div key={member.id} className="member-item">
                                                    <span className="member-name">{member.name}</span>
                                                    <div className="member-actions">
                                                        <button
                                                            className="member-chat-btn"
                                                            onClick={() => handleChatOpen(member)}
                                                        >
                                                            Chat
                                                        </button>
                                                        <button
                                                            className="member-view-btn"
                                                            onClick={() => handleViewMember(member)}
                                                        >
                                                            View Detail
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDeleteMember(member.id)}
                                                            aria-label={`Delete ${member.name}`}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                            {/* Requests Section */}
                            <div className="team-section requests-section">
                                <h2 className="section-title request-title">Requests</h2>
                                <div className="requests-grid">
                                    {teamData.joinRequests && teamData.joinRequests.length > 0 ? (
                                        teamData.joinRequests.map((request) => (
                                            <div key={request.id} className="request-card">
                                                <div className="request-info">
                                                    <div className="request-avatar">
                                                        {request.name.charAt(0)}
                                                    </div>
                                                    <span className="request-name">{request.name}</span>
                                                </div>
                                                <div className="request-actions">
                                                    <button
                                                        className="action-btn view-btn"
                                                        onClick={() => handleViewRequest(request)}
                                                    >
                                                        View Detail
                                                    </button>
                                                    <button
                                                        className="action-btn chat-btn"
                                                        onClick={() => handleChatOpen(request)}
                                                    >
                                                        Chat
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-requests">No pending requests.</p>
                                    )}
                                </div>
                            </div>
                        </div >
                    </div >
                </div >
            </main >

            {/* Member Details Modal */}
            {
                selectedMember && (
                    <div className="modal-overlay" onClick={closeMemberModal}>
                        <div className="modal-content member-card" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeMemberModal}>&times;</button>
                            <h2 className="member-card-title">Member Details</h2>
                            {selectedMember.isHypervision && (
                                <div className="hypervision-badge" style={{ marginBottom: '15px' }}>
                                    Hypervision Member
                                </div>
                            )}
                            <div className="member-card-body">
                                <div className="member-detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value name-value">{selectedMember.name}</span>
                                </div>
                                <div className="member-detail-row">
                                    <span className="detail-label">About:</span>
                                    <span className="detail-value">{selectedMember.about}</span>
                                </div>
                                <div className="member-detail-row">
                                    <span className="detail-label">University:</span>
                                    <span className="detail-value">{selectedMember.university}</span>
                                </div>
                                <div className="member-detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{selectedMember.email}</span>
                                </div>
                                <div className="member-detail-row">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">{selectedMember.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Request Details Modal */}
            {
                selectedRequest && (
                    <div className="modal-overlay" onClick={closeRequestModal}>
                        <div className="modal-content request-modal-card" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeRequestModal}>&times;</button>
                            <h2 className="request-modal-name">{selectedRequest.name}</h2>

                            {selectedRequest.isHypervision && (
                                <div className="hypervision-badge">
                                    Hypervision Member
                                </div>
                            )}

                            <div className="request-modal-body">
                                <div className="request-about-container">
                                    <p className="request-about">{selectedRequest.about}</p>
                                </div>

                                <div className="request-contact-details">
                                    <div className="request-detail-item">
                                        <span className="request-label">Email:</span>
                                        <span className="request-value">{selectedRequest.email}</span>
                                    </div>
                                    <div className="request-detail-item">
                                        <span className="request-label">University:</span>
                                        <span className="request-value">{selectedRequest.university}</span>
                                    </div>
                                </div>

                                <div className="request-modal-actions">
                                    <button className="modal-action-btn accept-btn" onClick={() => handleAcceptRequest(selectedRequest.id)}>Accept</button>
                                    <button className="modal-action-btn reject-btn" onClick={() => handleRejectRequest(selectedRequest.id)}>Reject</button>
                                    <button className="modal-action-btn chat-btn-modal" onClick={() => handleChatOpen(selectedRequest)}>Chat</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Chat Modal */}
            {
                chatTarget && (
                    <div className="modal-overlay chat-overlay" onClick={closeChatModal}>
                        <div
                            className={`modal-content chat-modal-card ${isChatExpanded ? 'expanded' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="chat-avatar">{chatTarget.name.charAt(0)}</div>
                                    <div className="chat-name-status">
                                        <h3>{chatTarget.name}</h3>
                                        <span className="chat-status">Online</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button
                                        className="chat-expand-btn"
                                        onClick={toggleChatExpand}
                                        title={isChatExpanded ? "Collapse" : "Expand"}
                                        aria-label={isChatExpanded ? "Collapse Chat" : "Expand Chat"}
                                    >
                                        {isChatExpanded ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="4 14 10 14 10 20"></polyline>
                                                <polyline points="20 10 14 10 14 4"></polyline>
                                                <line x1="14" y1="10" x2="21" y2="3"></line>
                                                <line x1="3" y1="21" x2="10" y2="14"></line>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                <polyline points="9 21 3 21 3 15"></polyline>
                                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                                <line x1="3" y1="21" x2="10" y2="14"></line>
                                            </svg>
                                        )}
                                    </button>
                                    <button className="chat-close" onClick={closeChatModal}>&times;</button>
                                </div>
                            </div>

                            <div className="chat-body">
                                {dummyChatHistory.map(msg => {
                                    const isMe = msg.sender === 'me';
                                    const senderName = isMe ? "You" : chatTarget.name;
                                    return (
                                        <div key={msg.id} className={`chat-message ${isMe ? 'sent' : 'received'}`}>
                                            <span className="chat-msg-label">{senderName}</span>
                                            <div className="message-bubble">
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form className="chat-footer" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="Type a message..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                />
                                <button type="submit" className="chat-send-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TeamUpPage;
