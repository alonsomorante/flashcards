#!/bin/bash

set -e

echo "=========================================="
echo "  Flashcards - Vercel Deploy"
echo "=========================================="
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if logged in
echo "Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo ""
    echo "You need to log in to Vercel first."
    echo "Running: vercel login"
    echo ""
    vercel login
fi

# Install all dependencies first
echo ""
echo "Installing dependencies..."
bun install

# Build server for Vercel (CJS bundle to api/index.cjs)
echo ""
echo "Building server bundle for Vercel..."
cd apps/server
# Temporarily remove "type": "module" so Bun outputs CJS
node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json')); delete p.type; fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
bun build src/app.ts --outfile ../../api/index.cjs --target node --format cjs
# Restore "type": "module"
git checkout package.json
cd ../..

echo ""
echo "Bundle created at api/index.cjs"

# Build frontend
echo ""
echo "Building frontend..."
cd apps/web
bun run build
cd ../..

# Deploy
echo ""
echo "Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "=========================================="
echo "  Deploy complete!"
echo "=========================================="
