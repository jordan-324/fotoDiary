const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists at startup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safeOriginal}`);
  },
});
const upload = multer({ storage });

// Serve static assets
const publicDir = path.join(__dirname, 'public');
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(publicDir));

// Simple health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Explicit routes for public HTML files (in case static middleware is bypassed)
app.get('/', (_req, res) => {
  res.redirect('/upload.html');
});
app.get('/upload.html', (_req, res) => {
  res.sendFile(path.join(publicDir, 'upload.html'));
});
app.get('/viewer.html', (_req, res) => {
  res.sendFile(path.join(publicDir, 'viewer.html'));
});

// Upload endpoint (expects field name 'file')
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'Upload successful',
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

// List uploaded files
app.get('/list', (_req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read uploads directory' });
    }
    const sorted = files
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
    res.json({ files: sorted });
  });
});

app.listen(PORT, () => {
  console.log(`Photo Diary server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/upload.html to upload photos.`);
  console.log(`Open http://localhost:${PORT}/viewer.html to view uploads.`);
});


