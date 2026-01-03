import React, { useState, useEffect } from "react";

export default function PSGallery() {
  // --- STATE & LOGIC - STRICTLY INTACT ---
  const [expandedId, setExpandedId] = useState(null);
  const [problemStatements, setProblemStatements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingPs, setPendingPs] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Added for Hamburger Functionality (Matching PPT.jsx)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- FETCH LOGIC - STRICTLY INTACT ---
  useEffect(() => {
    fetch("http://localhost:5001/api/student/getallproblem-statements", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblemStatements(data.problem_statements);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // --- HANDLERS - STRICTLY INTACT ---
  const triggerLockSequence = (ps) => {
    setPendingPs(ps);
    setShowModal(true);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const confirmLock = async () => {
    try {
      const res = await fetch(
        "http://localhost:5001/api/select-problem-statement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            problem_statement_id: pendingPs?.problem_statement_id,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setPendingPs(null);
        showNotification("success", "Problem statement selected successfully!");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setShowModal(false);
        showNotification(
          "error",
          data.error || "Failed to select problem statement"
        );
      }
    } catch (err) {
      console.error("Selection error:", err);
      setShowModal(false);
      showNotification("error", "Server connection failed");
    }
  };

  return (
    /* WRAPPER: Matches PPTSubmission scrolling and layout logic */
    <div
      className="ps-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        height: "100vh",
        width: "100%",
        padding: "100px 20px 60px 20px",
        boxSizing: "border-box",
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily: '"Courier New", Courier, monospace',
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* --- FIXED BACKGROUND (Matching Dashboard Visuals) --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4otxGPqIii92wFJAksBcqA97drEL-EvYZjw&s')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: "0.4",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, transparent 10%, rgba(200, 80, 71, 0.42) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* --- HAMBURGER BUTTON (Strictly from PPT.jsx) --- */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="heist-hamburger"
        style={{
          display: "none",
          position: "fixed",
          top: "70px",
          left: "20px",
          zIndex: 1000,
          background: "rgba(220, 38, 38, 0.2)",
          border: "1px solid #dc2626",
          width: "45px",
          height: "45px",
          borderRadius: "4px",
          cursor: "pointer",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <div
          className={`line ${isMenuOpen ? "cross-top" : ""}`}
          style={{
            width: "25px",
            height: "2px",
            background: "#fff",
            transition: "0.3s",
          }}
        ></div>
        <div
          className={`line ${isMenuOpen ? "hide" : ""}`}
          style={{
            width: "25px",
            height: "2px",
            background: "#fff",
            transition: "0.3s",
          }}
        ></div>
        <div
          className={`line ${isMenuOpen ? "cross-bottom" : ""}`}
          style={{
            width: "25px",
            height: "2px",
            background: "#fff",
            transition: "0.3s",
          }}
        ></div>
      </button>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div
        style={{
          animation: "fadeIn 0.5s ease-out",
          width: "100%",
          maxWidth: "900px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* --- HEADER WARNING --- */}
        <div
          style={{
            borderLeft: "8px solid #dc2626",
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "15px 25px",
            marginBottom: "40px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: "900",
              color: "#dc2626",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            <span style={{ marginRight: "10px" }}>⚠️</span> CAUTION: TARGET LOCK
            IS PERMANENT. MODIFICATIONS RESTRICTED ONCE INITIALIZED.
          </p>
        </div>

        {/* --- CARD LIST --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {problemStatements.map((ps) => {
            const count = ps.selections || 0;
            const target = ps.max_count || 30;
            const barWidth = Math.min((count / target) * 100, 100);

            return (
              <div
                key={ps.problem_statement_id}
                className="ps-card"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  borderRadius: "4px",
                  padding: "30px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                }}
              >
                <div
                  className="card-layout-inner"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          background: "#dc2626",
                          padding: "3px 10px",
                          fontSize: "10px",
                          fontWeight: "900",
                        }}
                      >
                        ID: {ps.problem_statement_id}
                      </span>
                      <span
                        style={{
                          color: "#dc2626",
                          fontSize: "10px",
                          fontWeight: "900",
                          letterSpacing: "1.5px",
                        }}
                      >
                        // {ps.track?.toUpperCase()}
                      </span>
                    </div>
                    <h3
                      className="ps-title-text"
                      style={{
                        fontSize: "1.6rem",
                        margin: 0,
                        color: "#fff",
                        fontWeight: "900",
                        textTransform: "uppercase",
                      }}
                    >
                      {ps.title}
                    </h3>
                  </div>

                  <div
                    className="action-column"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "15px",
                    }}
                  >
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === ps.problem_statement_id
                            ? null
                            : ps.problem_statement_id
                        )
                      }
                      className="view-btn-heist"
                    >
                      {expandedId === ps.problem_statement_id
                        ? "CLOSE DOSSIER"
                        : "VIEW DOSSIER"}
                    </button>

                    <div
                      className="heat-gauge-container"
                      style={{ width: "180px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "8px",
                            fontWeight: "900",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          CONFLICT LEVEL
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "900",
                            color: "#dc2626",
                          }}
                        >
                          {count}/{target}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "3px",
                          width: "100%",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${barWidth}%`,
                            background: "#dc2626",
                            boxShadow: "0 0 10px #dc2626",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedId === ps.problem_statement_id && (
                  <div
                    style={{
                      marginTop: "30px",
                      paddingTop: "25px",
                      borderTop: "1px solid rgba(220, 38, 38, 0.2)",
                      animation: "fadeIn 0.4s ease",
                    }}
                  >
                    <p
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        lineHeight: "1.7",
                        fontSize: "0.95rem",
                      }}
                    >
                      <strong style={{ color: "#dc2626" }}>[BRIEFING]:</strong>{" "}
                      {ps.description}
                    </p>
                    <button
                      onClick={() => triggerLockSequence(ps)}
                      className="lock-shine-btn"
                    >
                      INITIALIZE TARGET LOCK
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- MODAL UI (Strictly Intact Logic) --- */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.95)",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                padding: "40px",
                background: "#0a0a0a",
                border: "2px solid #dc2626",
                textAlign: "center",
                boxShadow: "0 0 50px rgba(220,38,38,0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: "#dc2626",
                  fontWeight: "900",
                  letterSpacing: "5px",
                  marginBottom: "15px",
                }}
              >
                BELLA CIAO
              </div>
              <h2
                style={{
                  color: "#fff",
                  textTransform: "uppercase",
                  margin: "0 0 20px 0",
                }}
              >
                LOCK TARGET?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "30px",
                  fontSize: "14px",
                }}
              >
                Confirming lock for{" "}
                <strong style={{ color: "#dc2626" }}>
                  {pendingPs?.problem_statement_id}
                </strong>
                .
              </p>
              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid #333",
                    padding: "15px",
                    cursor: "pointer",
                  }}
                >
                  ABORT
                </button>
                <button
                  onClick={confirmLock}
                  style={{
                    flex: 1,
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding: "15px",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  INITIALIZE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- NOTIFICATION UI --- */}
        {notification.show && (
          <div
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              zIndex: 3000,
              padding: "20px 40px",
              background: "#0a0a0a",
              borderLeft: `5px solid ${
                notification.type === "success" ? "#22c55e" : "#dc2626"
              }`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <p style={{ color: "#fff", margin: 0, fontWeight: "700" }}>
              {notification.message}
            </p>
          </div>
        )}

        <style
          dangerouslySetInnerHTML={{
            __html: `
                    @media (max-width: 992px) {
                        .heist-hamburger { display: flex !important; }
                        aside, .sidebar-container { 
                            position: fixed !important; 
                            left: ${isMenuOpen ? "0" : "-300px"} !important; 
                            top: 0; height: 100vh; z-index: 1500; 
                            transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .card-layout-inner { flex-direction: column !important; }
                        .action-column { align-items: flex-start !important; width: 100% !important; margin-top: 15px; }
                        .view-btn-heist { width: 100% !important; }
                        .heat-gauge-container { width: 100% !important; }
                    }
                    .cross-top { transform: translateY(7px) rotate(45deg); }
                    .cross-bottom { transform: translateY(-7px) rotate(-45deg); }
                    .hide { opacity: 0; }
                    .view-btn-heist { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 10px 25px; cursor: pointer; font-weight: 900; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; transition: 0.3s; }
                    .view-btn-heist:hover { background: #fff; color: #000; border-color: #fff; }
                    .lock-shine-btn { width: 100%; padding: 18px; margin-top: 25px; background: #dc2626; color: #fff; border: none; font-weight: 900; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 20px rgba(220, 38, 38, 0.3); }
                    .lock-shine-btn:hover { background: #ff0000; box-shadow: 0 0 30px rgba(220, 38, 38, 0.5); }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `,
          }}
        />
      </div>
    </div>
  );
}
