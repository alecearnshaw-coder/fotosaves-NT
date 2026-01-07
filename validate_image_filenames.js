const fs = require('fs');
const path = require('path');

/**
 * Validates that thumbnail filenames starting with "A_" and ending with "_600.jpg"
 * have corresponding large filenames ending with "_1200.jpg"
 */

function validateImageFilenames() {
  const speciesDir = path.join(__dirname, 'src', 'data', 'species');
  const mismatches = [];

  try {
    // Get all SP_xxxx.json files
    const files = fs.readdirSync(speciesDir)
      .filter(file => file.startsWith('SP_') && file.endsWith('.json'))
      .sort();

    console.log(`Found ${files.length} species JSON files to check\n`);

    for (const file of files) {
      const filePath = path.join(speciesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);

      if (!jsonData.data || !Array.isArray(jsonData.data)) {
        console.log(`Warning: ${file} has no valid data array`);
        continue;
      }

      // Check each image record
      jsonData.data.forEach((record, index) => {
        const thumbnail = record.Thumbnail_Filename;
        const large = record.Large_Filename;

        // Skip if large filename is empty/null
        if (!large || large.trim() === '') {
          return;
        }

        // Check if thumbnail matches our pattern
        if (thumbnail && thumbnail.startsWith('A_') && thumbnail.endsWith('_600.jpg')) {
          // Expected large filename should end with _1200.jpg
          const expectedLarge = thumbnail.replace('_600.jpg', '_1200.jpg');

          if (large !== expectedLarge) {
            mismatches.push({
              speciesFile: file,
              speciesId: record.Species_ID,
              recordIndex: index,
              thumbnail: thumbnail,
              actualLarge: large,
              expectedLarge: expectedLarge
            });
          }
        }
      });
    }

    // Report results
    if (mismatches.length === 0) {
      console.log('✅ All thumbnail/large filename pairs are consistent!');
    } else {
      console.log(`❌ Found ${mismatches.length} mismatches:`);
      console.log('─'.repeat(80));

      mismatches.forEach((mismatch, i) => {
        console.log(`${i + 1}. ${mismatch.speciesFile} (Species: ${mismatch.speciesId}, Record: ${mismatch.recordIndex})`);
        console.log(`   Thumbnail: ${mismatch.thumbnail}`);
        console.log(`   Large:     ${mismatch.actualLarge} (expected: ${mismatch.expectedLarge})`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error validating image filenames:', error.message);
    process.exit(1);
  }
}

// Run the validation
validateImageFilenames();

