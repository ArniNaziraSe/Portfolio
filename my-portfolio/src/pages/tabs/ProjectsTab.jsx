import { useEffect, useState } from "react";
import { API_BASE, getImageUrl, safeFetch } from "./apiClient";

function ProjectsTab({ onCountChange }) {
  const [projects, setProjects] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", github_link: "", tech_stack: "" });
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
        description: project.description || "",
        github_link: project.github_link || "",
        tech_stack: project.tech_stack || "",
      });
      setImagePreview(getImageUrl(project.image_url));
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setForm({ title: "", description: "", github_link: "", tech_stack: "" });
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
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("github_link", form.github_link);
    formData.append("tech_stack", form.tech_stack);
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
                      <span>{p.description?.substring(0, 50)}...</span>
                    </div>
                  </td>
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
                    <span className="badge-status pub">PUBLISHED</span>
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
          <div className="modal-glass-container">
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
                <label>Description</label>
                <textarea
                  required
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Project Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
              </div>
              <div className="form-group">
                <label>GitHub Link</label>
                <input
                  type="text"
                  value={form.github_link}
                  onChange={(e) => setForm({ ...form, github_link: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tech Stack</label>
                <input
                  type="text"
                  value={form.tech_stack}
                  onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                />
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