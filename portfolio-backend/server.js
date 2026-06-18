const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// ============================================================
// 1. MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// 2. KONEKSI POSTGRESQL
// ============================================================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error koneksi database:', err.stack);
  }
  console.log('🎉 Sukses terkoneksi ke PostgreSQL Database!');
  release();
});

// ============================================================
// UPLOAD GAMBAR (multer)
// ============================================================

// Pastikan folder upload ada
['uploads/projects', 'uploads/profile'].forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function makeUploader(folder) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, `uploads/${folder}`)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, crypto.randomBytes(12).toString('hex') + ext);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter: (req, file, cb) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'));
      }
    },
  });
}

const uploadProjectImage = makeUploader('projects');
const uploadAvatar = makeUploader('profile');

// File yang diupload bisa diakses langsung lewat /uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Bikin slug otomatis dari title project, cth: "Toko Online Keren" -> "toko-online-keren"
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Bikin category_key otomatis dari category_label, cth: "Mobile Development" -> "mobileDevelopment"
function toCategoryKey(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, idx) => (idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

// Hapus file lama di /uploads kalau ada gambar baru yang gantiin
function deleteOldUpload(relativePath) {
  if (relativePath && relativePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
}

// ============================================================
// 3. ROUTES — semua endpoint API (wajib di atas app.listen)
// ============================================================

// ------------------------------------------------------------
// 📁 PROJECTS
// ------------------------------------------------------------
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Projects');
  }
});

