import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({
  userInfo,
  isAdmin = false,
  menuItems = [],
  onMenuItemClick,
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
      <header className="top-nav" style={{ 
          position: 'sticky', 
          top: 0, 
          left: 0, 
          width: '100%', 
          zIndex: 1000, 
          background: "rgba(10, 10, 10, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(220, 38, 38, 0.3)"
      }}>
        <div className="top-nav-inner" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            height: "70px"
        }}>
          <div className="logo-container" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              className="hamburger-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "10px"
              }}
            >
              <span style={{ width: "25px", height: "2px", background: "#fff" }}></span>
              <span style={{ width: "25px", height: "2px", background: "#fff" }}></span>
              <span style={{ width: "25px", height: "2px", background: "#fff" }}></span>
            </button>
            <img
              src="/hypervision-logo.png"
              alt="Hypervision Logo"
              className="logo-img"
              style={{ height: "35px" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div className="logo-mark" style={{ display: "none" }}></div>
            <div>
              <div className="logo-text" style={{ color: "#fff", fontWeight: "900", textTransform: "uppercase", fontSize: "1.1rem" }}>Code Hustle</div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                {isAdmin ? "Admin Panel" : "Student Dashboard"}
              </div>
            </div>
          </div>
          <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div className="nav-user" style={{ color: "#fff", fontWeight: "700", fontSize: "0.9rem" }}>{userInfo}</div>
            <button className="nav-logout" onClick={handleLogout} style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "2px",
                fontSize: "0.8rem",
                fontWeight: "900",
                cursor: "pointer",
                textTransform: "uppercase"
            }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)"
          }}
        >
          <div
            className="mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
            style={{
                width: "300px",
                height: "100%",
                background: "#0a0a0a",
                borderRight: "2px solid #dc2626",
                padding: "30px 20px",
                position: "relative",
                display: "flex",
                flexDirection: "column"
            }}
          >
            <div className="mobile-menu-header" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "40px"
            }}>
              <h3 style={{ color: "#fff", margin: 0, fontSize: "1.2rem", letterSpacing: "2px" }}>{isAdmin ? "ADMIN MENU" : "NAVIGATION"}</h3>
              <button
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                    background: "rgba(220, 38, 38, 0.2)",
                    border: "1px solid #dc2626",
                    color: "#fff",
                    width: "35px",
                    height: "35px",
                    cursor: "pointer",
                    fontSize: "20px"
                }}
              >
                ×
              </button>
            </div>
            <ul className="mobile-menu-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {menuItems.map((item, index) => (
                <li key={item.id || index} style={{ marginBottom: "15px" }}>
                  <button
                    className={`mobile-menu-item ${
                      item.active ? "active" : ""
                    }`}
                    onClick={() => handleMenuClick(item)}
                    style={{
                        width: "100%",
                        textAlign: "left",
                        background: item.active ? "rgba(220, 38, 38, 0.2)" : "transparent",
                        border: item.active ? "1px solid #dc2626" : "1px solid transparent",
                        color: "#fff",
                        padding: "12px 15px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        cursor: "pointer"
                    }}
                  >
                    {item.label || item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 993px) {
              .hamburger-menu { display: none !important; }
          }
          .mobile-menu-item:hover {
              background: rgba(255, 255, 255, 0.05);
              border-color: rgba(220, 38, 38, 0.5);
          }
      `}} />
    </>
  );
}