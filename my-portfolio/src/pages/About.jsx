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

// Sort by tahun (extract dari period), terbaru di atas
function sortByYear(items) {
  return [...items].sort((a, b) => {
    const getYear = (item) => {
      const match = (item.period || "").match(/\d{4}/g);
      // Ambil tahun terakhir (end year), atau tahun pertama jika cuma 1
      return match ? parseInt(match[match.length - 1]) : 0;
    };
    return getYear(b) - getYear(a);
  });
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

  const experiencesSorted = sortByYear(experiences);
  const educationSorted = sortByYear(education);

  return (
    <div className="home-page">
      <Header />

      <main className="about-main">
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
                Informatics Engineering graduate focused on web & mobile development.
              </p>
            )}

            <div className="about-actions">
              {profile?.cv_url && (
                <a href={profile.cv_url} className="btn-primary" target="_blank" rel="noreferrer">
                  Download CV
                </a>
              )}
              <button className="btn-outline" onClick={openContact}>Get in touch</button>
            </div>
          </div>
        </section>

        {/* EXPERIENCE (separated) */}
        {experiencesSorted.length > 0 && (
          <section className="about-timeline-block">
            <span className="section-label">EXPERIENCE</span>
            <div className="timeline-list">
              {experiencesSorted.map((item) => (
                <TimelineEntry key={`exp-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION (separated) */}
        {educationSorted.length > 0 && (
          <section className="about-timeline-block">
            <span className="section-label">EDUCATION</span>
            <div className="timeline-list">
              {educationSorted.map((item) => (
                <TimelineEntry key={`edu-${item.id}`} item={item} />
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

        {/* CERTIFICATES + BEYOND WORK */}
        <section className="about-bottom-grid">
          <div>
            <span className="section-label">CERTIFICATES</span>
            <div className="cert-list">
              {certifications.length > 0 ? (
                certifications.map((c) => (
                  <div key={c.id} className="cert-item">
                    <div>
                      <strong>{c.title}</strong>
                      <span>{c.issuer}</span>
                    </div>
                    <span className="mono cert-year">{c.year || ""}</span>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-subtle)" }}>
                  Belum ada sertifikat.
                </p>
              )}
            </div>
          </div>

          <div>
            <span className="section-label">BEYOND WORK</span>
            <p className="beyond-note">
              When I'm not coding, you'll probably find me exploring something creative or curious. I believe these interests keep me balanced and bring fresh perspective into my work as a developer.
            </p>
            <div className="hobby-pills">
              <span className="hobby-pill">💃 Dance — both traditional and modern styles, a creative outlet that keeps me energized</span>
              <span className="hobby-pill">🎬 Movies — especially action, romance, and fantasy genres</span>
              <span className="hobby-pill">🗣️ Language Learning — always excited to pick up a new language and culture</span>
              <span className="hobby-pill">☕ Coffee — my constant companion during long coding sessions</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TimelineEntry({ item }) {
  return (
    <div className="timeline-entry">
      <div className="timeline-year-col">
        <span className="mono">{item.period || "—"}</span>
      </div>
      <div className="timeline-dot" />
      <div className="timeline-content">
        <strong>{item.title}</strong>
        <span className="timeline-institution">{item.institution}</span>
        {item.description && <p className="timeline-desc">{item.description}</p>}
      </div>
    </div>
  );
}

export default About;