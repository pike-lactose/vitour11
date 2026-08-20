const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');               // ← replaced mysql2 with pg
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const crypto = require('crypto');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');

require('dotenv').config();

const isStorageConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

let _supabaseStorage = null;
function getSupabaseStorage() {
  if (!_supabaseStorage && isStorageConfigured()) {
    _supabaseStorage = createSupabaseClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabaseStorage;
}
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'vitour';

// PostgreSQL connection pool using Supabase Session Pooler
const dbPool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL, // from .env
  ssl: { rejectUnauthorized: false }                   // required by Supabase
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/:filename', (req, res, next) => {
  if (!isStorageConfigured()) return next();
  const { filename } = req.params;
  if (/(^|\/)\.\.|\.\.(\/|$)/.test(filename)) return res.status(400).json({ error: 'Invalid filename' });
  res.redirect(302, storagePublicUrl(encodeURIComponent(filename)));
});

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'vitour-secret-key-2024-change-in-production'],
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
}));

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

function generateFilename(file) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  return uniqueSuffix + path.extname(file.originalname);
}

function storagePublicUrl(filename) {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
}

async function uploadToStorage(filename, buffer, contentType) {
  if (!isStorageConfigured()) {
    // Fallback: write to local disk so local dev still works without storage keys
    const dest = path.join(__dirname, 'uploads', filename);
    fs.writeFileSync(dest, buffer);
    return;
  }
  const { error } = await getSupabaseStorage().storage
    .from(STORAGE_BUCKET)
    .upload(filename, buffer, { contentType, upsert: true });
  if (error) throw error;
}

async function deleteFromStorage(filename) {
  if (!filename) return;
  if (!isStorageConfigured()) {
    const dest = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    return;
  }
  const { error } = await getSupabaseStorage().storage.from(STORAGE_BUCKET).remove([filename]);
  if (error) console.warn('Storage delete warning:', error.message);
}

