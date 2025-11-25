#!/bin/bash

# Script to run database migrations manually
# Usage: ./run_migration.sh [up|down]

set -e

# Load environment variables
if [ -f ../../.env ]; then
    export $(cat ../../.env | grep -v '^#' | xargs)
fi

# Default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-sid_seirotan}

# Build connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"

# Check if migrate is installed
if ! command -v migrate &> /dev/null; then
    echo "Error: migrate CLI not found"
    echo "Install it from: https://github.com/golang-migrate/migrate"
    echo ""
    echo "Or use Docker:"
    echo "docker run -v \$(pwd):/migrations --network host migrate/migrate -path=/migrations -database \"$DATABASE_URL\" up"
    exit 1
fi

# Run migration
ACTION=${1:-up}

echo "Running migration: $ACTION"
echo "Database: $DB_NAME at $DB_HOST:$DB_PORT"
echo ""

migrate -path . -database "$DATABASE_URL" $ACTION

echo ""
echo "Migration completed successfully!"
