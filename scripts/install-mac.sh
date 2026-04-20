#!/bin/bash
set -e

echo "============================================"
echo "   PDF Tools Suite - Mac/Linux Installer"
echo "============================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "        Install via: brew install node"
    echo "        Or download from: https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js $(node -v)"

# Check Python
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python is not installed."
    echo "        Install via: brew install python"
    exit 1
fi
echo "[OK] $($PYTHON_CMD --version)"

# Check pip
PIP_CMD=""
if command -v pip3 &> /dev/null; then
    PIP_CMD="pip3"
elif command -v pip &> /dev/null; then
    PIP_CMD="pip"
else
    echo "[ERROR] pip is not installed."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "[1/3] Installing Node.js backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install --production
echo "[OK] Backend dependencies installed."

echo ""
echo "[2/3] Installing Python processing dependencies..."
cd "$SCRIPT_DIR/processing"
$PIP_CMD install -r requirements.txt
echo "[OK] Python dependencies installed."

echo ""
echo "[3/3] Building frontend..."
cd "$SCRIPT_DIR/frontend"
npm install
npx vite build
echo "[OK] Frontend built."

echo ""
echo "============================================"
echo "   Installation complete!"
echo "   Run ./run-mac.sh to start PDF Tools."
echo "============================================"
echo ""
echo "[OPTIONAL] For full functionality, also install:"
echo "  - LibreOffice: brew install --cask libreoffice"
echo "  - Poppler:     brew install poppler"
echo "  - Tesseract:   brew install tesseract"
echo "  - wkhtmltopdf: brew install --cask wkhtmltopdf"
echo ""
