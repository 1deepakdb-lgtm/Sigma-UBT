#!/bin/bash
# ============================================================
# ExamJK 100% Clean Re-Host Automation Script for cPanel
# ============================================================

echo "🧹 [1/6] Terminating old zombie processes..."
killall -9 node 2>/dev/null || true
pkill -9 -u examjkco node 2>/dev/null || true

echo "📦 [2/6] Cleaning up old caches, leftover zip files, and conflicting node_modules..."
cd /home/examjkco/repositories/Sigma-UBT 2>/dev/null || cd ~/repositories/Sigma-UBT
rm -rf node_modules tmp/* .next/cache *.zip 2>/dev/null || true

echo "⬇️ [3/6] Fetching pristine latest code and production Next.js build from GitHub..."
git fetch origin main
git reset --hard origin/main

echo "⚙️ [4/6] Setting up production .env configuration..."
cat << 'EOF' > .env
NODE_ENV=production
DATABASE_URL=file:/home/examjkco/repositories/Sigma-UBT/prisma/dev.db
JWT_SECRET=832ce4a1fc65c15861e817c7784d9b155061c91281a52e743dc0963a261ab7e0
NEXT_PUBLIC_APP_NAME="ExamJK UBT"
PORT=3000
EOF

echo "📁 [5/6] Creating restart triggers..."
mkdir -p tmp
touch tmp/restart.txt

echo "============================================================"
echo "✅ CLEAN RE-HOST READY!"
echo "👉 Now in cPanel 'Setup Node.js App':"
echo "   1. If your app is not listed: Click 'Create Application',"
echo "      - Root: repositories/Sigma-UBT"
echo "      - URL: examjk.com"
echo "      - Startup file: app.js"
echo "   2. If it is already listed: Click 'Restart' (🔄)"
echo "   3. Open https://examjk.com and enjoy your fast, clean site!"
echo "============================================================"
