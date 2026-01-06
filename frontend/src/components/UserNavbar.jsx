import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserNavbar({
  userInfo,
  menuItems = [],
  onMenuItemClick,
  onToggleSidebar, // Accept prop
  variant = "default", // "default" or "glass"
}) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/userlogin");
    }
  };

  const handleMenuClick = (item) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
    setIsMobileMenuOpen(false);
  };

  const handleToggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onToggleSidebar) {
      onToggleSidebar(!isMobileMenuOpen);
    }
  };

  return (
    <>
      <header
        className={`top-nav ${variant === "glass" ? "glass-navbar" : ""}`}
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      >
        <div className={`top-nav-inner ${variant === "glass" ? "glass-navbar-inner" : ""}`}>
          <div className="logo-container">
            {menuItems.length > 0 && (
              <button
                className="hamburger-menu"
                onClick={handleToggleMenu}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            )}
            <img
              src="/hypervision-logo.png"
              alt="Hypervision Logo"
              className="logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div className="logo-mark" style={{ display: "none" }}></div>
            <div>
              <div
                className="logo-text"
                style={{ transform: "translateY(7px)" }}
              >
                Code Hustle
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#9ca3af",
                  visibility: "hidden",
                }}
              >
                Student Dashboard
              </div>
            </div>
          </div>
          <div className="nav-right">
            {userInfo && <div className="nav-user">{userInfo}</div>}
            <button
              className="nav-logout"
              onClick={() =>
              (window.location.href =
                "https://codehustle11.upeshypervision.in/#contact")
              }
            >
              Contact us
            </button>
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && menuItems.length > 0 && (
        <div
          className={`mobile-menu-overlay ${variant === "glass" ? "glass-mobile-overlay" : ""}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`mobile-menu-content ${variant === "glass" ? "glass-mobile-content" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <h3>Navigation</h3>
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