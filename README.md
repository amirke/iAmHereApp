# IamHereApp - Real-Time Location Sharing PWA

## 🚀 Project Overview

IamHereApp is a Progressive Web Application (PWA) that enables real-time location sharing between users with GPS/AGPS positioning, bilingual support (English/Hebrew), and comprehensive security features. The application runs on Synology NAS with SSL encryption and provides a seamless experience across desktop and mobile devices.

## 🏗️ Technology Stack

### Frontend Technologies
- **Framework**: SvelteKit (SSR + Client-side routing)
- **Language**: JavaScript/TypeScript
- **Styling**: CSS3 with custom components
- **PWA**: Service Worker, Web App Manifest
- **Maps**: Custom HTML5 Canvas + OpenStreetMap tiles
- **Internationalization**: svelte-i18n (English/Hebrew with RTL support)
- **Geolocation**: Native Web APIs with GPS/AGPS fallback

### Backend Technologies
- **Runtime**: Node.js v20
- **Framework**: Express.js
- **Database**: SQLite3 with prepared statements
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **WebSocket**: Real-time communication
- **Security**: CORS, input validation, audit logging

### Infrastructure
- **Platform**: Synology NAS DSM
- **SSL**: Let's Encrypt certificates (valid until Sep 17, 2025)
- **Domain**: amirnas.dynamic-dns.net
- **Ports**: Frontend (4173), Backend (3001), SSH (2211)
- **SSL Location**: `/volume2/video/Projects/SSL/` (copied from `/usr/syno/etc/certificate/_archive/gpyNO7/`)

## 🔒 Security Level

**Current Security Implementation:**
- **Authentication**: ✅ Strong JWT-based with database verification
- **Authorization**: ✅ User can only access their own data  
- **Input Validation**: ✅ Type checking and sanitization
- **Password Security**: ✅ bcrypt hashing + current password verification
- **SQL Injection**: ✅ Prevented with prepared statements
- **XSS Prevention**: ✅ Basic input sanitization
- **Audit Logging**: ✅ Security events logged
- **SSL/TLS**: ✅ Let's Encrypt certificates with HTTPS enforcement

## 📱 PWA Compatibility

### Mobile Support
- **iPhone**: ✅ Full PWA installation and functionality
- **Android**: ✅ Complete PWA support with native-like experience
- **Desktop**: ✅ Chrome, Firefox, Safari compatibility
- **Offline**: Service Worker caching for offline functionality
- **Install**: Add to Home Screen on both iOS and Android

### PWA Features
- **Manifest**: Complete web app manifest for installation
- **Service Worker**: Background sync and caching
- **Icons**: Multiple sizes (192x192, 512x512) for all devices
- **Splash Screen**: Custom loading experience
- **Standalone Mode**: Full-screen app-like experience

## 🌐 Network Configuration

### Development Environment
```bash
# Frontend Development Server
Frontend: https://amirnas.dynamic-dns.net:4173
Backend API: https://amirnas.dynamic-dns.net:3001

# SSH Access
SSH: amirnas.dynamic-dns.net:2211
User: manageuser
```

### SSL Configuration
```bash
# SSL Certificate Locations
Source: /usr/syno/etc/certificate/_archive/gpyNO7/fullchain.pem
Destination: /volume2/video/Projects/SSL/fullchain.pem
Private Key: /volume2/video/Projects/SSL/privkey.pem
```

## 📊 Data Flow Architecture

```
{
┌─────────────────┐    HTTPS/WSS     ┌──────────────────┐
│   Frontend      │◄─────────────────►│    Backend       │
│   (SvelteKit)   │                  │   (Express.js)   │
│   Port: 4173    │                  │   Port: 3001     │
└─────────────────┘                  └──────────────────┘
         │                                       │
         │ Service Worker                        │
         │ Local Storage                         │ SQLite DB
         │ GPS/AGPS APIs                         │ JWT Auth
         │                                       │
         ▼                                       ▼
┌─────────────────┐                  ┌──────────────────┐
│   Browser       │                  │   Database       │
│   - PWA Cache   │                  │   - Users        │
│   - Location    │                  │   - Arrivals     │
│   - i18n Store  │                  │   - Requests     │
└─────────────────┘                  └──────────────────┘
}
```

### Data Flow Process
1. **User Authentication**: JWT token validation on every request
2. **Location Acquisition**: GPS/AGPS → Best result selection → Frontend display
3. **Real-time Updates**: WebSocket connections for live location sharing
4. **Bilingual Support**: Dynamic language switching with RTL/LTR layout
5. **Map Generation**: Canvas-based custom maps with OpenStreetMap tiles
6. **Security Logging**: All actions audited and logged


Git:
🔗 GitHub Repo: https://github.com/amirke/iAmHereApp
git add . 
git commit -m "description..."

git push -u https://github.com/amirke/iAmHereApp  main

## 📦 Version Management

