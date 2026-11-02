#!/bin/bash
# ============================================================
# Himalaa Hosting Deployment Script for ExamJK (sigma-ubt)
# Run this LOCALLY before uploading to server
# ============================================================

echo "🚀 Preparing ExamJK for Himalaa Hosting..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Build Next.js app
echo "🏗️  Building Next.js app..."
NODE_ENV=production npm run build

echo ""
echo "✅ Build complete! Now upload these to server:"
echo "   - .next/"
echo "   - src/"
echo "   - public/"
echo "   - prisma/"
echo "   - server.js"
echo "   - app.js"
echo "   - .htaccess"
echo "   - next.config.mjs"
echo "   - package.json"
echo "   - package-lock.json"
echo "   - .env"
echo ""
echo "❌ Do NOT upload:"
echo "   - node_modules/"
echo "   - .git/"
echo "   - electron/"
echo "   - android/"
echo "   - scripts/"
echo "   - ziAqyBqm"
echo "   - next_build.zip"
