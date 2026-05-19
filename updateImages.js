import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('src/assets/eventsData.js', 'utf8');
const regex = /export const eventsData = (\[[\s\S]*\]);/;
const match = fileContent.match(regex);
if (!match) {
  console.log("Could not parse eventsData.js");
  process.exit(1);
}

const eventsDataStr = match[1];

let eventsData;
try {
  eventsData = new Function('return ' + eventsDataStr)();
} catch (e) {
  console.log("Eval failed", e);
  process.exit(1);
}

const baseDir = path.join(process.cwd(), 'public', 'Evenements');

const imgExts = ['.jpg', '.jpeg', '.png', '.webp'];
const vidExts = ['.mp4', '.webm', '.mov', '.avi'];
const allMediaExts = [...imgExts, ...vidExts];

function getMediaFromDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  
  const files = fs.readdirSync(dirPath).filter(f => !fs.statSync(path.join(dirPath, f)).isDirectory());
  
  let mediaFiles = files.filter(f => allMediaExts.includes(path.extname(f).toLowerCase()));
  
  // Find posters (start with "poster" case insensitive)
  let posters = mediaFiles.filter(f => /^poster/i.test(f));
  let others = mediaFiles.filter(f => !/^poster/i.test(f));
  
  // Sort
  posters.sort((a, b) => a.localeCompare(b));
  others.sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });
  
  return [...posters, ...others];
}

const updatedData = eventsData.map(evt => {
  const evtFolder = path.join(baseDir, evt.folder);
  let media = [];
  let subEvents = [];
  
  if (fs.existsSync(evtFolder)) {
    // 1. Root media
    media = getMediaFromDir(evtFolder);
    
    // 2. Sub-events (sub-directories)
    const items = fs.readdirSync(evtFolder);
    const subDirs = items.filter(item => fs.statSync(path.join(evtFolder, item)).isDirectory());
    
    subDirs.forEach(subDir => {
      const subDirPath = path.join(evtFolder, subDir);
      const subMedia = getMediaFromDir(subDirPath);
      if (subMedia.length > 0) {
        subEvents.push({
          name: subDir,
          folder: subDir,
          media: subMedia
        });
      }
    });
  } else {
    // Default poster if folder doesn't exist
    media.push('poster.jpg');
  }
  
  // We'll replace "images" with "media" to be more accurate
  const newEvt = { ...evt, media };
  if (subEvents.length > 0) {
    newEvt.subEvents = subEvents;
  }
  delete newEvt.images; // Clean up old property
  
  return newEvt;
});

const outputContent = `export const eventsData = ${JSON.stringify(updatedData, null, 2)};\n`;
fs.writeFileSync('src/assets/eventsData.js', outputContent, 'utf8');
console.log('eventsData.js updated successfully with media and subEvents arrays.');
