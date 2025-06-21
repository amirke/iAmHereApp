#!/bin/bash

# Frontend startup script with Let's Encrypt certificates

echo "🚀 Starting IamHereApp Frontend with Let's Encrypt..."

# Common certificate locations on Synology
CERT_LOCATIONS=(
    "/usr/syno/etc/certificate/system/default"              # System default certificate
    "/usr/syno/etc/certificate/ReverseProxy/01ebadfc-b0a4-404d-beb5-c781fac3d769"  # Reverse proxy certificate
)

# Function to find certificates
find_certificates() {
    for location in "${CERT_LOCATIONS[@]}"; do
        if [ -f "$location/privkey.pem" ] && [ -f "$location/fullchain.pem" ]; then
            export LETSENCRYPT_KEY="$location/privkey.pem"
            export LETSENCRYPT_CERT="$location/fullchain.pem"
            echo "✅ Using certificates from: $location"
            return 0
        fi
    done
    return 1
}

# Try to find certificates
if find_certificates; then
    echo "   Key: $LETSENCRYPT_KEY"
    echo "   Cert: $LETSENCRYPT_CERT"
else
    echo "⚠️  Certificates not found in common locations"
    echo "   Available certificate directories:"
    ls -l /usr/syno/etc/certificate/system/default/
    ls -l /usr/syno/etc/certificate/ReverseProxy/
    echo "   Using self-signed certificates for now"
    unset LETSENCRYPT_KEY
    unset LETSENCRYPT_CERT
fi

# Add npm to PATH if not already there
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found in PATH"
    echo "   Trying to find npm..."
    NPM_PATH=$(find /usr -name npm 2>/dev/null | head -1)
    if [ -n "$NPM_PATH" ]; then
        echo "   Found npm at: $NPM_PATH"
        export PATH="$(dirname $NPM_PATH):$PATH"
    else
        echo "   npm not found. Please install Node.js and npm"
        exit 1
    fi
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Start the HTTPS server
echo "🌐 Starting HTTPS server..."
npm run serve-https

export LETSENCRYPT_KEY="/volume2/video/Projects/IamHereApp/backend/ssl/privkey.pem"
export LETSENCRYPT_CERT="/volume2/video/Projects/IamHereApp/backend/ssl/fullchain.pem" 