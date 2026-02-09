#!/bin/bash
API_KEY="AIzaSyD0T-I27tJ16dRsJrSFyKIICoWZMSnpJGk"
VIDEO_ID="9bZkp7q19f0" # Gangnam Style

echo "Testing YouTube API Key..."
URL="https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${VIDEO_ID}&key=${API_KEY}"

RESPONSE=$(curl -s "$URL")

if echo "$RESPONSE" | grep -q "PSY"; then
  echo "✅ API Key is Valid! Found 'PSY' in response."
  echo "Video Title: $(echo "$RESPONSE" | grep -o '"title": "[^"]*"' | head -1)"
else
  echo "❌ API Key Verification Failed."
  echo "Response: $RESPONSE"
fi
