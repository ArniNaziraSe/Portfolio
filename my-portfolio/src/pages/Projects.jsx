import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then((response) => response.json())
      .then((data) => {
        // ✨ PROSES SINKRONISASI DATA DATABASE KE JSX KAMU ✨
        const transformedData = data.map((project) => ({
          id: project.id,
          title: project.title,
          image: project.image_url, // Mengubah image_url jadi 'image' biar terbaca JSX
          shortDescription: project.description, // Mengubah description jadi 'shortDescription'
          type: "Web Development", // Variabel tambahan karena di DB belum ada kolom 'type'
          // Mengubah teks string "React, Tailwind" jadi array ["React", "Tailwind"]
          tech: project.tech_stack ? project.tech_stack.split(",").map((t) => t.trim()) : [],
          // Bikin slug otomatis dari title (Contoh: "E-Commerce App" jadi "e-commerce-app") buat link detail
          slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), 
        }));

        setProjects(transformedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Waduh gagal ambil data:', error);
        setIsLoading(false);
      });
  }, []);

  // 🛠️ FIX TYPO: Sebelumnya 'loading', diubah jadi 'isLoading' sesuai nama state kamu
  if (isLoading) {
    return (
      <p className="text-center text-blue-500" style={{ textAlign: "center", marginTop: "3rem", color: "#007acc" }}>
        Loading data dari database, sabar ya bestie... ⌛
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
          {projects.map((project) => (
            <article className="projects-page-card" key={project.id}>
              <div className="projects-page-image">
                <img src={project.image} alt={project.title} />
              </div>

              <div className="projects-page-content">
                <span className="projects-page-category">
                  {project.type}
                </span>

                <h3>{project.title}</h3>

                <p>{project.shortDescription}</p>

                <div className="projects-page-tags">
                  {project.tech.slice(0, 4).map((tag) => (
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
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Projects;