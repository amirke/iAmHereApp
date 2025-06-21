-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  language TEXT DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Address fields
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  -- Profile fields
  personal_picture TEXT, -- Base64 encoded image or file path
  subscription TEXT DEFAULT 'Free' CHECK(subscription IN ('Free', 'Pro', 'Manager')),
  valid_user BOOLEAN DEFAULT 1,
  ranking INTEGER DEFAULT 0,
  -- Usage statistics
  initiator_count INTEGER DEFAULT 0, -- How many times user initiated location requests
  client_count INTEGER DEFAULT 0,    -- How many times user responded to location requests
  -- Extra fields for future expansion
  extra_info1 TEXT,
  extra_info2 TEXT,
  spare1 TEXT,
  spare2 TEXT
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription);
CREATE INDEX IF NOT EXISTS idx_users_valid_user ON users(valid_user);
CREATE INDEX IF NOT EXISTS idx_users_ranking ON users(ranking);
CREATE INDEX IF NOT EXISTS idx_arrivals_user_id ON arrivals(user_id);
CREATE INDEX IF NOT EXISTS idx_arrivals_timestamp ON arrivals(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_requests_requester ON location_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_location_requests_target ON location_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_location_requests_requested_at ON location_requests(requested_at);
