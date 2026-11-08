#!/bin/bash
# ============================================================
# ExamJK 100% Clean Re-Host & Deep Disk Cleanup for cPanel
# ============================================================

echo "============================================================"
echo "🧹 STARTING EXAMJK CLEAN RE-HOST & DEEP DISK CLEANUP..."
echo "============================================================"

# 1. Kill old hanging Node processes
echo "🛑 [1/7] Terminating lingering processes..."
killall -9 node 2>/dev/null || true
pkill -9 -u examjkco node 2>/dev/null || true

# 2. Deep Disk Cleanup (Frees up 1 GB - 2 GB of space)
echo "🗑️ [2/7] Cleaning up cPanel trash, npm cache, and heavy zip archives..."
# Empty cPanel Trash bin
rm -rf ~/.trash/* ~/.trash/.* 2>/dev/null || true

# Clean npm cache and temporary cache folders
rm -rf ~/.npm ~/.cache 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# Remove leftover large zip files and deploy archives from home directory and repo
find ~/ -maxdepth 3 -type f \( -name "*.zip" -o -name "*.tar.gz" -o -name "*.tgz" \) 2>/dev/null | grep -v "/cpanel_backup/" | xargs rm -f 2>/dev/null || true

# Clean temporary log files
rm -rf ~/tmp/*.log ~/tmp/passenger.* 2>/dev/null || true

# 3. Clean and prepare repository directory
echo "📦 [3/7] Cleaning application repository directory..."
cd /home/examjkco/repositories/Sigma-UBT 2>/dev/null || cd ~/repositories/Sigma-UBT 2>/dev/null || cd "$HOME/repositories/Sigma-UBT"

# Remove physical node_modules so CloudLinux can create its symlink
rm -rf node_modules tmp/* .next/cache *.zip *.log 2>/dev/null || true

# 4. Fetch pristine code and optimized Next.js build from GitHub
echo "⬇️ [4/7] Pulling fresh production build from GitHub main..."
git fetch origin main
git reset --hard origin/main
git clean -fd -e prisma/dev.db

# Compress git history to save disk space
git gc --prune=now 2>/dev/null || true

# 5. Set up clean .env configuration
echo "⚙️ [5/7] Configuring production environment..."
cat << 'EOF' > .env
NODE_ENV=production
DATABASE_URL=file:/home/examjkco/repositories/Sigma-UBT/prisma/dev.db
JWT_SECRET=832ce4a1fc65c15861e817c7784d9b155061c91281a52e743dc0963a261ab7e0
NEXT_PUBLIC_APP_NAME="ExamJK UBT"
PORT=3000
EOF

# 6. Create Passenger restart trigger
echo "📁 [6/7] Setting restart trigger..."
mkdir -p tmp
touch tmp/restart.txt

# 7. Check current disk usage
echo "💾 [7/7] Disk cleanup completed!"
echo "------------------------------------------------------------"
echo "Current App Directory Size:"
du -sh . 2>/dev/null || true
echo "------------------------------------------------------------"

echo "============================================================"
echo "✅ DISK CLEANED & APP RE-HOST READY!"
echo "👉 Now in cPanel 'Setup Node.js App':"
echo "   Click 'Restart' (🔄) or 'Start Application'"
echo "   Then open https://examjk.com"
echo "============================================================"
