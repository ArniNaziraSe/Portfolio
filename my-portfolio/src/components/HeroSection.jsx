import { useState, useEffect } from "react";
import TypingIntro from "./TypingIntro";
import "./HeroSection.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function HeroSection() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/profile`).then((r) => r.json()).then(setProfile).catch(() => {});
  }, []);

  const scrollToProjects = () => {
    const el = document.getElementById("projects");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="hero-section-inner">
      <div className="hero-left">
        <span className="status-pill">
          <span className="status-dot" /> Available for new projects
        </span>

        <h1 className="hero-name">
          Hello,<br />I'm {profile?.full_name || "Arni Nazira"}
        </h1>

        <div className="hero-buttons">
          {profile?.cv_url && (
            <a href={profile.cv_url} className="btn-primary" target="_blank" rel="noreferrer">
              Download CV
            </a>
          )}
          <button className="btn-outline" onClick={scrollToProjects}>
            View Projects
          </button>
        </div>
      </div>

      <div className="hero-right">
        {profile ? (
          <TypingIntro profile={profile} />
        ) : (
          <div className="typing-code-box typing-skeleton" />
        )}
      </div>
    </div>
  );
}

export default HeroSection;