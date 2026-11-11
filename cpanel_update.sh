#!/bin/bash
# ============================================================
# ExamJK Production Update Script for cPanel (examjk.com)
# ============================================================

echo "🚀 [ExamJK] Starting update on cPanel server..."

# 1. Preserve SQLite database if modified on production
if [ -f "prisma/dev.db" ]; then
  cp -n prisma/dev.db prisma/dev.db.cpanel_backup 2>/dev/null || true
fi

# 2. Stash any local file locks or modified files so git never blocks
git stash --include-untracked 2>/dev/null || true

# 3. Fetch latest release from GitHub
git fetch origin main

# 4. Synchronize cleanly with origin/main
git reset --hard origin/main

# 5. Remove real node_modules directory if it is not a symlink (CloudLinux requirement)
if [ -d "node_modules" ] && [ ! -L "node_modules" ]; then
  echo "🧹 Removing conflicting physical node_modules so CloudLinux can manage its symlink..."
  rm -rf node_modules
fi

# 5.1 Ensure production dependencies exist
if [ ! -d "node_modules/next" ]; then
  echo "📦 Ensuring production node_modules exist..."
  npm install --omit=dev --no-audit --no-fund 2>/dev/null || true
fi

# 6. Ensure tmp directory exists and trigger passenger restart
mkdir -p tmp
touch tmp/restart.txt

echo "============================================================"
echo "✅ ExamJK code and production .next build updated to latest!"
echo "👉 In cPanel: Go to 'Setup Node.js App' -> Click 'Restart' (🔄)"
echo "   Then visit https://examjk.com/admin/listening to verify!"
echo "============================================================"
