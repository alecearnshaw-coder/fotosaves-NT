// Script to standardize date padding in species JSON files
const fs = require('fs');
const path = require('path');

const speciesDir = path.join(__dirname, '..', 'src', 'data', 'species');

// Function to pad a date string
function padDate(dateStr) {
  if (!dateStr || dateStr.startsWith('c.')) {
    // Skip circa dates
    return dateStr;
  }
  
  // Match full date: D-M-YYYY or DD-M-YYYY or D-MM-YYYY or DD-MM-YYYY
  const fullDateMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (fullDateMatch) {
    const day = fullDateMatch[1].padStart(2, '0');
    const month = fullDateMatch[2].padStart(2, '0');
    const year = fullDateMatch[3];
    return `${day}-${month}-${year}`;
  }
  
  // Match month-year: M-YYYY or MM-YYYY
  const monthYearMatch = dateStr.match(/^(\d{1,2})-(\d{4})$/);
  if (monthYearMatch) {
    const month = monthYearMatch[1].padStart(2, '0');
    const year = monthYearMatch[2];
    return `${month}-${year}`;
  }
  
  // Return unchanged if no match
  return dateStr;
}

// Function to pad date in Location_Date field (date is after " - ")
function padLocationDate(locDateStr) {
  if (!locDateStr) return locDateStr;
  
  // Find the last " - " which separates location from date
  const lastDashIndex = locDateStr.lastIndexOf(' - ');
  if (lastDashIndex === -1) return locDateStr;
  
  const location = locDateStr.substring(0, lastDashIndex);
  const datePart = locDateStr.substring(lastDashIndex + 3);
  
  const paddedDate = padDate(datePart);
  return `${location} - ${paddedDate}`;
}

// Process all JSON files
let totalFiles = 0;
let modifiedFiles = 0;
let totalChanges = 0;

const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(speciesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  let fileModified = false;
  let fileChanges = 0;
  
  // Process data array
  if (data.data && Array.isArray(data.data)) {
    for (const photo of data.data) {
      // Process Date field
      if (photo.Date) {
        const padded = padDate(photo.Date);
        if (padded !== photo.Date) {
          photo.Date = padded;
          fileModified = true;
          fileChanges++;
        }
      }
      
      // Process Location_Date field
      if (photo.Location_Date) {
        const padded = padLocationDate(photo.Location_Date);
        if (padded !== photo.Location_Date) {
          photo.Location_Date = padded;
          fileModified = true;
          fileChanges++;
        }
      }
    }
  }
  
  totalFiles++;
  
  if (fileModified) {
    // Write back with same formatting (2-space indent)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    modifiedFiles++;
    totalChanges += fileChanges;
  }
}

console.log(`\nDate Padding Complete!`);
console.log(`=======================`);
console.log(`Files scanned: ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
console.log(`Total changes: ${totalChanges}`);

