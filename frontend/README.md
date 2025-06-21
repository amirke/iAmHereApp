# Frontend - SvelteKit PWA Application

## 🎯 Overview

The frontend is a Progressive Web Application built with SvelteKit, providing real-time location sharing with bilingual support (English/Hebrew), GPS/AGPS positioning, and custom map generation. It features PWA capabilities for mobile installation and offline functionality.

## 🏗️ Architecture

```
{
Frontend Architecture:
┌─────────────────┐
│   SvelteKit     │ ← SSR + Client-side routing
│   Application   │
└─────────────────┘
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
┌─────┐ ┌─────┐ ┌─────┐
│Pages│ │Lib  │ │PWA  │
│     │ │     │ │     │
└─────┘ └─────┘ └─────┘
}
```

## 📁 File Structure & Functions

### {Root Configuration Files}

#### `package.json`
**Purpose**: Project dependencies and scripts
**Key Dependencies**:
- `@sveltejs/kit`: Framework core
- `svelte-i18n`: Internationalization
- `vite`: Build tool and dev server

**Scripts**:
```javascript
{
  "dev": "vite dev --host 0.0.0.0 --port 4173",
  "build": "vite build",
  "preview": "vite preview --host 0.0.0.0 --port 4173",
  "check": "svelte-kit sync && svelte-check --tsconfig ./jsconfig.json"
}
```

#### `vite.config.js`
**Purpose**: Build configuration and development server
**Key Functions**:
- `sveltekit()`: SvelteKit adapter configuration
- HTTPS development server setup
- Static file handling

#### `svelte.config.js`
**Purpose**: Svelte compiler configuration
**Features**:
- Static adapter for production builds
- Preprocess configuration
- Build optimization settings

#### `jsconfig.json`
**Purpose**: JavaScript/TypeScript configuration
**Features**:
- Path mapping for `$lib` alias
- Module resolution settings
- Type checking configuration

### {PWA Configuration}

#### `static/manifest.webmanifest`
**Purpose**: PWA manifest for app installation
**Key Properties**:
```javascript
{
  name: "IamHereApp",
  short_name: "IamHere",
  start_url: "/",
  display: "standalone",
  theme_color: "#1976d2",
  background_color: "#ffffff",
  icons: [/* Multiple sizes for all devices */]
}
```

#### `static/sw.js` (Service Worker)
**Purpose**: PWA functionality and caching
**Key Functions**:
- `install`: Cache essential resources
- `fetch`: Network-first caching strategy
- `activate`: Clean up old caches
- Background sync capabilities

#### `static/icons/`
**Purpose**: PWA icons for different devices
**Files**:
- `icon-192x192.png`: Standard PWA icon
- `icon-512x512.png`: High-resolution icon
- `favicon.png`: Browser favicon

### {Source Code Structure}

#### `src/app.html`
**Purpose**: HTML template for the entire application
**Key Features**:
- Meta tags for PWA
- Favicon links
- Service worker registration
- `%sveltekit.head%` and `%sveltekit.body%` placeholders

**Functions**:
- PWA meta configuration
- Service worker initialization
- Base HTML structure

### {Library Components - src/lib/}

#### `src/lib/config.js`
**Purpose**: Centralized configuration management
**Key Constants**:
```javascript
{
  API_BASE_URL: "https://amirnas.dynamic-dns.net:3001",
  WS_BASE_URL: "wss://amirnas.dynamic-dns.net:3001",
  DEFAULT_LANGUAGE: "en",
  SUPPORTED_LANGUAGES: ["en", "he"]
}
```

**Functions**:
- `getApiUrl()`: Generate API endpoints
- `getWsUrl()`: Generate WebSocket URLs
- Environment-based configuration

#### `src/lib/stores.js`
**Purpose**: Svelte stores for global state management
**Stores**:
- `userToken`: JWT authentication token
- `userInfo`: Current user information
- `language`: Current interface language
- `isRTL`: Right-to-left layout state

**Functions**:
- `initializeStores()`: Load from localStorage
- `clearStores()`: Reset all stores
- `updateUserInfo()`: Update user data

#### `src/lib/index.js`
**Purpose**: Library exports and utilities
**Exports**:
- Store instances
- Utility functions
- Configuration constants

### {Internationalization - src/lib/i18n/}

#### `src/lib/i18n/i18n.js`
**Purpose**: i18n configuration and setup
**Key Functions**:
- `setupI18n()`: Initialize internationalization
- `loadTranslations()`: Load language files
- `switchLanguage()`: Change interface language
- `waitLocale()`: Wait for translations to load

**Features**:
- Dynamic language switching
- RTL/LTR layout support
- Fallback language handling

#### `src/lib/i18n/en.json`
**Purpose**: English translations
**Structure**:
```json
{
  "welcome": "Welcome",
  "login": "Login",
  "register": "Register",
  "profile": "Profile",
  "map": "Map",
  /* ... hundreds of translation keys */
}
```

