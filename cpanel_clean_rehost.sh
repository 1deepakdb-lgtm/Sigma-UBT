#!/bin/bash
# ============================================================
# ExamJK Ultra-Lean Deep Cleanup & Repository Shrinker
# ============================================================

echo "============================================================"
echo "🧹 STARTING REPOSITORY & DISK ULTRA-LEAN CLEANUP..."
echo "============================================================"

# 1. Kill any running node processes
killall -9 node 2>/dev/null || true
pkill -9 -u examjkco node 2>/dev/null || true

# 2. Clean cPanel Trash & Global Caches
rm -rf ~/.trash/* ~/.trash/.* ~/.npm ~/.cache ~/tmp/*.log 2>/dev/null || true

# 3. Enter repository
cd /home/examjkco/repositories/Sigma-UBT 2>/dev/null || cd ~/repositories/Sigma-UBT 2>/dev/null || cd "$HOME/repositories/Sigma-UBT"

# 4. Remove heavy non-web folders from the server
# (Android Studio files and Electron desktop wrappers are NOT needed on web hosting)
echo "🗑️ Removing non-web files (Android build files, Electron, build caches)..."
rm -rf android electron .next/cache *.zip *.tar.gz *.log public/downloads/*.apk public/downloads/*.exe 2>/dev/null || true
rm -rf node_modules tmp/* 2>/dev/null || true

# 5. Compress and shrink Git repository database
echo "🗜️ Shrinking Git database and purging old commit bloat..."
git reflog expire --expire=now --all 2>/dev/null || true
git gc --prune=now --aggressive 2>/dev/null || true

# 6. Ensure clean production .env is configured
cat << 'EOF' > .env
NODE_ENV=production
DATABASE_URL=file:/home/examjkco/repositories/Sigma-UBT/prisma/dev.db
JWT_SECRET=832ce4a1fc65c15861e817c7784d9b155061c91281a52e743dc0963a261ab7e0
NEXT_PUBLIC_APP_NAME="ExamJK UBT"
PORT=3000
EOF

# 7. Create restart trigger
mkdir -p tmp
touch tmp/restart.txt

echo "============================================================"
echo "💾 CLEANUP COMPLETE! NEW REPOSITORY SIZE:"
du -sh . 2>/dev/null || true
echo "============================================================"
