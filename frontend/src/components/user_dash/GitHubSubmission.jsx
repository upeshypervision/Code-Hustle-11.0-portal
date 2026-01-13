import React, { useState, useEffect } from "react";
import socket from "../../socket";
import strangerThingsBg from "../../assets/StrangerThings-bg.png";

export default function SubmissionPortal({ onUpload, isSubmitted }) {
  // --- STATE & LOGIC: STRICTLY INTACT ---
  const [githubLink, setGithubLink] = useState("");
  const [hostedLink, setHostedLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [roundActive, setRoundActive] = useState(true);
  const [checkingRound, setCheckingRound] = useState(true);
  const [hackerrankStatus, setHackerrankStatus] = useState(null);
  const [pptStatus, setPptStatus] = useState(null);
  const [checkingApprovals, setCheckingApprovals] = useState(true);
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
          // Check if round is 'live' (enum state: 'live', 'closed', 'not_started')
          setRoundActive(data.rounds.github_submission === 'live');
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
      if (data.round_type === 'github_submission') {
        // data.state is enum: 'live', 'closed', 'not_started'
        setRoundActive(data.state === 'live');
      }
    };
    socket.on("round_status_changed", handleRoundChange);
    return () => socket.off("round_status_changed", handleRoundChange);
  }, []);

  // Check if user has already submitted
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/check-github-submission", {
          credentials: "include",
        });
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

  // Check Round 1 (Hackerrank) and Round 2 (PPT) approval status
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        // Check Hackerrank
        const hrRes = await fetch("http://localhost:5000/api/check-hackerrank-submission", {
          credentials: "include",
        });
        const hrData = await hrRes.json();
        if (hrData.success && hrData.is_submitted) {
          setHackerrankStatus(hrData.submission.approval_status);
        } else {
          setHackerrankStatus("not_submitted");
        }

        // Check PPT
        const pptRes = await fetch("http://localhost:5000/api/check-ppt-submission", {
          credentials: "include",
        });
        const pptData = await pptRes.json();
        if (pptData.success && pptData.is_submitted) {
          setPptStatus(pptData.submission.approval_status);
        } else {
          setPptStatus("not_submitted");
        }
      } catch (err) {
        console.error("Error checking approval status:", err);
      } finally {
        setCheckingApprovals(false);
      }
    };
    checkApprovalStatus();
  }, []);

  // Listen for approval updates
  useEffect(() => {
    const handleHackerrankUpdate = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/check-hackerrank-submission", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.is_submitted) {
          setHackerrankStatus(data.submission.approval_status);
        }
      } catch (err) {
        console.error("Error refetching Hackerrank status:", err);
      }
    };
    socket.on("hackerrank_approval_updated", handleHackerrankUpdate);
    return () => socket.off("hackerrank_approval_updated", handleHackerrankUpdate);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubLink.trim()) {
      setError("GitHub link is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/submit-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          github_link: githubLink,
          live_link: hostedLink || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        if (res.status === 403) {
          setError(data.error || "Sorry, the submission cannot be made as the GitHub submission round is currently closed.");
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

  return (
    <div
      className="ps-view-wrapper"
      style={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* --- BACKGROUNDS --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
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
          background: "radial-gradient(circle at 40% 70%, transparent 10%, rgba(20, 16, 16, 0.42) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* --- MAIN CONTENT CONTAINER --- */}
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
          zIndex: 1,
        }}
      >
        <div
          className="github-container-main"
          style={{
            width: "100%",
            maxWidth: "800px",
            position: "relative",
            zIndex: 10,
          }}
        >

          {/* LOGIC PRIORITY 1: LOADING */}
          {checkingRound || checkingStatus ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'rgba(255,255,255,0.6)',
              width: '100%',
              maxWidth: '900px'
            }}>
              <p>Loading...</p>
            </div>
          ) : (isSubmitted || success) ? (

            /* LOGIC PRIORITY 2: SUBMITTED (SUCCESS UI) */
            /* Shows even if round is closed */
            <div
              className="github-submission-card"
              style={{
                animation: "fadeIn 0.6s ease-out",
                width: "100%",
                maxWidth: "900px",
                background: "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)",
                backdropFilter: "blur(20px)",
                borderRadius: "4px",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                boxShadow: "0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)",
              }}
            >
              {/* Header Section (Replicated for UI Consistency) */}
              <div style={{ textAlign: "center", marginBottom: "45px", marginTop: "35px" }}>
                <h2 style={{
                  color: "#fff",
                  fontFamily: '"Della Respira", serif',
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: "0 0 10px 0",
                  textShadow: "0 0 15px rgba(220, 38, 38, 0.5)",
                }}>
                  Final Uplink
                </h2>
                <div style={{
                  height: "2px",
                  width: "60px",
                  background: "#dc2626",
                  margin: "0 auto 20px",
                }}></div>
                <p style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.85rem",
                  letterSpacing: "1px",
                }}>
                  TRANSMIT YOUR ARCHITECTURE TO THE VAULT
                </p>
              </div>


              {/* Success Message with Approval Status */}
              <div style={{
                padding: "40px",
                background: submissionData?.approval_status === 'approved'
                  ? "linear-gradient(145deg, rgba(34, 197, 94, 0.2) 0%, rgba(10, 10, 10, 0.9) 100%)"
                  : "rgba(255,255,255,0.03)",
                border: submissionData?.approval_status === 'approved' ? "2px solid #22c55e" : "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
                borderRadius: "8px",
                boxShadow: submissionData?.approval_status === 'approved' ? "0 0 30px rgba(34, 197, 94, 0.2)" : "none"
              }}>
                <div style={{
                  fontSize: "3rem",
                  marginBottom: "15px",
                  color: submissionData?.approval_status === 'approved' ? '#22c55e' :
                    submissionData?.approval_status === 'rejected' ? '#ef4444' : '#eab308'
                }}>
                  {submissionData?.approval_status === 'approved' ? '🏆' :
                    submissionData?.approval_status === 'rejected' ? '❌' : '⏳'}
                </div>
                <h3 style={{
                  color: submissionData?.approval_status === 'approved' ? "#22c55e" :
                    submissionData?.approval_status === 'rejected' ? "#ef4444" : "#eab308",
                  fontWeight: "900",
                  letterSpacing: "2px",
                  fontSize: '1.5rem',
                  marginBottom: '15px'
                }}>
                  {submissionData?.approval_status === 'approved' ? 'CONGRATS! YOU HAVE WON CODE HUSTLE 11.0' :
                    submissionData?.approval_status === 'rejected' ? 'SORRY, YOU ARE NOT THE WINNER' :
                      'REVIEW PENDING'}
                </h3>
                {submissionData?.approval_status === 'approved' && (
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", margin: "0 0 10px 0" }}>
                    Congratulations on your outstanding performance! You are the winner!
                  </p>
                )}
                {submissionData?.approval_status === 'pending' && (
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", margin: "0 0 10px 0" }}>
                    Your submission is currently under review by our team.
                  </p>
                )}
                {submissionData?.approval_status === 'rejected' && (
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", margin: "0 0 10px 0" }}>
                    Thank you for participating in Code Hustle 11.0. Better luck next time!
                  </p>
                )}
                <p style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.8rem",
                  marginTop: "10px",
                }}>
                  REPOSITORIES SECURED AT {submissionData?.submitted_at ? new Date(submissionData.submitted_at).toLocaleTimeString() : new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

          ) : ((hackerrankStatus && hackerrankStatus !== 'approved') || (pptStatus && pptStatus !== 'approved')) ? (
            /* LOGIC PRIORITY 2: NOT ALLOWED (Round 1 or Round 2 Not Approved) */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              padding: '40px',
              textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              animation: 'fadeIn 0.5s ease-out',
              width: '100%',
              maxWidth: '800px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚫</div>
              <h2 style={{
                color: '#ef4444',
                fontWeight: '900',
                fontSize: '2.5rem',
                letterSpacing: '3px',
                marginBottom: '15px'
              }}>
                NOT ALLOWED
              </h2>
              <p style={{
                color: '#fff',
                fontSize: '1.2rem',
                marginBottom: '15px',
                maxWidth: '600px'
              }}>
                Sorry, you are not allowed in this round.
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1rem'
              }}>
                {hackerrankStatus !== 'approved'
                  ? 'You must be approved in Round 1 (Hackerrank) to submit GitHub link.'
                  : 'You must be approved in Round 2 (PPT Submission) to submit GitHub link.'}
              </p>
            </div>

          ) : !roundActive ? (

            /* LOGIC PRIORITY 3: ROUND CLOSED (Only if NOT submitted) */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              padding: '40px',
              textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              animation: 'fadeIn 0.5s ease-out',
              width: '100%',
              maxWidth: '800px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)'
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
                GitHub Submission is currently not available.
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1rem'
              }}>
                ⏳ Please wait for the organizing committee to activate this round.
              </p>
            </div>

          ) : (

            /* LOGIC PRIORITY 4: ACTIVE FORM (Not submitted, Round Active) */
            <div
              className="github-submission-card"
              style={{
                animation: "fadeIn 0.6s ease-out",
                width: "100%",
                maxWidth: "700px",
                background: "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)",
                backdropFilter: "blur(20px)",
                borderRadius: "4px",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                boxShadow: "0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)",
                padding: "40px 50px",
              }}
            >
              {/* Header Section */}
              <div style={{ textAlign: "center", marginBottom: "45px", marginTop: "30px" }}>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "2.2rem",
                    fontWeight: "900",
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    margin: "0 0 10px 0",
                    textShadow: "0 0 15px rgba(220, 38, 38, 0.5)",
                  }}
                >
                  Final Uplink
                </h2>
                <div
                  style={{
                    height: "2px",
                    width: "60px",
                    background: "#dc2626",
                    margin: "0 auto 20px",
                  }}
                ></div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "1rem",
                    fontWeight: "700",
                    letterSpacing: "1px",
                  }}
                >
                  TRANSMIT YOUR ARCHITECTURE TO THE VAULT
                </p>
              </div>

              {error && (
                <div style={{
                  padding: "15px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid #ef4444",
                  borderRadius: "4px",
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                  textAlign: "center",
                }}>
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "30px" }}
              >
                <div style={{ position: "relative" }}>
                  <label style={{
                    color: "#dc2626",
                    fontSize: "0.8rem",
                    fontWeight: "900",
                    letterSpacing: "2px",
                    display: "block",
                    marginBottom: "10px",
                  }}>
                    01. GITHUB REPOSITORY (MANDATORY)
                  </label>
                  <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}>
                    <div style={{
                      position: "absolute",
                      left: "15px",
                      display: "flex",
                      alignItems: "center",
                      borderRight: "1px solid rgba(220, 38, 38, 0.3)",
                      paddingRight: "12px",
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#dc2626">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      placeholder="https://github.com/username/repo"
                      required
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      className="heist-input"
                      style={{
                        width: "100%",
                        padding: "18px 18px 18px 60px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(220, 38, 38, 0.2)",
                        borderRadius: "2px",
                        color: "#fff",
                        fontSize: "0.9rem",
                        fontFamily: "monospace",
                        outline: "none",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.8rem",
                    fontWeight: "900",
                    letterSpacing: "2px",
                    display: "block",
                    marginBottom: "10px",
                  }}>
                    02. LIVE DEPLOYMENT (OPTIONAL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-app.vercel.app"
                    value={hostedLink}
                    onChange={(e) => setHostedLink(e.target.value)}
                    className="heist-input-optional"
                    style={{
                      width: "100%",
                      padding: "18px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "2px",
                      color: "#fff",
                      fontSize: "0.9rem",
                      fontFamily: "monospace",
                      outline: "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="creative-red-btn"
                  disabled={!githubLink.trim() || loading}
                  style={{
                    marginTop: "10px",
                    width: "fit-content",
                    margin: "10px auto 0"
                  }}
                >
                  <span className="text">{loading ? "TRANSMITTING..." : "SEND THE SIGNAL"}</span>
                </button>

                <div style={{
                  textAlign: "center",
                  fontSize: "0.6rem",
                  color: "#444",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}>
                  Security Protocol: AES-256 Enabled // System: Operational
                </div>
              </form>
            </div>
          )}
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
                .github-container-main {
                    transform: translateX(-100px);
                }

                @media (max-width: 992px) {
                    aside, .sidebar-container {}
                }

                @media (max-width: 768px) {
                    .github-container-main {
                        transform: translateX(0);
                    }
                }

                .cross-top { transform: translateY(7px) rotate(45deg); }
                .cross-bottom { transform: translateY(-7px) rotate(-45deg); }
                .hide { opacity: 0; }
                .heist-input:focus {
                    border-color: #dc2626 !important;
                    background: rgba(220, 38, 38, 0.05) !important;
                    box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
                }
                .heist-input-optional:focus {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .heist-submit-btn {
                    background: linear-gradient(90deg, #991b1b, #dc2626, #991b1b);
                    background-size: 200% auto;
                    box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
                    animation: shine-red 3s linear infinite;
                }
                .heist-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 0 35px rgba(220, 38, 38, 0.6);
                }
                .heist-submit-btn:disabled {
                    background: #222; color: #444; cursor: not-allowed; box-shadow: none; animation: none;
                }
                @keyframes shine-red { to { background-position: 200% center; } }
                
                .creative-red-btn {
                    --c1: #0a0a0a;
                    --c2: #dc2626;
                    --size-letter: 14px;
                    padding: 12px 25px;
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

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `,
          }}
        />
      </div>
    </div>
  );
}