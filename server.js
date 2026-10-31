const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(PUBLIC_DIR));

// Pastikan folder data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper untuk membaca file JSON
function readJson(filename, defaultVal = {}) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf8');
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Gagal membaca ${filename}:`, e);
    return defaultVal;
  }
}

// Helper untuk menulis file JSON
function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. GET /api/data -> Ambil seluruh database, master data, dan konfigurasi
app.get('/api/data', (req, res) => {
  try {
    const database = readJson('database.json', { workers: [], dailyTrend: [], defectTimeSeries: [] });
    const master = readJson('master_lokal_mandor.json', []);
    const config = readJson('config.json', {});
    res.json({
      status: 'success',
      data: { database, master, config }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. POST /api/data -> Simpan pembaruan ke database lokal
app.post('/api/data', (req, res) => {
  try {
    const { database, master, config } = req.body;
    if (database) writeJson('database.json', database);
    if (master) writeJson('master_lokal_mandor.json', master);
    if (config) writeJson('config.json', config);

    res.json({
      status: 'success',
      message: 'Data berhasil disimpan ke database lokal Node.js',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. POST /api/sync/googlesheet -> Proxy simpan ke Google Apps Script Web App (menghindari CORS)
app.post('/api/sync/googlesheet', async (req, res) => {
  try {
    const { webAppUrl, data } = req.body;
    if (!webAppUrl) {
      return res.status(400).json({ status: 'error', message: 'webAppUrl diperlukan' });
    }

    const fetch = globalThis.fetch;
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error('Error saat sync ke Google Spreadsheet:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. GET /api/sync/googlesheet -> Proxy tarik data dari Google Apps Script Web App
app.get('/api/sync/googlesheet', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ status: 'error', message: 'Query parameter url diperlukan' });
    }

    const fetch = globalThis.fetch;
    const response = await fetch(targetUrl);
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error('Error saat fetch dari Google Spreadsheet:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Fallback route ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Node.js Production Defect Quality Dashboard Berjalan!`);
  console.log(`👉 Akses di browser: http://localhost:${PORT}`);
  console.log(`📁 Lokasi Folder: ${__dirname}`);
  console.log(`=======================================================`);
});
