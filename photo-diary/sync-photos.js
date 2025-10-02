#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const backendUploads = path.join(root, 'photo-diary', 'backend', 'uploads');
const backendMeta = path.join(root, 'photo-diary', 'backend', 'photo-metadata.json');
const staticDir = path.join(root, 'photo-diary');
const staticUploads = path.join(staticDir, 'uploads');
const photosJson = path.join(staticDir, 'photos.json');

function main() {
  fs.mkdirSync(staticUploads, { recursive: true });

  let metadata = {};
  if (fs.existsSync(backendMeta)) {
    try { metadata = JSON.parse(fs.readFileSync(backendMeta, 'utf8')); } catch { metadata = {}; }
  }

  const exts = ['.jpg','.jpeg','.png','.gif','.webp','.heic'];
  const files = fs.existsSync(backendUploads)
    ? fs.readdirSync(backendUploads).filter(n => {
        const p = path.join(backendUploads, n);
        return fs.statSync(p).isFile() && exts.some(e => n.toLowerCase().endsWith(e));
      }).sort()
    : [];

  const entries = [];
  for (const name of files) {
    const src = path.join(backendUploads, name);
    const dst = path.join(staticUploads, name);
    if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
    const m = metadata[name];
    const title = m && typeof m === 'object' ? (m.title || '') : '';
    entries.push({ filename: name, title });
  }

  fs.writeFileSync(photosJson, JSON.stringify(entries, null, 2));
  console.log(`Synced ${entries.length} photos.`);
}

main();