#### `src/lib/i18n/he.json`
**Purpose**: Hebrew translations with RTL support
**Structure**:
```json
{
  "welcome": "ברוכים הבאים",
  "login": "התחברות",
  "register": "הרשמה",
  "profile": "פרופיל",
  "map": "מפה",
  /* ... Hebrew translations */
}
```

### {Components - src/lib/components/}

#### `src/lib/components/ArrivedButton.svelte`
**Purpose**: Core "I Arrived" functionality button
**Functions**:
- `sendArrival()`: Send arrival notification
- `getCurrentLocation()`: Get GPS position
- `handleLocationError()`: Handle GPS errors

**Props**:
- `disabled`: Button state
- `loading`: Loading indicator

**Features**:
- GPS location capture
- Real-time status updates
- Error handling and feedback

#### `src/lib/components/Navigation.svelte`
**Purpose**: Main navigation component
**Functions**:
- `navigateTo()`: Handle route navigation
- `handleLogout()`: User logout functionality
- `updateLanguage()`: Language switching

**Props**:
- `returnUrl`: Back navigation URL
- `showBack`: Show back button

**Features**:
- Responsive navigation
- Language-aware routing
- Authentication-based visibility

### {Services - src/lib/services/}

#### `src/lib/services/wsClient.js`
**Purpose**: WebSocket client for real-time communication
**Key Functions**:
- `connect()`: Establish WebSocket connection
- `disconnect()`: Close connection
- `sendMessage()`: Send real-time messages
- `onMessage()`: Handle incoming messages
- `reconnect()`: Auto-reconnection logic

**Features**:
- Automatic reconnection
- Message queuing
- Connection state management
- Error handling

### {Utilities - src/lib/utils/}

#### `src/lib/utils/geolocation.js`
**Purpose**: GPS/AGPS location services
**Key Functions**:
- `getCurrentLocationWithAddress()`: Get location with address
- `coordinatesToAddress()`: Reverse geocoding
- `addressToCoordinates()`: Forward geocoding
- `generateMapLinks()`: Create map service URLs
- `createStaticMapScreenshot()`: Generate custom maps
- `getWorkingStaticMapUrl()`: Map generation with fallback

**Location Accuracy Levels**:
```javascript
{
  HIGH: { enableHighAccuracy: true, timeout: 15000 },
  MEDIUM: { enableHighAccuracy: false, timeout: 10000 },
  LOW: { enableHighAccuracy: false, timeout: 5000 },
  BOTH: { /* GPS + AGPS simultaneously */ }
}
```

**Map Generation**:
- HTML5 Canvas-based rendering
- OpenStreetMap tile integration
- Custom pin placement
- Bilingual map labels

### {Routes - src/routes/}

#### `src/routes/+layout.svelte`
**Purpose**: Root layout component
**Key Functions**:
- `initializeApp()`: App initialization
- `setupServiceWorker()`: PWA setup
- `handleLanguageChange()`: Language switching
- `manageRTL()`: RTL/LTR layout management

**Features**:
- PWA service worker registration
- Global state management
- Language and direction handling
- Authentication state monitoring

#### `src/routes/+layout.server.js`
**Purpose**: Server-side layout logic
**Functions**:
- `load()`: Server-side data loading
- Cookie and session handling
- Initial state setup

#### `src/routes/+page.svelte`
**Purpose**: Home page component
**Key Functions**:
- `checkAuthentication()`: Verify user login
- `initializeHomePage()`: Page setup
- `handleNavigation()`: Route management

**Features**:
- Welcome interface
- Quick navigation
- Authentication checks

### {Login Page - src/routes/login/}

#### `src/routes/login/+page.svelte`
**Purpose**: Authentication interface
**Key Functions**:
- `handleLogin()`: User login process
- `handleRegister()`: User registration
- `validateForm()`: Input validation
- `switchMode()`: Toggle login/register
- `updateLanguage()`: Language switching
- `updateSwitchText()`: UI text updates

**Features**:
- Dual login/register interface
- Form validation
- Language switching
- JWT token handling
- Error display and feedback

**Security**:
- Input sanitization
- Password strength validation
- CSRF protection

### {Profile Page - src/routes/profile/}

#### `src/routes/profile/+page.svelte`
**Purpose**: User profile management
**Key Functions**:
- `loadUserProfile()`: Fetch user data
- `updateDisplayName()`: Change display name
- `changePassword()`: Update password
- `changeLanguage()`: Switch interface language
- `validateCurrentPassword()`: Security verification

**Features**:
- Profile information display
- Secure password changes
- Language preferences
- Real-time updates

**Security**:
- Current password verification
- Input validation
- Secure API communication

### {Map Page - src/routes/map/}

