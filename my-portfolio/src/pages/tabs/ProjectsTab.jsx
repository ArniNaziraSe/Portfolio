import { useEffect, useState } from "react";
import { API_BASE, getImageUrl, safeFetch } from "./apiClient";
import RichTextEditor from "../../components/RichTextEditor";

const EMPTY_FORM = {
  title: "",
  short_description: "",
  description: "",
  github_link: "",
  demo_link: "",
  tech_stack: "",
  category: "Web Development",
  role: "",
  year: new Date().getFullYear().toString(),
  status: "Completed",
  features: "",
};

// Class CSS badge berdasarkan status (warna beda biar gampang dibedain mata)
function getStatusClass(status) {
  if (status === "In Progress") return "progress";
  if (status === "Archived") return "archived";
  return "pub"; // default = Completed → ijo
}

function ProjectsTab({ onCountChange }) {
  const [projects, setProjects] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchProjects = () => {
    safeFetch("/api/projects", []).then((data) => {
      setProjects(data);
      setIsFetching(false);
      if (onCountChange) onCountChange(data.length);
    });
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (project = null) => {
    setImageFile(null);
    if (project) {
      setIsEditing(true);
      setCurrentId(project.id);
      setForm({
        title: project.title || "",
        short_description: project.short_description || "",
        description: project.description || "",
        github_link: project.github_link || "",
        demo_link: project.demo_link || "",
        tech_stack: project.tech_stack || "",
        category: project.category || "Web Development",
        role: project.role || "",
        year: project.year || new Date().getFullYear().toString(),
        status: project.status || "Completed",
        features: project.features || "",
      });
      setImagePreview(getImageUrl(project.image_url));
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing ? `${API_BASE}/api/projects/${currentId}` : `${API_BASE}/api/projects`;

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) formData.append("image", imageFile);

    fetch(url, {
      method: isEditing ? "PUT" : "POST",
      body: formData,
    }).then(() => {
      fetchProjects();
      setShowModal(false);
      alert("🎉 Project database status updated!");
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus project ini dari database?")) {
      fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE" })
        .then(() => fetchProjects())
        .catch((err) => console.error("Gagal menghapus project:", err));
    }
  };

  return (
    <div className="tab-view animate-fade">
      <div className="view-header-with-action">
        <div>
          <h1>Manage Projects</h1>
          <p>Curate, organize, deploy, and synchronize your technical works repository documents.</p>
        </div>
        <button className="add-project-btn" onClick={() => openModal()}>
          + Add New Project
        </button>
      </div>

      <div className="projects-table-card">
        {isFetching ? (
          <p className="empty-state-text">Memuat data projects...</p>
        ) : projects.length === 0 ? (
          <p className="empty-state-text">Belum ada project. Klik "+ Add New Project" untuk mulai.</p>
        ) : (
          <table className="ethereal-data-table">
            <thead>
              <tr>
                <th>PROJECT INFO</th>
                <th>CATEGORY</th>
                <th>ROLE</th>
                <th>YEAR</th>
                <th>TECH STACK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="td-project-info">
                    <img
                      src={getImageUrl(p.image_url) || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"}
                      alt=""
                    />
                    <div>
                      <strong>{p.title}</strong>
                      <span>{p.short_description?.substring(0, 50) || "No description"}...</span>
                    </div>
                  </td>
                  <td className="td-text-cell">{p.category || "—"}</td>
                  <td className="td-text-cell">{p.role || "—"}</td>
                  <td className="td-text-cell">{p.year || "—"}</td>
                  <td>
                    <div className="table-tech-tags">
                      {p.tech_stack?.split(",").map((t) => (
                        <span key={t} className="pill-tag">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge-status ${getStatusClass(p.status)}`}>
                      {p.status || "Completed"}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button onClick={() => openModal(p)} className="action-icon-btn">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="action-icon-btn del">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-glass-container modal-wide">
            <h3>{isEditing ? "✨ Modify Project" : "➕ New Project Record"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Short Description (1-2 kalimat, buat preview di card)</label>
                <textarea
                  rows="2"
                  placeholder="Brief tagline buat tampilan card di halaman Projects"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Full Description (rich text — tampil di halaman detail)</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Jelasin project kamu lebih lengkap..."
                />
              </div>

              <div className="form-group">
                <label>Project Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option>Web Development</option>
                    <option>Mobile Development</option>
                    <option>Data Analysis</option>
                    <option>UI/UX Design</option>
                    <option>Excel Project</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    placeholder="e.g., Fullstack Developer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Completed</option>
                    <option>In Progress</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tech Stack (pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="e.g., React, Node.js, PostgreSQL"
                  value={form.tech_stack}
                  onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Key Features (satu fitur per baris)</label>
                <textarea
                  rows="4"
                  placeholder={`User authentication\nDashboard admin\nReal-time analytics`}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                ></textarea>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>GitHub Link</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={form.github_link}
                    onChange={(e) => setForm({ ...form, github_link: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Demo Link</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.demo_link}
                    onChange={(e) => setForm({ ...form, demo_link: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">
                  Save
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="modal-cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsTab;