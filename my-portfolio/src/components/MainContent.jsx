import { useState, useEffect } from "react"; // 1. Import useState & useEffect
import "../pages/Home.css";

function MainContent() {
  // 2. Siapkan state untuk menampung data projects dari database & status loading
  const [latestProjects, setLatestProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Ambil data dari backend pas halaman pertama kali di-load
  useEffect(() => {
    fetch("http://localhost:5000/api/projects") // Jalur API Backend kita
      .then((res) => res.json())
      .then((data) => {
        /* 
          KARENA data dari database kolomnya adalah 'image_url' dan 'tech_stack' (string),
          kita sesuaikan (transform) bentuknya biar pas sama codingan JSX kamu yang lama.
        */
        const transformedData = data.slice(0, 2).map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          image: project.image_url, // Mengubah image_url jadi 'image'
          // Mengubah string "React, Tailwind" jadi array ["React", "Tailwind"]
          tech: project.tech_stack ? project.tech_stack.split(",").map(t => t.trim()) : [], 
        }));

        setLatestProjects(transformedData); // Masukin data yang udah rapi ke state
        setLoading(false); // Matikan loading
      })
      .catch((err) => {
        console.error("Waduh gagal fetch data proyek, gwenchana:", err);
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
            {/* Ssst, jangan lupa ganti nama ini jadi namamu sendiri ya, Serena Aerin! 😉 */}
            <strong>Serena Aerin</strong>, Informatics Engineering Graduate
            &amp; Junior Web Developer. Building clean, efficient, and
            user-centric digital solutions.
          </p>
        </div>

        <div className="hero-image-wrapper">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"
            alt="Serena Aerin portfolio visual"
          />
        </div>
      </section>

      <section className="latest-projects" id="projects">
        <div className="section-heading">
          <h2>Latest Projects</h2>
        </div>

        {/* 4. Tampilkan efek loading kalau datanya masih otw ditarik dari database */}
        {loading ? (
          <p className="text-loading" style={{ textAlign: "center", color: "#007acc", margin: "2rem 0" }}>
            Loading projects dari database... ⏳
          </p>
        ) : (
          <div className="project-grid">
            {latestProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-image-wrapper">
                  <img
                    className="project-image"
                    src={project.image}
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
                  <p>{project.description}</p>

                  <a className="project-link" href="/projects">
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