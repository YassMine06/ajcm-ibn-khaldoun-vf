import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const annoncesDir = path.join(__dirname, 'public', 'Annonces');
const outputFilePath = path.join(__dirname, 'src', 'assets', 'annoncesData.js');

try {
  const items = fs.readdirSync(annoncesDir);
  let annonces = [];

  items.forEach(item => {
    const itemPath = path.join(annoncesDir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // It's a directory like "8", "21"
      const subItems = fs.readdirSync(itemPath);
      const txtFile = subItems.find(f => f.endsWith('.txt'));
      const imgFile = subItems.find(f => f.match(/\.(jpg|jpeg|png|webp)$/i));

      let text = '';
      if (txtFile) {
        text = fs.readFileSync(path.join(itemPath, txtFile), 'utf8');
      }

      if (imgFile) {
        annonces.push({
          id: item, // e.g. "8"
          image: `Annonces/${item}/${imgFile}`,
          text: text.trim()
        });
      }
    } else if (item.match(/\.(jpg|jpeg|png|webp)$/i)) {
      // It's a direct image file like "1.jpg"
      const id = item.split('.')[0];
      annonces.push({
        id: id,
        image: `Annonces/${item}`,
        text: '' // No text available
      });
    }
  });

  // Sort by ID descending (newest first)
  annonces.sort((a, b) => {
    const numA = parseInt(a.id, 10);
    const numB = parseInt(b.id, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numB - numA; // Descending
    }
    return b.id.localeCompare(a.id);
  });

  // Write to src/assets/annoncesData.js
  const fileContent = `export const annoncesData = ${JSON.stringify(annonces, null, 2)};\n`;
  fs.writeFileSync(outputFilePath, fileContent, 'utf8');
  console.log(`Successfully generated annoncesData.js with ${annonces.length} items.`);

} catch (err) {
  console.error("Error generating annoncesData.js:", err);
}
