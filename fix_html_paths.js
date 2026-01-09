const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Fix relative paths in HTML files to use absolute paths
 * Changes ../path to /path for href and src attributes
 * Only affects HTML files in subdirectories that actually use relative paths
 */

function fixHtmlPaths() {
  const publicDir = path.join(__dirname, 'public');

  // Get list of files that actually contain relative paths
  const filesWithRelativePaths = execSync('findstr /s /m "\\.\\./" public\\*.html', { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim())
    .map(line => path.join(__dirname, line.trim()));

  console.log(`Found ${filesWithRelativePaths.length} HTML files with relative paths`);

  // Exclude main index files to be safe
  const excludePatterns = [
    'index.html',
    'index_sp.html',
    'index_english.html'
  ];

  const filesToFix = filesWithRelativePaths.filter(filePath => {
    const fileName = path.basename(filePath);
    return !excludePatterns.includes(fileName);
  });

  console.log(`Will fix ${filesToFix.length} HTML files (excluding main index files)`);

  let filesModified = 0;

  for (const filePath of filesToFix) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Count relative paths before fix
    const relativePathMatches = content.match(/(href|src)="(\.\.[^"]*)"/g) || [];
    const originalCount = relativePathMatches.length;

    // Replace relative paths in href and src attributes
    const fixedContent = content
      .replace(/(href|src)="(\.\.[^"]*)"/g, (match, attr, relativePath) => {
        // Remove the ../ and add /
        const absolutePath = relativePath.replace(/\.\.\//g, '/');
        return `${attr}="${absolutePath}"`;
      });

    // Count relative paths after fix
    const remainingMatches = fixedContent.match(/(href|src)="(\.\.[^"]*)"/g) || [];
    const remainingCount = remainingMatches.length;

    if (originalCount !== remainingCount) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      filesModified++;
      console.log(`Fixed: ${path.relative(publicDir, filePath)} (${originalCount} → ${remainingCount} relative paths)`);
    } else {
      console.log(`Skipped: ${path.relative(publicDir, filePath)} (no changes needed)`);
    }
  }

  console.log(`\n✅ Fixed ${filesModified} HTML files`);
  console.log('All relative paths (../) have been converted to absolute paths (/path)');
  console.log('Main index files were preserved unchanged');
}

// Run the fix
fixHtmlPaths();
