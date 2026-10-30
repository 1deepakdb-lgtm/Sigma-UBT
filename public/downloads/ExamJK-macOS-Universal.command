#!/bin/bash
# ExamJK macOS Universal Standalone App Launcher (Apple Silicon & Intel)
echo "=========================================================="
echo "    ExamJK - macOS Universal Launcher (Silicon & Intel)"
echo "=========================================================="

ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    echo "Detected: Apple Silicon (M1/M2/M3/M4) - ARM64 Mode"
else
    echo "Detected: Intel Mac - x86_64 Mode"
fi

TARGET_URL="http://localhost:3000"
if [ "$1" != "" ]; then
    TARGET_URL="$1"
fi

echo "Launching ExamJK at $TARGET_URL ..."

if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
    open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL"
else
    open "$TARGET_URL"
fi
exit 0
