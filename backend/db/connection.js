// Backend
// ====== Database - Connectiom ========
//  /backend/db/connection.js

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Path to the DB file
const dbPath = path.join(__dirname, 'arrived.db');

// Create or connect to the SQLite database
const db = new Database(dbPath);

// Load schema from schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute schema
db.exec(schema);

console.log('✅ SQLite database initialized.');

module.exports = db;
