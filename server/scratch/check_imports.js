import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of the workspace
const WORKSPACE_DIR = path.resolve(__dirname, '../..');

const SCAN_DIRS = [
  path.join(WORKSPACE_DIR, 'client/src'),
  path.join(WORKSPACE_DIR, 'server')
];

// Helper to strip JS/JSX extensions
function stripJSExtension(filename) {
  return filename.replace(/\.(jsx?)$/i, '');
}

// Helper to strip any common extension for comparison
function stripExtension(filename) {
  return filename.replace(/\.(jsx?|css|svg|png|jpg|jpeg|json)$/i, '');
}

// Verifies a relative import string and returns the correct relative import path if mismatched
function verifyRelativeImport(importingFile, importStr) {
  // Only check relative imports
  if (!importStr.startsWith('.')) {
    return { valid: true };
  }

  const importingDir = path.dirname(importingFile);
  
  // Slashes normalization
  const normalizedImport = importStr.replace(/[\\/]/g, '/');
  const segments = normalizedImport.split('/');
  
  let currentDir = importingDir;
  let rebuiltSegments = [];
  let isChanged = false;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    if (segment === '.' || segment === '') {
      rebuiltSegments.push(segment);
      continue;
    }
    if (segment === '..') {
      rebuiltSegments.push(segment);
      currentDir = path.dirname(currentDir);
      continue;
    }

    // Verify directory exists to read
    if (!fs.existsSync(currentDir) || !fs.statSync(currentDir).isDirectory()) {
      return { valid: false, reason: 'parent_dir_missing', importStr };
    }

    const contents = fs.readdirSync(currentDir);

    // 1. Direct Case-Sensitive Match
    if (contents.includes(segment)) {
      rebuiltSegments.push(segment);
      currentDir = path.join(currentDir, segment);
      continue;
    }

    // 2. Last segment could omit extension (.js, .jsx, etc.)
    if (i === segments.length - 1) {
      // Let's check if there is an exact case-sensitive match for segment + extension
      const extensions = ['.js', '.jsx', '.css', '.json', '.svg', '.png'];
      let foundExactWithExt = false;
      for (const ext of extensions) {
        if (contents.includes(segment + ext)) {
          rebuiltSegments.push(segment);
          foundExactWithExt = true;
          break;
        }
      }
      if (foundExactWithExt) {
        break; // perfectly matched, no correction needed
      }

      // Check case-insensitive match for the last segment
      let caseInsensitiveMatch = null;
      for (const item of contents) {
        // Match with exact or stripped extensions
        const strippedItem = stripExtension(item);
        const strippedSegment = stripExtension(segment);
        
        if (item.toLowerCase() === segment.toLowerCase() || strippedItem.toLowerCase() === strippedSegment.toLowerCase()) {
          caseInsensitiveMatch = item;
          break;
        }
      }

      if (caseInsensitiveMatch) {
        // Keep the extension if the original segment had one, otherwise strip js/jsx
        const hasOriginalExt = segment.includes('.');
        let correctedSegment = caseInsensitiveMatch;
        
        if (!hasOriginalExt) {
          const ext = path.extname(caseInsensitiveMatch);
          if (ext === '.js' || ext === '.jsx') {
            correctedSegment = path.basename(caseInsensitiveMatch, ext);
          }
        }
        
        if (correctedSegment !== segment) {
          isChanged = true;
        }
        rebuiltSegments.push(correctedSegment);
        break;
      }
    }

    // 3. Case-Insensitive Match for directory/file segment
    const caseInsensitiveMatch = contents.find(item => item.toLowerCase() === segment.toLowerCase());
    if (caseInsensitiveMatch) {
      if (caseInsensitiveMatch !== segment) {
        isChanged = true;
      }
      rebuiltSegments.push(caseInsensitiveMatch);
      currentDir = path.join(currentDir, caseInsensitiveMatch);
      continue;
    }

    // 4. Not found on disk at all
    return { valid: false, reason: 'not_found', importStr };
  }

  if (isChanged) {
    const correctedPath = rebuiltSegments.join('/');
    return { valid: false, reason: 'casing_mismatch', correctPath: correctedPath, importStr };
  }

  return { valid: true };
}

