# Backend Monitoring & Logging System

## Overview

The IamHereApp backend includes a comprehensive logging and monitoring system designed to help you understand why the server stops working, track performance, and maintain system health.

## 📁 Log File Structure

### Daily Log Rotation
- **Location**: `backend/logs/`
- **Format**: `backend-YYYY-MM-DD.log`
- **Rotation**: New file created daily at midnight
- **Retention**: 30 days (old files automatically deleted)

### Example Log File
```
backend-2024-01-15.log
backend-2024-01-16.log
backend-2024-01-17.log
```

## 🔍 Log Levels

| Level | Description | Usage |
|-------|-------------|-------|
| `SYSTEM` | Server lifecycle events | Startup, shutdown, crashes |
| `INFO` | General information | Normal operations |
| `SUCCESS` | Successful operations | HTTPS enabled, DB connected |
| `WARNING` | Potential issues | High memory usage |
| `ERROR` | Errors that don't crash | API errors, DB queries |
| `FATAL` | Critical errors | Uncaught exceptions |
| `REQUEST` | HTTP requests | API calls with timing |
| `WEBSOCKET` | WebSocket events | Connections, disconnections |
| `DATABASE` | Database operations | SQL queries, schema loading |

## 📊 Comprehensive Logging

### 1. Server Lifecycle Logging
```javascript
// Server startup
[2024-01-15T10:30:00.000Z] [SYSTEM] === Backend Server Session Started ===
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "pid": 12345,
  "nodeVersion": "v18.17.0",
  "platform": "linux",
  "arch": "x64"
}

// Server crash
[2024-01-15T11:45:30.000Z] [FATAL] Uncaught Exception - Server will restart
{
  "error": "Cannot read property 'id' of undefined",
  "stack": "TypeError: Cannot read property 'id' of undefined..."
}
```

### 2. Request Logging
```javascript
[2024-01-15T10:35:15.123Z] [REQUEST] GET /api/health
{
  "status": 200,
  "duration": "45ms",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)..."
}
```

### 3. Database Logging
```javascript
[2024-01-15T10:30:05.000Z] [DATABASE] Preparing SQL statement
{
  "sql": "SELECT * FROM users WHERE username = ?"
}

[2024-01-15T10:30:05.050Z] [ERROR] SQL prepare error
{
  "sql": "SELECT * FROM users WHERE username = ?",
  "error": "database is locked"
}
```

### 4. WebSocket Logging
```javascript
[2024-01-15T10:40:20.000Z] [WEBSOCKET] Client connected
{
  "ip": "192.168.1.100",
  "totalConnections": 3
}

[2024-01-15T10:45:30.000Z] [WEBSOCKET] Client disconnected
{
  "ip": "192.168.1.100",
  "totalConnections": 2
}
```

## 🛡️ Error Handling

### 1. Uncaught Exceptions
```javascript
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught Exception - Server will restart', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});
```

### 2. Unhandled Promise Rejections
```javascript
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise
  });
});
```

### 3. Graceful Shutdown
```javascript
process.on('SIGTERM', () => {
  logger.logServerEvent('SIGTERM received - Graceful shutdown');
  process.exit(0);
});
```

### 4. Express Error Handler
```javascript
app.use((err, req, res, next) => {
  logger.error('Express error handler', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Something went wrong!' });
});
```

## 🏥 Health Monitoring

### 1. Health Check Endpoint
**URL**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": {
    "seconds": 3600.5,
    "formatted": "1h 0m 0s"
  },
  "memory": {
    "rss": {
      "bytes": 52428800,
      "mb": 50.0
    },
    "heapUsed": {
      "bytes": 20971520,
      "mb": 20.0
    },
    "heapTotal": {
      "bytes": 41943040,
      "mb": 40.0
    }
  },
  "websocketConnections": 3,
  "logFile": {
    "size": {
      "bytes": 1024000,
      "kb": 1000.0
    },
    "path": "backend-2024-01-15.log"
  }
}
```

### 2. Memory Monitoring Explained
- **RSS (Resident Set Size)**: Total memory allocated to the process in RAM
  - **Units**: MB (megabytes) and bytes
  - **What it means**: Total memory the Node.js process is using from the system
  
- **Heap Used**: JavaScript heap memory currently in use
  - **Units**: MB (megabytes) and bytes  
  - **What it means**: Memory used by JavaScript objects, strings, etc.
  
- **Heap Total**: Total JavaScript heap memory allocated
  - **Units**: MB (megabytes) and bytes
  - **What it means**: Total heap memory reserved by V8 engine

### 3. Uptime Monitoring
- **Seconds**: Raw uptime in seconds (decimal)
- **Formatted**: Human-readable format (e.g., "2d 5h 30m 15s")
- **What it means**: How long the server has been running continuously

### 4. Log File Monitoring
- **Size**: Current log file size
  - **Units**: KB (kilobytes) and bytes
  - **Path**: Current log file name
- **What it means**: How much disk space logs are using

## 📈 Monitoring Script

### Usage
```bash
# Start monitoring
npm run monitor

