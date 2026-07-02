import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TechIcon from "../components/TechIcon";
import "../components/TechIcon.css";
import "../components/RichTextEditor.css";
import { useContact } from "../context/ContactContext";
import "./About.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function About() {
  const { open: openContact } = useContact();

  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/profile`).then((r) => r.json()).then(setProfile).catch(() => {});
    fetch(`${API_BASE}/api/education`).then((r) => r.json()).then(setEducation).catch(() => {});
    fetch(`${API_BASE}/api/experiences`).then((r) => r.json()).then(setExperiences).catch(() => {});
    fetch(`${API_BASE}/api/skills`).then((r) => r.json()).then(setSkills).catch(() => {});
    fetch(`${API_BASE}/api/certifications`).then((r) => r.json()).then(setCertifications).catch(() => {});
  }, []);

  // Combine education + experience jadi 1 timeline, urut dari terbaru
  // Asumsi period format "YYYY" atau "YYYY — YYYY" atau "YYYY — Now"
  const timeline = [...experiences, ...education].sort((a, b) => {
    const getStartYear = (item) => {
      const match = (item.period || "").match(/\d{4}/);
      return match ? parseInt(match[0]) : 0;
    };
    return getStartYear(b) - getStartYear(a);
  });

  const hobbiesArray = profile?.hobbies
    ? profile.hobbies.split(",").map((h) => h.trim()).filter(Boolean)
    : [];

  return (
    <div className="home-page">
      <Header />

      <main className="about-main">
        {/* HERO: avatar + intro */}
        <section className="about-hero">
          <div className="about-avatar-wrap">
            <div className="about-avatar-card">
              {profile?.avatar_url ? (
                <img src={getImageUrl(profile.avatar_url)} alt={profile.full_name} />
              ) : (
                <div className="about-avatar-fallback">AN</div>
              )}
            </div>
          </div>

          <div className="about-intro">
            <span className="section-label">ABOUT ME</span>
            <h1>{profile?.full_name || "Arni Nazira"}</h1>

            {profile?.bio ? (
              <div
                className="rich-content about-bio"
                dangerouslySetInnerHTML={{ __html: profile.bio }}
              />
            ) : (
              <p className="about-bio">
                I recently graduated in Informatics Engineering and I love the full journey
                of building software — from understanding a real problem, to shaping the
                interface, to shipping a stable backend behind it.
              </p>
            )}

            <div className="about-actions">
              {profile?.cv_url && (
                <a href={profile.cv_url} className="btn-primary" target="_blank" rel="noreferrer">
                  Download CV
                </a>
              )}
              <button className="btn-outline" onClick={openContact}>
                Get in touch
              </button>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        {timeline.length > 0 && (
          <section className="about-timeline-block">
            <span className="section-label">EXPERIENCE & EDUCATION</span>
            <div className="timeline-list">
              {timeline.map((item) => (
                <div key={`${item.type}-${item.id}`} className="timeline-entry">
                  <div className="timeline-year-col">
                    <span className="mono">{item.period || "—"}</span>
                  </div>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <strong>{item.title}</strong>
                    <span className="timeline-institution">{item.institution}</span>
                    {item.description && (
                      <p className="timeline-desc">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS */}
        {skills.length > 0 && (
          <section className="about-skills-block">
            <span className="section-label">SKILLS</span>
            <div className="skills-grid">
              {skills.map((s) => {
                const items = s.items ? s.items.split(",").map((i) => i.trim()).filter(Boolean) : [];
                return (
                  <div key={s.id} className="skill-category-card">
                    <h4>{s.category_label}</h4>
                    <div className="skill-items">
                      {items.map((item) => (
                        <span key={item} className="skill-item">
                          <TechIcon name={item} size={14} />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CERTIFICATES + BEYOND WORK (2-col) */}
        <section className="about-bottom-grid">
          {certifications.length > 0 && (
            <div>
              <span className="section-label">CERTIFICATES</span>
              <div className="cert-list">
                {certifications.map((c) => (
                  <div key={c.id} className="cert-item">
                    <div>
                      <strong>{c.title}</strong>
                      <span>{c.issuer}</span>
                    </div>
                    <span className="mono cert-year">{c.year || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile?.personal_note || hobbiesArray.length > 0) && (
            <div>
              <span className="section-label">BEYOND WORK</span>
              {profile?.personal_note && <p className="beyond-note">{profile.personal_note}</p>}
              {hobbiesArray.length > 0 && (
                <div className="hobby-pills">
                  {hobbiesArray.map((h) => (
                    <span key={h} className="hobby-pill">{h}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;