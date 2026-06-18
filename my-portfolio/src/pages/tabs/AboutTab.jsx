import { useEffect, useState } from "react";
import { API_BASE, PUBLIC_ABOUT_URL, getImageUrl, safeFetch } from "./apiClient";

function AboutTab({ onSkillsCountChange }) {
  const [profile, setProfile] = useState({ full_name: "", current_role: "", bio: "", avatar_url: "", cv_url: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [education, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);

  // Buat tracking item Education/Experience/Cert/Skill yang udah di-edit inline,
  // biar pas tombol "Save Changes" diklik bisa bulk-update sekaligus.
  const [dirtyIds, setDirtyIds] = useState({ education: new Set(), experiences: new Set(), skills: new Set(), certifications: new Set() });

  // Modal Education / Experience
  const [showEdModal, setShowEdModal] = useState(false);
  const [edType, setEdType] = useState("education");
  const [isEditingEd, setIsEditingEd] = useState(false);
  const [currentEdId, setCurrentEdId] = useState(null);
  const [edForm, setEdForm] = useState({ title: "", institution: "", years: "", description: "", is_featured: false });

  // Modal Certifications
  const [showCertModal, setShowCertModal] = useState(false);
  const [isEditingCert, setIsEditingCert] = useState(false);
  const [currentCertId, setCurrentCertId] = useState(null);
  const [certForm, setCertForm] = useState({ title: "", issuer: "", icon: "🏆" });

  // Modal Skills
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [currentSkillId, setCurrentSkillId] = useState(null);
  const [skillForm, setSkillForm] = useState({ category_label: "", items: "", highlight: "" });

  // ============ FETCH INDEPENDEN ============
  // Tiap section di-fetch terpisah biar 1 endpoint error gak nge-block yang lain
  const fetchProfile = () => {
    safeFetch("/api/profile", null).then((data) => {
      if (data) setProfile({ ...{ full_name: "", current_role: "", bio: "", avatar_url: "", cv_url: "" }, ...data });
    });
  };
  const fetchEducation = () => safeFetch("/api/education", []).then(setEducation);
  const fetchExperiences = () => safeFetch("/api/experiences", []).then(setExperiences);
  const fetchSkills = () => {
    safeFetch("/api/skills", []).then((data) => {
      setSkills(data);
      if (onSkillsCountChange) onSkillsCountChange(data.length);
    });
  };
  const fetchCertifications = () => safeFetch("/api/certifications", []).then(setCertifications);

  const refreshAll = () => {
    fetchProfile();
    fetchEducation();
    fetchExperiences();
    fetchSkills();
    fetchCertifications();
    setDirtyIds({ education: new Set(), experiences: new Set(), skills: new Set(), certifications: new Set() });
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ HEADER ACTIONS ============
  const handlePreview = () => {
    window.open(PUBLIC_ABOUT_URL, "_blank", "noopener,noreferrer");
  };

  // Save Changes: simpan profile + semua item Education/Experience/Skills/Cert yang berubah (dirty)
  const handleSaveAll = async (e) => {
    e.preventDefault();

    const tasks = [];

    // 1. Profile
    const profileFormData = new FormData();
    profileFormData.append("full_name", profile.full_name);
    profileFormData.append("current_role", profile.current_role);
    profileFormData.append("bio", profile.bio);
    profileFormData.append("cv_url", profile.cv_url || "");
    if (avatarFile) profileFormData.append("avatar", avatarFile);
    tasks.push(fetch(`${API_BASE}/api/profile`, { method: "PUT", body: profileFormData }));

    // 2. Bulk update item yang dirty
    const bulkUpdate = (resource, items, idSet, mapBody) => {
      idSet.forEach((id) => {
        const item = items.find((x) => x.id === id);
        if (!item) return;
        tasks.push(
          fetch(`${API_BASE}/api/${resource}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mapBody(item)),
          })
        );
      });
    };

    bulkUpdate("education", education, dirtyIds.education, (it) => ({
      title: it.title,
      institution: it.institution,
      years: it.period,
      description: it.description,
      is_featured: it.is_featured,
    }));
    bulkUpdate("experiences", experiences, dirtyIds.experiences, (it) => ({
      title: it.title,
      institution: it.institution,
      years: it.period,
      description: it.description,
      is_featured: it.is_featured,
    }));
    bulkUpdate("skills", skills, dirtyIds.skills, (it) => ({
      category_label: it.category_label,
      items: it.items,
      highlight: it.highlight,
    }));
    bulkUpdate("certifications", certifications, dirtyIds.certifications, (it) => ({
      title: it.title,
      issuer: it.issuer,
      icon: it.icon,
    }));

    try {
      await Promise.all(tasks);
      setAvatarFile(null);
      refreshAll();
      const totalChanges = 1 + dirtyIds.education.size + dirtyIds.experiences.size + dirtyIds.skills.size + dirtyIds.certifications.size;
      alert(`🎉 Berhasil menyimpan ${totalChanges} perubahan!`);
    } catch (err) {
      alert("⚠️ Ada perubahan yang gagal disimpan. Cek console.");
      console.error(err);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // ============ INLINE EDIT HELPERS ============
  // Pas user edit inline (langsung di card, bukan via modal), state lokal diupdate
  // dan id-nya ditandai "dirty" biar nanti ke-include pas Save Changes.
  const markDirty = (resource, id) => {
    setDirtyIds((prev) => {
      const next = { ...prev, [resource]: new Set(prev[resource]) };
      next[resource].add(id);
      return next;
    });
  };

  // ============ EDUCATION & EXPERIENCE (via modal) ============
  const openEdModal = (type, item = null) => {
    setEdType(type);
    if (item) {
      setIsEditingEd(true);
      setCurrentEdId(item.id);
      setEdForm({
        title: item.title,
        institution: item.institution,
        years: item.period,
        description: item.description || "",
        is_featured: !!item.is_featured,
      });
    } else {
      setIsEditingEd(false);
      setCurrentEdId(null);
      setEdForm({ title: "", institution: "", years: "", description: "", is_featured: false });
    }
    setShowEdModal(true);
  };

  const handleEdSubmit = (e) => {
    e.preventDefault();
    const endpoint = edType === "education" ? "education" : "experiences";
    const url = isEditingEd ? `${API_BASE}/api/${endpoint}/${currentEdId}` : `${API_BASE}/api/${endpoint}`;

    fetch(url, {
      method: isEditingEd ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edForm),
    }).then(() => {
      if (edType === "education") fetchEducation();
      else fetchExperiences();
      setShowEdModal(false);
      alert(isEditingEd ? "✅ Riwayat berhasil diupdate!" : "🚀 New card deployed successfully!");
    });
  };

  const handleEdDelete = (type, id) => {
    const endpoint = type === "education" ? "education" : "experiences";
    if (window.confirm("Delete item riwayat ini dari database?")) {
      fetch(`${API_BASE}/api/${endpoint}/${id}`, { method: "DELETE" }).then(() => {
        if (type === "education") fetchEducation();
        else fetchExperiences();
      });
    }
  };

  // ============ CERTIFICATIONS ============
  const openCertModal = (item = null) => {
    if (item) {
      setIsEditingCert(true);
      setCurrentCertId(item.id);
      setCertForm({ title: item.title, issuer: item.issuer, icon: item.icon || "🏆" });
    } else {
      setIsEditingCert(false);
      setCurrentCertId(null);
      setCertForm({ title: "", issuer: "", icon: "🏆" });
    }
    setShowCertModal(true);
  };

  const handleCertSubmit = (e) => {
    e.preventDefault();
    const url = isEditingCert ? `${API_BASE}/api/certifications/${currentCertId}` : `${API_BASE}/api/certifications`;
    fetch(url, {
      method: isEditingCert ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(certForm),
    }).then(() => {
      fetchCertifications();
      setShowCertModal(false);
      alert(isEditingCert ? "✅ Certification updated!" : "🎖️ New certification added!");
    });
  };

  const handleCertDelete = (id) => {
    if (window.confirm("Hapus sertifikat ini dari database?")) {
      fetch(`${API_BASE}/api/certifications/${id}`, { method: "DELETE" }).then(fetchCertifications);
    }
  };

  // ============ SKILLS ============
  const openSkillModal = (item = null) => {
    if (item) {
      setIsEditingSkill(true);
      setCurrentSkillId(item.id);
      setSkillForm({ category_label: item.category_label, items: item.items || "", highlight: item.highlight || "" });
    } else {
      setIsEditingSkill(false);
      setCurrentSkillId(null);
      setSkillForm({ category_label: "", items: "", highlight: "" });
    }
    setShowSkillModal(true);
  };

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    const url = isEditingSkill ? `${API_BASE}/api/skills/${currentSkillId}` : `${API_BASE}/api/skills`;
    fetch(url, {
      method: isEditingSkill ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skillForm),
    }).then(() => {
      fetchSkills();
      setShowSkillModal(false);
      alert(isEditingSkill ? "✅ Skill category updated!" : "💻 New skill category added!");
    });
  };

  const handleSkillDelete = (id) => {
    if (window.confirm("Hapus kategori skill ini beserta semua item-nya?")) {
      fetch(`${API_BASE}/api/skills/${id}`, { method: "DELETE" }).then(fetchSkills);
    }
  };

  const handleRemoveSkillItem = (skillGroup, itemToRemove) => {
    const updatedItems = (skillGroup.items || "")
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i && i !== itemToRemove)
      .join(", ");
    fetch(`${API_BASE}/api/skills/${skillGroup.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...skillGroup, items: updatedItems }),
    }).then(fetchSkills);
  };

  return (
    <div className="tab-view animate-fade">
      <div className="view-header-with-action">
        <div>
          <span className="top-mini-tag">CONTENT MANAGEMENT</span>
          <h1 style={{ marginTop: "4px" }}>Edit About Me</h1>
        </div>
        <div className="header-action-buttons">
          <button type="button" className="btn-preview-changes" onClick={handlePreview}>
            👁️ Preview Changes
          </button>
          <button type="submit" form="aboutMasterForm" className="btn-save-changes">
            💾 Save Changes
          </button>
        </div>
      </div>

      <form id="aboutMasterForm" onSubmit={handleSaveAll}>
        <div className="about-editor-split-grid">
          {/* PANEL KIRI */}
          <div className="editor-left-pane">
            {/* PROFILE INFORMATION */}
            <div className="pane-inner-card glass-morph">
              <div className="card-inner-title">
                <span className="card-icon-avatar">👤</span>
                <h4>Profile Information</h4>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Current Role</label>
                  <input
                    type="text"
                    value={profile.current_role}
                    onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Professional Bio</label>
                <textarea
                  rows="4"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                ></textarea>
              </div>
              <div className="form-row-two">
                <div className="form-group">
                  <label>Avatar Photo</label>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  {(avatarPreview || getImageUrl(profile.avatar_url)) && (
                    <img
                      src={avatarPreview || getImageUrl(profile.avatar_url)}
                      alt="Avatar preview"
                      className="image-preview avatar-preview"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>CV File URL</label>
                  <input
                    type="text"
                    placeholder="/cv-serena.pdf"
                    value={profile.cv_url || ""}
                    onChange={(e) => setProfile({ ...profile, cv_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* EDUCATION */}
            <div className="pane-inner-card glass-morph" style={{ marginTop: "24px" }}>
              <div className="card-inner-title-with-action">
                <div className="title-left-side">
                  <span className="card-icon-avatar">🎓</span>
                  <h4>Education</h4>
                </div>
                <button
                  type="button"
                  className="add-item-circle-btn"
                  onClick={() => openEdModal("education")}
                >
                  +
                </button>
              </div>

              <div className="education-records-list">
                {education.length === 0 && <p className="empty-state-text small">Belum ada data education.</p>}
                {education.map((item, idx) => (
                  <div key={item.id} className="education-timeline-node">
                    <div className="node-icon-cap">🎓</div>
                    <div className="node-body-content">
                      <h5>{item.institution}</h5>
                      <p>
                        {item.title} • {item.period}
                      </p>
                    </div>
                    <div className="timeline-node-actions">
                      <button
                        type="button"
                        onClick={() => openEdModal("education", item)}
                        className="btn-edit-node"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdDelete("education", item.id)}
                        className="btn-delete-node"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACADEMIC PROJECT EXPERIENCE */}
            <div className="pane-inner-card glass-morph" style={{ marginTop: "24px" }}>
              <div className="card-inner-title-with-action">
                <div className="title-left-side">
                  <span className="card-icon-avatar">💼</span>
                  <h4>Academic Project Experience</h4>
                </div>
                <button
                  type="button"
                  className="add-item-circle-btn"
                  onClick={() => openEdModal("experience")}
                >
                  +
                </button>
              </div>

              <div className="education-records-list">
                {experiences.length === 0 && <p className="empty-state-text small">Belum ada data experience.</p>}
                {experiences.map((item) => (
                  <div key={item.id} className="education-timeline-node">
                    <div className="node-icon-cap">💼</div>
                    <div className="node-body-content">
                      <h5>{item.title}</h5>
                      <p>
                        {item.institution} • {item.period}
                      </p>
                    </div>
                    <div className="timeline-node-actions">
                      <button
                        type="button"
                        onClick={() => openEdModal("experience", item)}
                        className="btn-edit-node"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdDelete("experience", item.id)}
                        className="btn-delete-node"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PANEL KANAN */}
          <div className="editor-right-pane">
            <div className="pane-inner-card glass-morph height-fill-panel">
              <div className="card-inner-title-with-action">
                <div className="title-left-side">
                  <span className="card-icon-avatar">💻</span>
                  <h4>Technical Arsenal</h4>
                </div>
                <button
                  type="button"
                  className="add-item-circle-btn"
                  onClick={() => openSkillModal()}
                >
                  +
                </button>
              </div>

              <div className="arsenal-dynamic-list-wrapper">
                {skills.length === 0 && <p className="empty-state-text small">Belum ada kategori skill.</p>}
                {skills.map((skillGroup) => (
                  <div key={skillGroup.id} className="arsenal-tag-section">
                    <div className="section-tag-header">
                      <h5>{skillGroup.category_label.toUpperCase()}</h5>
                      <div className="section-tag-header-actions">
                        <button
                          type="button"
                          className="add-tag-inline-btn"
                          onClick={() => openSkillModal(skillGroup)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="add-tag-inline-btn danger"
                          onClick={() => handleSkillDelete(skillGroup.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="interactive-tags-box">
                      {(skillGroup.items || "")
                        .split(",")
                        .map((i) => i.trim())
                        .filter(Boolean)
                        .map((item) => (
                          <span key={item} className="tech-pill-interactive">
                            {item}{" "}
                            <span
                              className="pill-close-cross"
                              onClick={() => handleRemoveSkillItem(skillGroup, item)}
                            >
                              ✕
                            </span>
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CERTIFICATIONS */}
            <div className="pane-inner-card glass-morph" style={{ marginTop: "24px" }}>
              <div className="card-inner-title-with-action">
                <div className="title-left-side">
                  <span className="card-icon-avatar">🎖️</span>
                  <h4>Certifications</h4>
                </div>
                <button type="button" className="add-item-circle-btn" onClick={() => openCertModal()}>
                  +
                </button>
              </div>

              <div className="education-records-list">
                {certifications.length === 0 && <p className="empty-state-text small">Belum ada sertifikat.</p>}
                {certifications.map((cert) => (
                  <div key={cert.id} className="education-timeline-node">
                    <div className="node-icon-cap">{cert.icon}</div>
                    <div className="node-body-content">
                      <h5>{cert.title}</h5>
                      <p>{cert.issuer}</p>
                    </div>
                    <div className="timeline-node-actions">
                      <button type="button" onClick={() => openCertModal(cert)} className="btn-edit-node">
                        ✏️
                      </button>
                      <button type="button" onClick={() => handleCertDelete(cert.id)} className="btn-delete-node">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* MODAL EDUCATION / EXPERIENCE */}
      {showEdModal && (
        <div className="modal-overlay">
          <div className="modal-glass-container">
            <h3>
              {isEditingEd ? "✏️ Edit" : "➕ Add"} {edType === "education" ? "Education" : "Experience"}
            </h3>
            <form onSubmit={handleEdSubmit}>
              <div className="form-group">
                <label>{edType === "education" ? "Degree / Program" : "Role / Job Title"}</label>
                <input
                  type="text"
                  required
                  value={edForm.title}
                  onChange={(e) => setEdForm({ ...edForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{edType === "education" ? "Institution" : "Organization"}</label>
                <input
                  type="text"
                  required
                  value={edForm.institution}
                  onChange={(e) => setEdForm({ ...edForm, institution: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Period</label>
                <input
                  type="text"
                  placeholder="e.g., 2021 - 2025"
                  required
                  value={edForm.years}
                  onChange={(e) => setEdForm({ ...edForm, years: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={edForm.description}
                  onChange={(e) => setEdForm({ ...edForm, description: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="checkbox-inline-label">
                  <input
                    type="checkbox"
                    checked={edForm.is_featured}
                    onChange={(e) => setEdForm({ ...edForm, is_featured: e.target.checked })}
                  />
                  Mark as most recent / featured
                </label>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">
                  {isEditingEd ? "Save Changes" : "Deploy Card"}
                </button>
                <button type="button" onClick={() => setShowEdModal(false)} className="modal-cancel-btn">
                  Dismiss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CERTIFICATIONS */}
      {showCertModal && (
        <div className="modal-overlay">
          <div className="modal-glass-container">
            <h3>{isEditingCert ? "✏️ Edit Certification" : "🎖️ New Certification"}</h3>
            <form onSubmit={handleCertSubmit}>
              <div className="form-group">
                <label>Certification Title</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Issuer</label>
                <input
                  type="text"
                  required
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Icon (emoji)</label>
                <input
                  type="text"
                  placeholder="🏆"
                  value={certForm.icon}
                  onChange={(e) => setCertForm({ ...certForm, icon: e.target.value })}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">
                  {isEditingCert ? "Save Changes" : "Add Certification"}
                </button>
                <button type="button" onClick={() => setShowCertModal(false)} className="modal-cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SKILLS */}
      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal-glass-container">
            <h3>{isEditingSkill ? "✏️ Edit Skill Category" : "💻 New Skill Category"}</h3>
            <form onSubmit={handleSkillSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g., Mobile Development"
                  required
                  value={skillForm.category_label}
                  onChange={(e) => setSkillForm({ ...skillForm, category_label: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Items (pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="e.g., Kotlin, Flutter, Swift"
                  value={skillForm.items}
                  onChange={(e) => setSkillForm({ ...skillForm, items: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Highlight (item yang mau ditonjolkan, pisahkan koma)</label>
                <input
                  type="text"
                  value={skillForm.highlight}
                  onChange={(e) => setSkillForm({ ...skillForm, highlight: e.target.value })}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">
                  {isEditingSkill ? "Save Changes" : "Add Category"}
                </button>
                <button type="button" onClick={() => setShowSkillModal(false)} className="modal-cancel-btn">
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

export default AboutTab;