import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import socket from "../../socket";
import "./ProblemStatements.css"; // Import the new CSS

export default function ProblemStatements() {
  const [selectedPs, setSelectedPs] = useState(null);
  const [psMessage, setPsMessage] = useState({ type: "", text: "" });

  const [problemStatements, setProblemStatements] = useState([]);

  const [newPs, setNewPs] = useState({
    title: "",
    track: "",
    description: "",
    difficulty: "Easy",
    maxTeams: "",
  });

  const fetchProblemStatements = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/getallproblem-statements",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to fetch problem statements");
      }

      const psArray = Array.isArray(data) ? data : data.problem_statements;

      const formatted = psArray.map((ps) => ({
        id: ps.problem_statement_id,
        title: ps.title,
        track: ps.track || "",
        description: ps.description,
        difficulty: ps.difficulty,
        maxTeams: ps.max_count,
        selections: ps.selections || 0,
        visible: ps.visible,
      }));

      setProblemStatements(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchProblemStatements();
  }, []);

  // Socket Listeners
  useEffect(() => {
    const handlePsSelected = () => fetchProblemStatements();
    socket.on("ps_selected", handlePsSelected);
    return () => socket.off("ps_selected", handlePsSelected);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => fetchProblemStatements();
    socket.on("ps_visibility_changed", handleVisibilityChange);
    return () => socket.off("ps_visibility_changed", handleVisibilityChange);
  }, []);

  const handleAddPs = async (e) => {
    e.preventDefault();

    if (!newPs.title.trim() || !newPs.description.trim()) {
      setPsMessage({
        type: "error",
        text: "Title and description are required.",
      });
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/createproblem-statements",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newPs.title,
            track: newPs.track,
            description: newPs.description,
            difficulty: newPs.difficulty,
            Max_Count: Number(newPs.maxTeams),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create problem statement");
      }

      setPsMessage({
        type: "success",
        text: `Problem Statement created successfully (ID: ${data.problem_statement_id})`,
      });

      setNewPs({
        title: "",
        track: "",
        description: "",
        difficulty: "Easy",
        maxTeams: "",
      });

      fetchProblemStatements();
    } catch (err) {
      setPsMessage({
        type: "error",
        text: err.message,
      });
    }
  };

  const togglePsVisibility = async (psId) => {
    setProblemStatements((prev) =>
      prev.map((ps) => (ps.id === psId ? { ...ps, visible: !ps.visible } : ps))
    );

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/problem-statement/${psId}/toggle-visibility`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to toggle visibility");
      }
      fetchProblemStatements();
    } catch (err) {
      console.error(err);
      // Revert on error
      setProblemStatements((prev) =>
        prev.map((ps) => (ps.id === psId ? { ...ps, visible: !ps.visible } : ps))
      );
      setPsMessage({
        type: "error",
        text: "Network error: Failed to toggle visibility",
      });
    }
  };

  const handleViewTeams = async (ps) => {
    setSelectedPs(ps);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/problem-statement/${ps.id}/teams`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data.success) {
        setSelectedPs({ ...ps, teamsList: data.teams });
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  const handleCloseModal = () => setSelectedPs(null);

  // --- Render ---
  return (
    <div className="admin-ps-container">
      <header className="ps-header">
        <h2 className="ps-title">Problem Statements</h2>
        <p className="ps-subtitle">
          Manage, create, and track problem statements for the hackathon.
        </p>
      </header>

      {psMessage.text && (
        <div className={`message-box ${psMessage.type}`} style={{ marginBottom: "20px" }}>
          {psMessage.text}
        </div>
      )}

      {/* Grid Layout for Problem Statements */}
      <div className="ps-grid">
        {problemStatements.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#64748b", padding: "40px" }}>
            No problem statements created yet. Get started below!
          </div>
        ) : (
          problemStatements.map((ps) => (
            <div className="ps-card" key={ps.id}>
              {/* Card Header: ID Badge & Visibility Toggle */}
              <div className="ps-card-header">
                <span className="ps-id-badge">ID: {ps.id}</span>
                <label className="ps-toggle" title="Toggle Visibility">
                  <input
                    type="checkbox"
                    checked={ps.visible || false}
                    onChange={() => togglePsVisibility(ps.id)}
                  />
                  <span className="ps-slider"></span>
                </label>
              </div>

              {/* Title & Description */}
              <h3 className="ps-card-title">{ps.title}</h3>
              <p className="ps-card-desc">{ps.description}</p>

              {/* Chips */}
              <div className="ps-meta">
                <span className={`ps-chip difficulty-${ps.difficulty}`}>
                  {ps.difficulty}
                </span>
                {ps.track && <span className="ps-chip track">{ps.track}</span>}
              </div>

              {/* Footer */}
              <div className="ps-card-footer">
                <div className="ps-stat">
                  Max: <strong>{ps.maxTeams}</strong>
                </div>
                <button
                  className="btn-view-teams"
                  onClick={() => handleViewTeams(ps)}
                >
                  {ps.selections || 0} teams selected
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Section */}
      <div className="ps-form-section">
        <h3 className="ps-form-title">Add New Problem Statement</h3>
        <form onSubmit={handleAddPs} className="ps-form-grid">
          <div className="ps-input-group full-width">
            <label className="ps-label">Title</label>
            <input
              className="ps-input"
              value={newPs.title}
              onChange={(e) => setNewPs({ ...newPs, title: e.target.value })}
              placeholder="e.g. AI-Driven Healthcare Assistant"
            />
          </div>

          <div className="ps-input-group">
            <label className="ps-label">Track</label>
            <input
              className="ps-input"
              value={newPs.track}
              onChange={(e) => setNewPs({ ...newPs, track: e.target.value })}
              placeholder="e.g. Healthcare"
            />
          </div>

          <div className="ps-input-group">
            <label className="ps-label">Difficulty</label>
            <select
              className="ps-input"
              value={newPs.difficulty}
              onChange={(e) => setNewPs({ ...newPs, difficulty: e.target.value })}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="ps-input-group full-width">
            <label className="ps-label">Description</label>
            <textarea
              className="ps-input"
              value={newPs.description}
              onChange={(e) => setNewPs({ ...newPs, description: e.target.value })}
              placeholder="Detailed description of the problem..."
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="ps-input-group">
            <label className="ps-label">Max Teams</label>
            <input
              className="ps-input"
              type="number"
              min="1"
              value={newPs.maxTeams}
              onChange={(e) => setNewPs({ ...newPs, maxTeams: e.target.value })}
              placeholder="e.g. 10"
            />
          </div>

          <div className="ps-input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-add-ps">
              + Create Problem Statement
            </button>
          </div>
        </form>
      </div>

      {/* Teams Modal */}
      <Modal
        isOpen={!!selectedPs}
        onClose={handleCloseModal}
        title={selectedPs ? `Teams for ${selectedPs.title}` : ""}
      >
        {selectedPs && selectedPs.teamsList ? (
          <div>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "16px" }}>
              {selectedPs.teamsList.length} team(s) selected this problem statement
            </p>
            {selectedPs.teamsList.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6b7280" }}>
                No teams yet selected this problem.
              </p>
            ) : (
              <table className="table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Team ID</th>
                    <th>Team Name</th>
                    <th>Selected At</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPs.teamsList.map((team, idx) => (
                    <tr key={idx}>
                      <td><strong>{team.team_id}</strong></td>
                      <td>{team.team_name}</td>
                      <td>{new Date(team.selected_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Loading teams...</p>
        )}
      </Modal>
    </div>
  );
}