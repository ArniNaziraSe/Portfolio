import { useEffect, useState, useMemo } from "react";
import { API_BASE, PUBLIC_ABOUT_URL, getImageUrl, safeFetch, authFetch } from "./apiClient";
import RichTextEditor from "../../components/RichTextEditor";

// Sort helper: ekstrak tahun terakhir dari string period, terbaru di atas
function sortByPeriodYear(items) {
  return [...items].sort((a, b) => {
    const getYear = (item) => {
      const match = (item.period || "").match(/\d{4}/g);
      return match ? parseInt(match[match.length - 1]) : 0;
    };
    return getYear(b) - getYear(a);
  });
}

function sortCertsByYear(items) {
  return [...items].sort((a, b) => {
    const getYear = (item) => {
      const match = (item.year || "").match(/\d{4}/);
      return match ? parseInt(match[0]) : 0;
    };
    return getYear(b) - getYear(a);
  });
}

const MONTHS = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  january: 1, february: 2, march: 3, may: 5, june: 6,
  july: 7, august: 8, october: 10, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7,
  aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

// Sort key gabungan bulan+tahun. "Agustus 2024" -> 202408, "Desember 2024" -> 202412.
function getSortKey(text) {
  if (!text) return 0;
  const lower = String(text).toLowerCase();
  const years = lower.match(/\d{4}/g);
  const year = years ? parseInt(years[years.length - 1]) : 0;

  let lastMonthNum = 0;
  let lastMonthPos = -1;
  for (const [name, num] of Object.entries(MONTHS)) {
    const idx = lower.lastIndexOf(name);
    if (idx > lastMonthPos) {
      lastMonthPos = idx;
      lastMonthNum = num;
    }
  }
  return year * 100 + lastMonthNum;
}

