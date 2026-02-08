#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Clean legacy/unwanted fields from SP_*.json species image listings.
 *
 * Default mode is DRY RUN (no writes).
 *
 * Usage:
 *   node ./scripts/clean-species-json.js
 *   node ./scripts/clean-species-json.js --apply
 *   node ./scripts/clean-species-json.js --apply --remove-column-range
 *
 * What it checks/removes:
 * - In each file's metadata.columns[]: Threat_Status, Display_Order, Paired
 * - In each row of data[]: Threat_Status, Display_Order, Paired
 * - Optionally: metadata.column_range (with --remove-column-range)
 */

const fs = require('fs/promises');
const path = require('path');

const TARGET_KEYS = ['Threat_Status', 'Display_Order', 'Paired'];
const TARGET_META_FIELDS = ['generated_at', 'source_file'];

function parseArgs(argv) {
  const args = {
    apply: false,
    removeColumnRange: false,
    removeMetaFields: false,
    jsonIndent: 2,
  };

  for (const raw of argv) {
    if (raw === '--apply') args.apply = true;
    else if (raw === '--remove-column-range') args.removeColumnRange = true;
    else if (raw === '--remove-meta-fields') args.removeMetaFields = true;
    else if (raw.startsWith('--json-indent=')) {
      const n = Number(raw.split('=')[1]);
      if (Number.isFinite(n) && n >= 0) args.jsonIndent = n;
    } else if (raw === '--help' || raw === '-h') {
      printHelpAndExit(0);
    } else {
      console.warn(`Unknown arg ignored: ${raw}`);
    }
  }

  return args;
}

function printHelpAndExit(code) {
  console.log(`
Clean SP_*.json species image data (dry-run by default).

Usage:
  node ./scripts/clean-species-json.js [--apply] [--remove-column-range] [--remove-meta-fields] [--json-indent=N]

Options:
  --apply               Write changes to disk. (Default: dry-run)
  --remove-column-range Delete metadata.column_range if present.
  --remove-meta-fields  Delete metadata.generated_at and metadata.source_file if present.
  --json-indent=N       JSON indentation for writes (default: 2). Use 0 for minified.
`);
  process.exit(code);
}

async function listSpeciesJsonFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    // Directory missing is not fatal; just report 0 files.
    return [];
  }

  return entries
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => /^SP_\d{4}\.json$/i.test(name))
    .sort()
    .map((name) => path.join(dir, name));
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function analyzeFileObject(obj, opts) {
  const meta = obj && typeof obj === 'object' ? obj.metadata : null;
  const data = obj && typeof obj === 'object' ? obj.data : null;

  const result = {
    columnsHas: Object.fromEntries(TARGET_KEYS.map((k) => [k, 0])),
    rowsHas: Object.fromEntries(TARGET_KEYS.map((k) => [k, 0])),
    hasColumnRange: false,
    metaFieldsHas: Object.fromEntries(TARGET_META_FIELDS.map((k) => [k, 0])),
    wouldChange: false,
  };

  // metadata.columns[]
  if (meta && Array.isArray(meta.columns)) {
    for (const k of TARGET_KEYS) {
      const present = meta.columns.includes(k);
      if (present) {
        result.columnsHas[k] += 1; // count per-file presence
        result.wouldChange = true;
      }
    }
  }

  // metadata.column_range
  if (opts.removeColumnRange && meta && hasOwn(meta, 'column_range')) {
    result.hasColumnRange = true;
    result.wouldChange = true;
  }

  // metadata.* fields
  if (opts.removeMetaFields && meta) {
    for (const k of TARGET_META_FIELDS) {
      if (hasOwn(meta, k)) {
        result.metaFieldsHas[k] += 1; // count per-file presence
        result.wouldChange = true;
      }
    }
  }

  // data[]
  if (Array.isArray(data)) {
    for (const row of data) {
      if (!row || typeof row !== 'object') continue;
      for (const k of TARGET_KEYS) {
        if (hasOwn(row, k)) {
          result.rowsHas[k] += 1; // count per-row occurrences
          result.wouldChange = true;
        }
      }
    }
  }

  return result;
}

