import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Load data
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return res.json({ success: true, data: JSON.parse(data) });
    }
    return res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error reading database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save data & automatic backup
app.post('/api/data', (req, res) => {
  try {
    const payload = req.body;
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');

    // Create an automated rolling backup every time or on major changes
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUPS_DIR, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(payload, null, 2), 'utf-8');

    // Keep only last 10 backups
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length > 10) {
      files.slice(10).forEach(oldFile => {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, oldFile)); } catch (e) {}
      });
    }

    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List backups
app.get('/api/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(filename => {
        const stats = fs.statSync(path.join(BACKUPS_DIR, filename));
        return {
          filename,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, backups: files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Restore backup
app.post('/api/restore', (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Nom de fichier requis' });
    }
    const targetFile = path.join(BACKUPS_DIR, filename);
    if (!fs.existsSync(targetFile)) {
      return res.status(404).json({ success: false, error: 'Sauvegarde introuvable' });
    }
    const backupData = fs.readFileSync(targetFile, 'utf-8');
    fs.writeFileSync(DB_FILE, backupData, 'utf-8');

    res.json({ success: true, data: JSON.parse(backupData) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static frontend build if dist exists
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gestion Classe Backend Server running on http://localhost:${PORT}`);
});

