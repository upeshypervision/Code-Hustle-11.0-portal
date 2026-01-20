import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserNavbar.css";
import logo from "../../assets/codehustle-logo.png";

export default function UserNavbar({
  teamName,
  activeTab,
  setActiveTab,
  showHamburger = true,
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "DASHBOARD" },
    { id: "hackerrank-submission", label: "HACKERRANK PROTOCOL" },
    { id: "ps-selection", label: "PROBLEM STATEMENT SUBMISSION" },
    { id: "ppt-submission", label: "PPT SUBMISSION" },
    { id: "github-submission", label: "GITHUB LINK SUBMISSION" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5001/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/userlogin");
    }
  };

  const handleContactUs = () => {
    window.location.href = "https://codehustle11.upeshypervision.in/#contact";
  };

  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="user-navbar">
        <div className="user-navbar-inner">
          {/* Left Section - Hamburger & Logo */}
          <div className="user-navbar-left">
            {showHamburger && (
              <button
                className={`user-navbar-hamburger ${isMenuOpen ? "menu-open" : ""}`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            )}
            <div className="user-navbar-logo">
              <img
                src={logo}
                alt="Code Hustle Logo"
                className="user-navbar-logo-img"
              />
              <span className="user-navbar-logo-main">Code Hustle 11</span>
            </div>
          </div>

          {/* Right Section - Contact Us, Logout */}
          <div className="user-navbar-right">
            <button
              className="user-navbar-btn contact-btn"
              onClick={handleContactUs}
            >
              <svg
                className="icon-phone"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Contact Us</span>
            </button>
            <button
              className="user-navbar-btn logout-btn"
              onClick={handleLogout}
            >
              <svg
                className="icon-power"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            className="user-navbar-menu-overlay"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="user-navbar-menu-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="user-navbar-menu-header">
                <div className="menu-header-logo">
                  <div className="menu-header-title-wrapper">
                    <div className="menu-header-title-main">
                      {teamName || "CODEBREAKERS"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="user-navbar-menu-list">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    className={`menu-item ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <span className="menu-item-icon">
                      {item.id === "dashboard" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                      )}
                      {item.id === "hackerrank-submission" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      )}
                      {item.id === "ps-selection" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                      )}
                      {item.id === "ppt-submission" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      )}
                      {item.id === "github-submission" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                      )}
                    </span>
                    <span className="menu-item-text">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="menu-footer">
                <div className="menu-footer-text">On a curiosity voyage</div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