// Regex to capture import and export statements
const IMPORT_REGEXES = [
  /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /export\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g,
];

function processFile(filePath, dryRun = true) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let matchesFound = [];
  let fileChanged = false;

  for (const regex of IMPORT_REGEXES) {
    // Reset regex index
    regex.lastIndex = 0;
    let match;
    
    // We use a temporary string to replace so we don't interfere with index matching,
    // but a cleaner way is using replace() with a callback.
  }

  // Let's rewrite using replace with callback for safety and simplicity
  let updatedContent = content;
  for (const regex of IMPORT_REGEXES) {
    updatedContent = updatedContent.replace(regex, (fullMatch, importStr) => {
      const result = verifyRelativeImport(filePath, importStr);
      if (!result.valid && result.reason === 'casing_mismatch') {
        matchesFound.push({
          original: importStr,
          corrected: result.correctPath,
          reason: 'Casing mismatch'
        });
        fileChanged = true;
        // Keep the same quote type
        const quote = fullMatch.includes("'") ? "'" : '"';
        // Replace just the import path
        return fullMatch.replace(importStr, result.correctPath);
      } else if (!result.valid && result.reason === 'not_found') {
        matchesFound.push({
          original: importStr,
          corrected: null,
          reason: 'Not found on disk (potential dead import or module)'
        });
      }
      return fullMatch;
    });
  }

  if (fileChanged && !dryRun) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Fixed imports in: ${path.relative(WORKSPACE_DIR, filePath)}`);
  }

  return {
    fileChanged,
    matchesFound
  };
}

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(walkDir(filePath));
      }
    } else {
      const ext = path.extname(filePath);
      if (ext === '.js' || ext === '.jsx') {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function run(dryRun = true) {
  console.log(`\n🔍 Scanning imports (Mode: ${dryRun ? 'DRY RUN - Read Only' : 'FIX MODE - Write Changes'})...`);
  let allFiles = [];
  
  SCAN_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(walkDir(dir));
    }
  });

  console.log(`Found ${allFiles.length} JS/JSX files to check.`);
  let filesChecked = 0;
  let filesFixedCount = 0;
  let totalMismatches = 0;

  allFiles.forEach(file => {
    const relativePath = path.relative(WORKSPACE_DIR, file);
    const result = processFile(file, dryRun);
    
    if (result.matchesFound.length > 0) {
      const casingErrors = result.matchesFound.filter(m => m.corrected);
      const notFoundErrors = result.matchesFound.filter(m => !m.corrected);

      if (casingErrors.length > 0) {
        console.log(`\n📂 File: ${relativePath}`);
        casingErrors.forEach(err => {
          console.log(`  ⚠️ Mismatch: "${err.original}" -> "${err.corrected}"`);
          totalMismatches++;
        });
        if (result.fileChanged) {
          filesFixedCount++;
        }
      }
      
      if (notFoundErrors.length > 0) {
        // Some might be package imports or aliases, we only print if they are relative but not found
        const relativeNotFound = notFoundErrors.filter(err => err.original.startsWith('.'));
        if (relativeNotFound.length > 0) {
          console.log(`\n📂 File: ${relativePath}`);
          relativeNotFound.forEach(err => {
            console.log(`  ❓ Relative Not Found: "${err.original}"`);
          });
        }
      }
    }
    filesChecked++;
  });

  console.log(`\n📊 Scan Summary:`);
  console.log(`- Files checked: ${filesChecked}`);
  console.log(`- Total casing mismatches found: ${totalMismatches}`);
  console.log(`- Files ${dryRun ? 'needing fixes' : 'successfully fixed'}: ${filesFixedCount}`);
}

const args = process.argv.slice(2);
const isFix = args.includes('--fix');
run(!isFix);
