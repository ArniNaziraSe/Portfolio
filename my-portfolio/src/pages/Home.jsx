import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import ProjectsSection from "../components/ProjectsSection";
import AboutSection from "../components/AboutSection";
import "./Home.css";

function Home() {
  // Kalau datang dari halaman lain dengan hash (misal /#projects),
  // scroll otomatis ke section itu setelah komponen ke-mount.
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);

  return (
    <div className="home-page">
      <Header />
      <main>
        <section id="home">
          <HeroSection />
        </section>
        <section id="projects">
          <ProjectsSection />
        </section>
        <section id="about">
          <AboutSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;