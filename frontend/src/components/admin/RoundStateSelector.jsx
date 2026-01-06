import React from 'react';

// Helper component for 3-state round selector
const RoundStateSelector = ({ roundName, currentState, onStateChange, color }) => {
    const states = [
        { value: "not_started", label: "Not Started", color: "#94a3b8" },
        { value: "live", label: "Live", color: "#22c55e" },
        { value: "closed", label: "Closed", color: "#ef4444" }
    ];

    return (
        <div style={{ marginBottom: "20px" }}>
            <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: color || "#fff" }}>{roundName}</strong>
            </div>
            <div style={{
                display: "flex",
                gap: "8px",
                background: "rgba(255,255,255,0.05)",
                padding: "4px",
                borderRadius: "8px",
                width: "fit-content"
            }}>
                {states.map(state => (
                    <button
                        key={state.value}
                        onClick={() => onStateChange(state.value)}
                        style={{
                            padding: "8px 16px",
                            border: currentState === state.value ? `2px solid ${state.color}` : "2px solid transparent",
                            background: currentState === state.value ? `${state.color}20` : "transparent",
                            color: currentState === state.value ? state.color : "#94a3b8",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: currentState === state.value ? "700" : "500",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                            if (currentState !== state.value) {
                                e.target.style.background = "rgba(255,255,255,0.05)";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (currentState !== state.value) {
                                e.target.style.background = "transparent";
                            }
                        }}
                    >
                        {state.label}
                    </button>
                ))}
            </div>
            <div style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "6px"
            }}>
                {currentState === "not_started" && "Round hasn't started yet - submissions blocked"}
                {currentState === "live" && "Round is active - submissions allowed"}
                {currentState === "closed" && "Round has ended - submissions locked"}
            </div>
        </div>
    );
};

export default RoundStateSelector;
