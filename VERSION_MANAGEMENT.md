# IamHereApp Version Management System

## 📦 Overview

This document describes the comprehensive version management system for IamHereApp that automatically coordinates versions across all project files and git repositories.

## 🎯 Key Features

- **Centralized Configuration**: Single `version.json` file controls all versions
- **Automatic Updates**: Updates 8+ files simultaneously
- **Git Integration**: Creates annotated tags automatically
- **Build Numbering**: Incremental build counter for tracking
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Semantic Versioning**: Follows semver (major.minor.patch) standard

## 📋 Files Updated Automatically

| File | Purpose | Example Update |
|------|---------|----------------|
| `version.json` | Central version config | `"version": "1.0.1"` |
| `package.json` (root) | Main project version | `"version": "1.0.1"` |
| `frontend/package.json` | Frontend package version | `"version": "1.0.1"` |
| `backend/package.json` | Backend package version | `"version": "1.0.1"` |
| `frontend/static/manifest.webmanifest` | PWA manifest | `"version": "1.0.1"` |
| `frontend/static/sw.js` | Service Worker cache | `CACHE_VERSION = 'v1.0.1-2'` |
| `frontend/src/app.html` | HTML meta tag | `<meta name="version" content="1.0.1">` |
| `backend/constants.js` | Backend constants | `APP_VERSION: '1.0.1'` |
| `frontend/src/lib/config.js` | Frontend config | `APP_VERSION = '1.0.1'` |

## 🚀 Quick Commands

### Show Current Version
```bash
npm run version:show
node update-version.js --show
update-version.bat --show    # Windows
```

### Increment Versions
```bash
# Patch version (1.0.0 → 1.0.1) - Bug fixes
npm run version:patch
node update-version.js --patch

# Minor version (1.0.0 → 1.1.0) - New features
npm run version:minor
node update-version.js --minor

# Major version (1.0.0 → 2.0.0) - Breaking changes
npm run version:major
node update-version.js --major
```

### Set Specific Version
```bash
npm run version:set 2.1.0
node update-version.js --version 2.1.0 --description "Major UI overhaul"
```

### Release Workflow
```bash
# One-command release (version + build)
npm run release:patch    # or release:minor, release:major

# Manual workflow
node update-version.js --patch
git add .
git commit -m "Release v1.0.1"
git push origin main --tags
```

## 🔧 Advanced Usage

### Custom Release Information
```bash
node update-version.js --patch \
  --description "Fixed GPS accuracy issues" \
  --codename "Precision"
```

### Windows Batch Files
```cmd
REM Show version
update-version.bat --show

REM Increment patch
update-version.bat --patch

REM Set specific version
update-version.bat --version 2.0.0 --description "Major release"
```

## 📄 Version Configuration (`version.json`)

```json
{
  "version": "1.0.1",
  "buildNumber": 2,
  "releaseDate": "2024-01-15",
  "codeName": "Genesis",
  "description": "Added comprehensive version management system",
  "changes": [
    "✅ User authentication and profile management",
    "✅ GPS/AGPS location services with best result selection",
    "✅ Bilingual interface (English/Hebrew) with RTL support",
    "✅ Custom map generation with dual language support",
    "✅ PWA installation for iPhone and Android",
    "✅ Real-time WebSocket communication",
    "✅ Comprehensive security implementation",
    "✅ Database expansion with 13 new user fields"
  ],
  "compatibility": {
    "frontend": {
      "node": ">=18.0.0",
      "browsers": ["Chrome 90+", "Firefox 88+", "Safari 14+", "Edge 90+"]
    },
    "backend": {
      "node": ">=18.0.0",
      "sqlite": ">=3.35.0"
    }
  },
  "deployment": {
    "environment": "production",
    "ssl_expires": "2025-09-17",
    "domain": "amirnas.dynamic-dns.net",
    "ports": {
      "frontend": 4173,
      "backend": 3001,
      "ssh": 2211
    }
  }
}
```

## 🎯 Git Integration

### Automatic Git Tags
Each version update creates an annotated git tag:
```bash
git tag -a "v1.0.1" -m "Release 1.0.1: Added comprehensive version management system"
```

### View Git Tags
```bash
git tag -l -n1    # List tags with first line of message
git show v1.0.1   # Show tag details
```

### Push Tags to Remote
```bash
git push origin main --tags
```

## 🔄 Build Integration

### Service Worker Cache Busting
The Service Worker automatically gets updated cache versions:
```javascript
const CACHE_VERSION = 'v1.0.1-2';  // version-buildNumber
const APP_VERSION = '1.0.1';
```

### Frontend API Headers
All API requests include version headers:
```javascript
'X-App-Version': '1.0.1'
```

### Backend Version Endpoint
Check version via API:
```bash
curl https://amirnas.dynamic-dns.net:3001/api/version
```

## 📊 Version History Tracking

### View Version History
```bash
# Show current version
npm run version:show

# Git tag history
git tag -l --sort=-version:refname

# Commit history for version files
git log --oneline -- version.json
```

### Release Notes Generation
The `changes` array in `version.json` can be used to generate release notes:
```javascript
const version = require('./version.json');
console.log(`## Release ${version.version} - ${version.codeName}`);
console.log(version.description);
version.changes.forEach(change => console.log(`- ${change}`));
```

## 🚨 Troubleshooting

### Common Issues

**"Git not available"**
- Ensure git is installed and in PATH
- Initialize git repository: `git init`

**"Version update failed"**
- Check file permissions
- Ensure all package.json files exist
- Verify Node.js version compatibility

**"Cache not updating"**
- Service Worker cache version is automatically updated
- Clear browser cache manually if needed
- Use emergency cache clear: `emergencyClearCache()` in browser console

### Recovery Commands
```bash
# Reset to last committed version
git checkout HEAD -- version.json package.json

# Manual version sync (if files get out of sync)
node update-version.js --version $(node -p "require('./version.json').version")
```

## 🔧 Customization

### Adding New Files to Update
Edit `update-version.js` and add new update functions:
```javascript
function updateCustomFile(version, buildNumber) {
  // Your custom file update logic
}

// Add to main() function
updateCustomFile(newVersion, config.buildNumber);
```

### Custom Version Schemes
Modify `incrementVersion()` function for custom versioning:
```javascript
function incrementVersion(currentVersion, type = 'patch') {
  // Custom versioning logic
}
```

## 📈 Best Practices

1. **Always use the version management system** - Don't manually edit version numbers
2. **Commit before versioning** - Ensure clean working directory
3. **Use semantic versioning** - patch/minor/major based on change type
4. **Write descriptive release notes** - Use `--description` parameter
5. **Test after version updates** - Verify all systems work with new version
6. **Push tags to remote** - Keep remote repository in sync

## 🎉 Success Example

```bash
# Complete release workflow
npm run version:patch
git add .
git commit -m "Release v1.0.1: Enhanced version management"
git push origin main --tags

# Verify deployment
curl https://amirnas.dynamic-dns.net:3001/api/version
# Response: {"version":"1.0.1","buildNumber":2,"status":"ok"}
```

---

**Version Management System by IamHereApp Development Team**  
*Ensuring consistency across all project components* 🚀 