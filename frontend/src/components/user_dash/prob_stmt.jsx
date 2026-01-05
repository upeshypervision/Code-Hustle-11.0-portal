import React, { useState, useEffect } from "react";
import socket from "../../socket";

export default function PSGallery() {
  // --- STATE ---
  const [expandedId, setExpandedId] = useState(null);
  const [problemStatements, setProblemStatements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingPs, setPendingPs] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [selectedPS, setSelectedPS] = useState(null);
  const [checkingSelection, setCheckingSelection] = useState(true);
  const [roundActive, setRoundActive] = useState(true);
  const [checkingRound, setCheckingRound] = useState(true);

  // --- USE EFFECTS (Keep your existing useEffects here) ---
  // Check selection
  useEffect(() => {
    const checkSelection = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/check-selected-ps", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.is_selected) {
          setSelectedPS(data.selection);
        }
      } catch (err) {
        console.error("Error checking PS selection:", err);
      } finally {
        setCheckingSelection(false);
      }
    };
    checkSelection();
  }, []);

  // Check round status
  useEffect(() => {
    const checkRoundStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/round-status", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRoundActive(data.rounds.ps_selection);
        }
      } catch (err) {
        console.error("Error checking round status:", err);
      } finally {
        setCheckingRound(false);
      }
    };
    checkRoundStatus();
  }, []);

  // Listen for round status
  useEffect(() => {
    const handleRoundChange = (data) => {
      if (data.round_type === 'ps_selection') {
        setRoundActive(data.is_active);
      }
    };
    socket.on("round_status_changed", handleRoundChange);
    return () => socket.off("round_status_changed", handleRoundChange);
  }, []);

  // Fetch Data
  const fetchProblemStatements = () => {
    fetch("http://localhost:5000/api/student/getallproblem-statements", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblemStatements(data.problem_statements);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => { fetchProblemStatements(); }, []);

  // Sockets
  useEffect(() => {
    socket.on("ps_selected", fetchProblemStatements);
    socket.on("ps_visibility_changed", fetchProblemStatements);
    return () => {
      socket.off("ps_selected", fetchProblemStatements);
      socket.off("ps_visibility_changed", fetchProblemStatements);
    };
  }, []);

  // --- HANDLERS ---
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
    if (!pendingPs) return;
    try {
      const res = await fetch(
        "http://localhost:5000/api/student/select-problem-statement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            problem_statement_id: pendingPs.problem_statement_id,
          }),
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        setSelectedPS({
          problem_statement_id: pendingPs.problem_statement_id,
          title: pendingPs.title,
          description: pendingPs.description,
          track: pendingPs.track,
          difficulty: pendingPs.difficulty,
          selected_at: new Date().toISOString()
        });
        setPendingPs(null);
        showNotification("success", "Target Locked! Problem statement selected successfully.");
        fetchProblemStatements();
      } else {
        setShowModal(false);
        if (res.status === 403) {
          showNotification("error", data.error || "Round closed.");
        } else {
          showNotification("error", data.error || "Failed to select problem statement");
        }
      }
    } catch (err) {
      console.error("Selection error:", err);
      setShowModal(false);
      showNotification("error", "Server connection failed");
    }
  };

  return (
    <div
      className="ps-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        padding: "20px",
        boxSizing: "border-box",
        position: "relative",
        fontFamily: '"Courier New", Courier, monospace',
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* --- FIXED BACKGROUND --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url('https://www.hollywoodreporter.com/wp-content/uploads/2018/12/MoneyHeist.jpg?w=1296&h=730&crop=1')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: "1",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at 40% 70%, transparent 10%, rgba(31, 28, 28, 0.42) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

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
        {/* LOGIC CHANGE HERE:
            1. Check Loading
            2. Check SelectedPS (Highest Priority UI)
            3. Check !roundActive (Round Closed UI)
            4. Default (Selection List)
        */}

        {checkingRound || checkingSelection ? (
          /* --- LOADING STATE --- */
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            <p>Loading...</p>
          </div>
        ) : selectedPS ? (
          /* --- PRIORITY 1: SUCCESS UI (TARGET LOCKED) --- */
          /* Shows even if round is closed */
          <div style={{
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(10, 10, 10, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
            <h2 style={{
              color: '#10b981',
              fontWeight: '900',
              fontSize: '2rem',
              letterSpacing: '3px',
              marginBottom: '15px'
            }}>
              TARGET LOCKED
            </h2>
            <p style={{
              color: '#fff',
              fontSize: '1.2rem',
              marginBottom: '30px',
              letterSpacing: '1px'
            }}>
              Problem Statement Selected: <strong>{selectedPS.problem_statement_id}</strong>
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              padding: '25px',
              textAlign: 'left',
              marginTop: '20px'
            }}>
              <h3 style={{
                color: '#10b981',
                fontSize: '1.5rem',
                marginBottom: '15px',
                fontWeight: '800'
              }}>
                {selectedPS.title}
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <span style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem',
                  marginRight: '15px'
                }}>
                  <strong>Track:</strong> {selectedPS.track || 'N/A'}
                </span>
                <span style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem'
                }}>
                  <strong>Difficulty:</strong> {selectedPS.difficulty || 'N/A'}
                </span>
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <strong style={{ color: '#10b981' }}>Description:</strong>
                <p style={{ marginTop: '10px' }}>{selectedPS.description}</p>
              </div>
            </div>

            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              marginTop: '25px',
              letterSpacing: '1px'
            }}>
              ⚠️ SELECTION IS PERMANENT. PROCEED TO NEXT PHASE.
            </p>
          </div>
        ) : !roundActive ? (
          /* --- PRIORITY 2: ROUND CLOSED UI --- */
          /* Only shows if not selected AND round is closed */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(10, 10, 10, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🔒</div>
            <h2 style={{
              color: '#ef4444',
              fontWeight: '900',
              fontSize: '2.5rem',
              letterSpacing: '3px',
              marginBottom: '15px'
            }}>
              ROUND CLOSED
            </h2>
            <p style={{
              color: '#fff',
              fontSize: '1.2rem',
              marginBottom: '15px',
              maxWidth: '600px'
            }}>
              Problem Statement Selection is currently not available.
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1rem'
            }}>
              ⏳ Please wait for the organizing committee to activate this round.
            </p>
          </div>
        ) : (
          /* --- PRIORITY 3: ACTIVE SELECTION LIST --- */
          <>
            <div
              style={{
                borderLeft: "8px solid #dc2626",
                background: "rgba(20, 20, 20, 0.8)",
                backdropFilter: "blur(10px)",
                padding: "15px 25px",
                marginBottom: "40px",
                boxShadow: "0 10px 40px rgba(183, 99, 80, 0.5)",
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
                                fontSize: "16px",
                                fontWeight: "900",
                                color: "rgba(255,255,255,0.4)",
                              }}
                            >
                              CONFLICT LEVEL
                            </span>
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: "1000",
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
          </>
        )}

        {/* --- MODAL UI (Always render, visibility controlled by showModal) --- */}
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
                . Once breached, the vault stays locked.
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
              borderLeft: `5px solid ${notification.type === "success" ? "#22c55e" : "#dc2626"
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

        {/* --- STYLES (Moved outside conditional logic to apply everywhere) --- */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .ps-container::-webkit-scrollbar { display: none; }
              .ps-container { -ms-overflow-style: none; scrollbar-width: none; }
              
              @media (max-width: 992px) {
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
              @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `,
          }}
        />
      </div>
    </div>
  );
}