IamHereApp includes a comprehensive version management system that automatically updates versions across all project files and creates git tags.

### Version Commands
```bash
# Show current version information
npm run version:show
node update-version.js --show

# Increment patch version (1.0.0 → 1.0.1)
npm run version:patch
node update-version.js --patch

# Increment minor version (1.0.0 → 1.1.0) 
npm run version:minor
node update-version.js --minor

# Increment major version (1.0.0 → 2.0.0)
npm run version:major
node update-version.js --major

# Set specific version
npm run version:set 2.1.0
node update-version.js --version 2.1.0

# Windows users
update-version.bat --patch
update-version.bat --show
```

### What Gets Updated
The version management system automatically updates:
- ✅ `version.json` - Central version configuration
- ✅ `package.json` files (root, frontend, backend)
- ✅ `frontend/static/manifest.webmanifest` - PWA manifest
- ✅ `frontend/static/sw.js` - Service Worker cache version
- ✅ `frontend/src/app.html` - HTML meta version tag
- ✅ `backend/constants.js` - Backend version constants
- ✅ `frontend/src/lib/config.js` - Frontend version config
- ✅ Git tags with release information

### Release Workflow
```bash
# 1. Update version and build
npm run release:patch    # or release:minor, release:major

# 2. Review changes
git status
git diff

# 3. Commit and push
git add .
git commit -m "Release v1.0.1"
git push origin main --tags

# 4. Deploy to production
npm run deploy
```

### Version Configuration
The `version.json` file contains:
- **version**: Semantic version (major.minor.patch)
- **buildNumber**: Incremental build counter
- **releaseDate**: Automatic date stamping
- **codeName**: Release code name
- **description**: Release description
- **changes**: Feature/fix changelog
- **compatibility**: Node.js and browser requirements
- **deployment**: Production environment details

## 🛠️ Development Commands

Monitor Backend Health:
npm run monitor

Check Health:
curl https://192.168.1.17:3001/health


### Frontend Development
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
```
npm run build && npm run serve-https

### Backend Development
```bash
# Install dependencies
npm install

# Development with auto-reload
npm run dev

npm start


# Production start
npm start

# Database migration
sqlite3 db/arrived.db < db/migrate-user-fields.sql

# SSL certificate setup
./start-with-ssl.sh
```

### Production Deployment
```bash
# Frontend Production Build
npm run build
node https-server.js

# Backend Production
NODE_ENV=production node app.js

# SSH to NAS
ssh -p 2211 manageuser@amirnas.dynamic-dns.net
```

## 📂 Project Structure

```
{
IamHereApp/
├── frontend/           # SvelteKit frontend application
├── backend/            # Express.js backend API
├── README.md          # Main project documentation
├── Requirements.md    # Project requirements
├── status.md         # Development status
└── *.bat             # Windows batch scripts for development
}
```

## 🎯 Key Features Implemented

### Core Functionality
- ✅ **User Authentication**: Registration, login, JWT tokens
- ✅ **Profile Management**: Display name, language, password change
- ✅ **Location Services**: GPS/AGPS with accuracy selection
- ✅ **Bilingual Interface**: English/Hebrew with RTL support
- ✅ **Real-time Maps**: Custom canvas-based map generation
- ✅ **PWA Installation**: Full mobile app experience
- ✅ **Security**: Comprehensive authentication and authorization

### Advanced Features
- ✅ **Dual Language Maps**: English and Hebrew map generation
- ✅ **Zoom Controls**: Adjustable map scale (10-18 levels)
- ✅ **Image Enlargement**: Modal view with zoom/pan functionality
- ✅ **Cache Management**: Fresh data loading with cache clearing
- ✅ **Accessibility**: Full keyboard navigation and screen reader support
- ✅ **Database Expansion**: 13 additional user fields for future features

## 🔧 Development Philosophy

### Code Quality Standards
- **No Reactive Statements**: Explicit function calls prevent unnecessary re-renders
- **Accessibility First**: Full ARIA support and keyboard navigation
- **Security by Design**: Input validation, prepared statements, audit logging
- **Performance Optimized**: Parallel processing, efficient caching
- **Mobile-First**: PWA-ready with offline capabilities

## 📈 Development Progress

### Phase 1: Foundation ✅
- Basic authentication system
- SvelteKit frontend setup
- Express.js backend API
- SQLite database schema

### Phase 2: Core Features ✅
- GPS/AGPS location services
- Real-time WebSocket communication
- Bilingual internationalization
- PWA implementation

### Phase 3: Advanced Features ✅
- Custom map generation
- Security enhancements
- Profile management
- Database expansion

### Phase 4: Polish & Optimization ✅
- Accessibility improvements
- Performance optimization
- SSL deployment
- Production readiness

## 🚀 Next Steps

- Enhanced location sharing features
- Advanced user management
- Mobile app optimization
- Performance monitoring
- Feature expansion using new database fields

---

**Developed with ❤️ using modern web technologies on Synology NAS** 