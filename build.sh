#!/bin/bash
set -e

# Build server bundle for Vercel
cd apps/server
node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json')); delete p.type; fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
bun build src/app.ts --outfile ../../api/server.cjs --target node --format cjs
node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json')); p.type='module'; fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
cd ../..

# Build frontend
cd apps/web
bun run build
cd ../..
