#!/bin/bash
# ExamJK macOS Native Launcher for Intel Core Macs (x86_64)
echo "=========================================================="
echo "   ExamJK - Intel Mac Launcher (Core i3/i5/i7/i9)"
echo "=========================================================="
echo "Launching ExamJK in standalone high-performance window..."

TARGET_URL="http://localhost:3000"

if [ -d "/Applications/Google Chrome.app" ]; then
    arch -x86_64 open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    arch -x86_64 open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
    arch -x86_64 open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL" 2>/dev/null || open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL"
else
    open "$TARGET_URL"
fi
exit 0
