-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  language TEXT DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Arrivals table
CREATE TABLE IF NOT EXISTS arrivals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  location TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  confirmed_by INTEGER,
  confirmed_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(confirmed_by) REFERENCES users(id)
);

-- Location Requests table
CREATE TABLE IF NOT EXISTS location_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  response_location TEXT,
  acknowledged_by INTEGER,
  acknowledged_at DATETIME,
  FOREIGN KEY(requester_id) REFERENCES users(id),
  FOREIGN KEY(target_id) REFERENCES users(id),
  FOREIGN KEY(acknowledged_by) REFERENCES users(id)
);
