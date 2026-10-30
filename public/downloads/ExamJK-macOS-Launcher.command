#!/bin/bash
# ExamJK macOS Native Standalone App Launcher
TARGET_URL="http://localhost:3000"

if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "/Applications/Google Chrome.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -na "/Applications/Microsoft Edge.app" --args --app="$TARGET_URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
    open -na "/Applications/Brave Browser.app" --args --app="$TARGET_URL"
else
    open "$TARGET_URL"
fi
