import { useEffect, useState } from "react";
import { API_BASE, getImageUrl, safeFetch } from "./apiClient";
import RichTextEditor from "../../components/RichTextEditor";
import TechIcon from "../../components/TechIcon";

const EMPTY_FORM = {
  title: "", short_description: "", description: "",
  github_link: "", demo_link: "", tech_stack: "",
  category: "Web App", role: "",
  year: new Date().getFullYear().toString(),
  month: "",
  status: "Completed", features: "",
  project_type: "", impact: "",
};

// Warna badge status
function getStatusClass(status) {
  if (status === "In Progress") return "progress";
  if (status === "Archived") return "archived";
  return "pub"; // Completed = green
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
        category: project.category || "Web App",
        role: project.role || "",
        year: project.year || new Date().getFullYear().toString(),
        month: project.month || "",
        status: project.status || "Completed",
        features: project.features || "",
        project_type: project.project_type || "",
        impact: project.impact || "",
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
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append("image", imageFile);

    fetch(url, {
      method: isEditing ? "PUT" : "POST",
      body: formData,
    }).then(() => {
      fetchProjects();
      setShowModal(false);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus project ini?")) {
      fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE" })
        .then(() => fetchProjects())
        .catch((err) => console.error("Gagal menghapus:", err));
    }
  };

  return (
    <div className="tab-view">
      <div className="view-header-with-action">
        <div>
          <h1>{projects.length} projects</h1>
        </div>
        <button className="add-project-btn" onClick={() => openModal()}>
          + New Project
        </button>
      </div>

      <div className="simple-table-card">
        {isFetching ? (
          <p className="empty-state-text">Memuat data...</p>
        ) : projects.length === 0 ? (
          <p className="empty-state-text">Belum ada project. Klik "+ New Project" untuk mulai.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>CATEGORY</th>
                  <th>TYPE</th>
                  <th>ROLE</th>
                  <th className="th-center">PERIOD</th>
                  <th className="th-center">STATUS</th>
                  <th>TECH</th>
                  <th className="th-center">VIEWS</th>
                  <th>IMPACT</th>
                  <th className="th-right"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const techList = p.tech_stack
                    ? p.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="td-project-cell">
                          <strong>{p.title}</strong>
                          <span>{p.short_description?.substring(0, 40) || "—"}</span>
                        </div>
                      </td>
                      <td className="td-nowrap">{p.category || "—"}</td>
                      <td className="td-nowrap">
                        {p.project_type ? (
                          <span className="badge-type">{p.project_type}</span>
                        ) : "—"}
                      </td>
                      <td className="td-nowrap">{p.role || "—"}</td>
                      <td className="td-nowrap" style={{ textAlign: "center" }}>
                        {p.month || p.year ? (
                          <>
                            {p.month && <span style={{ fontSize: 12 }}>{p.month}</span>}
                            {p.month && p.year && " "}
                            {p.year && <strong>{p.year}</strong>}
                          </>
                        ) : "—"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge-status ${getStatusClass(p.status)}`}>
                          {p.status || "Completed"}
                        </span>
                      </td>
                      <td>
                        <div className="td-tech-icons">
                          {techList.slice(0, 4).map((t) => (
                            <span key={t} className="tech-icon">
                              <TechIcon name={t} size={14} />
                            </span>
                          ))}
                          {techList.length > 4 && (
                            <span className="td-tech-more">+{techList.length - 4}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{p.views || 0}</td>
                      <td className="td-impact" title={p.impact || ""}>
                        {p.impact ? (
                          p.impact.length > 60 ? p.impact.substring(0, 60) + "…" : p.impact
                        ) : "—"}
                      </td>
                      <td>
                        <div className="td-actions">
                          <button
                            onClick={() => window.open(`/projects/${p.slug}`, "_blank")}
                            className="action-icon-btn"
                            title="View live"
                          >
                            👁
                          </button>
                          <button
                            onClick={() => openModal(p)}
                            className="action-icon-btn"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="action-icon-btn del"
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-glass-container modal-wide">
            <h3>{isEditing ? "Edit Project" : "New Project"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Short Description</label>
                <textarea rows="2" placeholder="Brief tagline buat card"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Full Description</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Jelasin project kamu..."
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
              </div>
              <div className="form-row-two">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Web App</option>
                    <option>Mobile App</option>
                    <option>Dashboard</option>
                    <option>Admin/Data</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
              </div>
              <div className="form-row-three">
                <div className="form-group">
                  <label>Month</label>
                  <select value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}>
                    <option value="">— pilih —</option>
                    <option>Januari</option>
                    <option>Februari</option>
                    <option>Maret</option>
                    <option>April</option>
                    <option>Mei</option>
                    <option>Juni</option>
                    <option>Juli</option>
                    <option>Agustus</option>
                    <option>September</option>
                    <option>Oktober</option>
                    <option>November</option>
                    <option>Desember</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input type="text" value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Completed</option>
                    <option>In Progress</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tech Stack (pisah koma)</label>
                <input type="text" placeholder="React, Node.js, PostgreSQL"
                  value={form.tech_stack}
                  onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Project Type</label>
                <select value={form.project_type}
                  onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
                  <option value="">— pilih —</option>
                  <option>Self-initiated</option>
                  <option>Class Project</option>
                  <option>Work Project</option>
                  <option>Group Project</option>
                </select>
              </div>
              <div className="form-group">
                <label>Impact (dampak / hasil yang dibuat)</label>
                <textarea rows="3"
                  placeholder="Contoh: Reduced admin time by 60% for RT/RW village staff. Deployed to 3 real users."
                  value={form.impact}
                  onChange={(e) => setForm({ ...form, impact: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Key Features (1 per baris)</label>
                <textarea rows="4" value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })} />
              </div>
              <div className="form-row-two">
                <div className="form-group">
                  <label>GitHub Link</label>
                  <input type="text" value={form.github_link}
                    onChange={(e) => setForm({ ...form, github_link: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Demo Link</label>
                  <input type="text" value={form.demo_link}
                    onChange={(e) => setForm({ ...form, demo_link: e.target.value })} />
                </div>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">Save</button>
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