import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';

export default function ProblemStatements() {
    const [psVisible, setPsVisible] = useState(false);
    const [psToggles, setPsToggles] = useState({});
    const [selectedPs, setSelectedPs] = useState(null);
    const [psMessage, setPsMessage] = useState({ type: '', text: '' });

    // No demo data — starts empty, to be filled from backend
    const [problemStatements, setProblemStatements] = useState([]);

    const [newPs, setNewPs] = useState({
        title: '',
        track: '',
        description: '',
        difficulty: 'Easy',
        maxTeams: ''
    });
    useEffect(() => {
        const fetchProblemStatements = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/getallproblem-statements');
                const data = await res.json();
    
                if (!res.ok) {
                    throw new Error('Failed to fetch problem statements');
                }
    
                // 🔁 Normalize backend fields for frontend
                const formatted = data.map(ps => ({
                    id: ps.problem_statement_id,      // "PS001"
                    title: ps.title,
                    track: ps.track || '',
                    description: ps.description,
                    difficulty: ps.difficulty,
                    maxTeams: ps.max_count,
                    selections: ps.selections || 0,
                    visible: ps.visible
                }));
    
                setProblemStatements(formatted);
    
            } catch (err) {
                console.error(err);
            }
        };
    
        fetchProblemStatements();
    }, []);
    
    const handleAddPs = async (e) => {
        e.preventDefault();
    
        if (!newPs.title.trim() || !newPs.description.trim()) {
            setPsMessage({ type: 'error', text: 'Title and description are required.' });
            return;
        }
    
        try {
            const res = await fetch('http://localhost:5000/api/createproblem-statements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newPs.title,
                    track: newPs.track,
                    description: newPs.description,
                    difficulty: newPs.difficulty,
                    Max_Count: Number(newPs.maxTeams)
                })
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create problem statement');
            }
    
            setPsMessage({
                type: 'success',
                text: `Problem Statement created successfully (ID: ${data.problem_statement_id})`
            });
    
            // OPTIONAL: Clear form
            setNewPs({
                title: '',
                track: '',
                description: '',
                difficulty: 'Easy',
                maxTeams: ''
            });
    
        } catch (err) {
            setPsMessage({
                type: 'error',
                text: err.message
            });
        }
    };
    

    const togglePsVisibility = (psId) => {
        setPsToggles({ ...psToggles, [psId]: !psToggles[psId] });
    };

    const handleViewTeams = (ps) => setSelectedPs(ps);
    const handleCloseModal = () => setSelectedPs(null);

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2 className="admin-section-title">Problem Statements</h2>

                <label className="toggle-label">
                    <span style={{ fontSize: '0.85rem', marginRight: '8px' }}>
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
                    {problemStatements.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                            No problem statements created yet.
                        </p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visible</th>
                                    <th>PS ID</th>
                                    <th>Title</th>
                                    <th>Track</th>
                                    <th>Description</th>
                                    <th>Difficulty</th>
                                    <th>Max Teams</th>
                                    <th>Selections</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problemStatements.map((ps) => (
                                    <tr key={ps.id}>
                                        <td>
                                            <div className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={psToggles[ps.id] ?? true}
                                                    onChange={() => togglePsVisibility(ps.id)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </div>
                                        </td>

                                        <td><strong>{ps.id}</strong></td>
                                        <td>{ps.title}</td>
                                        <td>{ps.track || '-'}</td>
                                        <td>{ps.description}</td>
                                        <td>{ps.difficulty}</td>
                                        <td>{ps.maxTeams}</td>
                                        <td>
                                            <button
                                                className="chip chip-info"
                                                onClick={() => handleViewTeams(ps)}
                                            >
                                                {ps.selections || 0} teams
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                    Add New Problem Statement
                </h3>

                <div className="panel">
                    <div className="panel-inner">
                        <form onSubmit={handleAddPs} className="form">

                            <div className="form-row">
                                <label className="form-label">Title</label>
                                <input
                                    className="form-input"
                                    value={newPs.title}
                                    onChange={(e) =>
                                        setNewPs({ ...newPs, title: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <label className="form-label">Track</label>
                                <input
                                    className="form-input"
                                    value={newPs.track}
                                    onChange={(e) =>
                                        setNewPs({ ...newPs, track: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Description</label>
                                <input
                                    className="form-input"
                                    value={newPs.description}
                                    onChange={(e) =>
                                        setNewPs({ ...newPs, description: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Difficulty</label>
                                <select
                                    className="form-input"
                                    value={newPs.difficulty}
                                    onChange={(e) =>
                                        setNewPs({ ...newPs, difficulty: e.target.value })
                                    }
                                >
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <label className="form-label">Max Teams</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    min="1"
                                    value={newPs.maxTeams}
                                    onChange={(e) =>
                                        setNewPs({ ...newPs, maxTeams: e.target.value })
                                    }
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

            <Modal
                isOpen={!!selectedPs}
                onClose={handleCloseModal}
                title={selectedPs ? `Teams for ${selectedPs.id}` : ''}
            >
                {selectedPs && (
                    <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                        Team data will be loaded from backend.
                    </p>
                )}
            </Modal>
        </div>
    );
}
