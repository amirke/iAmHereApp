#!/bin/bash

# Backend startup script with SSL certificates

echo "🚀 Starting IamHereApp Backend with SSL..."

# Set SSL certificate paths
export LETSENCRYPT_KEY="/volume2/video/Projects/SSL/privkey.pem"
export LETSENCRYPT_CERT="/volume2/video/Projects/SSL/fullchain.pem"

# Check if certificates exist
if [ -f "$LETSENCRYPT_KEY" ] && [ -f "$LETSENCRYPT_CERT" ]; then
    echo "✅ SSL certificates found:"
    echo "   Key: $LETSENCRYPT_KEY"
    echo "   Cert: $LETSENCRYPT_CERT"
else
    echo "⚠️  SSL certificates not found at:"
    echo "   $LETSENCRYPT_KEY"
    echo "   $LETSENCRYPT_CERT"
    echo "   Please make sure the certificates are in place"
    exit 1
fi

# Start the backend server
echo "🌐 Starting backend server..."
node app.js 