#!/bin/bash

# IamHereApp Global Access Startup Script

echo "🚀 Starting IamHereApp with Global Access..."

# Load environment variables
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found, using defaults"
fi

# Check if SSL certificates exist
if [ ! -f "./ssl/private.key" ] || [ ! -f "./ssl/certificate.crt" ]; then
    echo "🔐 Generating SSL certificates..."
    npm run generate-ssl
fi

# Start the application
echo "🌐 Starting backend server..."
echo "   Domain: ${GLOBAL_DOMAIN:-amirnas.dynamic-dns.net}"
echo "   Port: 3001"
echo "   HTTPS: ${HTTPS_ENABLED:-true}"

# Start the server
npm start 