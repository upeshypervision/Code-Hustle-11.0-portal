import React, { useState, useEffect } from "react";
import socket from "../../socket";
import strangerThingsBg from "../../assets/StrangerThings-bg.png";

export default function PSGallery({ setIsExpandedView }) {
  // Accept prop
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
  const [hackerrankStatus, setHackerrankStatus] = useState(null);
  const [checkingHackerrank, setCheckingHackerrank] = useState(true);

  // --- USE EFFECTS ---
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

  // Check Hackerrank approval status
  useEffect(() => {
    const checkHackerrankStatus = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/check-hackerrank-submission",
          {
            credentials: "include",
          },
        );
        const data = await res.json();
        if (data.success && data.is_submitted) {
          setHackerrankStatus(data.submission.approval_status);
        } else {
          setHackerrankStatus("not_submitted");
        }
      } catch (err) {
        console.error("Error checking Hackerrank status:", err);
      } finally {
        setCheckingHackerrank(false);
      }
    };
    checkHackerrankStatus();
  }, []);

  // Listen for Hackerrank approval updates
  useEffect(() => {
    const handleApprovalUpdate = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/check-hackerrank-submission",
          {
            credentials: "include",
          },
        );
        const data = await res.json();
        if (data.success && data.is_submitted) {
          setHackerrankStatus(data.submission.approval_status);
        }
      } catch (err) {
        console.error("Error refetching Hackerrank status:", err);
      }
    };
    socket.on("hackerrank_approval_updated", handleApprovalUpdate);
    return () =>
      socket.off("hackerrank_approval_updated", handleApprovalUpdate);
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
          setRoundActive(data.rounds.ps_selection === "live");
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
      if (data.round_type === "ps_selection") {
        setRoundActive(data.state === "live");
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

  useEffect(() => {
    fetchProblemStatements();
  }, []);

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
        },
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
          selected_at: new Date().toISOString(),
        });
        setPendingPs(null);
        showNotification(
          "success",
          "Target Locked! Problem statement selected successfully.",
        );
        fetchProblemStatements();
      } else {
        setShowModal(false);
        if (res.status === 403) {
          showNotification("error", data.error || "Round closed.");
        } else {
          showNotification(
            "error",
            data.error || "Failed to select problem statement",
          );
        }
      }
    } catch (err) {
      console.error("Selection error:", err);
      setShowModal(false);
      showNotification("error", "Server connection failed");
    }
  };

  // --- LAYOUT LOGIC ---
  const showNotAllowedLayout =
    (!checkingRound &&
      !checkingSelection &&
      !selectedPS &&
      hackerrankStatus &&
      hackerrankStatus !== "approved") ||
    (!checkingRound && !selectedPS && !roundActive);
  const isFullScreenMode = showNotAllowedLayout || selectedPS;

  // Sync expanded view state with parent
  useEffect(() => {
    if (setIsExpandedView) {
      const isGridView =
        !checkingRound && !checkingSelection && !isFullScreenMode;
      setIsExpandedView(isGridView);
    }
  }, [setIsExpandedView, checkingRound, checkingSelection, isFullScreenMode]);

  return (
    <div
      className="ps-root-container"
      style={
        isFullScreenMode
          ? {
              // ✅ FULL SCREEN MODE (Success / Closed / Not Allowed)
              // Keeps the layout you liked
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100vw",
              height: "100vh",
              backgroundColor: "#0a0a0a",
              overflowY: "auto",
              fontFamily: '"Courier New", Courier, monospace',
              padding: "20px",
              boxSizing: "border-box",
              paddingTop: "120px", // High padding for full screen center mode
            }
          : {
              // ✅ NORMAL GRID MODE
              // Reduced gap here so it looks correct on load
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
              paddingTop: "80px", // Reduced from 120px to 80px for better fit
              paddingBottom: "40px",
              boxSizing: "border-box",
              fontFamily: '"Courier New", Courier, monospace',
              backgroundColor: "#0a0a0a",
              minHeight: "100vh",
              overflowY: "auto",
            }
      }
    >
      {/* --- FIXED BACKGROUND --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${strangerThingsBg})`,
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
          background:
            "radial-gradient(circle at 40% 70%, transparent 10%, rgba(31, 28, 28, 0.42) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div
        className="ps-main-content"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: isFullScreenMode ? "100%" : "1200px",
          margin: isFullScreenMode ? "0" : "0 auto",
          padding: isFullScreenMode ? "0" : "0 30px",
          boxSizing: "border-box",
          display: isFullScreenMode ? "flex" : "block",
          justifyContent: isFullScreenMode ? "center" : "unset",
          alignItems: isFullScreenMode ? "center" : "unset",
          height: isFullScreenMode ? "100%" : "auto",
        }}
      >
        {checkingRound || checkingSelection ? (
          /* --- LOADING STATE --- */
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <p>Loading...</p>
          </div>
        ) : selectedPS ? (
          /* --- PRIORITY 1: SUCCESS UI (TARGET LOCKED) --- */
          <div
            style={{
              background:
                "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid #10b981",
              borderRadius: "8px",
              padding: "40px",
              textAlign: "center",
              animation: "fadeIn 0.5s ease-out",
              maxWidth: "600px",
              width: "100%",
              margin: "auto",
              boxShadow: "0 10px 40px rgba(16, 185, 129, 0.1)",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: "2rem",
                letterSpacing: "3px",
                marginBottom: "15px",
                textShadow: "0 0 15px rgba(220, 38, 38, 0.5)",
              }}
            >
              COORDINATE LOCKED
            </h2>
            <p
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                marginBottom: "30px",
                letterSpacing: "1px",
              }}
            >
              Problem Statement Selected:{" "}
              <strong>{selectedPS.problem_statement_id}</strong>
            </p>

            <div
              style={{
                background:
                  "linear-gradient(145deg, rgba(34, 197, 94, 0.2) 0%, rgba(10, 10, 10, 0.9) 100%)",
                border: "2px solid #22c55e",
                borderRadius: "8px",
                padding: "25px",
                textAlign: "left",
                marginTop: "20px",
                boxShadow: "0 0 30px rgba(34, 197, 94, 0.2)",
              }}
            >
              <h3
                style={{
                  color: "#22c55e",
                  fontSize: "1.5rem",
                  marginBottom: "15px",
                  fontWeight: "800",
                }}
              >
                {selectedPS.title}
              </h3>
              <div style={{ marginBottom: "15px" }}>
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.9rem",
                    marginRight: "15px",
                  }}
                >
                  <strong>Track:</strong> {selectedPS.track || "N/A"}
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Difficulty:</strong> {selectedPS.difficulty || "N/A"}
                </span>
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "1px solid rgba(34, 197, 94, 0.3)",
                }}
              >
                <strong style={{ color: "#22c55e" }}>Description:</strong>
                <p style={{ marginTop: "10px" }}>{selectedPS.description}</p>
              </div>
            </div>

            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.85rem",
                marginTop: "25px",
                letterSpacing: "1px",
              }}
            >
              ⚠️ SELECTION IS PERMANENT. PROCEED TO NEXT PHASE.
            </p>
          </div>
        ) : hackerrankStatus && hackerrankStatus !== "approved" ? (
          /* --- PRIORITY 2: NOT ALLOWED --- */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
              padding: "40px",
              textAlign: "center",
              background:
                "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: "4px",
              animation: "fadeIn 0.5s ease-out",
              maxWidth: "800px",
              margin: "0",
              boxShadow:
                "0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)",
              width: "100%",
            }}
          >
            <div style={{ fontSize: "5rem", marginBottom: "20px" }}>🚫</div>
            <h2
              style={{
                color: "#ef4444",
                fontWeight: "900",
                fontSize: "2.5rem",
                letterSpacing: "3px",
                marginBottom: "15px",
              }}
            >
              NOT ALLOWED
            </h2>
            <p
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                marginBottom: "15px",
                maxWidth: "600px",
              }}
            >
              Sorry, you are not allowed in this round.
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "1rem",
              }}
            >
              You must be approved in Round 1 (Hackerrank) to access Problem
              Statement selection.
            </p>
          </div>
        ) : !roundActive ? (
          /* --- PRIORITY 3: ROUND CLOSED UI --- */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
              padding: "40px",
              textAlign: "center",
              background:
                "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: "4px",
              animation: "fadeIn 0.5s ease-out",
              maxWidth: "800px",
              margin: "0",
              boxShadow:
                "0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)",
              width: "100%",
            }}
          >
            <div style={{ fontSize: "5rem", marginBottom: "20px" }}>🔒</div>
            <h2
              style={{
                color: "#ef4444",
                fontWeight: "900",
                fontSize: "2.5rem",
                letterSpacing: "3px",
                marginBottom: "15px",
              }}
            >
              ROUND CLOSED
            </h2>
            <p
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                marginBottom: "15px",
                maxWidth: "600px",
              }}
            >
              Problem Statement Selection is currently not available.
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "1rem",
              }}
            >
              ⏳ Please wait for the organizing committee to activate this
              round.
            </p>
          </div>
        ) : (
          /* --- PRIORITY 4: ACTIVE SELECTION LIST (GRID MODE) --- */
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              className="caution-card"
              style={{
                borderLeft: "8px solid #dc2626",
                background: "rgba(20, 20, 20, 0.8)",
                backdropFilter: "blur(10px)",
                padding: "15px 25px",
                marginBottom: "40px",
                boxShadow: "0 10px 40px rgba(183, 99, 80, 0.5)",
                maxWidth: "80%",
                width: "100%",
                margin: "0 auto 40px auto",
                boxSizing: "border-box",
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
                  textAlign: "center",
                }}
              >
                <span style={{ marginRight: "10px" }}>⚠️</span> CAUTION:
                COORDINATES CANNOT BE CHANGED ONCE LOCKED.
              </p>
            </div>

            <div
              className="ps-grid-container"
              style={{
                gap: "20px",
                padding: "0",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
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
                              padding: "8px 15px",
                              fontSize: "12px",
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
                                : ps.problem_statement_id,
                            )
                          }
                          className="view-btn-heist"
                        >
                          {expandedId === ps.problem_statement_id
                            ? "CLOSE FILE"
                            : "VIEW FILE"}
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
                          <strong style={{ color: "#dc2626" }}>
                            [BRIEFING]:
                          </strong>{" "}
                          {ps.description}
                        </p>
                        <button
                          onClick={() => triggerLockSequence(ps)}
                          className="creative-red-btn"
                        >
                          <span className="text">LOCK THE COORDINATES</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL UI --- */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
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
                fontSize: "11px",
                color: "#dc2626",
                fontWeight: "900",
                letterSpacing: "5px",
                marginBottom: "15px",
              }}
            >
              CODE RED, HAWKINS
            </div>
            <h2
              style={{
                color: "#fff",
                textTransform: "uppercase",
                margin: "0 0 20px 0",
              }}
            >
              LOCK COORDINATES?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                marginBottom: "30px",
                fontSize: "14px",
              }}
            >
              The{" "}
              <strong style={{ color: "#dc2626" }}>
                {pendingPs?.problem_statement_id}
              </strong>
              . gate is armed, trigger it once, and it never reopens.
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => setShowModal(false)}
                className="modal-abort-btn"
              >
                <span className="text">ABORT</span>
              </button>
              <button onClick={confirmLock} className="modal-initialize-btn">
                <span className="text">INITIALIZE</span>
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

      {/* --- STYLES --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
              .ps-container::-webkit-scrollbar { display: none; }
              .ps-container { -ms-overflow-style: none; scrollbar-width: none; }
              
              /* ✅ Desktop: Grid */
              @media (min-width: 993px) {
                  .ps-grid-container { display: grid; grid-template-columns: repeat(2, 1fr); }
                  /* ✅ No hardcoded padding here, handled in JS */
              }

              /* ✅ Mobile: 90px top padding is handled in JS logic too, but CSS backup here */
              @media (max-width: 992px) {
                  .ps-root-container {
                      padding: 90px 15px 40px 15px !important;
                      justify-content: center !important;
                      align-items: flex-start !important;
                  }
                  
                  .ps-main-content { 
                      justify-content: center !important; 
                      padding: 0 4px !important; 
                  }
                  .ps-card { width: 100% !important; margin: 0 !important; box-sizing: border-box !important; }
                  
                  .card-layout-inner { flex-direction: column !important; }
                  .action-column { align-items: flex-start !important; width: 100% !important; margin-top: 15px; }
                  .view-btn-heist { width: 100% !important; }
                  .heat-gauge-container { width: 100% !important; }
                  .ps-grid-container { display: flex; flex-direction: column; width: 100%; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important; }
                  
                  .caution-card { max-width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; width: 100% !important; }
              }

              .cross-top { transform: translateY(7px) rotate(45deg); }
              .cross-bottom { transform: translateY(-7px) rotate(-45deg); }
              .hide { opacity: 0; }
              .view-btn-heist { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 10px 25px; cursor: pointer; font-weight: 900; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; transition: 0.3s; }
              .view-btn-heist:hover { background: #fff; color: #000; border-color: #fff; }
              
              .creative-red-btn {
                  --c1: #0a0a0a;
                  --c2: #dc2626;
                  --size-letter: 14px;
                  width: 100%;
                  padding: 18px 25px;
                  margin-top: 25px;
                  font-size: var(--size-letter);
                  background-color: transparent;
                  border: 2px solid var(--c2);
                  border-radius: 4px;
                  cursor: pointer;
                  overflow: hidden;
                  position: relative;
                  transition: 300ms cubic-bezier(0.83, 0, 0.17, 1);
                  font-family: 'Orbitron', sans-serif;
                  font-weight: 900;
                  text-transform: uppercase;
                  z-index: 5;
              }
              .creative-red-btn > .text {
                  font-weight: 900;
                  color: var(--c2);
                  position: relative;
                  z-index: 1;
                  transition: color 700ms cubic-bezier(0.83, 0, 0.17, 1);
              }
              .creative-red-btn::before,
              .creative-red-btn::after {
                  content: "";
                  width: 150%;
                  aspect-ratio: 1/1;
                  scale: 0;
                  transition: 1000ms cubic-bezier(0.76, 0, 0.24, 1);
                  background-color: var(--c2);
                  border-radius: 50%;
                  position: absolute;
                  top: 0; left: 0;
                  translate: -50% -50%;
              }
              .creative-red-btn::after {
                  top: 100%;
                  left: 100%;
              }
              .creative-red-btn:hover:not(:disabled) > .text {
                  color: var(--c1);
              }
              .creative-red-btn:hover:not(:disabled)::before,
              .creative-red-btn:hover:not(:disabled)::after {
                  scale: 1;
              }
              .creative-red-btn:active:not(:disabled) {
                  scale: 0.98;
                  filter: brightness(0.9);
              }
              .creative-red-btn:disabled {
                  opacity: 0.6;
                  cursor: not-allowed;
                  filter: grayscale(0.5);
              }

              /* Modal Abort Button */
              .modal-abort-btn {
                  --c1: #fff;
                  --c2: #666;
                  flex: 1;
                  padding: 15px;
                  font-size: 14px;
                  background-color: transparent;
                  border: 2px solid #333;
                  border-radius: 4px;
                  cursor: pointer;
                  overflow: hidden;
                  position: relative;
                  transition: 300ms cubic-bezier(0.83, 0, 0.17, 1);
                  font-family: 'Orbitron', sans-serif;
                  font-weight: 900;
                  text-transform: uppercase;
                  z-index: 5;
              }
              .modal-abort-btn > .text {
                  font-weight: 900;
                  color: #fff;
                  position: relative;
                  z-index: 1;
                  transition: color 700ms cubic-bezier(0.83, 0, 0.17, 1);
              }
              .modal-abort-btn::before,
              .modal-abort-btn::after {
                  content: "";
                  width: 150%;
                  aspect-ratio: 1/1;
                  scale: 0;
                  transition: 1000ms cubic-bezier(0.76, 0, 0.24, 1);
                  background-color: #666;
                  border-radius: 50%;
                  position: absolute;
                  top: 0; left: 0;
                  translate: -50% -50%;
              }
              .modal-abort-btn::after {
                  top: 100%;
                  left: 100%;
              }
              .modal-abort-btn:hover > .text {
                  color: #0a0a0a;
              }
              .modal-abort-btn:hover::before,
              .modal-abort-btn:hover::after {
                  scale: 1;
              }
              .modal-abort-btn:active {
                  scale: 0.98;
                  filter: brightness(0.9);
              }

              /* Modal Initialize Button */
              .modal-initialize-btn {
                  --c1: #0a0a0a;
                  --c2: #dc2626;
                  flex: 1;
                  padding: 15px;
                  font-size: 14px;
                  background-color: transparent;
                  border: 2px solid var(--c2);
                  border-radius: 4px;
                  cursor: pointer;
                  overflow: hidden;
                  position: relative;
                  transition: 300ms cubic-bezier(0.83, 0, 0.17, 1);
                  font-family: 'Orbitron', sans-serif;
                  font-weight: 900;
                  text-transform: uppercase;
                  z-index: 5;
              }
              .modal-initialize-btn > .text {
                  font-weight: 900;
                  color: var(--c2);
                  position: relative;
                  z-index: 1;
                  transition: color 700ms cubic-bezier(0.83, 0, 0.17, 1);
              }
              .modal-initialize-btn::before,
              .modal-initialize-btn::after {
                  content: "";
                  width: 150%;
                  aspect-ratio: 1/1;
                  scale: 0;
                  transition: 1000ms cubic-bezier(0.76, 0, 0.24, 1);
                  background-color: var(--c2);
                  border-radius: 50%;
                  position: absolute;
                  top: 0; left: 0;
                  translate: -50% -50%;
              }
              .modal-initialize-btn::after {
                  top: 100%;
                  left: 100%;
              }
              .modal-initialize-btn:hover > .text {
                  color: var(--c1);
              }
              .modal-initialize-btn:hover::before,
              .modal-initialize-btn:hover::after {
                  scale: 1;
              }
              .modal-initialize-btn:active {
                  scale: 0.98;
                  filter: brightness(0.9);
              }

              @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `,
        }}
      />
    </div>
  );
}
