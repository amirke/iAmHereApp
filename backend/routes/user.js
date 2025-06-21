// Backend
// ======== User =========
// /backend/routes/user.js

const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Enhanced middleware to extract and validate user from JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate token payload structure
    if (!decoded.id || typeof decoded.id !== 'number') {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    
    // Verify user still exists in database (prevents using tokens of deleted users)
    const userStmt = db.prepare('SELECT id, username FROM users WHERE id = ?');
    const user = userStmt.get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(401).json({ error: 'Token verification failed' });
    }
  }
}

// GET /api/user/me - get current user profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    // Additional security: explicitly ensure we only get the authenticated user's data
    const stmt = db.prepare('SELECT id, username, display_name, language, created_at FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Log access for security auditing
    console.log(`Profile accessed by user ID: ${req.user.id} (${req.user.username})`);
    
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/me - update display name or language
router.put('/me', authMiddleware, (req, res) => {
  try {
    const { display_name, language } = req.body;
    
    // Input validation
    if (display_name && typeof display_name !== 'string') {
      return res.status(400).json({ error: 'Display name must be a string' });
    }
    
    if (language && !['en', 'he'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language. Must be "en" or "he"' });
    }
    
    // Sanitize display name (basic XSS prevention)
    const sanitizedDisplayName = display_name ? display_name.trim().substring(0, 100) : null;

    const stmt = db.prepare(`
      UPDATE users
      SET display_name = COALESCE(?, display_name),
          language = COALESCE(?, language)
      WHERE id = ?
    `);

    const result = stmt.run(sanitizedDisplayName, language, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }
    
    // Log profile update for security auditing
    console.log(`Profile updated by user ID: ${req.user.id} (${req.user.username})`);

    res.json({ status: 'updated' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/change-password - change user password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;
  
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const bcrypt = require('bcryptjs');
    
    // First, get the current user's password hash to verify current password
    const userStmt = db.prepare('SELECT password_hash FROM users WHERE id = ?');
    const user = userStmt.get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check that new password is different from current
    const isSamePassword = await bcrypt.compare(new_password, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    const updateStmt = db.prepare(`
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `);

    updateStmt.run(hashedNewPassword, req.user.id);

    res.json({ status: 'password_updated' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
