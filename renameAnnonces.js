import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const annoncesDir = path.join(__dirname, 'public', 'Annonces');

const items = fs.readdirSync(annoncesDir);

// First pass: rename to temporary names
const tempItems = items.map(item => {
  const oldPath = path.join(annoncesDir, item);
  const match = item.match(/^(\d+)(\..+)?$/);
  if (match) {
    const num = parseInt(match[1], 10);
    const ext = match[2] || '';
    const tempName = `temp_${num}${ext}`;
    const newPath = path.join(annoncesDir, tempName);
    fs.renameSync(oldPath, newPath);
    return { num, ext, tempName };
  }
  return null;
}).filter(x => x);

// Second pass: rename to new names
tempItems.forEach(({ num, ext, tempName }) => {
  const newNum = 73 - num;
  const newName = `${newNum}${ext}`;
  const oldPath = path.join(annoncesDir, tempName);
  const newPath = path.join(annoncesDir, newName);
  fs.renameSync(oldPath, newPath);
});

console.log('Renaming done.');
