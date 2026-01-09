import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GlobalNavbar({
  userInfo,
  isAdmin = false,
  isEvaluator = false,
  menuItems = [],
  onMenuItemClick,
  onToggleSidebar,
  showContactUs = false,
  logoutPath,
}) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Call the logout endpoint to clear all auth cookies
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Navigate to appropriate login page based on user type or custom path
      if (logoutPath) {
        navigate(logoutPath);
      } else if (isEvaluator) {
        navigate("/evaluator-login");
      } else if (isAdmin) {
        navigate("/admin-login");
      } else {
        navigate("/userlogin");
      }
    }
  };

  const handleMenuClick = (item) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
    setIsMobileMenuOpen(false);
  };

  const handleHamburgerClick = () => {
    // On mobile, prioritize mobile menu if menuItems exist
    // Otherwise, toggle sidebar if provided
    if (menuItems.length > 0) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const getSubtitle = () => {
    if (isEvaluator) return "Evaluator Panel";
    if (isAdmin) return "Admin Panel";
    return "Student Dashboard";
  };

  return (
    <>
      <header className="top-nav">
        <div className="top-nav-inner">
          <div className="logo-container">
            <button
              className="hamburger-menu"
              onClick={handleHamburgerClick}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <img
              src="/hypervision-logo.png"
              alt="Hypervision Logo"
              className="logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = "block";
                }
              }}
            />
            <div className="logo-mark" style={{ display: "none" }}></div>
            <div>
              <div className="logo-text">Code Hustle</div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                {getSubtitle()}
              </div>
            </div>
          </div>
          <div className="nav-right">
            {userInfo && <div className="nav-user">{userInfo}</div>}
            {showContactUs && (
              <button
                className="nav-logout"
                onClick={() =>
                (window.location.href =
                  "https://codehustle11.upeshypervision.in/#contact")
                }
              >
                Contact us
              </button>
            )}
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Show if menuItems exist OR if we need to show sidebar items */}
      {isMobileMenuOpen && menuItems.length > 0 && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <h3>
                {isEvaluator
                  ? "Evaluator Menu"
                  : isAdmin
                    ? "Admin Menu"
                    : "Navigation"}
              </h3>
              <button
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <ul className="mobile-menu-list">
              {menuItems.map((item, index) => (
                <li key={item.id || index}>
                  <button
                    className={`mobile-menu-item ${item.active ? "active" : ""
                      }`}
                    onClick={() => handleMenuClick(item)}
                  >
                    {item.label || item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