# Or run directly
node monitor.js
```

### What It Monitors
1. **Backend Health**: Every 30 seconds
2. **Memory Usage**: Every 60 seconds
3. **Log File Size**: Included in health checks
4. **WebSocket Connections**: Real-time count

### Example Monitor Output
```
[2024-01-15T10:30:00.000Z] [SYSTEM] === Backend monitoring started ===
{
  "backendUrl": "https://192.168.1.17:3001",
  "checkInterval": 30000
}

[2024-01-15T10:30:05.000Z] [INFO] Backend health check successful
{
  "status": "ok",
  "uptime": 3600.5,
  "memory": {...},
  "websocketConnections": 3,
  "logFileSize": 1024000
}
```

## 🛠️ How to Use

### 1. Start Backend with Logging
```bash
cd backend
npm run dev
```

**What you'll see**:
```
[2024-01-15T10:30:00.000Z] [SYSTEM] === Backend Server Session Started ===
[2024-01-15T10:30:01.000Z] [INFO] Loading SSL certificates
[2024-01-15T10:30:01.500Z] [SUCCESS] HTTPS server enabled
[2024-01-15T10:30:02.000Z] [SYSTEM] === Backend Server Started Successfully ===
```

### 2. Monitor Backend Health
```bash
# In a separate terminal
npm run monitor
```

### 3. Check Log Files
```bash
# View today's log
tail -f logs/backend-$(date +%Y-%m-%d).log

# View last 100 lines
tail -100 logs/backend-$(date +%Y-%m-%d).log

# Search for errors
grep "ERROR\|FATAL" logs/backend-$(date +%Y-%m-%d).log
```

### 4. Check Health Endpoint
```bash
curl https://192.168.1.17:3001/health
```

## 🔍 Troubleshooting Common Issues

### 1. Server Crashes
**Look for**:
```
[FATAL] Uncaught Exception - Server will restart
```

**Common causes**:
- Database locked
- Memory exhaustion
- Unhandled promise rejections
- SSL certificate issues

### 2. High Memory Usage
**Look for**:
```
[INFO] Memory usage
{
  "rss": "150MB",
  "heapUsed": "80MB"
}
```

**Solutions**:
- Restart server
- Check for memory leaks
- Monitor over time

### 3. Database Issues
**Look for**:
```
[DATABASE] Database error
[ERROR] SQL prepare error
```

**Common causes**:
- File permissions
- Disk space
- Concurrent access

### 4. WebSocket Problems
**Look for**:
```
[WEBSOCKET] Client disconnected
[ERROR] WebSocket error
```

**Solutions**:
- Check network connectivity
- Verify client implementation
- Monitor connection count

## 📋 Log File Management

### Automatic Cleanup
- Logs older than 30 days are automatically deleted
- Daily rotation prevents single large files
- File size monitoring in health checks

### Manual Cleanup
```bash
# Remove old log files manually
find logs/ -name "*.log" -mtime +30 -delete

# Check log directory size
du -sh logs/
```

## 🚀 Production Considerations

### 1. Log Rotation
- Daily rotation prevents disk space issues
- Automatic cleanup maintains performance
- Structured format for easy parsing

### 2. Error Tracking
- All errors logged with stack traces
- Request/response logging for debugging
- Memory usage monitoring

### 3. Health Monitoring
- Independent monitoring script
- Health endpoint for load balancers
- Real-time status updates

### 4. Security
- No sensitive data in logs
- IP addresses logged for debugging
- User agents logged for compatibility

## 📞 Support

When reporting issues, include:
1. **Log file**: `logs/backend-YYYY-MM-DD.log`
2. **Health endpoint response**: `GET /health`
3. **Error messages**: Look for `[ERROR]` and `[FATAL]` entries
4. **Timeline**: When the issue occurred

This comprehensive logging system will help you quickly identify and resolve any backend issues! 