app.post('/api/projects', uploadProjectImage.single('image'), async (req, res) => {
  try {
    const { title, description, github_link, tech_stack } = req.body;
    const slug = slugify(title);
    const image_url = req.file ? `/uploads/projects/${req.file.filename}` : '';

    const newProject = await pool.query(
      'INSERT INTO projects (title, slug, description, image_url, github_link, tech_stack) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, slug, description, image_url, github_link, tech_stack]
    );
    res.json(newProject.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menambah proyek');
  }
});

app.put('/api/projects/:id', uploadProjectImage.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, github_link, tech_stack } = req.body;

    const existing = await pool.query('SELECT image_url FROM projects WHERE id = $1', [id]);
    let image_url = existing.rows[0]?.image_url || '';

    if (req.file) {
      deleteOldUpload(image_url);
      image_url = `/uploads/projects/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE projects SET title = $1, description = $2, image_url = $3, github_link = $4, tech_stack = $5 WHERE id = $6',
      [title, description, image_url, github_link, tech_stack, id]
    );
    res.send('Proyek berhasil di-update!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal mengupdate proyek');
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.send('Proyek berhasil dihapus!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menghapus proyek');
  }
});

// ------------------------------------------------------------
// 💻 SKILLS (Technical Arsenal)
// ------------------------------------------------------------
app.get('/api/skills', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skills ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Skills');
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const { category_label, items, highlight } = req.body;
    let key = toCategoryKey(category_label);
    const existing = await pool.query('SELECT id FROM skills WHERE category_key = $1', [key]);
    if (existing.rows.length > 0) key = `${key}_${Date.now()}`;

    const newSkill = await pool.query(
      'INSERT INTO skills (category_key, category_label, items, highlight) VALUES ($1, $2, $3, $4) RETURNING *',
      [key, category_label, items, highlight]
    );
    res.json(newSkill.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menambah skill category');
  }
});

app.put('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_label, items, highlight } = req.body;
    await pool.query(
      'UPDATE skills SET category_label = $1, items = $2, highlight = $3 WHERE id = $4',
      [category_label, items, highlight, id]
    );
    res.send('Skill category updated!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal mengupdate skill category');
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM skills WHERE id = $1', [id]);
    res.send('Skill category deleted!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menghapus skill category');
  }
});

// ------------------------------------------------------------
// 🎖️ CERTIFICATIONS
// ------------------------------------------------------------
app.get('/api/certifications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM certifications ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Certifications');
  }
});

app.post('/api/certifications', async (req, res) => {
  try {
    const { title, issuer, icon } = req.body;
    const newCert = await pool.query(
      'INSERT INTO certifications (title, issuer, icon) VALUES ($1, $2, $3) RETURNING *',
      [title, issuer, icon || '🏆']
    );
    res.json(newCert.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menambah certification');
  }
});

app.put('/api/certifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, issuer, icon } = req.body;
    await pool.query(
      'UPDATE certifications SET title = $1, issuer = $2, icon = $3 WHERE id = $4',
      [title, issuer, icon, id]
    );
    res.send('Certification updated!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal mengupdate certification');
  }
});

app.delete('/api/certifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM certifications WHERE id = $1', [id]);
    res.send('Certification deleted!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menghapus certification');
  }
});

// ------------------------------------------------------------
// 👤 PROFILE (singleton)
// ------------------------------------------------------------
app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profile LIMIT 1');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Profile');
  }
});

app.put('/api/profile', uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const { full_name, current_role, bio, cv_url } = req.body;

    const existing = await pool.query('SELECT avatar_url FROM profile WHERE id = 1');
    let avatar_url = existing.rows[0]?.avatar_url || '';

    if (req.file) {
      deleteOldUpload(avatar_url);
      avatar_url = `/uploads/profile/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE profile
       SET full_name = $1, "current_role" = $2, bio = $3, avatar_url = $4, cv_url = $5
       WHERE id = 1`,
      [full_name, current_role, bio, avatar_url, cv_url || '']
    );
    res.send('Profile updated successfully!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Update Profile');
  }
});

// ------------------------------------------------------------
// 🎓 EDUCATION (timeline_entries, type = 'education')
// ------------------------------------------------------------
app.get('/api/education', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM timeline_entries WHERE type = 'education' ORDER BY display_order ASC, id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Education');
  }
});

app.post('/api/education', async (req, res) => {
  try {
    const { title, institution, years, description, is_featured } = req.body;
    const newEd = await pool.query(
      `INSERT INTO timeline_entries (type, title, institution, period, description, is_featured)
       VALUES ('education', $1, $2, $3, $4, $5) RETURNING *`,
      [title, institution, years, description || '', !!is_featured]
    );
    res.json(newEd.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Add Education');
  }
});

app.put('/api/education/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, institution, years, description, is_featured } = req.body;
    await pool.query(
      `UPDATE timeline_entries
       SET title = $1, institution = $2, period = $3, description = $4, is_featured = $5
       WHERE id = $6`,
      [title, institution, years, description || '', !!is_featured, id]
    );
    res.send('Education updated!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Update Education');
  }
});

app.delete('/api/education/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM timeline_entries WHERE id = $1', [id]);
    res.send('Education item deleted!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Delete Education');
  }
});

// ------------------------------------------------------------
// 💼 EXPERIENCE (timeline_entries, type = 'experience')
// ------------------------------------------------------------
app.get('/api/experiences', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM timeline_entries WHERE type = 'experience' ORDER BY display_order ASC, id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Experiences');
  }
});

app.post('/api/experiences', async (req, res) => {
  try {
    const { title, institution, years, description, is_featured } = req.body;
    const newExp = await pool.query(
      `INSERT INTO timeline_entries (type, title, institution, period, description, is_featured)
       VALUES ('experience', $1, $2, $3, $4, $5) RETURNING *`,
      [title, institution, years, description || '', !!is_featured]
    );
    res.json(newExp.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Add Experience');
  }
});

app.put('/api/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, institution, years, description, is_featured } = req.body;
    await pool.query(
      `UPDATE timeline_entries
       SET title = $1, institution = $2, period = $3, description = $4, is_featured = $5
       WHERE id = $6`,
      [title, institution, years, description || '', !!is_featured, id]
    );
    res.send('Experience updated!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Update Experience');
  }
});

app.delete('/api/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM timeline_entries WHERE id = $1', [id]);
    res.send('Experience deleted!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Delete Experience');
  }
});

// ------------------------------------------------------------
// 🔐 ADMIN LOGIN
// ------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Welcome back, Serena! 🌌' });
  } else {
    res.status(401).json({ success: false, message: 'Password salah, bestie! ⚠️' });
  }
});

// ------------------------------------------------------------
// 📈 ANALYTICS & LIVE VISITOR
// ------------------------------------------------------------
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const totalVisits = await pool.query('SELECT COUNT(*) FROM page_visits');
    const liveNow = await pool.query(
      "SELECT COUNT(*) FROM page_visits WHERE visited_at >= NOW() - INTERVAL '1 hour'"
    );
    const recentVisits = await pool.query(
      'SELECT id, visited_at FROM page_visits ORDER BY id DESC LIMIT 5'
    );

    res.json({
      totalVisits: parseInt(totalVisits.rows[0].count),
      liveNow: parseInt(liveNow.rows[0].count),
      notifications: recentVisits.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Analytics');
  }
});

// Dipanggil dari web utama tiap kali ada yang buka halaman,
// biar "Total Visits" & "Live Now" di dashboard ke-update beneran.
app.post('/api/track-visit', async (req, res) => {
  try {
    await pool.query('INSERT INTO page_visits DEFAULT VALUES');
    res.send('Visit tracked!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Track Visit');
  }
});

// Data kunjungan per jam selama 24 jam terakhir, buat chart "Live Visitor Report".
// Balikin array of 24 angka, urut dari jam paling lama ke jam paling baru.
app.get('/api/analytics/timeseries', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH hours AS (
        SELECT generate_series(
          date_trunc('hour', NOW()) - INTERVAL '23 hours',
          date_trunc('hour', NOW()),
          INTERVAL '1 hour'
        ) AS hour_bucket
      )
      SELECT
        hours.hour_bucket,
        COUNT(page_visits.id)::int AS visit_count
      FROM hours
      LEFT JOIN page_visits
        ON date_trunc('hour', page_visits.visited_at) = hours.hour_bucket
      GROUP BY hours.hour_bucket
      ORDER BY hours.hour_bucket ASC
    `);

    res.json(result.rows.map((row) => ({
      hour: row.hour_bucket,
      count: row.visit_count,
    })));
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Timeseries');
  }
});

// ------------------------------------------------------------
// ⚠️ ERROR HANDLER UPLOAD (file kebesaran / tipe gak didukung)
// Wajib ditaruh paling bawah, setelah semua route
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || (err.message && err.message.includes('Tipe file'))) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// ============================================================
// 4. JALANKAN SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan gokil di http://localhost:${PORT}`);
});