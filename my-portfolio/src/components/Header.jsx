import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useContact } from "../context/ContactContext";
import "./Header.css";

function Header() {
  const location = useLocation();
  const { open: openContact } = useContact();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  });

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

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <NavLink to="/" className="brand-link">
          <div className="brand-avatar">AN</div>
          <span className="brand-name">Arni Nazira</span>
        </NavLink>

        <nav className="main-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? "☀" : "☾"}
          </button>
          <button
            className="contact-btn"
            onClick={openContact}
          >
            Contact
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;