#!/bin/bash

# Build the frontend
cd frontend
npm run build

# Create deployment directory on NAS
ssh manageuser@192.168.1.17 "mkdir -p /volume1/web/arrived-app"

# Copy frontend build
scp -r build/* manageuser@192.168.1.17:/volume1/web/arrived-app/

# Copy backend files
cd ../backend
scp -r * manageuser@192.168.1.17:/volume1/web/arrived-app/backend/

# Copy package files
scp package.json manageuser@192.168.1.17:/volume1/web/arrived-app/
scp package-lock.json manageuser@192.168.1.17:/volume1/web/arrived-app/

# Install dependencies and start the application
ssh manageuser@192.168.1.17 "cd /volume1/web/arrived-app && npm install && cd backend && npm install && pm2 start app.js --name arrived-app" 