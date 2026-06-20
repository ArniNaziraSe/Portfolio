import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ProjectDetail.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function ProjectDetail() {
  const { slug } = useParams();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    // Backend belum ada endpoint by-slug, jadi ambil semua lalu cari yang match
    async function loadProject() {
      try {
        const res = await fetch(`${API_BASE}/api/projects`);
        const data = await res.json();
        const selectedProject = data.find((item) => item.slug === slug);

        if (!selectedProject) {
          setIsNotFound(true);
          return;
        }

        setProject(selectedProject);
      } catch (error) {
        console.error(error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="home-page">
        <Header />
        <main className="project-detail-main">
          <p className="project-loading">Loading project...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isNotFound || !project) {
    return (
      <div className="home-page">
        <Header />
        <main className="project-detail-main">
          <section className="project-not-found">
            <h1>Project Not Found</h1>
            <p>The project you are looking for does not exist.</p>
            <Link to="/projects">Back to Projects</Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Transform data buat ditampilkan
  const techArray = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // Features di-store sebagai text dengan 1 fitur per baris
  const featuresArray = project.features
    ? project.features.split("\n").map((f) => f.trim()).filter(Boolean)
    : [];

  return (
    <div className="home-page">
      <Header />

      <main className="project-detail-main">
        <section className="project-detail-hero">
          <div className="project-detail-text">
            <Link to="/projects" className="back-link">
              ← Back to Projects
            </Link>

            <span className="project-type">{project.category || "Web Development"}</span>

            <h1>{project.title}</h1>

            {project.short_description && <p>{project.short_description}</p>}

            <div className="project-detail-meta">
              {project.category && (
                <div>
                  <span>Category</span>
                  <strong>{project.category}</strong>
                </div>
              )}
              {project.role && (
                <div>
                  <span>Role</span>
                  <strong>{project.role}</strong>
                </div>
              )}
              {project.year && (
                <div>
                  <span>Year</span>
                  <strong>{project.year}</strong>
                </div>
              )}
              {project.status && (
                <div>
                  <span>Status</span>
                  <strong>{project.status}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="project-detail-image">
            <img src={getImageUrl(project.image_url)} alt={project.title} />
          </div>
        </section>

        <section className="project-detail-content">
          {project.description && (
            <article className="project-detail-card project-overview">
              <h2>Project Overview</h2>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </article>
          )}

          {techArray.length > 0 && (
            <article className="project-detail-card">
              <h2>Tools &amp; Technologies</h2>
              <div className="project-detail-tags">
                {techArray.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          )}

          {featuresArray.length > 0 && (
            <article className="project-detail-card">
              <h2>Key Features</h2>
              <ul className="project-feature-list">
                {featuresArray.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </article>
          )}

          <article className="project-detail-card project-links-card">
            <h2>Project Links</h2>
            <div className="project-detail-actions">
              {project.demo_link && project.demo_link !== "#" ? (
                <a href={project.demo_link} target="_blank" rel="noreferrer">
                  View Demo
                </a>
              ) : (
                <span className="disabled-link">Demo Not Available</span>
              )}

              {project.github_link && project.github_link !== "#" ? (
                <a href={project.github_link} target="_blank" rel="noreferrer">
                  GitHub Repository
                </a>
              ) : (
                <span className="disabled-link">
                  {project.category === "Excel Project"
                    ? "Excel File / Preview Coming Soon"
                    : "Repository Not Available"}
                </span>
              )}
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProjectDetail;