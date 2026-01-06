import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({
  userInfo,
  isAdmin = false,
  menuItems = [],
  onMenuItemClick,
  style,
  showHamburger = true,
  hideSubtitle = false,
  centerLogo = false,
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
      navigate(isAdmin ? "/admin-login" : "/userlogin");
    }
  };

  const handleMenuClick = (item) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="top-nav" style={style}>
        <div className="top-nav-inner" style={centerLogo ? { position: 'relative', justifyContent: 'center' } : {}}>
          <div
            className="logo-container"
            style={centerLogo ? {
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            } : {}}
          >
            {showHamburger && (
              <button
                className="hamburger-menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              <div className="logo-text">Code Hustle</div>
              {!hideSubtitle && (
                <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                  {isAdmin ? "Admin Panel" : "Student Dashboard"}
                </div>
              )}
            </div>
          </div>
          <div className="nav-right" style={centerLogo ? { marginLeft: 'auto' } : {}}>
            <div className="nav-user">{userInfo}</div>
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
            <a
              href="https://codehustle11.upeshypervision.in/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-logout"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
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
              <h3>{isAdmin ? "Admin Menu" : "Navigation"}</h3>
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
