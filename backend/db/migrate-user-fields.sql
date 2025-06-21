-- Migration script to add new user fields
-- Run this on existing databases to add the new columns

-- Add address fields
ALTER TABLE users ADD COLUMN address_street TEXT;
ALTER TABLE users ADD COLUMN address_city TEXT;
ALTER TABLE users ADD COLUMN address_state TEXT;

-- Add profile fields
ALTER TABLE users ADD COLUMN personal_picture TEXT; -- Base64 encoded image or file path
ALTER TABLE users ADD COLUMN subscription TEXT DEFAULT 'Free';
ALTER TABLE users ADD COLUMN valid_user BOOLEAN DEFAULT 1;
ALTER TABLE users ADD COLUMN ranking INTEGER DEFAULT 0;

-- Add usage statistics
ALTER TABLE users ADD COLUMN initiator_count INTEGER DEFAULT 0; -- How many times user initiated location requests
ALTER TABLE users ADD COLUMN client_count INTEGER DEFAULT 0;    -- How many times user responded to location requests

-- Add extra fields for future expansion
ALTER TABLE users ADD COLUMN extra_info1 TEXT;
ALTER TABLE users ADD COLUMN extra_info2 TEXT;
ALTER TABLE users ADD COLUMN spare1 TEXT;
ALTER TABLE users ADD COLUMN spare2 TEXT;

-- Add constraint for subscription field (SQLite doesn't support adding constraints to existing columns)
-- This will be enforced in application code

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription);
CREATE INDEX IF NOT EXISTS idx_users_valid_user ON users(valid_user);
CREATE INDEX IF NOT EXISTS idx_users_ranking ON users(ranking);
CREATE INDEX IF NOT EXISTS idx_arrivals_user_id ON arrivals(user_id);
CREATE INDEX IF NOT EXISTS idx_arrivals_timestamp ON arrivals(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_requests_requester ON location_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_location_requests_target ON location_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_location_requests_requested_at ON location_requests(requested_at);

-- Update existing users to have default values
UPDATE users SET subscription = 'Free' WHERE subscription IS NULL;
UPDATE users SET valid_user = 1 WHERE valid_user IS NULL;
UPDATE users SET ranking = 0 WHERE ranking IS NULL;
UPDATE users SET initiator_count = 0 WHERE initiator_count IS NULL;
UPDATE users SET client_count = 0 WHERE client_count IS NULL; 