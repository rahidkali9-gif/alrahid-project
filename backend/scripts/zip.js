'use strict';

/**
 * Zip script — creates alrahid-backend.zip excluding node_modules, .git,
 * .env, logs contents, and the zip itself. Uses archiver.
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const logger = require('../utils/logger');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'alrahid-backend.zip');

const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'logs']);
const EXCLUDE_FILES = new Set(['.env', 'alrahid-backend.zip']);
const EXCLUDE_PATTERNS = [/\.zip$/i, /npm-debug\.log$/i];

function shouldExcludeEntry(name, isDir) {
  if (isDir && EXCLUDE_DIRS.has(name)) return true;
  if (!isDir && EXCLUDE_FILES.has(name)) return true;
  if (!isDir && EXCLUDE_PATTERNS.some((re) => re.test(name))) return true;
  return false;
}

function addDirectory(archive, dirPath, archiveBase) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (shouldExcludeEntry(entry.name, entry.isDirectory())) continue;
    const full = path.join(dirPath, entry.name);
    const rel = path.join(archiveBase, entry.name);
    if (entry.isDirectory()) {
      archive.directory(full, rel, (data) => {
        // callback form allows further filtering of nested entries
        return data;
      });
      // Recurse to ensure nested excludes apply (archiver.directory does not recurse-exclude)
      addDirectory(archive, full, rel);
    } else {
      archive.file(full, { name: rel });
    }
  }
}

function main() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(OUT);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      logger.info(`Created ${OUT} (${sizeMB} MB)`);
      resolve(OUT);
    });
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') logger.warn('Archive warning', { error: err.message });
    });

    archive.pipe(output);

    // Walk root and add entries (excluding top-level excludes)
    const entries = fs.readdirSync(ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (shouldExcludeEntry(entry.name, entry.isDirectory())) continue;
      const full = path.join(ROOT, entry.name);
      if (entry.isDirectory()) {
        // Use manual recursion so excludes apply at every depth
        addDirectory(archive, full, entry.name);
      } else {
        archive.file(full, { name: entry.name });
      }
    }

    archive.finalize();
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Zip failed', { error: err.message, stack: err.stack });
    process.exit(1);
  });
