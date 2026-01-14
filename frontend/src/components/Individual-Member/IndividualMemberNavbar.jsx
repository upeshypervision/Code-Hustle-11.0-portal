import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../user_dash/UserNavbar.css";

export default function IndividualMemberNavbar({
  userName,
  activeTab,
  setActiveTab,
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContentRef = useRef(null);

  const menuItems = [
    { id: "profile", label: "PROFILE" },
    { id: "teams", label: "TEAMS" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/individual-login");
    }
  };

  const handleContactUs = () => {
    window.location.href = "https://codehustle11.upeshypervision.in/#contact";
  };

  const handleMenuClick = (itemId) => {
    if (setActiveTab) {
      setActiveTab(itemId);
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen) {
        // Check if click is on the hamburger button - allow it to toggle
        const hamburgerButton = document.querySelector(
          ".user-navbar-hamburger"
        );
        if (hamburgerButton && hamburgerButton.contains(event.target)) {
          return; // Let the hamburger button handle the toggle
        }

        // If click is outside menu content, close the menu
        if (
          menuContentRef.current &&
          !menuContentRef.current.contains(event.target)
        ) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      // Use a slight delay to avoid conflicts with the overlay onClick
      document.addEventListener("click", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="user-navbar">
        <div className="user-navbar-inner">
          {/* Left Section - Hamburger & Logo */}
          <div className="user-navbar-left">
            <button
              className={`user-navbar-hamburger ${
                isMenuOpen ? "menu-open" : ""
              }`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="user-navbar-logo">
              <span className="user-navbar-logo-small">THE</span>
              <span className="user-navbar-logo-main">CODEHUSTLE 11.0</span>
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
              ref={menuContentRef}
              className="user-navbar-menu-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="user-navbar-menu-header">
                <div className="menu-header-logo">
                  <div className="menu-header-title-wrapper">
                    <div className="menu-header-title-main">
                      {userName || "INDIVIDUAL MEMBER"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="user-navbar-menu-list">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    className={`menu-item ${
                      activeTab === item.id ? "active" : ""
                    }`}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <span className="menu-item-icon">
                      {item.id === "profile" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                      {item.id === "teams" && (
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
                    </span>
                    <span className="menu-item-text">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="menu-footer">
                <div className="menu-footer-text">
                  "We are nerds and freaks." —Dustin
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
