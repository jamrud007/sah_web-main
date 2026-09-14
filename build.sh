#!/bin/bash
set -e

# Script runs from its own location (project root)
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT" || {
    echo "❌ ERROR: Failed to enter project directory: $PROJECT_ROOT"
    exit 1
}

echo "📍 Project root: $PROJECT_ROOT"

# --------------------------
# ✅ Check .env file exists & has APP_PORT
# --------------------------
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "Creating .env with default APP_PORT=8011..."
    echo "APP_PORT=8011" > "$ENV_FILE"
else
    # Check if APP_PORT is defined in .env
    if ! grep -q "^APP_PORT=" "$ENV_FILE"; then
        echo "ℹ️ .env found but APP_PORT not set — adding APP_PORT=8011..."
        echo "APP_PORT=8011" >> "$ENV_FILE"
    else
        APP_PORT_VALUE=$(grep "^APP_PORT=" "$ENV_FILE" | cut -d'=' -f2)
        echo "✅ .env verified | APP_PORT=$APP_PORT_VALUE"
    fi
fi

echo ""
echo "🔄 Pulling latest code from Git..."
git pull origin staging

echo ""
echo "🏗️ Building & starting container..."
docker compose -f staging-compose.yaml --env-file .env up -d --build

echo ""
echo "✅ Application updated successfully!"
date > last_update.txt
echo "🕐 Last updated: $(date)"
