# Backend - Express.js API Server

## 🎯 Overview

The backend is a secure Express.js API server providing authentication, real-time communication, and location services. It features JWT-based authentication, SQLite database, WebSocket support, and comprehensive security measures running on Synology NAS with SSL encryption.

## 🏗️ Architecture

```
{
Backend Architecture:
┌─────────────────┐
│   Express.js    │ ← HTTP/HTTPS Server
│   Application   │
└─────────────────┘
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
┌─────┐ ┌─────┐ ┌─────┐
│API  │ │Auth │ │WS   │
│     │ │JWT  │ │     │
└─────┘ └─────┘ └─────┘
         │
         ▼
    ┌─────────┐
    │ SQLite  │
    │Database │
    └─────────┘
}
```

## 📁 File Structure & Functions

### {Core Application Files}

#### `app.js`
**Purpose**: Main application entry point and server configuration
**Key Functions**:
- `checkPortAvailable(port)`: Check if port is available
- `findAndKillProcessOnPort(port)`: Kill process using port
- `setupMiddleware()`: Configure Express middleware
- `setupRoutes()`: Initialize API routes
- `startServer()`: Start HTTPS server with SSL

**Features**:
- Port conflict resolution with automatic process termination
- SSL/TLS configuration with Let's Encrypt certificates
- CORS configuration for cross-origin requests
- Request logging and error handling
- WebSocket server initialization

**SSL Configuration**:
```javascript
{
  key: fs.readFileSync('/volume2/video/Projects/SSL/privkey.pem'),
  cert: fs.readFileSync('/volume2/video/Projects/SSL/fullchain.pem')
}
```

**Port Management**:
- Automatic detection of port conflicts
- Process identification using `netstat`
- Graceful process termination with `kill -9`
- Verification and retry logic

#### `config.js`
**Purpose**: Centralized configuration management
**Key Functions**:
- `getConfig()`: Return configuration object
- `validateConfig()`: Validate configuration settings
- `getSSLPaths()`: SSL certificate paths

**Configuration Sections**:
```javascript
{
  server: {
    port: 3001,
    host: '0.0.0.0',
    ssl: {
      enabled: true,
      keyPath: '/volume2/video/Projects/SSL/privkey.pem',
      certPath: '/volume2/video/Projects/SSL/fullchain.pem'
    }
  },
  database: {
    path: './db/arrived.db',
    options: { verbose: console.log }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: '24h'
  }
}
```

#### `constants.js`
**Purpose**: Application constants and enumerations
**Key Constants**:
- `SERVER_PORT`: Default server port (3001)
- `CORS_ORIGINS`: Allowed CORS origins
- `JWT_EXPIRY`: Token expiration time
- `SSL_PATHS`: SSL certificate locations
- `API_ENDPOINTS`: API route definitions

**Usage Tracking**:
- `INITIATOR_ACTION`: User initiates location request
- `CLIENT_ACTION`: User responds to location request
- `SUBSCRIPTION_TYPES`: Free, Pro, Manager

#### `package.json`
**Purpose**: Project dependencies and scripts
**Key Dependencies**:
- `express`: Web framework
- `sqlite3`: Database driver
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT authentication
- `ws`: WebSocket server
- `cors`: Cross-origin resource sharing

**Scripts**:
```json
{
  "start": "node app.js",
  "dev": "nodemon app.js",
  "test": "node test-connection.js",
  "migrate": "sqlite3 db/arrived.db < db/migrate-user-fields.sql"
}
```

### {Database Layer - db/}

#### `db/connection.js`
**Purpose**: Database connection and initialization
**Key Functions**:
- `initializeDatabase()`: Create database connection
- `createTables()`: Execute schema creation
- `runMigrations()`: Apply database migrations
- `closeDatabase()`: Graceful connection closure

**Features**:
- Connection pooling and management
- Error handling and reconnection logic
- Transaction support
- Prepared statement caching

#### `db/schema.sql`
**Purpose**: Database schema definition
**Tables**:

**Users Table**:
```sql
{
CREATE TABLE users (
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
  personal_picture TEXT,
  subscription TEXT DEFAULT 'Free' CHECK(subscription IN ('Free', 'Pro', 'Manager')),
  valid_user BOOLEAN DEFAULT 1,
  ranking INTEGER DEFAULT 0,
  -- Usage statistics
  initiator_count INTEGER DEFAULT 0,
  client_count INTEGER DEFAULT 0,
  -- Extra fields
  extra_info1 TEXT,
  extra_info2 TEXT,
  spare1 TEXT,
  spare2 TEXT
);
}
```

