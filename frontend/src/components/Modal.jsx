import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid rgba(148,163,184,0.2)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(148,163,184,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(15,23,42,0.95)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: 0, color: "#e5e7eb", fontSize: "1.1rem" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}
