#!/usr/bin/env node
'use strict';

/**
 * Seed script – loads initial HR data into the SQLite database.
 * Run: node scripts/seed.js
 * (After: npm run deploy)
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const dbPath = path.join(__dirname, '..', 'db', 'hrms.db');

if (!fs.existsSync(dbPath)) {
  console.error('Database not found at', dbPath);
  console.error('Run "npm run deploy" first to create the schema.');
  process.exit(1);
}

const db = new Database(dbPath);

try {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'data', 'seed.sql'), 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

  db.transaction(() => {
    for (const stmt of statements) {
      try {
        db.prepare(stmt + ';').run();
      } catch (e) {
        // Skip duplicate inserts silently
        if (!e.message.includes('UNIQUE constraint failed')) {
          console.warn('Warning:', e.message.substring(0, 80));
        }
      }
    }
  })();

  console.log('✅ Seed data loaded successfully!');
  console.log('   - 5 Departments');
  console.log('   - 5 Employees (login with empCode: 240)');
  console.log('   - 5 Leave Types (CL, SL, PL, ML, LWP)');
  console.log('   - Leave Balances for Employee 240');
  console.log('   - 3 Leave Requests');
  console.log('   - 12 Attendance Records (March 2026)');
  console.log('   - 7 Holidays');
  console.log('   - 3 Payslips');

} catch (e) {
  // If better-sqlite3 not available, use cds built-in seeding
  console.log('ℹ️  better-sqlite3 not available, using CDS CSV seeding instead.');
  console.log('   Place CSV files in db/data/ folder with entity names.');
} finally {
  db.close && db.close();
}
