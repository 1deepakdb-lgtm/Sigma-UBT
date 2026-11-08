#!/bin/bash
# ============================================================
# ExamJK Ultra-Lean Deep Cleanup & Production Starter
# ============================================================

echo "============================================================"
echo "🧹 STARTING EXAMJK HOSTING RECOVERY & PRODUCTION SETUP..."
echo "============================================================"

# 1. Kill any stale node processes
pkill -9 -u examjkco node 2>/dev/null || true

# 2. Clean cPanel Trash & Global Caches
rm -rf ~/.trash/* ~/.trash/.* ~/.npm ~/.cache ~/tmp/*.log 2>/dev/null || true

# 3. Enter repository
cd /home/examjkco/repositories/Sigma-UBT 2>/dev/null || cd ~/repositories/Sigma-UBT 2>/dev/null || cd "$HOME/repositories/Sigma-UBT"

# 4. Remove heavy non-web folders from the server
echo "🗑️ Removing non-web files (Android build files, Electron, build caches)..."
rm -rf android electron .next/cache *.zip *.tar.gz *.log public/downloads/*.apk public/downloads/*.exe tmp/* 2>/dev/null || true

# 5. Compress and shrink Git repository database
echo "🗜️ Shrinking Git database..."
git reflog expire --expire=now --all 2>/dev/null || true
git gc --prune=now 2>/dev/null || true

# 6. Ensure clean production .env is configured with all credentials
cat << 'EOF' > .env
NODE_ENV=production
DATABASE_URL=file:/home/examjkco/repositories/Sigma-UBT/prisma/dev.db
JWT_SECRET=832ce4a1fc65c15861e817c7784d9b155061c91281a52e743dc0963a261ab7e0
NEXT_PUBLIC_APP_NAME="ExamJK UBT"
PORT=3000
R2_ACCOUNT_ID="b70b92d169949696594931fa076ae637"
R2_ACCESS_KEY_ID="ef2b9504becd6f05ca27aec5b3914608"
R2_SECRET_ACCESS_KEY="5256075c5425a63785e3981477b159f6279a97eee7e8264792368276e028316e"
R2_BUCKET_NAME="sigma"
R2_PUBLIC_URL="https://b70b92d169949696594931fa076ae637.r2.cloudflarestorage.com"
EOF

# 7. Setup Node 20 environment and install production dependencies
echo "📦 Ensuring Node.js production dependencies are installed..."
export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH
export TMPDIR=$HOME/tmp
mkdir -p "$HOME/tmp"

if [ ! -d "node_modules/@prisma/client" ] || [ ! -d "node_modules/next" ]; then
  npm install --omit=dev --no-audit --no-fund
fi

# 8. Generate Prisma client
echo "🔄 Generating Prisma Client..."
npx prisma generate

# 9. Create restart trigger for Phusion Passenger
mkdir -p tmp
touch tmp/restart.txt

echo "============================================================"
echo "🚀 EXAMJK SERVER READY! NEW REPOSITORY SIZE:"
du -sh . 2>/dev/null || true
echo "============================================================"
