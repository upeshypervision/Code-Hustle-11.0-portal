import React from "react";
import { useNavigate } from "react-router-dom";
import "./Indi.css";

const CongratulationsBanner = ({ acceptedTeam, userDetails }) => {
  const navigate = useNavigate();

  if (!acceptedTeam) return null;

  return (
    <div
      className="neural-node node-materialize animate-enter congrats-banner"
      style={{
        width: "100%",
        maxWidth: "600px",
        aspectRatio: "0.9",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 40px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "10px", display: "flex", justifyContent: "center" }}>
        🎃
      </div>
      <h1
        className="congrats-title"
        style={{
          color: "#22c55e",
          fontSize: "2.5rem",
          marginBottom: "15px",
          fontWeight: "800",
          textShadow: "0 2px 10px rgba(34, 197, 94, 0.3)",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Congratulations!
      </h1>
      <p
        className="congrats-subtitle"
        style={{
          color: "#FFFFFF",
          fontSize: "1.5rem",
          marginBottom: "10px",
          fontWeight: "600",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        You've been accepted by
      </p>
      <h2
        className="congrats-team-name"
        style={{
          color: "#FFFFFF",
          fontSize: "2rem",
          marginBottom: "10px",
          fontWeight: "700",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {acceptedTeam.teamName}
      </h2>
      <p
        className="congrats-team-id"
        style={{
          color: "#FFFFFF",
          fontSize: "1.2rem",
          marginBottom: "40px",
          fontWeight: "500",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        Team ID: {acceptedTeam.teamId}
      </p>
      <button
        className="congrats-button"
        onClick={() =>
          navigate("/accepted-team", {
            state: { team: acceptedTeam, userDetails },
          })
        }
        style={{
          background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          color: "#FFFFFF",
          border: "1px solid rgba(220, 38, 38, 0.5)",
          padding: "16px 40px",
          borderRadius: "10px",
          fontSize: "1.2rem",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(220, 38, 38, 0.5), 0 0 20px rgba(220, 38, 38, 0.3)",
          transition: "all 0.3s ease",
          textTransform: "uppercase",
          letterSpacing: "1px",
          width: "auto",
          maxWidth: "100%",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-3px)";
          e.target.style.boxShadow = "0 10px 30px rgba(220, 38, 38, 0.7), 0 0 30px rgba(220, 38, 38, 0.5)";
          e.target.style.background = "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 6px 20px rgba(220, 38, 38, 0.5), 0 0 20px rgba(220, 38, 38, 0.3)";
          e.target.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
        }}
      >
        View Your Team →
      </button>
    </div>
  );
};

export default CongratulationsBanner;
