import React, { useState } from "react";
import "./Navbar.css";

// PUBLIC_INTERFACE
function Navbar() {
  // For mobile hamburger & profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Example, simulate logged-in user
  const userName = "Alex";

  // Menu navigation structure
  const navItems = [
    { icon: "🏠", label: "Home", href: "#" },
    { icon: "🎮", label: "Games", href: "#" },
    { icon: "😂", label: "Memes", href: "#" },
    { icon: "🎬", label: "Movies", href: "#" },
    { icon: "💬", label: "Quotes", href: "#" },
  ];

  // PUBLIC_INTERFACE
  const handleMenuToggle = () => setMenuOpen((v) => !v);
  // PUBLIC_INTERFACE
  const handleProfileToggle = () => setProfileOpen((v) => !v);

  // Optionally, highlight "active" via window.location or state
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <nav className="funbase-navbar">
      <div className="navbar-left">
        <span className="navbar-logo" tabIndex={0} aria-label="FunBase Home">
          🎉 <span className="logo-text">FunBase</span>
        </span>
      </div>
      <button
        className={`navbar-hamburger${menuOpen ? " open" : ""}`}
        onClick={handleMenuToggle}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="navbar-menu"
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`navbar-menu${menuOpen ? " show" : ""}`} id="navbar-menu">
        <ul>
          {navItems.map((item, idx) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`navbar-link${activeIdx === idx ? " active" : ""}`}
                aria-current={activeIdx === idx ? "page" : undefined}
                onClick={() => {
                  setActiveIdx(idx);
                  setMenuOpen(false); // close mobile menu
                }}
              >
                <span className="emoji">{item.icon}</span> {item.label}
              </a>
            </li>
          ))}
          <li className="navbar-profile-wrap">
            <button
              className={`navbar-link navbar-profile${profileOpen ? " open" : ""}`}
              aria-haspopup="true"
              aria-expanded={profileOpen}
              aria-label="Profile"
              onClick={handleProfileToggle}
              tabIndex={0}
            >
              <span className="emoji">👤</span> <span className="profile-label">Profile</span>
              <svg width="8" height="6" aria-hidden="true" fill="none" viewBox="0 0 8 6" className={`chevron${profileOpen ? " up" : ""}`}><path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
            <div className={`profile-dropdown${profileOpen ? " show" : ""}`}>
              <div className="dropdown-greet">Hey, {userName}! 👋</div>
              <ul>
                <li>
                  <a href="#profile" tabIndex={profileOpen ? 0 : -1}>My Profile</a>
                </li>
                <li>
                  <a href="#favorites" tabIndex={profileOpen ? 0 : -1}>Favorites ⭐</a>
                </li>
                <li>
                  <a href="#logout" tabIndex={profileOpen ? 0 : -1}>Logout</a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      {/* Overlay for mobile menu */}
      {menuOpen && <div className="overlay" onClick={handleMenuToggle} />}
    </nav>
  );
}

export default Navbar;