// ------------------ Database Initialization (PostgreSQL) ------------------
async function initDatabase() {
  // 1. Ensure vitour schema exists
  await dbPool.query('CREATE SCHEMA IF NOT EXISTS vitour');

  // 2. Create tables inside vitour schema (IF NOT EXISTS)
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS vitour.users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS vitour.scenes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      description TEXT,
      created_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      updated_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS vitour.hotspots (
      id SERIAL PRIMARY KEY,
      scene_id INT NOT NULL REFERENCES vitour.scenes(id) ON DELETE CASCADE,
      pitch FLOAT NOT NULL,
      yaw FLOAT NOT NULL,
      text VARCHAR(255),
      description TEXT,
      target_scene_id INT REFERENCES vitour.scenes(id) ON DELETE SET NULL,
      created_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      updated_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS vitour.denah (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      description TEXT,
      created_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      updated_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS vitour.denah_spheres (
      id SERIAL PRIMARY KEY,
      denah_id INT NOT NULL REFERENCES vitour.denah(id) ON DELETE CASCADE,
      x FLOAT NOT NULL,
      y FLOAT NOT NULL,
      text VARCHAR(255),
      target_denah_id INT REFERENCES vitour.denah(id) ON DELETE SET NULL,
      created_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      updated_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS vitour.floor_plan (
      id SERIAL PRIMARY KEY,
      image_path VARCHAR(500) NOT NULL,
      updated_by INT REFERENCES vitour.users(id) ON DELETE SET NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add any missing columns (equivalent to your previous ALTER attempts)
  try {
    await dbPool.query('ALTER TABLE vitour.scenes ADD COLUMN IF NOT EXISTS created_by INT REFERENCES vitour.users(id) ON DELETE SET NULL');
    await dbPool.query('ALTER TABLE vitour.scenes ADD COLUMN IF NOT EXISTS updated_by INT REFERENCES vitour.users(id) ON DELETE SET NULL');
    await dbPool.query('ALTER TABLE vitour.scenes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  } catch (e) { console.warn('scenes migration note:', e.message); }

  try {
    await dbPool.query('ALTER TABLE vitour.hotspots ADD COLUMN IF NOT EXISTS created_by INT REFERENCES vitour.users(id) ON DELETE SET NULL');
    await dbPool.query('ALTER TABLE vitour.hotspots ADD COLUMN IF NOT EXISTS updated_by INT REFERENCES vitour.users(id) ON DELETE SET NULL');
    await dbPool.query('ALTER TABLE vitour.hotspots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  } catch (e) { console.warn('hotspots migration note:', e.message); }

  // 3. Create default super admin if no users exist
  const { rows } = await dbPool.query('SELECT COUNT(*) as count FROM vitour.users');
  if (parseInt(rows[0].count) === 0) {
    const defaultPassword = await bcrypt.hash('admin123', 10);
    await dbPool.query(
      'INSERT INTO vitour.users (username, password_hash, role) VALUES ($1, $2, $3)',
      ['admin', defaultPassword, 'super_admin']
    );
    console.log('Default super admin created: username=admin, password=admin123');
  }

  // 4. Quick test query
  const test = await dbPool.query('SELECT COUNT(*) FROM vitour.scenes');
  console.log(`Database ready – scenes in vitour: ${test.rows[0].count}`);
}

// ------------------ API Routes (unchanged logic, PG syntax) ------------------

app.get('/api/scenes', async (req, res) => {
  try {
    const { rows: scenes } = await dbPool.query('SELECT * FROM vitour.scenes ORDER BY id');
    const { rows: hotspots } = await dbPool.query('SELECT * FROM vitour.hotspots');

    if (scenes.length === 0) {
      return res.json({ default: { firstScene: '', autoLoad: false }, scenes: {} });
    }

    const scenesObj = {};
    scenes.forEach(scene => {
      const sceneHotspots = hotspots
        .filter(h => h.scene_id === scene.id)
        .map(h => {
          const targetScene = scenes.find(s => s.id === h.target_scene_id);
          return {
            pitch: h.pitch,
            yaw: h.yaw,
            type: 'scene',
            text: h.text || '',
            description: h.description || '',
            sceneId: h.target_scene_id,
            sceneName: targetScene ? targetScene.name : ''
          };
        });

      scenesObj[scene.name] = {
        type: 'equirectangular',
        panorama: `/uploads/${path.basename(scene.image_path)}`,
        title: scene.name,
        description: scene.description || '',
        hotSpots: sceneHotspots
      };
    });

    res.json({
      default: {
        firstScene: scenes[0].name,
        autoLoad: true
      },
      scenes: scenesObj
    });
  } catch (error) {
    console.error('Error fetching scenes:', error);
    res.status(500).json({ error: 'Failed to fetch scenes' });
  }
});

app.get('/api/scenes/list', async (req, res) => {
  try {
    const { rows } = await dbPool.query(`
      SELECT s.*, cu.username as created_by_name, uu.username as updated_by_name
      FROM vitour.scenes s
      LEFT JOIN vitour.users cu ON s.created_by = cu.id
      LEFT JOIN vitour.users uu ON s.updated_by = uu.id
      ORDER BY s.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching scenes:', error);
    res.status(500).json({ error: 'Failed to fetch scenes' });
  }
});

app.post('/api/scenes', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Scene name is required' });
    }

    const imagePath = generateFilename(req.file);
    await uploadToStorage(imagePath, req.file.buffer, req.file.mimetype);
    const { rows } = await dbPool.query(
      `INSERT INTO vitour.scenes (name, image_path, description, created_by, updated_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
      [name, imagePath, description || '', req.session?.userId || null, req.session?.userId || null]
    );

    res.json({
      id: rows[0].id,
      name,
      image_path: imagePath,
      description: description || ''
    });
  } catch (error) {
    console.error('Error creating scene:', error);
    res.status(500).json({ error: 'Failed to create scene' });
  }
});

app.put('/api/scenes/:id', async (req, res) => {
  console.log('PUT /api/scenes/:id called with:', req.params, req.body);
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (description !== undefined) {
      await dbPool.query(
        `UPDATE vitour.scenes SET name = $1, description = $2, updated_by = $3, updated_at = NOW() WHERE id = $4`,
        [name || '', description || '', req.session?.userId || null, id]
      );
    } else {
      await dbPool.query(
        `UPDATE vitour.scenes SET name = $1, updated_by = $2, updated_at = NOW() WHERE id = $3`,
        [name || '', req.session?.userId || null, id]
      );
    }

    res.json({ message: 'Scene updated successfully' });
  } catch (error) {
    console.error('Error updating scene:', error);
    res.status(500).json({ error: 'Failed to update scene: ' + error.message });
  }
});

app.delete('/api/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: sceneRows } = await dbPool.query('SELECT image_path FROM vitour.scenes WHERE id = $1', [id]);
    if (sceneRows.length > 0) {
      await deleteFromStorage(sceneRows[0].image_path);
    }

    await dbPool.query('DELETE FROM vitour.hotspots WHERE scene_id = $1 OR target_scene_id = $1', [id]);
    await dbPool.query('DELETE FROM vitour.scenes WHERE id = $1', [id]);

    res.json({ message: 'Scene deleted successfully' });
  } catch (error) {
    console.error('Error deleting scene:', error);
    res.status(500).json({ error: 'Failed to delete scene' });
  }
});

app.get('/api/hotspots', async (req, res) => {
  try {
    const { sceneId } = req.query;
    let query = `
      SELECT h.*, s.name as scene_name, ts.name as target_scene_name,
             cu.username as created_by_name, uu.username as updated_by_name
      FROM vitour.hotspots h
      LEFT JOIN vitour.scenes s ON h.scene_id = s.id
      LEFT JOIN vitour.scenes ts ON h.target_scene_id = ts.id
      LEFT JOIN vitour.users cu ON h.created_by = cu.id
      LEFT JOIN vitour.users uu ON h.updated_by = uu.id
    `;

    const params = [];
    if (sceneId) {
      query += ' WHERE h.scene_id = $1';
      params.push(sceneId);
    }

    query += ' ORDER BY h.id';
    const { rows } = await dbPool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    res.status(500).json({ error: 'Failed to fetch hotspots' });
  }
});

app.post('/api/hotspots', async (req, res) => {
  try {
    const { scene_id, pitch, yaw, text, description, target_scene_id } = req.body;

    if (scene_id === undefined || pitch === undefined || yaw === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { rows } = await dbPool.query(
      `INSERT INTO vitour.hotspots (scene_id, pitch, yaw, text, description, target_scene_id, created_by, updated_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [scene_id, pitch, yaw, text || '', description || '', target_scene_id || null, req.session?.userId || null, req.session?.userId || null]
    );

    res.json({
      id: rows[0].id,
      scene_id,
      pitch,
      yaw,
      text: text || '',
      description: description || '',
      target_scene_id: target_scene_id || null
    });
  } catch (error) {
    console.error('Error creating hotspot:', error);
    res.status(500).json({ error: 'Failed to create hotspot' });
  }
});

app.put('/api/hotspots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pitch, yaw, text, description, target_scene_id } = req.body;

    await dbPool.query(
      `UPDATE vitour.hotspots SET pitch = $1, yaw = $2, text = $3, description = $4, target_scene_id = $5, updated_by = $6, updated_at = NOW() WHERE id = $7`,
      [pitch, yaw, text || '', description || '', target_scene_id || null, req.session?.userId || null, id]
    );

    res.json({ message: 'Hotspot updated successfully' });
  } catch (error) {
    console.error('Error updating hotspot:', error);
    res.status(500).json({ error: 'Failed to update hotspot' });
  }
});

app.delete('/api/hotspots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbPool.query('DELETE FROM vitour.hotspots WHERE id = $1', [id]);
    res.json({ message: 'Hotspot deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotspot:', error);
    res.status(500).json({ error: 'Failed to delete hotspot' });
  }
});

// ---------- DENAH ----------
app.get('/api/denah', async (req, res) => {
  try {
    const { rows } = await dbPool.query(`
      SELECT d.*, cu.username as created_by_name, uu.username as updated_by_name
      FROM vitour.denah d
      LEFT JOIN vitour.users cu ON d.created_by = cu.id
      LEFT JOIN vitour.users uu ON d.updated_by = uu.id
      ORDER BY d.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching denah:', error);
    res.status(500).json({ error: 'Failed to fetch denah' });
  }
});

app.post('/api/denah', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Denah name is required' });

    const imagePath = generateFilename(req.file);
    await uploadToStorage(imagePath, req.file.buffer, req.file.mimetype);
    const { rows } = await dbPool.query(
      `INSERT INTO vitour.denah (name, image_path, description, created_by, updated_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
      [name, imagePath, description || '', req.session?.userId || null, req.session?.userId || null]
    );
    res.json({ id: rows[0].id, name, image_path: imagePath, description: description || '' });
  } catch (error) {
    console.error('Error creating denah:', error);
    res.status(500).json({ error: 'Failed to create denah' });
  }
});

app.put('/api/denah/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (req.file) {
      const { rows: existing } = await dbPool.query('SELECT image_path FROM vitour.denah WHERE id = $1', [id]);
      if (existing.length > 0) {
        await deleteFromStorage(existing[0].image_path);
      }
      const newImagePath = generateFilename(req.file);
      await uploadToStorage(newImagePath, req.file.buffer, req.file.mimetype);
      await dbPool.query(
        `UPDATE vitour.denah SET name = $1, description = $2, image_path = $3, updated_by = $4, updated_at = NOW() WHERE id = $5`,
        [name || '', description || '', newImagePath, req.session?.userId || null, id]
      );
    } else {
      await dbPool.query(
        `UPDATE vitour.denah SET name = $1, description = $2, updated_by = $3, updated_at = NOW() WHERE id = $4`,
        [name || '', description || '', req.session?.userId || null, id]
      );
    }
    res.json({ message: 'Denah updated successfully' });
  } catch (error) {
    console.error('Error updating denah:', error);
    res.status(500).json({ error: 'Failed to update denah' });
  }
});

app.delete('/api/denah/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await dbPool.query('SELECT image_path FROM vitour.denah WHERE id = $1', [id]);
    if (rows.length > 0) {
      await deleteFromStorage(rows[0].image_path);
    }
    await dbPool.query('DELETE FROM vitour.denah_spheres WHERE denah_id = $1 OR target_denah_id = $1', [id]);
    await dbPool.query('DELETE FROM vitour.denah WHERE id = $1', [id]);
    res.json({ message: 'Denah deleted successfully' });
  } catch (error) {
    console.error('Error deleting denah:', error);
    res.status(500).json({ error: 'Failed to delete denah' });
  }
});

// ---------- FLOOR PLAN ----------
app.get('/api/floorplan', async (req, res) => {
  try {
    const { rows } = await dbPool.query('SELECT * FROM vitour.floor_plan ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) return res.json({ image_path: null });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching floor plan:', error);
    res.status(500).json({ error: 'Failed to fetch floor plan' });
  }
});

app.post('/api/floorplan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const imagePath = generateFilename(req.file);
    await uploadToStorage(imagePath, req.file.buffer, req.file.mimetype);

    const { rows: existing } = await dbPool.query('SELECT * FROM vitour.floor_plan ORDER BY id DESC LIMIT 1');
    if (existing.length > 0) {
      await deleteFromStorage(existing[0].image_path);
      await dbPool.query(
        `UPDATE vitour.floor_plan SET image_path = $1, updated_by = $2, updated_at = NOW() WHERE id = $3`,
        [imagePath, req.session?.userId || null, existing[0].id]
      );
    } else {
      await dbPool.query(
        `INSERT INTO vitour.floor_plan (image_path, updated_by) VALUES ($1, $2)`,
        [imagePath, req.session?.userId || null]
      );
    }
    res.json({ image_path: imagePath });
  } catch (error) {
    console.error('Error saving floor plan:', error);
    res.status(500).json({ error: 'Failed to save floor plan' });
  }
});

// ---------- DENAH SPHERES ----------
app.get('/api/denah-spheres', async (req, res) => {
  try {
    const { rows } = await dbPool.query(`
      SELECT ds.*, d.name as denah_name, td.name as target_denah_name,
             cu.username as created_by_name, uu.username as updated_by_name
      FROM vitour.denah_spheres ds
      LEFT JOIN vitour.denah d ON ds.denah_id = d.id
      LEFT JOIN vitour.denah td ON ds.target_denah_id = td.id
      LEFT JOIN vitour.users cu ON ds.created_by = cu.id
      LEFT JOIN vitour.users uu ON ds.updated_by = uu.id
      ORDER BY ds.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching denah spheres:', error);
    res.status(500).json({ error: 'Failed to fetch denah spheres' });
  }
});

app.post('/api/denah-spheres', async (req, res) => {
  try {
    const { denah_id, x, y, text, target_denah_id } = req.body;
    if (denah_id === undefined || x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { rows } = await dbPool.query(
      `INSERT INTO vitour.denah_spheres (denah_id, x, y, text, target_denah_id, created_by, updated_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
      [denah_id, x, y, text || '', target_denah_id || null, req.session?.userId || null, req.session?.userId || null]
    );
    res.json({ id: rows[0].id, denah_id, x, y, text: text || '', target_denah_id: target_denah_id || null });
  } catch (error) {
    console.error('Error creating denah sphere:', error);
    res.status(500).json({ error: 'Failed to create denah sphere' });
  }
});

app.put('/api/denah-spheres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { x, y, text, target_denah_id } = req.body;
    await dbPool.query(
      `UPDATE vitour.denah_spheres SET x = $1, y = $2, text = $3, target_denah_id = $4, updated_by = $5, updated_at = NOW() WHERE id = $6`,
      [x, y, text || '', target_denah_id || null, req.session?.userId || null, id]
    );
    res.json({ message: 'Denah sphere updated successfully' });
  } catch (error) {
    console.error('Error updating denah sphere:', error);
    res.status(500).json({ error: 'Failed to update denah sphere' });
  }
});

app.delete('/api/denah-spheres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbPool.query('DELETE FROM vitour.denah_spheres WHERE id = $1', [id]);
    res.json({ message: 'Denah sphere deleted successfully' });
  } catch (error) {
    console.error('Error deleting denah sphere:', error);
    res.status(500).json({ error: 'Failed to delete denah sphere' });
  }
});

// ---------- AUTH ----------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { rows } = await dbPool.query('SELECT * FROM vitour.users WHERE username = $1', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session = null;
  res.clearCookie('session');
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

function requireSuperAdmin(req, res, next) {
  if (req.session && req.session.role === 'super_admin') return next();
  res.status(403).json({ error: 'Akses ditolak. Hanya super admin yang dapat mengelola user.' });
}

// ---------- ACTIVITY LOG (PostgreSQL version with ||) ----------
app.get('/api/activity-log', requireSuperAdmin, async (req, res) => {
  try {
    const { rows } = await dbPool.query(`
      SELECT 'scene_created' as action, s.name as item_name, s.id as item_id,
             u.username as actor, s.updated_at as action_time, s.description
      FROM vitour.scenes s JOIN vitour.users u ON s.created_by = u.id
      UNION ALL
      SELECT 'scene_updated' as action, s.name as item_name, s.id as item_id,
             u.username as actor, s.updated_at as action_time, s.description
      FROM vitour.scenes s JOIN vitour.users u ON s.updated_by = u.id
      WHERE s.created_at != s.updated_at
      UNION ALL
      SELECT 'hotspot_created' as action, 'Hotspot pada ' || s.name as item_name, h.id as item_id,
             u.username as actor, h.updated_at as action_time, h.description
      FROM vitour.hotspots h JOIN vitour.scenes s ON h.scene_id = s.id JOIN vitour.users u ON h.created_by = u.id
      UNION ALL
      SELECT 'hotspot_updated' as action, 'Hotspot pada ' || s.name as item_name, h.id as item_id,
             u.username as actor, h.updated_at as action_time, h.description
      FROM vitour.hotspots h JOIN vitour.scenes s ON h.scene_id = s.id JOIN vitour.users u ON h.updated_by = u.id
      WHERE h.created_at != h.updated_at
      UNION ALL
      SELECT 'denah_created' as action, d.name as item_name, d.id as item_id,
             u.username as actor, d.updated_at as action_time, d.description
      FROM vitour.denah d JOIN vitour.users u ON d.created_by = u.id
      UNION ALL
      SELECT 'denah_updated' as action, d.name as item_name, d.id as item_id,
             u.username as actor, d.updated_at as action_time, d.description
      FROM vitour.denah d JOIN vitour.users u ON d.updated_by = u.id
      WHERE d.created_at != d.updated_at
      ORDER BY action_time DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// ---------- USERS MANAGEMENT ----------
app.get('/api/users', requireSuperAdmin, async (req, res) => {
  try {
    const { rows } = await dbPool.query('SELECT id, username, role, created_at FROM vitour.users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.post('/api/users', requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { rows: existing } = await dbPool.query('SELECT id FROM vitour.users WHERE username = $1', [username]);
    if (existing.length > 0) return res.status(409).json({ error: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows: newUser } = await dbPool.query(
      `INSERT INTO vitour.users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
      [username, passwordHash, role || 'admin']
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser[0].id, username, role: role || 'admin' }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.session.userId) return res.status(403).json({ error: 'Cannot delete your own account' });

    const { rowCount } = await dbPool.query('DELETE FROM vitour.users WHERE id = $1', [userId]);
    if (rowCount === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.put('/api/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { password, role } = req.body;

    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      const passwordHash = await bcrypt.hash(password, 10);
      await dbPool.query('UPDATE vitour.users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    }
    if (role) {
      await dbPool.query('UPDATE vitour.users SET role = $1 WHERE id = $2', [role, userId]);
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ---------- Error handling ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ---------- Start server ----------
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});