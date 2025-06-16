// Backend
// ======== User =========
// /backend/routes/user.js

const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Middleware to extract user from JWT
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/user/me - get current user profile
router.get('/me', authMiddleware, (req, res) => {
  const stmt = db.prepare('SELECT id, username, display_name, language, created_at FROM users WHERE id = ?');
  const user = stmt.get(req.user.id);
  res.json(user);
});

// PUT /api/user/me - update display name or language
router.put('/me', authMiddleware, (req, res) => {
  const { display_name, language } = req.body;

  const stmt = db.prepare(`
    UPDATE users
    SET display_name = COALESCE(?, display_name),
        language = COALESCE(?, language)
    WHERE id = ?
  `);

  stmt.run(display_name, language, req.user.id);

  res.json({ status: 'updated' });
});

module.exports = router;
