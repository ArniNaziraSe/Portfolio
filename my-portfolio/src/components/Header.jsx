import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContact } from "../context/ContactContext";
import logoImg from "../assets/logo.png";
import "./Header.css";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
];

function Header() {
  const { open: openContact } = useContact();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  });
  const [activeSection, setActiveSection] = useState("home");
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

  // Scroll-spy: pantau section mana yang lagi kelihatan, highlight nav-nya.
  // Cuma jalan kalau kita di halaman utama ("/").
  useEffect(() => {
    if (location.pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const closeMobile = () => setMobileOpen(false);

  // Kalau lagi di halaman lain (misal /projects/kirana-store), navigate
  // balik ke "/" dulu bawa hash — Home.jsx bakal scroll otomatis setelah mount.
  const goToSection = (id) => {
    closeMobile();
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button className="brand-link" onClick={() => goToSection("home")} aria-label="Ke beranda">
          <img src={logoImg} alt="Arni Nazira" className="brand-logo-img" />
        </button>

        <nav className="main-nav">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              className={activeSection === id && location.pathname === "/" ? "active" : ""}
              onClick={() => goToSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? "☀" : "☾"}
          </button>
          <button className="contact-btn" onClick={openContact}>Contact</button>
        </div>

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

      {mobileOpen && (
        <div className="mobile-nav">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              className={activeSection === id && location.pathname === "/" ? "active" : ""}
              onClick={() => goToSection(id)}
            >
              {label}
            </button>
          ))}
          <div className="mobile-nav-divider" />
          <button onClick={() => { toggleTheme(); closeMobile(); }}>
            {isDark ? "☀ Light mode" : "☾ Dark mode"}
          </button>
          <button className="mobile-nav-contact" onClick={() => { openContact(); closeMobile(); }}>
            Contact
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;