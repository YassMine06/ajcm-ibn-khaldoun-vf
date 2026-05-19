import fs from 'fs';

// Map categories to IDs
const categoryMap = {
  'Culture': 'cat-1',
  'Jeunesse': 'cat-2',
  'Formation': 'cat-3',
  'Événement': 'cat-4',
  'Art': 'cat-5',
  'Sport': 'cat-6',
  'Solidarité': 'cat-7',
  'Santé': 'cat-8',
  'Citoyenneté': 'cat-9',
  'Autre': 'cat-10'
};

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
  // Use Function to evaluate
  eventsData = new Function('return ' + eventsDataStr)();
} catch (e) {
  console.log("Eval failed", e);
  process.exit(1);
}

const updatedData = eventsData.map(evt => {
  const categoryId = categoryMap[evt.category] || 'cat-10';
  
  // Create new object without category and color
  const newEvt = { ...evt, categoryId };
  delete newEvt.category;
  delete newEvt.color;
  
  return newEvt;
});

const outputContent = `export const eventsData = ${JSON.stringify(updatedData, null, 2)};\n`;
fs.writeFileSync('src/assets/eventsData.js', outputContent, 'utf8');
console.log('eventsData.js updated successfully');
