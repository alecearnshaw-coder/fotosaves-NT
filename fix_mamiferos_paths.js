const fs = require('fs');
const path = require('path');

/**
 * Fix relative paths in FotosMamiferos HTML files
 * Changes /path to ../path since files are served from subdirectory
 */

function fixMamiferosPaths() {
  const mamiferosDir = path.join(__dirname, 'public', 'FotosMamiferos');

  // Get all HTML files in FotosMamiferos directory
  const htmlFiles = fs.readdirSync(mamiferosDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(mamiferosDir, file));

  console.log(`Found ${htmlFiles.length} HTML files in FotosMamiferos to fix`);

  let filesModified = 0;

  for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace absolute paths with relative paths that go up one directory
    // Changes /path to ../path for href and src attributes
    const fixedContent = content
      .replace(/(href|src)="\/([^"]*)"/g, (match, attr, relativePath) => {
        return `${attr}="../${relativePath}"`;
      });

    if (fixedContent !== originalContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      filesModified++;
      console.log(`Fixed: ${path.basename(filePath)}`);
    } else {
      console.log(`No changes needed: ${path.basename(filePath)}`);
    }
  }

  console.log(`\n✅ Fixed ${filesModified} HTML files in FotosMamiferos`);
  console.log('Changed /path to ../path for correct relative paths from subdirectory');
}

// Run the fix
fixMamiferosPaths();






