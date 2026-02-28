#!/usr/bin/env node
/**
 * RF-B14: D1 Schema Migration CLI
 * Usage:
 *   node migrate.js up              – run pending migrations
 *   node migrate.js status          – show migration status
 *   node migrate.js baseline        – mark all existing migrations as applied (no SQL run)
 *   node migrate.js create <name>   – scaffold a new migration file
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../../migrations');
const DB_NAME = process.env.RF_DB_NAME || 'revenueforge-db';

// ── SHA-256 checksum ──────────────────────────
function checksum(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// ── Sanitize version for SQL safety ──────────
function sanitizeVersion(version) {
  if (typeof version !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(version)) {
    throw new Error(`Invalid migration version: "${version}". Must match [a-zA-Z0-9_-]+`);
  }
  return version;
}

// ── Wrangler D1 execute ───────────────────────
function d1exec(sql, remote = false) {
  const remoteFlag = remote ? '--remote' : '--local';
  const result = spawnSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB_NAME, remoteFlag, '--command', sql],
    { encoding: 'utf8', cwd: path.resolve(__dirname, '../../../') }
  );
  if (result.status !== 0) {
    throw new Error(`D1 execute failed:\n${result.stderr}`);
  }
  return result.stdout;
}

// ── Collect migration files ───────────────────
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.rollback.sql') && f !== '.gitkeep')
    .sort()
    .map((file) => ({
      version: path.basename(file, '.sql'),
      file,
      filePath: path.join(MIGRATIONS_DIR, file),
    }));
}

// ── Ensure tracking table ─────────────────────
function ensureTrackingTable(remote) {
  d1exec(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      version    TEXT    NOT NULL UNIQUE,
      checksum   TEXT    NOT NULL,
      applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );`,
    remote
  );
}

// ── cmdUp ─────────────────────────────────────
async function cmdUp(remote) {
  console.log('Running pending migrations...');
  ensureTrackingTable(remote);

  const files = getMigrationFiles();
  let applied = 0;

  for (const { version, filePath } of files) {
    const safeVersion = sanitizeVersion(version);

    const check = d1exec(
      `SELECT version FROM _migrations WHERE version = '${safeVersion}';`,
      remote
    );
    if (check.includes(safeVersion)) {
      console.log(`  skip  ${safeVersion} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8').trim();
    const cs = checksum(sql);

    console.log(`  apply ${safeVersion}...`);
    d1exec(sql, remote);

    d1exec(
      `INSERT INTO _migrations (version, checksum) VALUES ('${safeVersion}', '${cs}');`,
      remote
    );
    console.log(`  done  ${safeVersion} (sha256: ${cs.slice(0, 8)}...)`);
    applied++;
  }

  console.log(`\nDone. ${applied} migration(s) applied.`);
}

// ── cmdStatus ─────────────────────────────────
function cmdStatus(remote) {
  console.log('Migration status:');
  ensureTrackingTable(remote);

  for (const { version, filePath } of getMigrationFiles()) {
    const safeVersion = sanitizeVersion(version);
    const check = d1exec(
      `SELECT version, checksum FROM _migrations WHERE version = '${safeVersion}';`,
      remote
    );
    if (check.includes(safeVersion)) {
      const sql = fs.readFileSync(filePath, 'utf8').trim();
      const csMatch = check.includes(checksum(sql));
      console.log(`  applied  ${safeVersion}  ${csMatch ? '(checksum OK)' : 'CHECKSUM MISMATCH'}`);
    } else {
      console.log(`  pending  ${safeVersion}`);
    }
  }
}

// ── cmdBaseline ───────────────────────────────
// Bootstrap an existing database: mark all migrations as applied WITHOUT running their SQL.
// Use this when the DB schema already exists and you want to bring it under migration tracking.
function cmdBaseline(remote) {
  console.log('Baselining existing database (no SQL will be executed)...');
  ensureTrackingTable(remote);

  const files = getMigrationFiles();
  let baselined = 0;

  for (const { version, filePath } of files) {
    const safeVersion = sanitizeVersion(version);

    const check = d1exec(
      `SELECT version FROM _migrations WHERE version = '${safeVersion}';`,
      remote
    );
    if (check.includes(safeVersion)) {
      console.log(`  skip      ${safeVersion} (already tracked)`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8').trim();
    const cs = checksum(sql);

    d1exec(
      `INSERT INTO _migrations (version, checksum) VALUES ('${safeVersion}', '${cs}');`,
      remote
    );
    console.log(`  baselined ${safeVersion} (sha256: ${cs.slice(0, 8)}...)`);
    baselined++;
  }

  console.log(`\nDone. ${baselined} migration(s) baselined.`);
}

// ── cmdCreate ─────────────────────────────────
function cmdCreate(name) {
  if (!name) {
    console.error('Error: provide a name, e.g.  node migrate.js create add_invoices');
    process.exit(1);
  }
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const files = getMigrationFiles();
  const maxSeq = files.reduce((max, { version }) => {
    const m = version.match(/^(\d+)/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  const filename = `${nextSeq}_${safeName}.sql`;
  const filePath = path.join(MIGRATIONS_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.error(`File already exists: ${filePath}`);
    process.exit(1);
  }

  fs.writeFileSync(
    filePath,
    `-- Migration: ${filename}\n-- Created: ${new Date().toISOString()}\n\n-- TODO: add your SQL here\n`
  );
  console.log(`Created: ${filePath}`);
}

// ── Entry point ───────────────────────────────
const [, , command, ...args] = process.argv;
const remote = args.includes('--remote');

switch (command) {
  case 'up':
    cmdUp(remote).catch((e) => { console.error(e.message); process.exit(1); });
    break;
  case 'status':
    cmdStatus(remote);
    break;
  case 'baseline':
    cmdBaseline(remote);
    break;
  case 'create':
    cmdCreate(args.find((a) => !a.startsWith('--')));
    break;
  default:
    console.log(`
D1 Migration CLI
  node migrate.js up [--remote]          Run pending migrations
  node migrate.js status [--remote]      Show migration status
  node migrate.js baseline [--remote]    Mark all as applied (no SQL run)
  node migrate.js create <name>          Scaffold a new migration file
`);
    process.exit(1);
}
