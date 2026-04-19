#!/bin/bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
cd "$(dirname "$0")"
echo "--- Initializing Dumbo Finance Backend ---"
echo "Cleaning up port 5005..."
lsof -ti:5005 | xargs kill -9 2>/dev/null
echo "Starting Server..."
npm start
