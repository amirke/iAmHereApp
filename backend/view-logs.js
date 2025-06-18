#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logsDir = path.join(__dirname, 'logs');

function getTodayLogFile() {
  const today = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `backend-${today}.log`);
}

function listLogFiles() {
  if (!fs.existsSync(logsDir)) {
    console.log('❌ Logs directory not found');
    return [];
  }
  
  const files = fs.readdirSync(logsDir)
    .filter(file => file.endsWith('.log'))
    .sort()
    .reverse();
  
  return files;
}

function viewLogFile(filename, lines = 50) {
  const filePath = path.join(logsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Log file not found: ${filename}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const logLines = content.split('\n').filter(line => line.trim());
  
  console.log(`\n📄 ${filename} (last ${lines} lines):`);
  console.log('='.repeat(80));
  
  const recentLines = logLines.slice(-lines);
  recentLines.forEach(line => {
    // Color coding for different log levels
    if (line.includes('[FATAL]')) {
      console.log('\x1b[31m%s\x1b[0m', line); // Red
    } else if (line.includes('[ERROR]')) {
      console.log('\x1b[33m%s\x1b[0m', line); // Yellow
    } else if (line.includes('[SUCCESS]')) {
      console.log('\x1b[32m%s\x1b[0m', line); // Green
    } else if (line.includes('[SYSTEM]')) {
      console.log('\x1b[36m%s\x1b[0m', line); // Cyan
    } else {
      console.log(line);
    }
  });
}

function searchLogs(filename, searchTerm) {
  const filePath = path.join(logsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Log file not found: ${filename}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const logLines = content.split('\n').filter(line => line.trim());
  
  console.log(`\n🔍 Searching for "${searchTerm}" in ${filename}:`);
  console.log('='.repeat(80));
  
  const matches = logLines.filter(line => 
    line.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (matches.length === 0) {
    console.log('No matches found');
    return;
  }
  
  matches.forEach(line => {
    if (line.includes('[FATAL]')) {
      console.log('\x1b[31m%s\x1b[0m', line); // Red
    } else if (line.includes('[ERROR]')) {
      console.log('\x1b[33m%s\x1b[0m', line); // Yellow
    } else {
      console.log(line);
    }
  });
  
  console.log(`\nFound ${matches.length} matches`);
}

function showHelp() {
  console.log(`
📋 Log Viewer - Usage:

  node view-logs.js                    # View today's log (last 50 lines)
  node view-logs.js today              # View today's log
  node view-logs.js today 100          # View today's log (last 100 lines)
  node view-logs.js list               # List all log files
  node view-logs.js <filename>         # View specific log file
  node view-logs.js <filename> 100     # View specific log file (last 100 lines)
  node view-logs.js search <term>      # Search today's log for term
  node view-logs.js search <term> <filename>  # Search specific log file
  node view-logs.js help               # Show this help

Examples:
  node view-logs.js search ERROR       # Search for errors in today's log
  node view-logs.js backend-2024-01-15.log  # View specific date
  node view-logs.js backend-2024-01-15.log 100  # View last 100 lines
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Default: show today's log
    viewLogFile(getTodayLogFile().split('/').pop());
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'help':
      showHelp();
      break;
      
    case 'list':
      const files = listLogFiles();
      console.log('\n📁 Available log files:');
      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`  ${file} (${size}KB)`);
      });
      break;
      
    case 'today':
      const lines = parseInt(args[1]) || 50;
      viewLogFile(getTodayLogFile().split('/').pop(), lines);
      break;
      
    case 'search':
      const searchTerm = args[1];
      const searchFile = args[2] || getTodayLogFile().split('/').pop();
      
      if (!searchTerm) {
        console.log('❌ Please provide a search term');
        return;
      }
      
      searchLogs(searchFile, searchTerm);
      break;
      
    default:
      // Assume it's a filename
      const filename = command;
      const lineCount = parseInt(args[1]) || 50;
      viewLogFile(filename, lineCount);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  viewLogFile,
  searchLogs,
  listLogFiles
}; 