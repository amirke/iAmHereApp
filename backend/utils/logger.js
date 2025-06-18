const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '..', 'logs');
    this.currentLogFile = null;
    this.currentDate = null;
    this.ensureLogsDirectory();
    this.initializeLogFile();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getLogFileName(date) {
    return `backend-${date.toISOString().split('T')[0]}.log`;
  }

  initializeLogFile() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (this.currentDate !== todayStr) {
      this.currentDate = todayStr;
      this.currentLogFile = path.join(this.logsDir, this.getLogFileName(today));
      
      // Log server start/crash detection
      this.log('SYSTEM', '=== Backend Server Session Started ===', {
        timestamp: today.toISOString(),
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      });
    }
  }

  writeToFile(level, message, data = null) {
    this.initializeLogFile(); // Check if we need to rotate to new day
    
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      logEntry += '\n' + JSON.stringify(data, null, 2);
    }
    
    logEntry += '\n';
    
    try {
      fs.appendFileSync(this.currentLogFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
      // Fallback to console
      console.log(logEntry);
    }
  }

  log(level, message, data = null) {
    // Write to file
    this.writeToFile(level, message, data);
    
    // Also write to console for development
    const timestamp = new Date().toISOString();
    const consoleEntry = `[${timestamp}] [${level}] ${message}`;
    console.log(consoleEntry);
    
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  success(message, data = null) {
    this.log('SUCCESS', message, data);
  }

  warning(message, data = null) {
    this.log('WARNING', message, data);
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  fatal(message, data = null) {
    this.log('FATAL', message, data);
  }

  request(method, path, status, duration, ip, userAgent) {
    this.log('REQUEST', `${method} ${path}`, {
      status: status,
      duration: `${duration}ms`,
      ip: ip,
      userAgent: userAgent
    });
  }

  websocket(event, data = null) {
    this.log('WEBSOCKET', event, data);
  }

  database(operation, data = null) {
    this.log('DATABASE', operation, data);
  }

  // Log server crash/restart
  logServerEvent(event, data = null) {
    this.log('SYSTEM', `=== ${event} ===`, data);
  }

  // Get recent logs (last N lines)
  getRecentLogs(lines = 100) {
    try {
      const logContent = fs.readFileSync(this.currentLogFile, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      return logLines.slice(-lines);
    } catch (error) {
      return [`Error reading log file: ${error.message}`];
    }
  }

  // Get log file size
  getLogFileSize() {
    try {
      const stats = fs.statSync(this.currentLogFile);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  // Clean old log files (keep last 30 days)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(this.logsDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      files.forEach(file => {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.logsDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < thirtyDaysAgo) {
            fs.unlinkSync(filePath);
            this.info(`Cleaned old log file: ${file}`);
          }
        }
      });
    } catch (error) {
      this.error('Failed to clean old logs', { error: error.message });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
logger.cleanOldLogs();

module.exports = logger; 