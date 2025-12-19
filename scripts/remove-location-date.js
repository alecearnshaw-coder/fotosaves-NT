// Script to remove Location_Date field from species JSON files
const fs = require('fs');
const path = require('path');

const speciesDir = path.join(__dirname, '..', 'src', 'data', 'species');

let totalFiles = 0;
let modifiedFiles = 0;
let totalRemovals = 0;

const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(speciesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  let fileModified = false;
  let fileRemovals = 0;
  
  // Process data array
  if (data.data && Array.isArray(data.data)) {
    for (const item of data.data) {
      if ('Location_Date' in item) {
        delete item.Location_Date;
        fileModified = true;
        fileRemovals++;
      }
    }
  }
  
  // Also remove from metadata columns array if present
  if (data.metadata && Array.isArray(data.metadata.columns)) {
    const idx = data.metadata.columns.indexOf('Location_Date');
    if (idx !== -1) {
      data.metadata.columns.splice(idx, 1);
      fileModified = true;
    }
  }
  
  totalFiles++;
  
  if (fileModified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    modifiedFiles++;
    totalRemovals += fileRemovals;
  }
}

console.log(`\nLocation_Date Removal Complete!`);
console.log(`================================`);
console.log(`Files scanned: ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
console.log(`Total fields removed: ${totalRemovals}`);

