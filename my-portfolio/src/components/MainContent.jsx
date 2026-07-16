import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TechIcon from "./TechIcon";
import "./TechIcon.css";
import "./MainContent.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const MONTHS = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  january: 1, february: 2, march: 3, may: 5, june: 6,
  july: 7, august: 8, october: 10, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7,
  aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function getProjectSortKey(p) {
  const year = parseInt(p.year || "0") || 0;
  const monthText = String(p.month || "").toLowerCase();
  let monthNum = 0;
  for (const [name, num] of Object.entries(MONTHS)) {
    if (monthText.includes(name)) { monthNum = num; break; }
  }
  if (monthNum === 0) {
    const asNum = parseInt(monthText);
    if (asNum >= 1 && asNum <= 12) monthNum = asNum;
  }
  return year * 100 + monthNum;
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

// SVG swoosh background di belakang foto (turquoise brush strokes)
function HeroSwoosh() {
  return (
    <svg
      className="hero-swoosh-bg"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="var(--primary-scribble)" fill="none" strokeLinecap="round">
        <path d="M 80 250 Q 130 130, 220 180 Q 320 230, 420 130" strokeWidth="46" opacity="0.75" />
        <path d="M 60 300 Q 180 210, 280 260 Q 380 310, 440 220" strokeWidth="38" opacity="0.55" />
        <path d="M 100 200 Q 220 260, 320 200 Q 400 160, 460 250" strokeWidth="30" opacity="0.6" />
        <path d="M 50 350 Q 150 320, 260 350 Q 350 380, 430 320" strokeWidth="26" opacity="0.4" />
      </g>
    </svg>
  );
}

// Icon gambar untuk placeholder card
function ImagePlaceholderIcon() {
  return (
    <svg
      className="placeholder-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function MainContent() {
  const [featured, setFeatured] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/projects`).then((r) => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/profile`).then((r) => r.json()).catch(() => null),
    ]).then(([projectsData, profileData]) => {
      const sorted = [...projectsData].sort((a, b) => getProjectSortKey(b) - getProjectSortKey(a));
      setFeatured(sorted.slice(0, 3));
      setProfile(profileData);
      setLoading(false);
    });
  }, []);

  const photoUrl = profile?.avatar_url ? getImageUrl(profile.avatar_url) : null;
  const showPhoto = photoUrl && !photoError;

  return (
    <main className="home-main">
      {/* HERO — 2 kolom: text kiri + foto+swoosh kanan */}
      <section className="hero-block">
        <div className="hero-left">
          <h1 className="hero-name">
            Hello,<br />
            I'm {profile?.full_name || "Arni Nazira"}
          </h1>

          <div className="hero-desc">
            {profile?.bio ? (
              <div dangerouslySetInnerHTML={{ __html: profile.bio }} />
            ) : (
              <p>
                Informatics Engineering graduate focused on web & mobile development
                with Laravel, React, and Flutter — while steadily growing my data &
                admin skills along the way.
              </p>
            )}
          </div>

          {profile?.cv_url && (
            <a href={profile.cv_url} className="btn-primary" target="_blank" rel="noreferrer">
              Download CV
            </a>
          )}
        </div>

        <div className="hero-right">
          <div className="hero-photo-wrap">
            <HeroSwoosh />
            {showPhoto ? (
              <img
                src={photoUrl}
                alt={profile?.full_name || "Profile"}
                className="hero-photo"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="hero-photo-fallback">
                <span>AN</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="featured-block">
        <div className="section-heading">
          <h2>PROJECTS</h2>
          <Link to="/projects" className="section-see-all">See all →</Link>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : (
          <div className="featured-grid">
            {featured.map((p) => (
              <FeaturedCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function FeaturedCard({ project }) {
  const [imgError, setImgError] = useState(false);
  const techList = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const imgUrl = getImageUrl(project.image_url);
  const showImage = imgUrl && !imgError;

  return (
    <Link to={`/projects/${project.slug}`} className="featured-card">
      <div className="number-placeholder">
        {showImage ? (
          <img src={imgUrl} alt={project.title} onError={() => setImgError(true)} />
        ) : (
          <ImagePlaceholderIcon />
        )}
      </div>

      <div className="featured-card-body">
        <h3>{project.title}</h3>
        <p>{project.short_description || "—"}</p>

        <div className="tech-pills">
          {techList.slice(0, 5).map((t) => (
            <span key={t} className="tech-pill-icon">
              <TechIcon name={t} size={12} />
              <span>{t}</span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default MainContent;