import { useState, useEffect } from "react";
import "../pages/Home.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function MainContent() {
  const [latestProjects, setLatestProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/projects`).then((res) => res.json()).catch(() => []),
      fetch(`${API_BASE}/api/profile`).then((res) => res.json()).catch(() => null),
    ])
      .then(([projectsData, profileData]) => {
        // Ambil 2 project terbaru, pakai short_description biar preview pendek
        const transformedData = projectsData.slice(0, 2).map((project) => ({
          id: project.id,
          slug: project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: project.title,
          shortDescription: project.short_description || "",
          image: project.image_url,
          tech: project.tech_stack ? project.tech_stack.split(",").map((t) => t.trim()) : [],
        }));

        setLatestProjects(transformedData);
        setProfile(profileData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Waduh gagal fetch data, gwenchana:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="main-content">
      <section className="hero-section">
        <div className="hero-text">
          <h1 className="hero-title">
            Port<span>fo</span>lio
          </h1>

          <p className="hero-description">
            <strong>{profile?.full_name || "Arni Nazira"}</strong>,{" "}
            {profile?.current_role ||
              "Informatics Engineering Graduate & Junior Web Developer. Building clean, efficient, and user-centric digital solutions."}
          </p>

          {profile?.cv_url && (
            <div className="hero-cta">
              <a className="hero-cv-button" href={profile.cv_url} download>
                Download CV
              </a>
            </div>
          )}
        </div>

        <div className="hero-image-wrapper">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"
            alt="Arni Nazira portfolio visual"
          />
        </div>
      </section>

      <section className="latest-projects" id="projects">
        <div className="section-heading">
          <h2>Latest Projects</h2>
        </div>

        {loading ? (
          <p
            className="text-loading"
            style={{ textAlign: "center", color: "#007acc", margin: "2rem 0" }}
          >
            Loading projects dari database... ⏳
          </p>
        ) : (
          <div className="project-grid">
            {latestProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-image-wrapper">
                  <img
                    className="project-image"
                    src={getImageUrl(project.image)}
                    alt={project.title}
                  />
                </div>

                <div className="project-content">
                  <div className="tech-list">
                    {project.tech.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>

                  <h3>{project.title}</h3>
                  <p>{project.shortDescription}</p>

                  <a className="project-link" href={`/projects/${project.slug}`}>
                    View Details →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="more-project-wrapper">
          <a className="more-project-button" href="/projects">
            See More Projects
          </a>
        </div>
      </section>
    </main>
  );
}

export default MainContent;