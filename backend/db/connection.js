// Backend
// ====== Database - Connectiom =======
//  /backend/db/connection.js

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const logger = require('../utils/logger');

// Path to the DB file
const dbPath = path.join(__dirname, 'arrived.db');

logger.database('Initializing database connection', {
  dbPath: dbPath,
  exists: fs.existsSync(dbPath)
});

try {
  // Create or connect to the SQLite database
  const db = new Database(dbPath);
  
  logger.database('Database connection established', {
    dbPath: dbPath,
    size: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0
  });

  // Load schema from schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  logger.database('Loading database schema', {
    schemaPath: schemaPath,
    schemaSize: schema.length
  });

  // Execute schema
  db.exec(schema);
  
  logger.database('Database schema loaded successfully');

  // Monitor database operations
  const originalPrepare = db.prepare;
  db.prepare = function(sql) {
    logger.database('Preparing SQL statement', { sql: sql });
    try {
      const stmt = originalPrepare.call(this, sql);
      return stmt;
    } catch (error) {
      logger.error('SQL prepare error', {
        sql: sql,
        error: error.message
      });
      throw error;
    }
  };

  // Add database close handler for graceful shutdown
  process.on('SIGINT', () => {
    logger.database('Closing database connection');
    db.close();
  });

  process.on('SIGTERM', () => {
    logger.database('Closing database connection');
    db.close();
  });

  module.exports = db;
  
} catch (error) {
  logger.fatal('Failed to initialize database', {
    error: error.message,
    stack: error.stack,
    dbPath: dbPath
  });
  throw error;
}
