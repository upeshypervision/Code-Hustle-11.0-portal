import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserNavbar({
    userInfo,
    menuItems = [],
    onMenuItemClick,
    onToggleSidebar, // Accept prop
}) {
    const navigate = useNavigate();
    // Removed internal isMobileMenuOpen state - now controlled by parent

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
        // No local state to close
    };

    return (
        <>
            <header className="top-nav">
                <div className="top-nav-inner">
                    <div className="logo-container">
                        <button
                            className="hamburger-menu"
                            onClick={onToggleSidebar} // Use prop
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
                                e.target.nextSibling.style.display = "block";
                            }}
                        />
                        <div className="logo-mark" style={{ display: "none" }}></div>
                        <div>
                            <div className="logo-text" style={{ transform: "translateY(7px)" }}>Code Hustle</div>
                            <div style={{ fontSize: "0.7rem", color: "#9ca3af", visibility: "hidden" }}>
                                Student Dashboard
                            </div>
                        </div>
                    </div>
                    <div className="nav-right">
                        <div className="nav-user">{userInfo}</div>
                        <button
                            className="nav-logout"
                            onClick={() => window.location.href = "https://codehustle11.upeshypervision.in/#contact"}
                        >
                            Contact us
                        </button>
                        <button className="nav-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay Removed - Controlled by Dashboard Sidebar */}
        </>
    );
}