import "../pages/Home.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <span className="footer-logo">DevPortfolio</span>

        <p>© 2026 Informatics Engineer. Arni Nazira.</p>

        <div className="footer-links">
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;