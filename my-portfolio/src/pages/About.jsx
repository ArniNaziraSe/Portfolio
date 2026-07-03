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

const MONTHS = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  january: 1, february: 2, march: 3, may: 5, june: 6,
  july: 7, august: 8, october: 10, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7,
  aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function getSortKey(text) {
  if (!text) return 0;
  const lower = String(text).toLowerCase();
  const years = lower.match(/\d{4}/g);
  const year = years ? parseInt(years[years.length - 1]) : 0;

  let lastMonthNum = 0;
  let lastMonthPos = -1;
  for (const [name, num] of Object.entries(MONTHS)) {
    const idx = lower.lastIndexOf(name);
    if (idx > lastMonthPos) {
      lastMonthPos = idx;
      lastMonthNum = num;
    }
  }
  return year * 100 + lastMonthNum;
}

function sortByNewest(items) {
  return [...items].sort((a, b) => getSortKey(b.period) - getSortKey(a.period));
}

function sortCertsByNewest(items) {
  return [...items].sort((a, b) => getSortKey(b.year) - getSortKey(a.year));
}

// Parse hobbies dari textarea (satu per baris)
function parseHobbies(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((h) => h.trim())
    .filter(Boolean);
}

function About() {
  const { open: openContact } = useContact();

  const [profile, setProfile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
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

  const experiencesSorted = sortByNewest(experiences);
  const educationSorted = sortByNewest(education);
  const certsSorted = sortCertsByNewest(certifications);
  const hobbiesList = parseHobbies(profile?.hobbies);

  return (
    <div className="home-page">
      <Header />

      <main className="about-main">
        <section className="about-hero">
          <div className="about-avatar-wrap">
            <div className="about-avatar-card">
              {profile?.avatar_url && !avatarError ? (
                <img
                  src={getImageUrl(profile.avatar_url)}
                  alt={profile.full_name}
                  onError={() => setAvatarError(true)}
                />
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

        {/* CERTIFICATES + BEYOND WORK (dari database) */}
        <section className="about-bottom-grid">
          <div>
            <span className="section-label">CERTIFICATES</span>
            <div className="cert-list">
              {certifications.length > 0 ? (
                certsSorted.map((c) => (
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
            {profile?.personal_note ? (
              <p className="beyond-note">{profile.personal_note}</p>
            ) : (
              <p className="beyond-note" style={{ color: "var(--text-subtle)" }}>
                Belum ada catatan personal.
              </p>
            )}
            {hobbiesList.length > 0 && (
              <div className="hobby-pills">
                {hobbiesList.map((h, i) => (
                  <span key={i} className="hobby-pill">{h}</span>
                ))}
              </div>
            )}
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