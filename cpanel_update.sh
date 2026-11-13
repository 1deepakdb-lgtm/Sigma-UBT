#!/bin/bash
# ============================================================
# ExamJK Production Update Script for cPanel (examjk.com)
# ============================================================

# Ensure we are inside the repository directory
REPO_DIR="/home/examjkco/repositories/Sigma-UBT"
if [ -d "$REPO_DIR" ]; then
  cd "$REPO_DIR" || exit 1
elif [ -d "$HOME/repositories/Sigma-UBT" ]; then
  cd "$HOME/repositories/Sigma-UBT" || exit 1
else
  cd "$(dirname "$0")" || exit 1
fi

echo "🚀 [ExamJK] Starting update in $(pwd)..."

# Ensure convenient shortcut exists in $HOME so 'bash cpanel_update.sh' works from ~
if [ -n "$HOME" ] && [ -d "$HOME" ]; then
  ln -sf "$(pwd)/cpanel_update.sh" "$HOME/cpanel_update.sh" 2>/dev/null || true
fi

# 1. Kill stale node processes holding old build in memory
pkill -9 -u examjkco node 2>/dev/null || true

# 2. Preserve SQLite database if modified on production
if [ -f "prisma/dev.db" ]; then
  cp -n prisma/dev.db prisma/dev.db.cpanel_backup 2>/dev/null || true
fi

# 3. Clean any git locks or corrupted branch references
rm -f .git/index.lock .git/refs/remotes/origin/*\ * 2>/dev/null || true
git stash --include-untracked 2>/dev/null || true

# 4. Fetch latest release from GitHub
git fetch origin main --force

# 5. Synchronize cleanly with origin/main
git reset --hard origin/main

# 6. Clean stale build caches
rm -rf .next/cache tmp/* 2>/dev/null || true

# 7. Remove real node_modules directory if it is not a symlink (CloudLinux requirement)
if [ -d "node_modules" ] && [ ! -L "node_modules" ]; then
  echo "🧹 Removing conflicting physical node_modules so CloudLinux can manage its symlink..."
  rm -rf node_modules
fi

# 8. Ensure production dependencies exist
if [ ! -d "node_modules/next" ]; then
  echo "📦 Ensuring production node_modules exist..."
  npm install --omit=dev --no-audit --no-fund 2>/dev/null || true
fi

# 9. Ensure tmp directory exists and trigger passenger restart
mkdir -p tmp
touch tmp/restart.txt

echo "============================================================"
echo "✅ ExamJK code updated to latest!"
echo "📌 Active Server Build ID: $(cat .next/BUILD_ID 2>/dev/null)"
echo "👉 In cPanel: Go to 'Setup Node.js App' -> Click 'Restart' (🔄)"
echo "   Then visit https://examjk.com/ to verify!"
echo "============================================================"