#### `src/routes/map/+page.svelte`
**Purpose**: GPS/AGPS location and mapping interface
**Key Functions**:
- `getCurrentLocation()`: GPS/AGPS positioning
- `selectBestLocation()`: Choose optimal result
- `loadStaticMaps()`: Generate bilingual maps
- `updateEnglishMapZoom()`: English map controls
- `updateHebrewMapZoom()`: Hebrew map controls
- `enlargeImage()`: Modal image viewer
- `clearMapCache()`: Fresh data loading
- `startWatching()`: Real-time tracking
- `searchForAddress()`: Address geocoding

**Map Features**:
- Dual language maps (English/Hebrew)
- Adjustable zoom levels (10-18)
- Custom canvas-based generation
- OpenStreetMap tile integration
- Location pin placement
- Clickable image enlargement

**Location Services**:
- GPS satellite positioning
- AGPS network-assisted positioning
- Best result selection algorithm
- Accuracy-based filtering
- Real-time location tracking

**Accessibility**:
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management

### {Settings Page - src/routes/settings/}

#### `src/routes/settings/+page.svelte`
**Purpose**: Application settings management
**Functions**:
- `updateSettings()`: Save preferences
- `resetSettings()`: Restore defaults
- `exportData()`: Data export functionality

### {Where Page - src/routes/where/}

#### `src/routes/where/+page.svelte`
**Purpose**: Location request interface
**Functions**:
- `requestLocation()`: Send location request
- `handleResponse()`: Process location response

### {Arrivals Page - src/routes/arrivals/}

#### `src/routes/arrivals/+page.svelte`
**Purpose**: Arrival history and management
**Functions**:
- `loadArrivals()`: Fetch arrival history
- `confirmArrival()`: Confirm arrival status

## 🔄 Component Relationships

### {Data Flow}
```
{
App Initialization:
+layout.svelte → stores.js → config.js
     │
     ├─→ i18n.js → language files
     ├─→ wsClient.js → backend connection
     └─→ Service Worker → PWA functionality

User Authentication:
login/+page.svelte → API call → stores.js → localStorage
     │
     └─→ Navigation update → Route protection

Location Services:
map/+page.svelte → geolocation.js → GPS/AGPS APIs
     │
     ├─→ Map generation → Canvas API
     ├─→ Address lookup → OpenStreetMap API
     └─→ Real-time updates → WebSocket
}
```

### {State Management}
- **Global State**: Svelte stores with localStorage persistence
- **Component State**: Local reactive variables
- **Server State**: SvelteKit load functions
- **Real-time State**: WebSocket synchronization

### {Communication Patterns}
- **Parent-Child**: Props and events
- **Sibling Components**: Shared stores
- **Cross-Route**: Global stores and navigation
- **Backend Communication**: Fetch API with JWT tokens

## 🎨 Styling Architecture

### {CSS Organization}
- **Global Styles**: In `app.html` and `+layout.svelte`
- **Component Styles**: Scoped CSS in each `.svelte` file
- **Responsive Design**: Mobile-first approach
- **RTL Support**: Dynamic layout switching for Hebrew

### {Design System}
- **Colors**: Consistent color palette
- **Typography**: Responsive font sizing
- **Spacing**: Standardized margins and padding
- **Components**: Reusable UI elements

## 🚀 Performance Optimizations

### {Build Optimizations}
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and file compression
- **Bundle Analysis**: Size monitoring

### {Runtime Optimizations}
- **Lazy Loading**: Route-based loading
- **Caching**: Service Worker caching strategies
- **Debouncing**: Input handling optimization
- **Parallel Processing**: Simultaneous API calls

## 📱 PWA Features

### {Installation}
- **Manifest**: Complete PWA manifest
- **Service Worker**: Offline functionality
- **Install Prompts**: Custom installation UI
- **App Icons**: Multiple sizes for all devices

### {Offline Support}
- **Cache Strategy**: Network-first with fallback
- **Background Sync**: Offline action queuing
- **Storage**: IndexedDB for offline data

## 🔧 Development Tools

### {Development Server}
```bash
# Start development server
npm run dev

# Access at: https://amirnas.dynamic-dns.net:4173
```

### {Build Process}
```bash
# Production build
npm run build

# Preview build
npm run preview

# Type checking
npm run check
```

### {Debugging}
- **Browser DevTools**: Component inspection
- **Svelte DevTools**: State debugging
- **Network Tab**: API monitoring
- **Console Logging**: Structured logging

## 🔒 Security Implementation

### {Client-Side Security}
- **JWT Validation**: Token expiry checking
- **Input Sanitization**: XSS prevention
- **Route Protection**: Authentication guards
- **HTTPS Enforcement**: Secure communication

### {Data Protection}
- **Local Storage**: Secure token storage
- **State Management**: Sensitive data handling
- **API Communication**: Encrypted requests

---

**Frontend built with modern web standards for optimal performance and user experience** 🚀 