function AboutTab({ onSkillsCountChange }) {
  const [profile, setProfile] = useState({
    full_name: "", current_role: "", bio: "", avatar_url: "", cv_url: "",
    focus: "", graduation_year: "", email: "", personal_note: "", hobbies: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [education, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const fetchAll = () => {
    safeFetch("/api/profile", null).then((data) => {
      if (data) {
        setProfile((prev) => ({ ...prev, ...data }));
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
      ["full_name", "current_role", "bio", "cv_url",
       "focus", "graduation_year", "email", "personal_note", "hobbies"
      ].forEach((k) => formData.append(k, profile[k] || ""));
      if (avatarFile) formData.append("avatar", avatarFile);

      await authFetch("/api/profile", { method: "PUT", body: formData });
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
      <div className="about-header-bar">
        <p className="about-subtitle">Edits mirror the public About page.</p>
        <div className="about-header-actions">
          <button onClick={saveProfile} className="add-project-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {savedMsg && <div className="saved-msg">{savedMsg}</div>}

      {/* BASIC INFO */}
      <div className="about-section-card">
        <h3>Basic Info</h3>
        <div className="form-row-two">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Role / Headline</label>
            <input type="text" value={profile.current_role || ""}
              onChange={(e) => setProfile({ ...profile, current_role: e.target.value })} />
          </div>
        </div>

        <div className="form-row-two">
          <div className="form-group">
            <label>Focus (2 kata, muncul di stat Home)</label>
            <input type="text" placeholder="Web·Mobile"
              value={profile.focus || ""}
              onChange={(e) => setProfile({ ...profile, focus: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Graduation Year</label>
            <input type="text" placeholder="2025"
              value={profile.graduation_year || ""}
              onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>Email (Contact modal)</label>
          <input type="email" placeholder="hello@arninazira.my.id"
            value={profile.email || ""}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Bio (About page)</label>
          <RichTextEditor
            value={profile.bio || ""}
            onChange={(html) => setProfile({ ...profile, bio: html })}
            placeholder="Cerita singkat tentang kamu..."
          />
        </div>

        <div className="form-group">
          <label>CV File URL</label>
          <input type="text" placeholder="https://..."
            value={profile.cv_url || ""}
            onChange={(e) => setProfile({ ...profile, cv_url: e.target.value })} />
        </div>
      </div>

      {/* TECT STACK */}
      <div className="about-section-card">
        <h3>Tech Stack</h3>
        <div className="form-group">
          <label>Frameworks / Libraries</label>
          <input type="text" value={profile.frameworks || ""}
            onChange={(e) => setProfile({ ...profile, frameworks: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Tools</label>
          <input type="text" value={profile.tools || ""}
            onChange={(e) => setProfile({ ...profile, tools: e.target.value })} />
        </div>
      </div>

      {/* BEYOND WORK */}
      <div className="about-section-card">
        <h3>Beyond Work</h3>
        <div className="form-group">
          <label>Personal Note</label>
          <textarea rows="3"
            placeholder="Away from the keyboard I recharge with..."
            value={profile.personal_note || ""}
            onChange={(e) => setProfile({ ...profile, personal_note: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Hobbies (satu per baris — bisa pakai emoji + deskripsi)</label>
          <textarea rows="5"
            placeholder={"💃 Dance — creative outlet\n🎬 Movies — action & romance\n☕ Coffee — coding companion"}
            value={profile.hobbies || ""}
            onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
            style={{ fontFamily: "inherit" }} />
        </div>
      </div>

      {/* EDUCATION */}
      <TimelineSection title="Education" endpoint="/api/education" items={education} onRefresh={fetchAll} />

      {/* EXPERIENCE */}
      <TimelineSection title="Experience" endpoint="/api/experiences" items={experiences} onRefresh={fetchAll} />

      {/* SKILLS */}
      <SkillsSection skills={skills} onRefresh={fetchAll} />

      {/* CERTIFICATIONS */}
      <CertificationsSection certs={certifications} onRefresh={fetchAll} />
    </div>
  );
}

function TimelineSection({ title, endpoint, items, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [form, setForm] = useState({ title: "", institution: "", years: "", description: "", is_featured: false });

  // Sort by bulan+tahun terakhir. "Agustus 2024" > "Februari 2024".
  const sortedItems = useMemo(() => {
    const withKey = items.map((item) => ({ ...item, _sortKey: getSortKey(item.period) }));
    withKey.sort((a, b) => sortDesc ? b._sortKey - a._sortKey : a._sortKey - b._sortKey);
    return withKey;
  }, [items, sortDesc]);

  const startAdd = () => {
    setEditingId(null);
    setForm({ title: "", institution: "", years: "", description: "", is_featured: false });
    setIsAdding(true);
  };
  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "", institution: item.institution || "",
      years: item.period || "", description: item.description || "",
      is_featured: !!item.is_featured,
    });
    setIsAdding(true);
  };
  const save = async () => {
    const path = editingId ? `${endpoint}/${editingId}` : endpoint;
    await authFetch(path, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsAdding(false);
    setEditingId(null);
    onRefresh();
  };
  const del = async (id) => {
    if (!window.confirm(`Hapus item ${title.toLowerCase()} ini?`)) return;
    await authFetch(`${endpoint}/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="about-section-card">
      <div className="section-card-header">
        <h3>{title}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-add-small"
            onClick={() => setSortDesc(!sortDesc)}
            title="Toggle sort"
            style={{ background: "transparent" }}
          >
            {sortDesc ? "↓ Newest" : "↑ Oldest"}
          </button>
          <button className="btn-add-small" onClick={startAdd}>+ Add</button>
        </div>
      </div>

      {items.length === 0 && !isAdding && (
        <p className="empty-state-text">Belum ada {title.toLowerCase()}.</p>
      )}

      {sortedItems.map((item) => (
        <div key={item.id} className="timeline-item-compact">
          <div className="timeline-item-left"><span className="timeline-year">{item.period || "—"}</span></div>
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
              <input type="text" placeholder="e.g., 2021 — 2025" value={form.years}
                onChange={(e) => setForm({ ...form, years: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Institution</label>
            <input type="text" value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea rows="2" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
    setForm({ category_label: s.category_label || "", items: s.items || "", highlight: s.highlight || "" });
    setIsAdding(true);
  };
  const save = async () => {
    const path = editingId ? `/api/skills/${editingId}` : `/api/skills`;
    await authFetch(path, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsAdding(false);
    setEditingId(null);
    onRefresh();
  };
  const del = async (id) => {
    if (!window.confirm("Hapus skill group ini?")) return;
    await authFetch(`/api/skills/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="about-section-card">
      <div className="section-card-header">
        <h3>Skills</h3>
        <button className="btn-add-small" onClick={startAdd}>+ Add group</button>
      </div>
      <p className="section-hint">
        Tech names pisah koma — nama yang match punya logo (React, Laravel, Flutter).
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
              <input type="text" value={form.category_label}
                onChange={(e) => setForm({ ...form, category_label: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Highlight (opsional)</label>
              <input type="text" placeholder="React, Vue" value={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Items (pisah koma)</label>
            <input type="text" placeholder="React, Vue.js, Tailwind CSS" value={form.items}
              onChange={(e) => setForm({ ...form, items: e.target.value })} />
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

function CertificationsSection({ certs, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [form, setForm] = useState({ title: "", issuer: "", icon: "🏆", year: "" });

  const sortedCerts = useMemo(() => {
    const withKey = certs.map((c) => ({ ...c, _sortKey: getSortKey(c.year) }));
    withKey.sort((a, b) => sortDesc ? b._sortKey - a._sortKey : a._sortKey - b._sortKey);
    return withKey;
  }, [certs, sortDesc]);

  const startAdd = () => {
    setEditingId(null);
    setForm({ title: "", issuer: "", icon: "🏆", year: "" });
    setIsAdding(true);
  };
  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ title: c.title || "", issuer: c.issuer || "", icon: c.icon || "🏆", year: c.year || "" });
    setIsAdding(true);
  };
  const save = async () => {
    const path = editingId ? `/api/certifications/${editingId}` : `/api/certifications`;
    await authFetch(path, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsAdding(false);
    setEditingId(null);
    onRefresh();
  };
  const del = async (id) => {
    if (!window.confirm("Hapus sertifikat ini?")) return;
    await authFetch(`/api/certifications/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="about-section-card">
      <div className="section-card-header">
        <h3>Certifications</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-add-small"
            onClick={() => setSortDesc(!sortDesc)}
            style={{ background: "transparent" }}
          >
            {sortDesc ? "↓ Newest" : "↑ Oldest"}
          </button>
          <button className="btn-add-small" onClick={startAdd}>+ Add</button>
        </div>
      </div>

      {certs.length === 0 && !isAdding && <p className="empty-state-text">Belum ada sertifikat.</p>}

      {sortedCerts.map((c) => (
        <div key={c.id} className="cert-row-compact">
          <span className="cert-icon">{c.icon || "🏆"}</span>
          <div className="cert-body">
            <strong>{c.title}</strong>
            <span>{c.issuer} {c.year ? `· ${c.year}` : ""}</span>
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
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="text" placeholder="2024" value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
          </div>
          <div className="form-row-two">
            <div className="form-group">
              <label>Issuer</label>
              <input type="text" value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Icon (emoji)</label>
              <input type="text" value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
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