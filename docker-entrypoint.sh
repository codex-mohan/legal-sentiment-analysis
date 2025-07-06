#!/bin/sh

# Start the Python backend
echo "\033[0;32m🐍 Starting Python backend...\033[0m"
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start the Next.js frontend
echo "\033[0;32m🌐 Starting Next.js frontend...\033[0m"
cd /app/frontend
pnpm start &

# Wait for both processes to finish (they won't in this case, as they are servers)
# This is a simple way to keep the container running
wait