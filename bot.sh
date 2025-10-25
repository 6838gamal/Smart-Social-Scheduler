#!/bin/bash

# Environment variables should be set in Replit Secrets
# This script validates that required environment variables are set

echo "=== إعدادات البوت ==="
if [ -z "$SMART_SCHEDULER_TOKEN" ]; then
    echo "❌ SMART_SCHEDULER_TOKEN not set"
else
    echo "✅ SMART_SCHEDULER_TOKEN is set"
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ GOOGLE_CLIENT_ID not set"
else
    echo "✅ GOOGLE_CLIENT_ID is set"
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ GOOGLE_CLIENT_SECRET not set"
else
    echo "✅ GOOGLE_CLIENT_SECRET is set"
fi
