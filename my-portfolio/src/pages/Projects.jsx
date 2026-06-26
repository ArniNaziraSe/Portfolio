import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Projects.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/projects`)
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Waduh gagal ambil data:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <p style={{ textAlign: "center", marginTop: "3rem", color: "#007acc" }}>
        Loading data dari database, sabar ya ⌛
      </p>
    );
  }

  return (
    <div className="home-page">
      <Header />

      <main className="projects-main">
        <header className="projects-hero">
          <h1>Selected Projects</h1>
          <p>
            A collection of my work in web development, information systems,
            data analysis, Excel dashboards, and UI design.
          </p>
        </header>

        <section className="projects-page-grid">
          {projects.map((project) => {
            const techArray = project.tech_stack
              ? project.tech_stack.split(",").map((t) => t.trim())
              : [];

            return (
              <article className="projects-page-card" key={project.id}>
                <div className="projects-page-image">
                  <img src={getImageUrl(project.image_url)} alt={project.title} />
                </div>

                <div className="projects-page-content">
                  <span className="projects-page-category">
                    {project.category || "Web Development"}
                  </span>

                  <h3>{project.title}</h3>

                  <p>{project.short_description}</p>

                  <div className="projects-page-tags">
                    {techArray.slice(0, 4).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="projects-page-actions">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="projects-page-button"
                    >
                      View Project
                    </Link>

                    <Link
                      to={`/projects/${project.slug}`}
                      className="projects-page-icon-button"
                    >
                      &lt;/&gt;
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Projects;