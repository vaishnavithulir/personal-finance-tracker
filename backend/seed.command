#!/bin/bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
cd "$(dirname "$0")"
echo "--- Initializing User Seed Process ---"
node seed-users.js
echo "--- Done ---"
