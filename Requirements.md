**Software Specification: "Arrived" PWA Application**

---

## 📄 Overview
"Arrived" is a privacy-focused Progressive Web Application (PWA) designed for mobile (Android) users, enabling communication of arrival and location status between users. The application runs without installation (PWA with Home Screen shortcut) and uses WebSocket and HTTPS-based APIs hosted on a Synology NAS.

---

## 🌐 Supported Features

### Core Features
- ✅ "I Arrived" button:
  - Sends user’s GPS location and timestamp to predefined contacts, regardless of prior requests.

- ❓ "Where Are You" button:
  - Sends a location request to a selected contact.

- ⚙️ Settings:
  - Add/remove contacts.
  - Select application language (Hebrew / English).
  - View connection status.

### Language Support
- Full bi-directional support for:
  - English (LTR)
  - Hebrew (RTL)
- User-selectable language in settings.
- Texts, layouts, and directions adapt dynamically.

---

## 🔧 Architecture

### Frontend (PWA)
- Built using **React** or **Svelte** with routing.
- Installed via browser shortcut (Add to Home Screen).
- Geolocation access via `navigator.geolocation`.
- WebSocket client for real-time communication.

### Backend (Synology NAS hosted)
- **Node.js** with **Express** and **WebSocket (`ws`)**.
- Serves REST API and WebSocket server over HTTPS.
- Hosted on Synology NAS behind **Reverse Proxy**.
- Uses internal **SQLite** database stored locally with file access restricted to the app service.

---

## 📁 Project File Structure

```text
arrived-app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page-level views
│   │   ├── i18n/              # Translation files (en.json, he.json)
│   │   ├── services/          # WebSocket, API clients
│   │   ├── utils/             # Geolocation utils, helpers
│   │   ├── App.jsx            # App layout and routing
│   │   └── main.jsx           # Entry point
│   └── index.html
├── backend/
│   ├── routes/
│   │   ├── api.js            # REST API handlers
│   │   └── websocket.js      # WebSocket events
│   ├── db/
│   │   ├── schema.sql        # DB structure
│   │   └── connection.js     # SQLite connection
│   ├── app.js             # Express entry point
│   └── config.js          # App config and constants
└── README.md
```

---

## 🔢 Database Schema

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  last_seen TIMESTAMP,
  preferred_language TEXT DEFAULT 'en'
);
```

### contacts
```sql
CREATE TABLE contacts (
  user_id INTEGER,
  contact_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (contact_id) REFERENCES users(id)
);
```

### arrivals
```sql
CREATE TABLE arrivals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  latitude REAL,
  longitude REAL,
  timestamp TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### location_requests
```sql
CREATE TABLE location_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user INTEGER,
  to_user INTEGER,
  timestamp TEXT,
  responded BOOLEAN DEFAULT 0,
  FOREIGN KEY (from_user) REFERENCES users(id),
  FOREIGN KEY (to_user) REFERENCES users(id)
);
```

---

## 🔔 API Endpoints (REST)
- `POST /api/login` – user login or registration
- `POST /api/contacts` – add or remove contact
- `POST /api/arrived` – submit current location
- `GET /api/arrivals` – fetch location history

---

## 🔌 WebSocket Events

### From client to server:
```json
{
  "type": "where_are_you",
  "to": "user_id"
}
```
```json
{
  "type": "i_arrived",
  "location": { "lat": 31.77, "lng": 35.21 },
  "timestamp": "2025-05-30T14:00:00Z"
}
```

### From server to client:
```json
{
  "type": "location_request",
  "from": "user_id"
}
```
```json
{
  "type": "arrival_update",
  "from": "user_id",
  "location": { "lat": 31.77, "lng": 35.21 },
  "timestamp": "2025-05-30T14:00:00Z"
}
```

---

## 🚫 Not Included
- No Push Notifications
- No SMS integration
- No offline background service

---

## 🛡️ Security Measures
- All communication via HTTPS (SSL-enabled Reverse Proxy)
- Authentication via token/session
- Database files protected with NAS permissions (DSM Users only)
- Cross-origin protection (CORS) enabled

---

## ✨ Optional Future Features
- Export CSV of arrivals
- Push notification via FCM
- Background sync for missed arrivals

---

## 🔹 Summary
This PWA application empowers users to quickly communicate arrival status and request locations using a privacy-first, real-time architecture. Hosted securely on a personal NAS, it offers language adaptability, modern UI, and maintainable code architecture. All user data remains fully private and locally controlled.



---

## 🧩 SSH Access & NAS Path Configuration

To facilitate development using tools like Cursor or VS Code over SSH, the backend and project should be accessible on the Synology NAS with the following credentials:

### SSH Credentials
- **Host:** `192.168.1.17`
- **Username:** `manageuser`
- **Password:** `StrongPassword123`

### Project Location on NAS
All project files should be placed in:

```
/volume2/videos/Projects/IamHereApp/
```

This folder must be readable and writable by the user `manageuser` and should be secured using Synology DSM shared folder permissions.

---

## 🛠 IDE Integration (Cursor)

Tools like **Cursor** can be used to connect directly to the Synology NAS via SSH to this directory.
Once connected:
- Run backend server using `node backend/app.js`
- Start frontend using `npm run dev` inside the `frontend` folder
- Use the SQLite database file from `backend/db/arrived.sqlite`