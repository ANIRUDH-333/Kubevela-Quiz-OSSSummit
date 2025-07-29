#!/bin/bash

echo "🚀 Starting Quiz Backend..."
echo "📂 Current directory: $(pwd)"
echo "📋 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

echo ""
echo "🔧 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🌟 Starting server..."
node server.js
