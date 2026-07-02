import { useEffect, useState } from "react";
import { API_BASE, PUBLIC_ABOUT_URL, getImageUrl, safeFetch } from "./apiClient";
import RichTextEditor from "../../components/RichTextEditor";

function AboutTab({ onSkillsCountChange }) {
  // Profile state
  const [profile, setProfile] = useState({
    full_name: "",
    current_role: "",
    bio: "",
    avatar_url: "",
    cv_url: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Timeline (education + experience)
  const [education, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // ============ FETCH ALL ============
  const fetchAll = () => {
    safeFetch("/api/profile", null).then((data) => {
      if (data) {
        setProfile(data);
        setAvatarPreview(getImageUrl(data.avatar_url));
      }
    });
    safeFetch("/api/education", []).then(setEducation);
    safeFetch("/api/experiences", []).then(setExperiences);
    safeFetch("/api/skills", []).then((data) => {
      setSkills(data);
      if (onSkillsCountChange) onSkillsCountChange(data.length);
    });
    safeFetch("/api/certifications", []).then(setCertifications);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ PROFILE SAVE ============
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    setSavedMsg("");
    try {
      const formData = new FormData();
      formData.append("full_name", profile.full_name || "");
      formData.append("current_role", profile.current_role || "");
      formData.append("bio", profile.bio || "");
      formData.append("cv_url", profile.cv_url || "");
      if (avatarFile) formData.append("avatar", avatarFile);

      await fetch(`${API_BASE}/api/profile`, { method: "PUT", body: formData });
      setSavedMsg("✓ Profile saved!");
      fetchAll();
    } catch (e) {
      setSavedMsg("Failed to save.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  return (
    <div className="tab-view about-tab-wrapper">
      {/* Header + save button */}
      <div className="about-header-bar">
        <div>
          <p className="about-subtitle">Edits mirror the public About page.</p>
        </div>
        <div className="about-header-actions">
          <a
            href={PUBLIC_ABOUT_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-outline-teal"
          >
            👁 Preview
          </a>
          <button
            onClick={saveProfile}
            className="add-project-btn"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "💾 Save Profile"}
          </button>
        </div>
      </div>

      {savedMsg && <div className="saved-msg">{savedMsg}</div>}

      {/* ============ BASIC INFO ============ */}
      <div className="about-section-card">
        <h3>Basic Info</h3>
        <div className="form-row-two">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role / Headline</label>
            <input
              type="text"
              value={profile.current_role || ""}
              onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <RichTextEditor
            value={profile.bio || ""}
            onChange={(html) => setProfile({ ...profile, bio: html })}
            placeholder="Cerita singkat tentang kamu..."
          />
        </div>

        <div className="form-row-two">
          <div className="form-group">
            <label>Avatar Photo</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            {avatarPreview && (
              <img src={avatarPreview} alt="Avatar" className="avatar-preview" />
            )}
          </div>
          <div className="form-group">
            <label>CV File URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={profile.cv_url || ""}
              onChange={(e) => setProfile({ ...profile, cv_url: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ============ EDUCATION ============ */}
      <TimelineSection
        title="Education"
        endpoint="/api/education"
        items={education}
        onRefresh={fetchAll}
      />

      {/* ============ EXPERIENCE ============ */}
      <TimelineSection
        title="Experience"
        endpoint="/api/experiences"
        items={experiences}
        onRefresh={fetchAll}
      />

      {/* ============ SKILLS ============ */}
      <SkillsSection skills={skills} onRefresh={fetchAll} />

      {/* ============ CERTIFICATIONS ============ */}
      <CertificationsSection certs={certifications} onRefresh={fetchAll} />
    </div>
  );
}

// ============ TIMELINE SECTION (Education / Experience) ============
function TimelineSection({ title, endpoint, items, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    institution: "",
    years: "",
    description: "",
    is_featured: false,
  });

  const startAdd = () => {
    setEditingId(null);
    setForm({ title: "", institution: "", years: "", description: "", is_featured: false });
    setIsAdding(true);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      institution: item.institution || "",
      years: item.period || "",
      description: item.description || "",
      is_featured: !!item.is_featured,
    });
    setIsAdding(true);
  };

  const cancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const save = async () => {
    const url = editingId ? `${API_BASE}${endpoint}/${editingId}` : `${API_BASE}${endpoint}`;
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsAdding(false);
    setEditingId(null);
    onRefresh();
  };

  const del = async (id) => {
    if (!window.confirm(`Hapus item ${title.toLowerCase()} ini?`)) return;
    await fetch(`${API_BASE}${endpoint}/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="about-section-card">
      <div className="section-card-header">
        <h3>{title}</h3>
        <button className="btn-add-small" onClick={startAdd}>+ Add</button>
      </div>

      {items.length === 0 && !isAdding && (
        <p className="empty-state-text">Belum ada {title.toLowerCase()}.</p>
      )}

      {items.map((item) => (
        <div key={item.id} className="timeline-item-compact">
          <div className="timeline-item-left">
            <span className="timeline-year">{item.period || "—"}</span>
          </div>
          <div className="timeline-item-body">
            <strong>{item.title}</strong>
            <span>{item.institution}</span>
          </div>
          <div className="timeline-item-actions">
            <button className="action-icon-btn" onClick={() => startEdit(item)}>✏️</button>
            <button className="action-icon-btn del" onClick={() => del(item.id)}>🗑</button>
          </div>
        </div>
      ))}

      {isAdding && (
        <div className="inline-edit-form">
          <div className="form-row-two">
            <div className="form-group">
              <label>Year / Period</label>
              <input
                type="text"
                placeholder="e.g., 2021 — 2025"
                value={form.years}
                onChange={(e) => setForm({ ...form, years: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., Bachelor Degree"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Institution</label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                style={{ marginRight: 6 }}
              />
              Featured (dot aktif di timeline)
            </label>
          </div>
          <div className="modal-buttons">
            <button className="modal-submit-btn" onClick={save}>Save</button>
            <button className="modal-cancel-btn" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ SKILLS SECTION ============
function SkillsSection({ skills, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ category_label: "", items: "", highlight: "" });

  const startAdd = () => {
    setEditingId(null);
    setForm({ category_label: "", items: "", highlight: "" });
    setIsAdding(true);
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({
      category_label: s.category_label || "",
      items: s.items || "",
      highlight: s.highlight || "",
    });
    setIsAdding(true);
  };

  const save = async () => {
    const url = editingId ? `${API_BASE}/api/skills/${editingId}` : `${API_BASE}/api/skills`;
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsAdding(false);
    setEditingId(null);
    onRefresh();
  };

  const del = async (id) => {
    if (!window.confirm("Hapus skill group ini?")) return;
    await fetch(`${API_BASE}/api/skills/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="about-section-card">
      <div className="section-card-header">
        <h3>Skills</h3>
        <button className="btn-add-small" onClick={startAdd}>+ Add group</button>
      </div>

      <p className="section-hint">
        Tech names pisah koma — nama yang match punya logo (e.g. React, Laravel, Flutter).
      </p>

      {skills.map((s) => (
        <div key={s.id} className="skill-row-compact">
          <div className="skill-row-title">{s.category_label}</div>
          <div className="skill-row-items">{s.items}</div>
          <div className="skill-row-actions">
            <button className="action-icon-btn" onClick={() => startEdit(s)}>✏️</button>
            <button className="action-icon-btn del" onClick={() => del(s.id)}>🗑</button>
          </div>
        </div>
      ))}

      {isAdding && (
        <div className="inline-edit-form">
          <div className="form-row-two">
            <div className="form-group">
              <label>Category (e.g., Frontend)</label>
              <input
                type="text"
                value={form.category_label}
                onChange={(e) => setForm({ ...form, category_label: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Highlight (opsional)</label>
              <input
                type="text"
                placeholder="React, Vue"
                value={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Items (pisah koma)</label>
            <input
              type="text"
              placeholder="React, Vue.js, Tailwind CSS"
              value={form.items}
              onChange={(e) => setForm({ ...form, items: e.target.value })}
            />
          </div>
          <div className="modal-buttons">
            <button className="modal-submit-btn" onClick={save}>Save</button>
            <button className="modal-cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ CERTIFICATIONS SECTION ============
function CertificationsSection({ certs, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", issuer: "", icon: "🏆" });

  const startAdd = () => {
    setEditingId(null);
    setForm({ title: "", issuer: "", icon: "🏆" });
    setIsAdding(true);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ title: c.title || "", issuer: c.issuer || "", icon: c.icon || "🏆" });
    setIsAdding(true);
  };

  const save = async () => {
    const url = editingId ? `${API_BASE}/api/certifications/${editingId}` : `${API_BASE}/api/certifications`;
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsAdding(false);
    setEditingId(null);
    onRefresh();
  };

  const del = async (id) => {
    if (!window.confirm("Hapus sertifikat ini?")) return;
    await fetch(`${API_BASE}/api/certifications/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="about-section-card">
      <div className="section-card-header">
        <h3>Certifications</h3>
        <button className="btn-add-small" onClick={startAdd}>+ Add</button>
      </div>

      {certs.length === 0 && !isAdding && (
        <p className="empty-state-text">Belum ada sertifikat.</p>
      )}

      {certs.map((c) => (
        <div key={c.id} className="cert-row-compact">
          <span className="cert-icon">{c.icon || "🏆"}</span>
          <div className="cert-body">
            <strong>{c.title}</strong>
            <span>{c.issuer}</span>
          </div>
          <div className="cert-actions">
            <button className="action-icon-btn" onClick={() => startEdit(c)}>✏️</button>
            <button className="action-icon-btn del" onClick={() => del(c.id)}>🗑</button>
          </div>
        </div>
      ))}

      {isAdding && (
        <div className="inline-edit-form">
          <div className="form-row-two">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Icon (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Issuer</label>
            <input
              type="text"
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            />
          </div>
          <div className="modal-buttons">
            <button className="modal-submit-btn" onClick={save}>Save</button>
            <button className="modal-cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AboutTab;