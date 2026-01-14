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
        const res = await fetch("http://localhost:5000/api/round-status", {
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
          "http://localhost:5000/api/check-hackerrank-submission",
          {
            credentials: "include",
          }
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
          "http://localhost:5000/api/check-hackerrank-submission",
          {
            credentials: "include",
          }
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
      const res = await fetch("http://localhost:5000/api/submit-hackerrank", {
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
              "Sorry, the submission cannot be made as the Hackerrank submission round is currently closed."
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
          maxWidth: "500px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)",
            backdropFilter: "blur(10px)",
            borderRadius: "4px",
            border: success
              ? "1px solid #10b981"
              : "1px solid rgba(34, 197, 94, 0.3)", // Green theme
            boxShadow: success
              ? "0 10px 40px rgba(16, 185, 129, 0.1)"
              : "0 10px 40px rgba(0,0,0,0.8)",
            padding: "30px",
            animation: "fadeIn 0.6s ease-out",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              textAlign: "left",
              marginBottom: "25px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "15px",
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
                  color: "#22c55e", // Green for Hackerrank
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: "0 0 5px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>🧩</span> HACKERRANK
                PROTOCOL
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem",
                  letterSpacing: "1px",
                  margin: 0,
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
                padding: "30px",
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
              <div
                style={{
                  fontSize: "3rem",
                  color:
                    submissionData?.approval_status === "approved"
                      ? "#22c55e"
                      : submissionData?.approval_status === "rejected"
                      ? "#ef4444"
                      : "#eab308",
                }}
              >
                {submissionData?.approval_status === "approved"
                  ? "🎉"
                  : submissionData?.approval_status === "rejected"
                  ? "❌"
                  : "⏳"}
              </div>
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
                  gap: "15px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <input
                    type="url"
                    placeholder="https://www.hackerrank.com/profile/username"
                    required
                    value={hackerrankLink}
                    onChange={(e) => setHackerrankLink(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      borderRadius: "2px",
                      color: "#fff",
                      fontSize: "0.9rem",
                      fontFamily: "monospace",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(34, 197, 94, 0.3)")
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "15px 30px",
                    background: "#22c55e",
                    border: "none",
                    color: "#000",
                    fontWeight: "900",
                    fontSize: "0.9rem",
                    letterSpacing: "1px",
                    cursor: loading ? "wait" : "pointer",
                    textTransform: "uppercase",
                    minWidth: "150px",
                  }}
                >
                  {loading ? "SUBMITTING..." : "SUBMIT PROFILE"}
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
                    border: 1px solid #22c55e;
                    color: #22c55e;
                    font-weight: 800;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 2px;
                    white-space: nowrap;
                }
                .challenge-link-btn:hover {
                    background: #22c55e;
                    color: #000;
                    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
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
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 2px;
                    color: #fff;
                    fontSize: 0.9rem;
                    font-family: 'Space Mono', 'Courier New', Courier, monospace;
                    outline: none;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                    height: 50px;
                }
                
                .hackerrank-submit-btn {
                    padding: 0 30px;
                    background: #22c55e;
                    border: none;
                    color: #000;
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
                    opacity: 0.7;
                    cursor: wait;
                }
                .hackerrank-submit-btn:hover:not(:disabled) {
                    background: #4ade80;
                    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
                }

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
