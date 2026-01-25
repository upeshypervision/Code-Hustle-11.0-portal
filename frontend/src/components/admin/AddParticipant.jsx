import { useState } from "react";
import "./AddParticipant.css";

const emptyMember = {
  fullName: "",
  university: "",
  sapid: "",
  email: "",
  phone: "",
};

export default function AddParticipant() {
  const [teamName, setTeamName] = useState("");
  const [team, setTeam] = useState({
    leader: { ...emptyMember },
    m1: { ...emptyMember },
    m2: { ...emptyMember },
    m3: { ...emptyMember },
    m4: { ...emptyMember },
  });

  const [participantMessage, setParticipantMessage] = useState({
    type: "",
    text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTeam, setCreatedTeam] = useState(null);

  const handleTeamChange = (memberKey, field, value) => {
    setTeam((prev) => ({
      ...prev,
      [memberKey]: { ...prev[memberKey], [field]: value },
    }));
  };

  const isMemberFilled = (m) =>
    m.fullName || m.university || m.sapid || m.email || m.phone;

  const validateMember = (m) => {
    if (!m.fullName || !m.email || !m.phone || !m.university) return false;
    if (!m.sapid) return false;
    return true;
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    setParticipantMessage({ type: "", text: "" });
    setCreatedTeam(null);

    if (!teamName.trim()) {
      setParticipantMessage({ type: "error", text: "Team Name is required." });
      return;
    }

    if (
      !validateMember(team.leader) ||
      !validateMember(team.m1) ||
      !validateMember(team.m2)
    ) {
      setParticipantMessage({
        type: "error",
        text: "Leader, Member 1 and Member 2 details are mandatory.",
      });
      return;
    }

    const optionalMembers = [team.m3, team.m4].filter(isMemberFilled);

    for (let m of optionalMembers) {
      if (!validateMember(m)) {
        setParticipantMessage({
          type: "error",
          text: "Optional members must have all details filled if added.",
        });
        return;
      }
    }

    const totalMembers = 1 + 2 + optionalMembers.length;

    if (totalMembers < 3 || totalMembers > 5) {
      setParticipantMessage({
        type: "error",
        text: "Team must have minimum 3 and maximum 5 members.",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      team_name: teamName,
      leader: team.leader,
      members: [team.m1, team.m2, ...optionalMembers],
    };

    try {
      const response = await fetch("http://localhost:5000/api/admin/add-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setParticipantMessage({
          type: "success",
          text: `Team "${teamName}" registered successfully!`,
        });
        setCreatedTeam({
          teamId: data.team_id,
          password: data.password,
        });
        setTeamName("");
        setTeam({
          leader: { ...emptyMember },
          m1: { ...emptyMember },
          m2: { ...emptyMember },
          m3: { ...emptyMember },
          m4: { ...emptyMember },
        });
      } else {
        setParticipantMessage({
          type: "error",
          text: data.error || "Failed to add team.",
        });
      }
    } catch {
      setParticipantMessage({
        type: "error",
        text: "Server connection failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMemberInputs = (key, label, required = false) => {
    const m = team[key];

    return (
      <div className="member-section">
        <span className="section-label">
          {label} {required && <span className="req">*</span>}
        </span>

        <div className="input-row">
          <div className="cosmic-input-group">
            <label className="cosmic-label">
              Full Name {required && <span className="req">*</span>}
            </label>
            <div className="cosmic-input-container">
              <input
                className="cosmic-input"
                value={m.fullName}
                onChange={(e) =>
                  handleTeamChange(key, "fullName", e.target.value)
                }
              />
            </div>
          </div>

          <div className="cosmic-input-group">
            <label className="cosmic-label">
              University {required && <span className="req">*</span>}
            </label>
            <div className="cosmic-input-container">
              <select
                className="cosmic-input select-input"
                value={m.university}
                onChange={(e) =>
                  handleTeamChange(key, "university", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="UPES">UPES</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
        </div>

        {m.university && (
          <div className="input-row">
            <div className="cosmic-input-group">
              <label className="cosmic-label">
                {m.university === "UPES" ? "SAP ID" : "Institute Name"}{" "}
                {required && <span className="req">*</span>}
              </label>
              <div className="cosmic-input-container">
                <input
                  className="cosmic-input"
                  value={m.sapid}
                  onChange={(e) =>
                    handleTeamChange(key, "sapid", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="input-row">
          <div className="cosmic-input-group">
            <label className="cosmic-label">
              Email {required && <span className="req">*</span>}
            </label>
            <div className="cosmic-input-container">
              <input
                className="cosmic-input"
                value={m.email}
                onChange={(e) => handleTeamChange(key, "email", e.target.value)}
              />
            </div>
          </div>

          <div className="cosmic-input-group">
            <label className="cosmic-label">
              Phone {required && <span className="req">*</span>}
            </label>
            <div className="cosmic-input-container">
              <input
                className="cosmic-input"
                value={m.phone}
                onChange={(e) => handleTeamChange(key, "phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-cosmic-wrapper">
      <div className="cosmic-card">
        <form onSubmit={handleAddParticipant} className="form-grid">
          {/* ✅ FIXED TEAM NAME */}
          <div className="member-section">
            <span className="section-label">
              TEAM NAME <span className="req">*</span>
            </span>

            <div className="cosmic-input-group">
              <label className="cosmic-label">
                Team Name <span className="req">*</span>
              </label>
              <div className="cosmic-input-container">
                <input
                  className="cosmic-input"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter Unique Team Name"
                />
              </div>
            </div>
          </div>

          {renderMemberInputs("leader", "TEAM LEADER", true)}
          {renderMemberInputs("m1", "MEMBER 1", true)}
          {renderMemberInputs("m2", "MEMBER 2", true)}
          {renderMemberInputs("m3", "MEMBER 3")}
          {renderMemberInputs("m4", "MEMBER 4")}

          {participantMessage.text && (
            <div className={`cosmic-msg ${participantMessage.type}`}>
              {participantMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="cosmic-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "REGISTER TEAM NOW"}
          </button>
        </form>
      </div>
    </div>
  );
}
