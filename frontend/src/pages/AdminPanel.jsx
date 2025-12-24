import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('rounds');
  
  // Control states
  const [psVisible, setPsVisible] = useState(false);
  const [round1Active, setRound1Active] = useState(true);
  const [round2Active, setRound2Active] = useState(false);
  
  // Individual PS visibility toggles
  const [psToggles, setPsToggles] = useState({
    PS001: true,
    PS002: true,
    PS003: true
  });
  
  // Expanded states
  const [expandedPs, setExpandedPs] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  
  // New PS form
  const [newPs, setNewPs] = useState({ id: '', title: '', track: '' });
  const [psMessage, setPsMessage] = useState({ type: '', text: '' });
  
  // Add participant form
  const [newParticipant, setNewParticipant] = useState({
    fullName: '', sapId: '', email: '', phone: ''
  });
  const [participantMessage, setParticipantMessage] = useState({ type: '', text: '' });
  
  // Edit team state
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamData, setEditTeamData] = useState({
    teamName: '', leaderId: '', members: []
  });

  // Demo data
  const demoPs = [
    { 
      id: "PS001", 
      title: "Smart campus mobility", 
      track: "Smart Cities", 
      selections: 12,
      teams: [
        { teamId: "CH-TEAM-001", teamName: "HyperCoders", leader: "Ananya Sharma" },
        { teamId: "CH-TEAM-003", teamName: "Debug Demons", leader: "Rahul Verma" },
        { teamId: "CH-TEAM-007", teamName: "Code Crushers", leader: "Priya Singh" },
        { teamId: "CH-TEAM-012", teamName: "Tech Titans", leader: "Arjun Patel" }
      ]
    },
    { 
      id: "PS002", 
      title: "Developer productivity insights", 
      track: "DevTools", 
      selections: 8,
      teams: [
        { teamId: "CH-TEAM-002", teamName: "Bit Benders", leader: "Sneha Gupta" },
        { teamId: "CH-TEAM-005", teamName: "Code Ninjas", leader: "Vikram Kumar" },
        { teamId: "CH-TEAM-009", teamName: "Logic Lords", leader: "Neha Reddy" }
      ]
    },
    { 
      id: "PS003", 
      title: "Green energy monitor", 
      track: "Sustainability", 
      selections: 15,
      teams: [
        { teamId: "CH-TEAM-004", teamName: "Eco Warriors", leader: "Amit Joshi" },
        { teamId: "CH-TEAM-006", teamName: "Green Geeks", leader: "Riya Malhotra" },
        { teamId: "CH-TEAM-008", teamName: "Sustain Squad", leader: "Karan Mehta" },
        { teamId: "CH-TEAM-011", teamName: "Planet Protectors", leader: "Divya Iyer" },
        { teamId: "CH-TEAM-013", teamName: "Carbon Coders", leader: "Rohan Das" }
      ]
    }
  ];

  const demoTeams = [
    { 
      id: "CH-TEAM-001", 
      name: "HyperCoders", 
      leader: "Ananya Sharma",
      leaderId: "50001234",
      members: [
        { name: "Ananya Sharma", sapId: "50001234", role: "Team Lead" },
        { name: "Rohit Kumar", sapId: "50001235", role: "Backend" },
        { name: "Priya Singh", sapId: "50001236", role: "Frontend" }
      ]
    },
    { 
      id: "CH-TEAM-002", 
      name: "Bit Benders", 
      leader: "Sneha Gupta",
      leaderId: "50002345",
      members: [
        { name: "Sneha Gupta", sapId: "50002345", role: "Team Lead" },
        { name: "Arjun Patel", sapId: "50002346", role: "Full Stack" },
        { name: "Neha Reddy", sapId: "50002347", role: "UI/UX" },
        { name: "Vikram Kumar", sapId: "50002348", role: "Backend" }
      ]
    },
    { 
      id: "CH-TEAM-003", 
      name: "Debug Demons", 
      leader: "Rahul Verma",
      leaderId: "50003456",
      members: [
        { name: "Rahul Verma", sapId: "50003456", role: "Team Lead" },
        { name: "Kavya Nair", sapId: "50003457", role: "Frontend" }
      ]
    }
  ];

  const demoSubmissions = [
    { teamId: "CH-TEAM-001", teamName: "HyperCoders", ps: "PS001", fileName: "solution-round1.pptx", submittedAt: "Dec 15, 2025 3:45 PM" },
    { teamId: "CH-TEAM-002", teamName: "Bit Benders", ps: "PS002", fileName: "innovation-deck.pptx", submittedAt: "Dec 15, 2025 4:12 PM" },
    { teamId: "CH-TEAM-005", teamName: "Code Ninjas", ps: "PS001", fileName: "campus-solution.pptx", submittedAt: "Dec 16, 2025 10:30 AM" }
  ];

  const handleAddPs = (e) => {
    e.preventDefault();
    if (!newPs.id.trim() || !newPs.title.trim()) {
      setPsMessage({ type: 'error', text: 'PS ID and Title are required.' });
      return;
    }
    setPsMessage({ 
      type: 'success', 
      text: `Problem Statement ${newPs.id} added successfully! Backend should persist this.` 
    });
    setPsToggles({...psToggles, [newPs.id]: true});
    setNewPs({ id: '', title: '', track: '' });
  };

  const togglePsVisibility = (psId) => {
    setPsToggles({...psToggles, [psId]: !psToggles[psId]});
  };

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

  const handleEditTeam = (team) => {
    setEditingTeam(team.id);
    setEditTeamData({
      teamName: team.name,
      leaderId: team.leaderId,
      members: team.members
    });
  };

  const handleSaveTeam = () => {
    // In production, save to backend
    setEditingTeam(null);
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'rounds':
        return (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Round Management</h2>
            </div>
            
            <div className="control-group">
              <label className="toggle-label">
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={round1Active} 
                    onChange={(e) => setRound1Active(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
                <span>
                  <strong>Round 1: PS Selection & PPT Upload</strong>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                    {round1Active ? 'Currently OPEN - Participants can select PS and upload PPT' : 'Currently CLOSED'}
                  </div>
                </span>
              </label>

              <label className="toggle-label">
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={round2Active} 
                    onChange={(e) => setRound2Active(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
                <span>
                  <strong>Round 2: GitHub Link & Physical Round</strong>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                    {round2Active ? 'Currently VISIBLE - Qualified teams can see round 2 details (MAC Building)' : 'Currently HIDDEN'}
                  </div>
                </span>
              </label>
            </div>

            <div style={{marginTop: '24px'}}>
              <h3 style={{fontSize: '0.95rem', marginBottom: '12px'}}>Round Details</h3>
              <div className="panel">
                <div className="panel-inner">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Round</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Round 1</td>
                        <td>
                          <span className={`status-pill ${round1Active ? 'pass' : 'pending'}`}>
                            {round1Active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>PS Selection & PPT Upload</td>
                        <td>Online Portal</td>
                      </tr>
                      <tr>
                        <td>Round 2</td>
                        <td>
                          <span className={`status-pill ${round2Active ? 'pass' : 'pending'}`}>
                            {round2Active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>GitHub Submission & Physical Coding</td>
                        <td>MAC Building, UPES</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'problem-statements':
        return (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Problem Statements</h2>
              <label className="toggle-label">
                <span style={{fontSize: '0.85rem', marginRight: '8px'}}>
                  Global PS Visibility
                </span>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={psVisible} 
                    onChange={(e) => setPsVisible(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            </div>

            <div className="panel">
              <div className="panel-inner">
                <p className="panel-subtitle" style={{marginBottom: '12px'}}>
                  {psVisible 
                    ? '✅ Problem statements are globally visible. Use individual toggles below to hide specific PS.' 
                    : '🔒 All problem statements are globally hidden from participants'}
                </p>
                
                <h3 style={{fontSize: '0.9rem', margin: '16px 0 8px'}}>Active Problem Statements</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Visible</th>
                      <th>PS ID</th>
                      <th>Title</th>
                      <th>Track</th>
                      <th>Selections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoPs.map((ps) => (
                      <>
                        <tr key={ps.id}>
                          <td>
                            <div className="toggle-switch" style={{width: '40px', height: '20px'}}>
                              <input 
                                type="checkbox" 
                                checked={psToggles[ps.id]}
                                onChange={() => togglePsVisibility(ps.id)}
                              />
                              <span className="toggle-slider"></span>
                            </div>
                          </td>
                          <td><strong>{ps.id}</strong></td>
                          <td>{ps.title}</td>
                          <td>{ps.track}</td>
                          <td>
                            <button 
                              className="chip chip-info"
                              onClick={() => setExpandedPs(expandedPs === ps.id ? null : ps.id)}
                              style={{cursor: 'pointer', border: '1px solid rgba(37,99,235,0.5)'}}
                            >
                              {ps.selections} teams {expandedPs === ps.id ? '▲' : '▼'}
                            </button>
                          </td>
                        </tr>
                        {expandedPs === ps.id && (
                          <tr>
                            <td colSpan="5" style={{background: 'rgba(15,23,42,0.95)', padding: '12px'}}>
                              <strong style={{fontSize: '0.85rem', display: 'block', marginBottom: '8px'}}>
                                Teams that selected {ps.id}:
                              </strong>
                              <div style={{display: 'grid', gap: '8px'}}>
                                {ps.teams.map((team) => (
                                  <div 
                                    key={team.teamId}
                                    style={{
                                      background: 'rgba(37,99,235,0.1)',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(37,99,235,0.3)',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    <strong>{team.teamId}</strong> - {team.teamName}
                                    <br />
                                    <span style={{color: 'var(--text-muted)'}}>
                                      Leader: {team.leader}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{marginTop: '24px'}}>
              <h3 style={{fontSize: '0.95rem', marginBottom: '12px'}}>Add New Problem Statement</h3>
              <div className="panel">
                <div className="panel-inner">
                  <form onSubmit={handleAddPs} className="form">
                    <div className="form-row">
                      <label className="form-label" htmlFor="psId">
                        Problem Statement ID
                        <span className="form-hint">e.g., PS004</span>
                      </label>
                      <input
                        id="psId"
                        name="id"
                        className="form-input"
                        type="text"
                        value={newPs.id}
                        onChange={(e) => setNewPs({...newPs, id: e.target.value})}
                        placeholder="PS004"
                      />
                    </div>
                    <div className="form-row">
                      <label className="form-label" htmlFor="psTitle">
                        Title
                      </label>
                      <input
                        id="psTitle"
                        name="title"
                        className="form-input"
                        type="text"
                        value={newPs.title}
                        onChange={(e) => setNewPs({...newPs, title: e.target.value})}
                        placeholder="e.g., AI-powered campus assistant"
                      />
                    </div>
                    <div className="form-row">
                      <label className="form-label" htmlFor="psTrack">
                        Track
                        <span className="form-hint">Optional</span>
                      </label>
                      <input
                        id="psTrack"
                        name="track"
                        className="form-input"
                        type="text"
                        value={newPs.track}
                        onChange={(e) => setNewPs({...newPs, track: e.target.value})}
                        placeholder="e.g., AI/ML"
                      />
                    </div>
                    {psMessage.text && (
                      <div className={`message-box ${psMessage.type}`}>
                        {psMessage.text}
                      </div>
                    )}
                    <button type="submit" className="button-primary">
                      Add Problem Statement
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );

      case 'add-participant':
        return (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Add Participant/Team</h2>
            </div>

            <div className="panel">
              <div className="panel-inner">
                <p className="panel-subtitle" style={{marginBottom: '16px'}}>
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
                      onChange={(e) => setNewParticipant({...newParticipant, fullName: e.target.value})}
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
                      onChange={(e) => setNewParticipant({...newParticipant, sapId: e.target.value})}
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
                      onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
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
                      onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
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

      case 'edit-teams':
        return (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Edit Teams</h2>
            </div>

            <div className="panel">
              <div className="panel-inner">
                <p className="panel-subtitle" style={{marginBottom: '16px'}}>
                  Click on a team to expand and edit details.
                </p>

                {demoTeams.map((team) => (
                  <div key={team.id} style={{marginBottom: '12px'}}>
                    <div 
                      className="submission-card"
                      onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                      style={{cursor: 'pointer'}}
                    >
                      <div className="submission-info">
                        <p className="submission-team">
                          {team.name} ({team.id})
                        </p>
                        <p className="submission-meta">
                          Leader: {team.leader} ({team.leaderId}) · {team.members.length} members
                        </p>
                      </div>
                      <div className="submission-actions">
                        <span style={{fontSize: '1.2rem'}}>
                          {expandedTeam === team.id ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {expandedTeam === team.id && (
                      <div style={{
                        background: 'rgba(15,23,42,0.95)',
                        border: '1px solid rgba(148,163,184,0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        marginTop: '8px'
                      }}>
                        {editingTeam === team.id ? (
                          <div className="form">
                            <div className="form-row">
                              <label className="form-label">Team Name</label>
                              <input
                                className="form-input"
                                type="text"
                                value={editTeamData.teamName}
                                onChange={(e) => setEditTeamData({...editTeamData, teamName: e.target.value})}
                              />
                            </div>
                            <div className="form-row">
                              <label className="form-label">Leader SAP ID</label>
                              <input
                                className="form-input"
                                type="text"
                                value={editTeamData.leaderId}
                                onChange={(e) => setEditTeamData({...editTeamData, leaderId: e.target.value})}
                              />
                            </div>
                            <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                              <button onClick={handleSaveTeam} className="button-primary" style={{width: 'auto', padding: '8px 16px', fontSize: '0.85rem'}}>
                                Save Changes
                              </button>
                              <button onClick={() => setEditingTeam(null)} className="btn-small">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 style={{fontSize: '0.9rem', marginBottom: '12px'}}>Team Members:</h4>
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>SAP ID</th>
                                  <th>Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {team.members.map((member, idx) => (
                                  <tr key={idx}>
                                    <td>{member.name}</td>
                                    <td>{member.sapId}</td>
                                    <td>{member.role}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button 
                              onClick={() => handleEditTeam(team)} 
                              className="btn-small"
                              style={{marginTop: '12px'}}
                            >
                              Edit Team Details
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'submissions':
        return (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">PPT Submissions</h2>
            </div>

            <div className="panel">
              <div className="panel-inner">
                <p className="panel-subtitle" style={{marginBottom: '16px'}}>
                  All Round 1 PPT submissions from teams. Click "View" to download or preview.
                </p>

                {demoSubmissions.map((sub) => (
                  <div key={sub.teamId} className="submission-card">
                    <div className="submission-info">
                      <p className="submission-team">
                        {sub.teamName} ({sub.teamId})
                      </p>
                      <p className="submission-meta">
                        PS: <strong>{sub.ps}</strong> · File: {sub.fileName} · {sub.submittedAt}
                      </p>
                    </div>
                    <div className="submission-actions">
                      <button className="btn-small">View PPT</button>
                      <button className="btn-small">Download</button>
                    </div>
                  </div>
                ))}

                {demoSubmissions.length === 0 && (
                  <p style={{textAlign: 'center', color: 'var(--text-muted)', padding: '20px'}}>
                    No submissions yet
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar 
        userInfo={
          <>
            Role: <strong>Admin</strong> · Hypervision
          </>
        }
        isAdmin={true}
      />

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2 className="admin-sidebar-title">Admin Console</h2>
            <p className="admin-sidebar-subtitle">Code Hustle Management</p>
          </div>

          <ul className="admin-nav-menu">
            <li className="admin-nav-item">
              <a 
                className={`admin-nav-link ${activeSection === 'rounds' ? 'active' : ''}`}
                onClick={() => setActiveSection('rounds')}
              >
                <span className="admin-nav-icon">🎯</span>
                <span>Round Management</span>
              </a>
            </li>
            
            <li className="admin-nav-item">
              <a 
                className={`admin-nav-link ${activeSection === 'problem-statements' ? 'active' : ''}`}
                onClick={() => setActiveSection('problem-statements')}
              >
                <span className="admin-nav-icon">📋</span>
                <span>Problem Statements</span>
              </a>
            </li>

            <li className="admin-nav-item">
              <a 
                className={`admin-nav-link ${activeSection === 'add-participant' ? 'active' : ''}`}
                onClick={() => setActiveSection('add-participant')}
              >
                <span className="admin-nav-icon">➕</span>
                <span>Add Participant</span>
              </a>
            </li>

            <li className="admin-nav-item">
              <a 
                className={`admin-nav-link ${activeSection === 'edit-teams' ? 'active' : ''}`}
                onClick={() => setActiveSection('edit-teams')}
              >
                <span className="admin-nav-icon">✏️</span>
                <span>Edit Teams</span>
              </a>
            </li>

            <li className="admin-nav-item">
              <a 
                className={`admin-nav-link ${activeSection === 'submissions' ? 'active' : ''}`}
                onClick={() => setActiveSection('submissions')}
              >
                <span className="admin-nav-icon">📁</span>
                <span>View Submissions</span>
              </a>
            </li>
          </ul>
        </aside>

        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
