import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useContact } from "../context/ContactContext";
import "../pages/Home.css";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { open } = useContact();
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink className="logo" to="/" onClick={closeMenu}>
          DevPortfolio
        </NavLink>

        <div className={`nav-menu ${isOpen ? "show" : ""}`}>
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/projects"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Projects
          </NavLink>

          <NavLink
            to="/about"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            About Me
          </NavLink>

          <a
            className="nav-link mobile-contact"
            href="#"
            onClick={(e) => { e.preventDefault(); open(); closeMenu(); }}
          >
            Contact
          </a>
        </div>

        <a className="contact-button" onClick={open}>
          Contact
        </a>

        <button
          className="mobile-menu"
          aria-label="Menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "×" : "☰"}
        </button>
      </div>
    </nav>
  );
}

export default Header;