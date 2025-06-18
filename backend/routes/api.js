// Backend
//===== API Routes ======
// Backend/routes/api.js  

// Core modules and dependencies
const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Used to hash and compare passwords

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Middleware to protect routes using JWT tokens
const authenticateToken = (req, res, next) => {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

//
// 🔐 REGISTER NEW USER
// Creates a new user with username, password, and preferred language.
router.post('/register', async (req, res) => {
  const { username, password, language } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const stmt = db.prepare(`
      INSERT INTO users (username, password_hash, language, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(username, hashedPassword, language || 'en');

    // Create token
    const user = {
      id: result.lastInsertRowid,
      username,
      preferred_language: language || 'en'
    };

    const token = jwt.sign(user, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//
// 🔓 LOGIN
// Logs in a user by checking username and password.
//
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const userStmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = userStmt.get(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found. Use register instead.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//
// 📇 GET CONTACTS
// Returns the authenticated user's contact list with last seen status.
//
router.get('/contacts', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.last_seen
      FROM contacts c
      JOIN users u ON c.contact_id = u.id
      WHERE c.user_id = ?
    `);
    const contacts = stmt.all(req.user.id);
    res.json(contacts);
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//
// ➕ ADD CONTACT
// Adds another user by username to the authenticated user's contact list.
//
router.post('/contacts', authenticateToken, (req, res) => {
  const { contactUsername } = req.body;

  try {
    const contact = db.prepare('SELECT id FROM users WHERE username = ?').get(contactUsername);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const stmt = db.prepare('INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)');
    stmt.run(req.user.id, contact.id);
    res.json({ message: 'Contact added successfully' });
  } catch (err) {
    console.error('Add contact error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//
// ❌ REMOVE CONTACT
// Removes a contact by ID from the authenticated user's contact list.
//
router.delete('/contacts/:contactId', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM contacts WHERE user_id = ? AND contact_id = ?');
    stmt.run(req.user.id, req.params.contactId);
    res.json({ message: 'Contact removed successfully' });
  } catch (err) {
    console.error('Remove contact error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//
// ⚙️ UPDATE USER PREFERENCES
// Updates the user's preferred language or other profile settings.
//
router.put('/preferences', authenticateToken, (req, res) => {
  const { preferred_language } = req.body;

  try {
    const stmt = db.prepare('UPDATE users SET preferred_language = ? WHERE id = ?');
    stmt.run(preferred_language, req.user.id);
    res.json({ message: 'Preferences updated successfully' });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//
// 📍 ARRIVED EVENT
// Logs a simple "arrived" event from the frontend; extend later with DB logic.
//
router.post('/arrived', (req, res) => {
  const { location, timestamp } = req.body;
  console.log('[ARRIVED]', location, timestamp);

  res.json({ success: true });
});

//
// 🏥 HEALTH CHECK
// Simple endpoint to check if backend is running and accessible
//
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'IamHereApp Backend'
  });
});

module.exports = router;
