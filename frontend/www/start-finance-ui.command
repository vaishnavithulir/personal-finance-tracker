#!/bin/bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
cd "$(dirname "$0")"
echo "--- Initializing Dumbo Finance Frontend ---"
echo "Cleaning up port 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
echo "Starting Frontend Server..."
npm run dev
