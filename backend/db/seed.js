
// Run the seed script to create DB and insert data
// node db/seed.js

const bcrypt = require('bcrypt');
const db = require('./connection');

// Prepare hashed password
const password = '123456';
const hash = bcrypt.hashSync(password, 10);

// Insert users
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password_hash, display_name, language)
  VALUES (?, ?, ?, ?)
`);

insertUser.run('alice', hash, 'Alice Wonderland', 'en');
insertUser.run('bob', hash, 'Bob Builder', 'he');

const getUserId = db.prepare(`SELECT id FROM users WHERE username = ?`);
const aliceId = getUserId.get('alice').id;
const bobId = getUserId.get('bob').id;

// Insert arrivals
const insertArrival = db.prepare(`
  INSERT INTO arrivals (user_id, location, timestamp)
  VALUES (?, ?, ?)
`);

insertArrival.run(aliceId, 'Home', new Date().toISOString());
insertArrival.run(bobId, 'Office', new Date().toISOString());

// Insert location request
const insertRequest = db.prepare(`
  INSERT INTO location_requests (requester_id, target_id)
  VALUES (?, ?)
`);

insertRequest.run(bobId, aliceId);

console.log('✅ Test data inserted.');
