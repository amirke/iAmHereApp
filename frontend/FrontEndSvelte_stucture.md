TypeScript 
    TypeScript is a superset of JavaScript that adds static typing
        If you're the sole developer or working with a small codebase → start with plain JavaScript (no TypeScript). You can migrate later easily.

Playwright/Testing
    Playwright is a browser automation/testing tool for end-to-end testing
        Not needed now. You can add it later if your app grows or if you plan to automate browser testing

Skeleton Project in SvelteKit
    A "skeleton project" in SvelteKit is a minimal starting point:
        No UI framework (like Tailwind or Bootstrap)
        No routing presets
        No TypeScript or testing unless you enable them
    Ideal for clean setups like yours.   

Explanation of each folder
Folder	                Purpose
src/routes/	            Pages and routing (SvelteKit handles URL mapping here)
src/lib/	            Shared code (components, utilities, stores, etc.)
src/lib/components/	    Reusable UI components (e.g., buttons)
src/lib/services/	    API and WebSocket clients
src/lib/i18n/	        Translation files and logic (Heb / EN)
src/lib/utils/	        Helper functions (e.g., geolocation parsing)
static/	                Public assets (favicon, icons, manifest, etc.)




Project Summary: I Am Here (Arrived App)

This document summarizes the backend and frontend structure, technologies, file organization, and operations for the "I Am Here" app.

🔧 Backend Summary

📁 Folder: backend/

Technologies: Node.js, Express, SQLite (planned), WebSocket (planned)

📄 Main Files and Purpose:

app.js

Entry point of the backend server

Loads configuration, sets up Express app, JSON parsing, and routes

Starts server on defined HOST and PORT

config.js

Defines constants for PORT, HOST, and BACKEND_NAME

Example:

module.exports = {
  PORT: 3001,
  HOST: '0.0.0.0',
  BACKEND_NAME: 'Arrived Backend'
}

routes/api.js

Contains REST API endpoints

/api/arrived POST endpoint logs user arrival

Uses express.json() to parse body

Example:

router.post('/arrived', (req, res) => {
  const { location, timestamp } = req.body;
  if (!location || !timestamp) {
    return res.status(400).json({ error: 'Missing data' });
  }
  console.log(`[ARRIVED] ${location} at ${timestamp}`);
  res.json({ status: 'OK' });
});

routes/websocket.js (planned)

Will handle real-time WebSocket events

db/schema.sql (planned)

Defines SQLite schema for storing arrivals

db/connection.js (planned)

Provides connection logic to SQLite database

🌐 Frontend Summary

📁 Folder: frontend/

Technologies: SvelteKit, JavaScript, Vite, Prettier

📄 Main Files and Purpose:

src/routes/+page.svelte

Homepage UI, renders the "I Arrived" button

Imports and uses <ArrivedButton /> component

src/lib/components/ArrivedButton.svelte

Contains the actual button logic

On click, sends POST /api/arrived to backend

Displays confirmation or error

src/lib/config.js

Contains base URL to backend:

export const BACKEND_URL = 'http://192.168.1.17:3001';

src/lib/services/ (planned)

For WebSocket or API client abstractions

src/lib/i18n/ (planned)

For localization files (en.json, he.json)

🧪 How to Run

Run backend: npm run dev in backend/

Run frontend: npm run dev in frontend/

Frontend must be hosted with --host 0.0.0.0 to be visible on LAN

🔁 API Interaction

Frontend calls POST /api/arrived with JSON:

{
  "location": "Home",
  "timestamp": "2025-06-16T18:15:00.000Z"
}

Backend responds with:

{ "status": "OK" }

This structure allows further features like arrival history, real-time updates, and user authentication to be added incrementally.

