import React, { useState, useEffect } from "react";
import socket from "../../socket";
import strangerThingsBg from "../../assets/StrangerThings-bg.png";

export default function HackerrankSubmission({ teamName }) {
  const [hackerrankLink, setHackerrankLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [roundActive, setRoundActive] = useState(true);
  const [checkingRound, setCheckingRound] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);

  // Check round status on mount
  useEffect(() => {
    const checkRoundStatus = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/round-status", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          // Check if round is 'live' (enum state)
          setRoundActive(data.rounds.hackerrank_submission === "live");
        }
      } catch (err) {
        console.error("Error checking round status:", err);
      } finally {
        setCheckingRound(false);
      }
    };
    checkRoundStatus();
  }, []);

  // Listen for round status changes
  useEffect(() => {
    const handleRoundChange = (data) => {
      if (data.round_type === "hackerrank_submission") {
        // data.state is enum: 'live', 'closed', 'not_started'
        setRoundActive(data.state === "live");
      }
    };
    socket.on("round_status_changed", handleRoundChange);
    return () => socket.off("round_status_changed", handleRoundChange);
  }, []);

  // Check if user has already submitted
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/check-hackerrank-submission",
          {
            credentials: "include",
          },
        );
        const data = await res.json();
        if (data.success && data.is_submitted) {
          setSuccess(true);
          setSubmissionData(data.submission);
        }
      } catch (err) {
        console.error("Error checking submission status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkSubmissionStatus();
  }, []);

  // Listen for approval status changes from admin (real-time updates)
  useEffect(() => {
    const handleApprovalUpdate = async (data) => {
      // Refetch submission status when this team's submission is updated
      try {
        const res = await fetch(
          "http://localhost:5001/api/check-hackerrank-submission",
          {
            credentials: "include",
          },
        );
        const responseData = await res.json();
        if (responseData.success && responseData.is_submitted) {
          setSuccess(true);
          setSubmissionData(responseData.submission);
        }
      } catch (err) {
        console.error("Error refetching submission status:", err);
      }
    };

    socket.on("hackerrank_approval_updated", handleApprovalUpdate);
    return () =>
      socket.off("hackerrank_approval_updated", handleApprovalUpdate);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hackerrankLink.trim()) {
      setError("Hackerrank profile link is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5001/api/submit-hackerrank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hackerrank_link: hackerrankLink,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setSubmissionData({
          hackerrank_link: hackerrankLink,
          submitted_at: new Date().toISOString(),
        });
      } else {
        if (res.status === 403) {
          setError(
            data.error ||
              "Sorry, the submission cannot be made as the Hackerrank submission round is currently closed.",
          );
        } else {
          setError(data.error || "Failed to submit link");
        }
      }
    } catch (err) {
      console.error("Error submitting link:", err);
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingRound || checkingStatus) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "rgba(255,255,255,0.6)",
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p>Loading Protocol...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 70px)",
        position: "relative",
        padding: "0",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            "radial-gradient(circle at 40% 70%, transparent 10%, rgba(20, 16, 16, 0.42) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div
        className="hackerrank-container"
        style={{
          width: "100%",
          maxWidth: "800px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)",
            backdropFilter: "blur(20px)",
            borderRadius: "4px",
            border: success
              ? "1px solid #10b981"
              : "1px solid rgba(220, 38, 38, 0.3)", // Red theme
            boxShadow: success
              ? "0 10px 40px rgba(16, 185, 129, 0.1)"
              : "0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)",
            padding: "40px",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.6s ease-out",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              textAlign: "left",
              marginBottom: "15px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h2
                style={{
                  color: "#fff", // White text
                  fontFamily: '"Della Respira", serif',
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: "0 0 5px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textShadow: "0 0 15px rgba(220, 38, 38, 0.5)", // Red glow
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>🧩</span> HACKERRANK
                PROTOCOL
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "1rem",
                  letterSpacing: "1px",
                  margin: 0,
                  fontFamily: '"Rajdhani", sans-serif',
                  fontWeight: "600",
                }}
              >
                SOLVE CHALLENGES & SUBMIT YOUR PROFILE
              </p>
            </div>

            {roundActive && (
              <a
                href="https://www.hackerrank.com/contests/"
                target="_blank"
                rel="noopener noreferrer"
                className="challenge-link-btn"
                style={{
                  textDecoration: "none",
                }}
              >
                ACCESS CHALLENGES ↗
              </a>
            )}
          </div>

          {/* Content */}
          {success ? (
            <div
              style={{
                padding: "60px 30px",
                background:
                  submissionData?.approval_status === "approved"
                    ? "linear-gradient(145deg, rgba(34, 197, 94, 0.2) 0%, rgba(10, 10, 10, 0.9) 100%)"
                    : "rgba(255,255,255,0.03)",
                border:
                  submissionData?.approval_status === "approved"
                    ? "2px solid #22c55e"
                    : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "20px",
                boxShadow:
                  submissionData?.approval_status === "approved"
                    ? "0 0 30px rgba(34, 197, 94, 0.2)"
                    : "none",
              }}
            >
              <div style={{ width: "100%" }}>
                <h3
                  style={{
                    color:
                      submissionData?.approval_status === "approved"
                        ? "#22c55e"
                        : submissionData?.approval_status === "rejected"
                          ? "#ef4444"
                          : "#eab308",
                    fontWeight: "900",
                    letterSpacing: "1px",
                    fontSize: "1.5rem", // Larger font
                    margin: "0 0 10px 0",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  {submissionData?.approval_status === "approved"
                    ? "CONGRATS! YOU ARE SELECTED FOR ROUND 2"
                    : submissionData?.approval_status === "rejected"
                      ? "SORRY, NOT SELECTED"
                      : "REVIEW PENDING"}
                </h3>
                {submissionData?.approval_status === "approved" && (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "1rem",
                      margin: "0 0 10px 0",
                      textAlign: "center",
                    }}
                  >
                    You may now proceed to the Problem Statement selection.
                  </p>
                )}
                {submissionData?.approval_status === "pending" && (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "1rem",
                      margin: "0 0 10px 0",
                      textAlign: "center",
                    }}
                  >
                    Your submission is currently under review by our team.
                  </p>
                )}
                {submissionData?.approval_status === "rejected" && (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "1rem",
                      margin: "0 0 10px 0",
                      textAlign: "center",
                    }}
                  >
                    We’re sorry to inform you that you were not selected for
                    Round 2. Better luck next time!
                  </p>
                )}
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.9rem",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "#fff" }}>Link:</strong>{" "}
                  {submissionData?.hackerrank_link}
                </p>
              </div>
            </div>
          ) : !roundActive ? (
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
                  "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(10, 10, 10, 0.8) 100%)",
                backdropFilter: "blur(10px)",
                border: "2px solid #ef4444",
                borderRadius: "8px",
                animation: "fadeIn 0.5s ease-out",
                width: "100%",
                maxWidth: "800px",
                margin: "0 auto",
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
                Hackerrank Submission is currently not available.
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
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", gap: "15px", flexDirection: "column" }}
            >
              {error && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "0.85rem",
                    background: "rgba(239,68,68,0.1)",
                    padding: "10px",
                    borderRadius: "2px",
                    border: "1px solid #ef4444",
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div style={{ width: "80%", maxWidth: "500px" }}>
                  <input
                    type="url"
                    placeholder="https://www.hackerrank.com/profile/username"
                    required
                    value={hackerrankLink}
                    onChange={(e) => setHackerrankLink(e.target.value)}
                    className="hackerrank-input"
                    style={{
                      width: "100%",
                      padding: "15px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(220, 38, 38, 0.2)",
                      borderRadius: "2px",
                      color: "#fff",
                      fontSize: "0.9rem",
                      fontFamily: "monospace",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bubbles"
                  style={{
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  <span className="text">
                    {loading ? "SUBMITTING..." : "SUBMIT PROFILE"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
                .challenge-link-btn {
                    padding: 10px 20px;
                    background: transparent;
                    border: 1px solid #dc2626;
                    color: #dc2626;
                    font-weight: 800;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 2px;
                    white-space: nowrap;
                }
                .challenge-link-btn:hover {
                    background: #dc2626;
                    color: #fff;
                    box-shadow: 0 0 15px rgba(220, 38, 38, 0.4);
                }

                .form-row {
                    display: flex;
                    gap: 15px;
                    align-items: stretch;
                }
                
                .hackerrank-input {
                    flex: 1;
                    width: 100%;
                    padding: 15px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 2px;
                    color: #fff;
                    font-size: 0.9rem;
                    font-family: monospace;
                    outline: none;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                    height: 50px;
                }

                .hackerrank-input:focus {
                    border-color: #dc2626 !important;
                    background: rgba(220, 38, 38, 0.05) !important;
                    box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
                }
                
                .hackerrank-submit-btn {
                    padding: 0 30px;
                    background: linear-gradient(90deg, #991b1b, #dc2626, #991b1b);
                    background-size: 200% auto;
                    box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
                    animation: shine-red 3s linear infinite;
                    border: none;
                    color: #fff;
                    font-weight: 900;
                    font-size: 0.9rem;
                    letter-spacing: 1px;
                    cursor: pointer;
                    text-transform: uppercase;
                    min-width: 150px;
                    height: 50px; /* Matched height */
                    border-radius: 2px;
                    transition: all 0.3s ease;
                }
                .hackerrank-submit-btn:disabled {
                    background: #222; 
                    opacity: 0.7;
                    cursor: wait;
                    animation: none;
                    box-shadow: none;
                    color: #444;
                }
                .hackerrank-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 0 35px rgba(220, 38, 38, 0.6);
                }
                

                .bubbles {
                    --c1: #0a0a0a;
                    --c2: #dc2626;
                    --size-letter: 14px;
                    padding: 16px 40px; /* Adjusted padding */
                    min-width: 200px;
                    font-size: var(--size-letter);
                    background-color: transparent;
                    border: 2px solid var(--c2);
                    border-radius: 5px;
                    cursor: pointer;
                    overflow: hidden;
                    position: relative;
                    transition: 300ms cubic-bezier(0.83, 0, 0.17, 1);
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 900;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    margin-top: 10px;
                    z-index: 5;
                    box-shadow: 0 0 5px rgba(220, 38, 38, 0.4);
                }

                .bubbles > .text {
                    font-weight: 900;
                    color: var(--c2);
                    position: relative;
                    z-index: 1;
                    transition: color 700ms cubic-bezier(0.83, 0, 0.17, 1);
                }

                .bubbles::before {
                    top: 0;
                    left: 0;
                }

                .bubbles::after {
                    top: 100%;
                    left: 100%;
                }

                .bubbles::before,
                .bubbles::after {
                    content: "";
                    width: 150%;
                    aspect-ratio: 1/1;
                    scale: 0;
                    transition: 1000ms cubic-bezier(0.76, 0, 0.24, 1);
                    background-color: var(--c2);
                    border-radius: 50%;
                    position: absolute;
                    translate: -50% -50%;
                }

                .bubbles:hover {
                     box-shadow: 0 0 30px rgba(220, 38, 38, 0.8);
                }

                .bubbles:hover > .text {
                    color: var(--c1);
                }

                .bubbles:hover::before,
                .bubbles:hover::after {
                    scale: 1;
                }

                .bubbles:active {
                    scale: 0.98;
                    filter: brightness(0.9);
                }
                
                .bubbles:disabled {
                    opacity: 0.7;
                    cursor: wait;
                    pointer-events: none;
                }
                
                @keyframes shine-red { to { background-position: 200% center; } }

                .hackerrank-container {
                    transform: translateX(-100px);
                }

                @media (max-width: 768px) {
                    .hackerrank-container {
                        transform: translateX(0);
                    }
                    .form-row {
                        flex-direction: column;
                    }
                    .hackerrank-input, .hackerrank-submit-btn {
                        width: 100%;
                    }
                    .challenge-link-btn {
                        width: 100%;
                        text-align: center;
                    }
                }
            `,
          }}
        />
      </div>
    </div>
  );
}