function applyCleanup(obj, opts) {
  let changed = false;
  const meta = obj && typeof obj === 'object' ? obj.metadata : null;

  if (meta && Array.isArray(meta.columns)) {
    const beforeLen = meta.columns.length;
    meta.columns = meta.columns.filter((c) => !TARGET_KEYS.includes(c));
    if (meta.columns.length !== beforeLen) changed = true;
  }

  if (opts.removeColumnRange && meta && hasOwn(meta, 'column_range')) {
    delete meta.column_range;
    changed = true;
  }

  if (opts.removeMetaFields && meta) {
    for (const k of TARGET_META_FIELDS) {
      if (hasOwn(meta, k)) {
        delete meta[k];
        changed = true;
      }
    }
  }

  if (obj && typeof obj === 'object' && Array.isArray(obj.data)) {
    for (const row of obj.data) {
      if (!row || typeof row !== 'object') continue;
      for (const k of TARGET_KEYS) {
        if (hasOwn(row, k)) {
          delete row[k];
          changed = true;
        }
      }
    }
  }

  return changed;
}

function formatCount(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

async function processFolder(folderLabel, folderPath, opts) {
  const files = await listSpeciesJsonFiles(folderPath);

  const summary = {
    label: folderLabel,
    folderPath,
    totalFiles: files.length,
    parsedOk: 0,
    parseErrors: [],
    wouldChangeFiles: 0,
    keysInColumnsFiles: Object.fromEntries(TARGET_KEYS.map((k) => [k, 0])),
    keysInRowsTotal: Object.fromEntries(TARGET_KEYS.map((k) => [k, 0])),
    columnRangeFiles: 0,
    metaFieldsFiles: Object.fromEntries(TARGET_META_FIELDS.map((k) => [k, 0])),
    filesWritten: 0,
  };

  for (const file of files) {
    let text;
    let obj;
    try {
      text = await fs.readFile(file, 'utf8');
      obj = JSON.parse(text);
      summary.parsedOk += 1;
    } catch (e) {
      summary.parseErrors.push({ file, error: String(e && e.message ? e.message : e) });
      continue;
    }

    const analysis = analyzeFileObject(obj, opts);

    for (const k of TARGET_KEYS) {
      // columnsHas[k] is 0/1 per file
      summary.keysInColumnsFiles[k] += analysis.columnsHas[k];
      summary.keysInRowsTotal[k] += analysis.rowsHas[k];
    }
    if (analysis.hasColumnRange) summary.columnRangeFiles += 1;
    for (const k of TARGET_META_FIELDS) {
      summary.metaFieldsFiles[k] += analysis.metaFieldsHas[k];
    }
    if (analysis.wouldChange) summary.wouldChangeFiles += 1;

    if (opts.apply && analysis.wouldChange) {
      const changed = applyCleanup(obj, opts);
      if (changed) {
        const out = JSON.stringify(obj, null, opts.jsonIndent) + '\n';
        if (out !== text) {
          await fs.writeFile(file, out, 'utf8');
          summary.filesWritten += 1;
        }
      }
    }
  }

  return summary;
}

function printSummary(folderSummaries, opts) {
  const totals = {
    totalFiles: 0,
    parsedOk: 0,
    parseErrors: 0,
    wouldChangeFiles: 0,
    keysInColumnsFiles: Object.fromEntries(TARGET_KEYS.map((k) => [k, 0])),
    keysInRowsTotal: Object.fromEntries(TARGET_KEYS.map((k) => [k, 0])),
    columnRangeFiles: 0,
    metaFieldsFiles: Object.fromEntries(TARGET_META_FIELDS.map((k) => [k, 0])),
    filesWritten: 0,
  };

  for (const s of folderSummaries) {
    totals.totalFiles += s.totalFiles;
    totals.parsedOk += s.parsedOk;
    totals.parseErrors += s.parseErrors.length;
    totals.wouldChangeFiles += s.wouldChangeFiles;
    totals.columnRangeFiles += s.columnRangeFiles;
    totals.filesWritten += s.filesWritten;
    for (const k of TARGET_KEYS) {
      totals.keysInColumnsFiles[k] += s.keysInColumnsFiles[k];
      totals.keysInRowsTotal[k] += s.keysInRowsTotal[k];
    }
    for (const k of TARGET_META_FIELDS) {
      totals.metaFieldsFiles[k] += s.metaFieldsFiles[k];
    }
  }

  console.log(`Mode: ${opts.apply ? 'APPLY (writing files)' : 'DRY RUN (no writes)'}`);
  console.log(`Folders scanned: ${folderSummaries.length}`);
  console.log('');

  for (const s of folderSummaries) {
    console.log(`== ${s.label} ==`);
    console.log(`Path: ${s.folderPath}`);
    console.log(`Files: ${formatCount(s.totalFiles)} (parsed ok: ${formatCount(s.parsedOk)}, parse errors: ${formatCount(s.parseErrors.length)})`);
    console.log(`Files that would change: ${formatCount(s.wouldChangeFiles)}`);
    if (opts.removeColumnRange) console.log(`Files with metadata.column_range: ${formatCount(s.columnRangeFiles)}`);
    if (opts.removeMetaFields) {
      console.log('Files with metadata fields:');
      for (const k of TARGET_META_FIELDS) {
        console.log(`  - ${k}: ${formatCount(s.metaFieldsFiles[k])}`);
      }
    }
    if (opts.apply) console.log(`Files written: ${formatCount(s.filesWritten)}`);

    console.log('metadata.columns contains (files):');
    for (const k of TARGET_KEYS) {
      console.log(`  - ${k}: ${formatCount(s.keysInColumnsFiles[k])}`);
    }
    console.log('data[] contains (total row occurrences):');
    for (const k of TARGET_KEYS) {
      console.log(`  - ${k}: ${formatCount(s.keysInRowsTotal[k])}`);
    }

    if (s.parseErrors.length) {
      console.log('Parse errors (first 10):');
      for (const e of s.parseErrors.slice(0, 10)) {
        console.log(`  - ${e.file}: ${e.error}`);
      }
      if (s.parseErrors.length > 10) console.log(`  ... and ${s.parseErrors.length - 10} more`);
    }
    console.log('');
  }

  console.log('== TOTAL ==');
  console.log(`Files: ${formatCount(totals.totalFiles)} (parsed ok: ${formatCount(totals.parsedOk)}, parse errors: ${formatCount(totals.parseErrors)})`);
  console.log(`Files that would change: ${formatCount(totals.wouldChangeFiles)}`);
  if (opts.removeColumnRange) console.log(`Files with metadata.column_range: ${formatCount(totals.columnRangeFiles)}`);
  if (opts.removeMetaFields) {
    console.log('Files with metadata fields:');
    for (const k of TARGET_META_FIELDS) {
      console.log(`  - ${k}: ${formatCount(totals.metaFieldsFiles[k])}`);
    }
  }
  if (opts.apply) console.log(`Files written: ${formatCount(totals.filesWritten)}`);
  console.log('metadata.columns contains (files):');
  for (const k of TARGET_KEYS) {
    console.log(`  - ${k}: ${formatCount(totals.keysInColumnsFiles[k])}`);
  }
  console.log('data[] contains (total row occurrences):');
  for (const k of TARGET_KEYS) {
    console.log(`  - ${k}: ${formatCount(totals.keysInRowsTotal[k])}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const repoRoot = path.join(__dirname, '..');
  const folders = [
    { label: 'public/data/species', folder: path.join(repoRoot, 'public', 'data', 'species') },
    { label: 'src/data/species', folder: path.join(repoRoot, 'src', 'data', 'species') },
  ];

  const summaries = [];
  for (const f of folders) {
    summaries.push(await processFolder(f.label, f.folder, opts));
  }

  printSummary(summaries, opts);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

