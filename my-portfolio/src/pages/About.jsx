import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../components/RichTextEditor.css";
import "./About.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// Helper buat gambar yang diupload via dashboard (path "/uploads/...")
// jadi URL lengkap. Tetap dukung URL eksternal yang udah berupa "http://..."
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function About() {
  // States dinamis untuk semua data dari database
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [education, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetching semua data secara paralel
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/profile`).then((res) => res.json()),
      fetch(`${API_BASE}/api/skills`).then((res) => res.json()),
      fetch(`${API_BASE}/api/certifications`).then((res) => res.json()),
      fetch(`${API_BASE}/api/education`).then((res) => res.json()),
      fetch(`${API_BASE}/api/experiences`).then((res) => res.json()),
    ])
      .then(([profileData, skillsData, certsData, eduData, expData]) => {
        setProfile(profileData);
        setSkills(skillsData);
        setCertifications(certsData);
        setEducation(eduData);
        setExperiences(expData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Waduh, ada kendala pas ambil data About:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <p style={{ textAlign: "center", marginTop: "4rem", color: "#007acc" }}>
        Loading your awesome profile... ⌛
      </p>
    );
  }

  // Ambil nama depan buat sapaan "Hello, I'm ..."
  const firstName = profile?.full_name?.split(" ")[0] || "";

  // Bio bisa berisi beberapa paragraf, dipisah baris kosong ganda ("\n\n")
  const bioParagraphs = (profile?.bio || "").split("\n\n").filter(Boolean);

  return (
    <div className="home-page">
      <Header />

      <main className="about-main">
        <section className="about-title-section">
          <h1>About Me</h1>
          <div className="about-title-line"></div>
        </section>

        <section className="about-profile-section">
          <div className="about-avatar-card">
            <div className="about-avatar">
              {profile?.avatar_url ? (
                <img src={getImageUrl(profile.avatar_url)} alt="Profile portrait" />
              ) : (
                <span className="about-avatar-placeholder">Profile portrait</span>
              )}
            </div>

            <h2>{profile?.full_name}</h2>
            <p>{profile?.current_role}</p>
          </div>

          <div className="about-intro-card">
            <h3>Hello, I'm {firstName}.</h3>

            <div
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: profile?.bio || "" }}
            />
          </div>
        </section>

        <section className="about-details-section">
          <div className="about-cv-column">
            <h3 className="about-section-heading">
              <span>🎓</span>
              Curriculum Vitae
            </h3>

            <div className="about-cv-card">
              <div className="about-cv-block">
                <h4>Education</h4>

                {education.map((item) => (
                  <div
                    key={item.id}
                    className={`about-timeline-item ${item.is_featured ? "active" : ""}`}
                  >
                    <h5>{item.institution}</h5>
                    <p className="about-timeline-meta">{item.title}</p>
                    <p className="about-year">{item.period}</p>
                    <div
                      className="rich-content"
                      dangerouslySetInnerHTML={{ __html: item.description || "" }}
                    />
                  </div>
                ))}
              </div>

              <div className="about-cv-block">
                <h4>Academic Project Experience</h4>

                {experiences.map((item) => (
                  <div
                    key={item.id}
                    className={`about-timeline-item ${item.is_featured ? "active" : ""}`}
                  >
                    <h5>{item.title}</h5>
                    <p className="about-timeline-meta">
                      {item.institution} | {item.period}
                    </p>
                    <div
                      className="rich-content"
                      dangerouslySetInnerHTML={{ __html: item.description || "" }}
                    />
                  </div>
                ))}
              </div>

              {profile?.cv_url && (
                <div className="about-download-card">
                  <div>
                    <h4>Curriculum Vitae</h4>
                    <p>Download my latest CV for more detailed information.</p>
                  </div>

                  <a href={profile.cv_url} download>
                    Download CV
                  </a>
                </div>
              )}
            </div>
          </div>

          <aside className="about-sidebar">
            <h3 className="about-section-heading">
              <span>💻</span>
              Technical Arsenal
            </h3>

            <div className="about-skills-card">
              {skills.map((skillGroup) => (
                <SkillGroup
                  key={skillGroup.id}
                  title={skillGroup.category_label}
                  items={
                    skillGroup.items
                      ? skillGroup.items.split(",").map((i) => i.trim()).filter(Boolean)
                      : []
                  }
                  highlight={
                    skillGroup.highlight
                      ? skillGroup.highlight.split(",").map((i) => i.trim()).filter(Boolean)
                      : []
                  }
                />
              ))}
            </div>

            <div className="about-certification-card">
              <h4>Certifications</h4>

              <div className="about-certification-list">
                {certifications.map((certification) => (
                  <div className="about-certification-item" key={certification.id}>
                    <div className="about-certification-icon">
                      {certification.icon}
                    </div>

                    <div>
                      <h5>{certification.title}</h5>
                      <p>{certification.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SkillGroup({ title, items, highlight = [] }) {
  return (
    <div className="about-skill-group">
      <h4>{title}</h4>

      <div className="about-skill-list">
        {items.map((item) => (
          <span
            className={highlight.includes(item) ? "highlight" : ""}
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default About;