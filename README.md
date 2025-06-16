# Arrived App

A privacy-focused Progressive Web Application (PWA) for sharing arrival status and location information.

## Features

- "I Arrived" button for sharing location
- "Where Are You" button for requesting location
- Bilingual support (English/Hebrew)
- Real-time updates via WebSocket
- Privacy-focused design
- PWA support for Android

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- SQLite3
- Synology NAS (for production deployment)

## Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Configure environment:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the environment variables as needed

3. Start development servers:
```bash
npm start
```

## Project Structure

```
arrived-app/
├── frontend/          # React PWA frontend
├── backend/           # Node.js Express backend
└── README.md
```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:3001

## Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Configure Synology NAS:
   - Set up Reverse Proxy
   - Configure SSL certificates
   - Set up Node.js environment

3. Deploy backend to NAS:
   - Copy backend files to NAS
   - Install dependencies
   - Configure environment variables
   - Start the service

## Security

- All communication is over HTTPS
- Authentication via JWT tokens
- CORS protection enabled
- Database access restricted to app service

## License

MIT 