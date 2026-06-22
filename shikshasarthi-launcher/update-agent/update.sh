#!/bin/bash

# Configuration from environment or defaults
HUB_IP="100.111.94.52"
HUB_PORT="4000"
MANIFEST_URL="http://${HUB_IP}:${HUB_PORT}/api/updates/manifest"
COMPOSE_FILE="${COMPOSE_FILE:-/launcher_root/docker-compose.yml}"
ENV_FILE="${ENV_FILE:-/launcher_root/.env}"

echo "[$(date)] Update agent started."

while true; do
    echo "[$(date)] Checking for updates..."
    
    # Get the manifest
    MANIFEST=$(curl -s "$MANIFEST_URL")
    
    if [ -n "$MANIFEST" ]; then
        REMOTE_VERSION=$(echo "$MANIFEST" | grep -oP '(?<="version":")[^"]*')
        LOCAL_VERSION=$(grep -oP '(?<=APP_VERSION=)[^"]*' "$ENV_FILE")
        
        if [ "$REMOTE_VERSION" != "$LOCAL_VERSION" ]; then
            echo "New version detected: $REMOTE_VERSION (Local: $LOCAL_VERSION). Updating..."
            
            # Update the .env file with new version
            # Note: This requires .env to be writable. 
            # If mounted as RO, this will fail. For now we assume the launcher root mount is RW or we handle versioning differently.
            sed -i "s/APP_VERSION=$LOCAL_VERSION/APP_VERSION=$REMOTE_VERSION/" "$ENV_FILE"
            
            # Pull new images and restart
            docker compose -f "$COMPOSE_FILE" pull
            docker compose -f "$COMPOSE_FILE" up -d
            
            echo "Update to $REMOTE_VERSION complete."
        else
            echo "Already at latest version ($LOCAL_VERSION)."
        fi
    else
        echo "Failed to fetch manifest from $MANIFEST_URL"
    fi
    
    # Wait for 1 hour
    sleep 3600
done
