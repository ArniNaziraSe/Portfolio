import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getProjects } from "../utils/getProjects";
import "./ProjectDetail.css";

function ProjectDetail() {
  const { slug } = useParams();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await getProjects();
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

  return (
    <div className="home-page">
      <Header />

      <main className="project-detail-main">
        <section className="project-detail-hero">
          <div className="project-detail-text">
            <Link to="/projects" className="back-link">
              ← Back to Projects
            </Link>

            <span className="project-type">{project.type}</span>

            <h1>{project.title}</h1>

            <p>{project.shortDescription}</p>

            <div className="project-detail-meta">
              <div>
                <span>Category</span>
                <strong>{project.category}</strong>
              </div>

              <div>
                <span>Role</span>
                <strong>{project.role}</strong>
              </div>

              <div>
                <span>Year</span>
                <strong>{project.year}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{project.status}</strong>
              </div>
            </div>
          </div>

          <div className="project-detail-image">
            <img src={project.image} alt={project.title} />
          </div>
        </section>

        <section className="project-detail-content">
          <article className="project-detail-card project-overview">
            <h2>Project Overview</h2>
            <p>{project.description}</p>
          </article>

          <article className="project-detail-card">
            <h2>Tools & Technologies</h2>

            <div className="project-detail-tags">
              {project.tech.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>

          <article className="project-detail-card">
            <h2>Key Features</h2>

            <ul className="project-feature-list">
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>

          <article className="project-detail-card project-links-card">
            <h2>Project Links</h2>

            <div className="project-detail-actions">
              {project.demoUrl && project.demoUrl !== "#" ? (
                <a href={project.demoUrl} target="_blank" rel="noreferrer">
                  View Demo
                </a>
              ) : (
                <span className="disabled-link">Demo Not Available</span>
              )}

              {project.githubUrl && project.githubUrl !== "#" ? (
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  GitHub Repository
                </a>
              ) : (
                <span className="disabled-link">
                  {project.type === "Excel Project"
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