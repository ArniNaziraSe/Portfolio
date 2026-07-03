import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useContact } from "../context/ContactContext";
import "./Header.css";

function Header() {
  const { open: openContact } = useContact();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDark(true);
    }
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <NavLink to="/" className="brand-link" onClick={closeMobile}>
          <div className="brand-avatar">AN</div>
          <span className="brand-name">Arni Nazira</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="main-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>

        {/* Desktop actions */}
        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? "☀" : "☾"}
          </button>
          <button className="contact-btn" onClick={openContact}>Contact</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu (dropdown dari bawah header) */}
      {mobileOpen && (
        <div className="mobile-nav">
          <NavLink to="/" end onClick={closeMobile}>Home</NavLink>
          <NavLink to="/projects" onClick={closeMobile}>Projects</NavLink>
          <NavLink to="/about" onClick={closeMobile}>About</NavLink>
          <div className="mobile-nav-divider" />
          <button onClick={() => { toggleTheme(); closeMobile(); }}>
            {isDark ? "☀ Light mode" : "☾ Dark mode"}
          </button>
          <button
            className="mobile-nav-contact"
            onClick={() => { openContact(); closeMobile(); }}
          >
            Contact
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;