import { useEffect, useState } from "react";
import TechIcon from "./TechIcon";
import "./TechIcon.css";
import "./AboutSection.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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
    if (idx > lastMonthPos) { lastMonthPos = idx; lastMonthNum = num; }
  }
  return year * 100 + lastMonthNum;
}

function sortByNewest(items) {
  return [...items].sort((a, b) => getSortKey(b.period) - getSortKey(a.period));
}
function sortCertsByNewest(items) {
  return [...items].sort((a, b) => getSortKey(b.year) - getSortKey(a.year));
}
function parseHobbies(text) {
  if (!text) return [];
  return text.split(/\r?\n/).map((h) => h.trim()).filter(Boolean);
}

function AboutSection() {
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

  const experiencesSorted = sortByNewest(experiences);
  const educationSorted = sortByNewest(education);
  const certsSorted = sortCertsByNewest(certifications);
  const hobbiesList = parseHobbies(profile?.hobbies);

  return (
    <div className="about-section-inner">
      {experiencesSorted.length > 0 && (
        <div className="about-block">
          <h2 className="about-block-title">EXPERIENCE</h2>
          <div className="timeline-list">
            {experiencesSorted.map((item) => (
              <TimelineEntry key={`exp-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {educationSorted.length > 0 && (
        <div className="about-block">
          <h2 className="about-block-title">EDUCATION</h2>
          <div className="timeline-list">
            {educationSorted.map((item) => (
              <TimelineEntry key={`edu-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="about-block">
          <h2 className="about-block-title">SKILLS</h2>
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
        </div>
      )}

      <div className="about-bottom-grid">
        <div>
          <h2 className="about-block-title">CERTIFICATES</h2>
          <div className="cert-list">
            {certsSorted.length > 0 ? (
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
          <h2 className="about-block-title">HOBBY</h2>
          {profile?.personal_note && <p className="beyond-note">{profile.personal_note}</p>}
          {hobbiesList.length > 0 && (
            <div className="hobby-pills">
              {hobbiesList.map((h, i) => (
                <span key={i} className="hobby-pill">{h}</span>
              ))}
            </div>
          )}
        </div>
      </div>
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

export default AboutSection;