**Arrivals Table**:
```sql
{
CREATE TABLE arrivals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  location TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  confirmed_by INTEGER,
  confirmed_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(confirmed_by) REFERENCES users(id)
);
}
```

**Location Requests Table**:
```sql
{
CREATE TABLE location_requests (
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
}
```

**Indexes for Performance**:
- `idx_users_username`: Username lookups
- `idx_users_subscription`: Subscription filtering
- `idx_users_ranking`: Ranking queries
- `idx_arrivals_user_id`: User arrivals
- `idx_location_requests_requester`: Request queries

#### `db/migrate-user-fields.sql`
**Purpose**: Database migration for new user fields
**Operations**:
- Add new columns to users table
- Create performance indexes
- Update existing records with default values
- Maintain data integrity

#### `db/seed.js`
**Purpose**: Database seeding for development
**Functions**:
- `createTestUsers()`: Generate test user accounts
- `seedArrivals()`: Create sample arrival data
- `seedLocationRequests()`: Generate test location requests

### {API Routes - routes/}

#### `routes/api.js`
**Purpose**: Core API endpoints
**Key Endpoints**:

**Authentication**:
- `POST /register`: User registration
- `POST /login`: User authentication
- `POST /arrivals`: Record arrival
- `GET /arrivals`: Retrieve arrival history

**Security Features**:
- Input sanitization and validation
- SQL injection prevention with prepared statements
- Rate limiting for API endpoints
- Request logging and audit trails

#### `routes/user.js`
**Purpose**: User management endpoints
**Key Endpoints**:
- `GET /me`: Get current user profile
- `PUT /me`: Update user profile
- `PUT /change-password`: Change user password

**Security Middleware**:
- `authenticateToken()`: JWT token validation
- `authorizeUser()`: User authorization
- `validateInput()`: Input sanitization

#### `routes/websocket.js`
**Purpose**: WebSocket connection management
**Key Functions**:
- `handleConnection()`: New WebSocket connections
- `authenticateWebSocket()`: WebSocket authentication
- `handleMessage()`: Message routing and processing
- `broadcastMessage()`: Message broadcasting

## 🔄 Database Interactions

### {Database Operations}

**User Management**:
```javascript
{
// User Registration
const createUser = async (userData) => {
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, display_name, language) 
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(userData.username, userData.passwordHash, 
                  userData.displayName, userData.language);
};
}
```

**Location Services**:
```javascript
{
// Record Arrival
const recordArrival = async (userId, location) => {
  const stmt = db.prepare(`
    INSERT INTO arrivals (user_id, location, timestamp) 
    VALUES (?, ?, datetime('now'))
  `);
  return stmt.run(userId, JSON.stringify(location));
};
}
```

### {Database Commands}

**Development Commands**:
```bash
# Create database and tables
sqlite3 db/arrived.db < db/schema.sql

# Run migrations
sqlite3 db/arrived.db < db/migrate-user-fields.sql

# Backup database
sqlite3 db/arrived.db ".backup backup_$(date +%Y%m%d).db"
```

## 🌐 Frontend Communication

### {API Communication Patterns}

**Authentication Flow**:
```javascript
{
Frontend Request:
POST /api/register
{
  username: "user123",
  password: "securepass",
  display_name: "User Name",
  language: "en"
}

Backend Response:
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    id: 1,
    username: "user123",
    display_name: "User Name",
    language: "en"
  }
}
}
```

## 🛠️ Development Commands

### {Development Setup}
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test
```

### {Production Deployment}
```bash
# Start production server
NODE_ENV=production npm start

# Start with SSL
./start-with-ssl.sh

# Run migration
npm run migrate
```

## 🔒 Security Implementation

### {Authentication & Authorization}
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiry**: 24-hour token lifetime
- **Session Management**: Secure session handling

### {Data Protection}
- **SQL Injection Prevention**: Prepared statements
- **Input Validation**: Comprehensive input sanitization
- **XSS Prevention**: Output encoding
- **CORS Configuration**: Restricted cross-origin access

---

**Backend engineered for security, performance, and scalability** 🔒 