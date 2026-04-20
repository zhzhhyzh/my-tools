#!/bin/bash

echo "============================================"
echo "   PDF Tools Suite - Starting..."
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect Python command
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

# Start Python Processing Service
echo "[1/2] Starting Processing Engine (port 5000)..."
cd "$SCRIPT_DIR/processing"
$PYTHON_CMD -m uvicorn main:app --host 127.0.0.1 --port 5000 &
PYTHON_PID=$!

sleep 3

# Start Node.js Backend (serves frontend + API)
echo "[2/2] Starting PDF Tools Server (port 3001)..."
cd "$SCRIPT_DIR/backend"
node index.js &
NODE_PID=$!

sleep 2

echo ""
echo "============================================"
echo "   PDF Tools is running!"
echo "   Opening http://localhost:3001 ..."
echo "============================================"
echo ""

# Open browser
if command -v open &> /dev/null; then
    open http://localhost:3001
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
fi

echo "Press Ctrl+C to stop all services..."

# Trap to clean up on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $PYTHON_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    wait $PYTHON_PID 2>/dev/null
    wait $NODE_PID 2>/dev/null
    echo "Done."
    exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
