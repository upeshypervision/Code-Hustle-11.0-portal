import React, { useState, useEffect } from "react";
import socket from "../../socket";

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

  // Check round status on mount
  useEffect(() => {
    const checkRoundStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/round-status", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRoundActive(data.rounds.github_submission);
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
        setRoundActive(data.is_active);
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
        }
      } catch (err) {
        console.error("Error checking submission status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkSubmissionStatus();
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
          backgroundImage: `url('https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/22977484/Nissan.jpg?quality=90&strip=all&crop=0.095000000000006%2C0%2C99.81%2C100&w=2400')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(20%) brightness(30%) contrast(70%)",
          zIndex: -2,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(28, 25, 25, 0.4) 50%, rgba(0, 0, 0, 0.9) 100%)",
          zIndex: -1,
        }}
      />

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          zIndex: 1,
        }}
        className="github-submission-wrapper"
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
              maxWidth: "700px",
              background: "linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.85) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: "4px",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.9), inset 0 0 100px rgba(220, 38, 38, 0.05)",
            }}
          >
             {/* Header Section (Replicated for UI Consistency) */}
             <div style={{ textAlign: "center", marginBottom: "45px" }}>
              <h2 style={{
                  color: "#fff",
                  fontSize: "2.2rem",
                  fontWeight: "900",
                  letterSpacing: "4px",
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

            {/* Success Message */}
            <div style={{
                padding: "40px",
                background: "rgba(16,185,129,0.05)",
                border: "1px solid #10b981",
                textAlign: "center",
                borderRadius: "2px",
              }}>
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>✓</div>
              <h3 style={{
                  color: "#10b981",
                  fontWeight: "900",
                  letterSpacing: "2px",
                }}>
                MISSION ACCOMPLISHED
              </h3>
              <p style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.8rem",
                  marginTop: "10px",
                }}>
                REPOSITORIES SECURED AT {new Date().toLocaleTimeString()}
              </p>
            </div>
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
            background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(10, 10, 10, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            animation: 'fadeIn 0.5s ease-out',
            width: '100%',
            maxWidth: '800px'
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
            }}
          >
            {/* Header Section */}
            <div style={{ textAlign: "center", marginBottom: "45px" }}>
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
                  fontSize: "0.85rem",
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
                    fontSize: "0.65rem",
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
                    fontSize: "0.65rem",
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
                className="heist-submit-btn"
                disabled={!githubLink.trim() || loading}
                style={{
                  marginTop: "10px",
                  padding: "20px",
                  border: "none",
                  borderRadius: "2px",
                  color: "#fff",
                  fontWeight: "900",
                  fontSize: "1rem",
                  letterSpacing: "4px",
                  cursor: loading ? "wait" : "pointer",
                  textTransform: "uppercase",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "TRANSMITTING..." : "INITIATE TRANSMISSION"}
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

        <style
          dangerouslySetInnerHTML={{
            __html: `
                @media (max-width: 992px) {
                    aside, .sidebar-container {}
                }
                .github-submission-wrapper {
                    padding: 80px 40px 40px 40px;
                }
                .github-submission-card {
                    padding: 50px 40px;
                }
                @media (max-width: 768px) {
                    .github-submission-wrapper {
                        padding: 20px !important;
                        align-items: center !important;
                    }
                    .github-submission-card {
                        padding: 30px 20px !important;
                        width: 100% !important; 
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