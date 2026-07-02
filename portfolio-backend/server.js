const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const app = express();

// ============================================================
// 1. MIDDLEWARE
// ============================================================

// CORS — restrict ke domain frontend aja, gak boleh allow all di production
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Origin null untuk request dari Postman/curl/server-side — boleh
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
  })
);

app.use(express.json());

// Health check buat UptimeRobot biar Render gak sleep
app.get('/api/health', (req, res) => res.send('OK'));

// ============================================================
// 2. KONEKSI POSTGRESQL (Neon)
// ============================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon wajib SSL
});

pool.connect((err, client, release) => {
  if (err) return console.error('Error koneksi database:', err.stack);
  console.log('🎉 Sukses terkoneksi ke PostgreSQL Database!');
  release();
});

// ============================================================
// 3. CLOUDFLARE R2 (S3-compatible) — STORAGE GAMBAR
// ============================================================
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // misal https://pub-xxx.r2.dev

// Multer pakai memoryStorage (file ditahan di RAM sebentar sebelum di-upload ke R2)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'));
    }
  },
});

// Upload buffer (dari multer.memoryStorage) ke R2, return public URL
async function uploadToR2(file, folder) {
  const ext = path.extname(file.originalname);
  const key = `${folder}/${crypto.randomBytes(12).toString('hex')}${ext}`;
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

// Hapus file lama di R2 berdasarkan public URL
async function deleteFromR2(publicUrl) {
  if (!publicUrl || !publicUrl.startsWith(R2_PUBLIC_URL)) return;
  const key = publicUrl.replace(`${R2_PUBLIC_URL}/`, '');
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (err) {
    console.warn(`Gagal hapus dari R2 (skip): ${key}`, err.message);
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

// ============================================================
// 4. ROUTES
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

app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const {
      title, description, short_description, github_link, demo_link,
      tech_stack, category, role, year, status, features,
    } = req.body;
    const slug = slugify(title);
    let image_url = '';
    if (req.file) image_url = await uploadToR2(req.file, 'projects');
 
    const newProject = await pool.query(
      `INSERT INTO projects
        (title, slug, description, short_description, image_url, github_link, demo_link,
         tech_stack, category, role, year, status, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        title, slug, description, short_description || '', image_url,
        github_link || '', demo_link || '', tech_stack,
        category || '', role || '', year || '', status || 'Completed', features || '',
      ]
    );
    res.json(newProject.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menambah proyek');
  }
});

app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, short_description, github_link, demo_link,
      tech_stack, category, role, year, status, features,
    } = req.body;
 
    const existing = await pool.query('SELECT image_url FROM projects WHERE id = $1', [id]);
    let image_url = existing.rows[0]?.image_url || '';
 
    if (req.file) {
      await deleteFromR2(image_url);
      image_url = await uploadToR2(req.file, 'projects');
    }
 
    await pool.query(
      `UPDATE projects SET
        title = $1, description = $2, short_description = $3, image_url = $4,
        github_link = $5, demo_link = $6, tech_stack = $7,
        category = $8, role = $9, year = $10, status = $11, features = $12
       WHERE id = $13`,
      [
        title, description, short_description || '', image_url,
        github_link || '', demo_link || '', tech_stack,
        category || '', role || '', year || '', status || 'Completed', features || '',
        id,
      ]
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
    const existing = await pool.query('SELECT image_url FROM projects WHERE id = $1', [id]);
    if (existing.rows[0]?.image_url) await deleteFromR2(existing.rows[0].image_url);
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.send('Proyek berhasil dihapus!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menghapus proyek');
  }
});

// ------------------------------------------------------------
// 💻 SKILLS
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
    const { title, issuer, icon, year } = req.body;
    const newCert = await pool.query(
      'INSERT INTO certifications (title, issuer, icon, year) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, issuer, icon || '🏆', year || '']
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
    const { title, issuer, icon, year } = req.body;
    await pool.query(
      'UPDATE certifications SET title = $1, issuer = $2, icon = $3, year = $4 WHERE id = $5',
      [title, issuer, icon, year || '', id]
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
// 👤 PROFILE
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

app.put('/api/profile', upload.single('avatar'), async (req, res) => {
  try {
    const {
      full_name, current_role, bio, cv_url,
      focus, graduation_year, email, personal_note, hobbies,
    } = req.body;
    const existing = await pool.query('SELECT avatar_url FROM profile WHERE id = 1');
    let avatar_url = existing.rows[0]?.avatar_url || '';
 
    if (req.file) {
      await deleteFromR2(avatar_url);
      avatar_url = await uploadToR2(req.file, 'profile');
    }
 
    await pool.query(
      `UPDATE profile SET
        full_name = $1, "current_role" = $2, bio = $3, avatar_url = $4, cv_url = $5,
        focus = $6, graduation_year = $7, email = $8, personal_note = $9, hobbies = $10
       WHERE id = 1`,
      [
        full_name, current_role, bio, avatar_url, cv_url || '',
        focus || '', graduation_year || '', email || '', personal_note || '', hobbies || '',
      ]
    );
    res.send('Profile updated successfully!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Update Profile');
  }
});

// ------------------------------------------------------------
// 🎓 EDUCATION
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
      `UPDATE timeline_entries SET title = $1, institution = $2, period = $3, description = $4, is_featured = $5 WHERE id = $6`,
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
// 💼 EXPERIENCE
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
      `UPDATE timeline_entries SET title = $1, institution = $2, period = $3, description = $4, is_featured = $5 WHERE id = $6`,
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
// 📈 ANALYTICS
// ------------------------------------------------------------
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const [totalVisits, thisWeek, projectViews, projectsCount, topProjects, recent] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM page_visits'),
      pool.query(`SELECT COUNT(*) FROM page_visits WHERE visited_at >= NOW() - INTERVAL '7 days'`),
      pool.query('SELECT COALESCE(SUM(views), 0) AS total FROM projects'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT id, title, views FROM projects ORDER BY views DESC NULLS LAST LIMIT 4'),
      pool.query('SELECT id, visited_at FROM page_visits ORDER BY id DESC LIMIT 5'),
    ]);
 
    res.json({
      totalVisits: parseInt(totalVisits.rows[0].count),
      thisWeek: parseInt(thisWeek.rows[0].count),
      projectViews: parseInt(projectViews.rows[0].total),
      projectsCount: parseInt(projectsCount.rows[0].count),
      topProjects: topProjects.rows,
      notifications: recent.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Analytics');
  }
});

app.post('/api/track-visit', async (req, res) => {
  try {
    await pool.query('INSERT INTO page_visits DEFAULT VALUES');
    res.send('Visit tracked!');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Track Visit');
  }
});

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
      SELECT hours.hour_bucket, COUNT(page_visits.id)::int AS visit_count
      FROM hours
      LEFT JOIN page_visits ON date_trunc('hour', page_visits.visited_at) = hours.hour_bucket
      GROUP BY hours.hour_bucket
      ORDER BY hours.hour_bucket ASC
    `);
    res.json(result.rows.map((row) => ({ hour: row.hour_bucket, count: row.visit_count })));
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Timeseries');
  }
});

app.get('/api/analytics/daily-visits', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH days AS (
        SELECT generate_series(
          date_trunc('day', NOW()) - INTERVAL '13 days',
          date_trunc('day', NOW()),
          INTERVAL '1 day'
        ) AS day_bucket
      )
      SELECT
        days.day_bucket,
        COUNT(page_visits.id)::int AS visit_count
      FROM days
      LEFT JOIN page_visits ON date_trunc('day', page_visits.visited_at) = days.day_bucket
      GROUP BY days.day_bucket
      ORDER BY days.day_bucket ASC
    `);
    res.json(result.rows.map((row) => ({ day: row.day_bucket, count: row.visit_count })));
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error Daily Visits');
  }
});

app.post('/api/projects/:slug/track-view', async (req, res) => {
  try {
    const { slug } = req.params;
    await pool.query('UPDATE projects SET views = COALESCE(views, 0) + 1 WHERE slug = $1', [slug]);
    res.send('View tracked');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Track view error');
  }
});

// ------------------------------------------------------------
// ⚠️ ERROR HANDLER UPLOAD
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || (err.message && err.message.includes('Tipe file'))) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// ============================================================
// 5. JALANKAN SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di port ${PORT}`);
});