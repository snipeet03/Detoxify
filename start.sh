#!/bin/bash
# One-command startup for Detoxify
# Usage: bash start.sh

echo ""
echo "⚡ Starting Detoxify..."
echo ""

# Install backend deps
echo "📦 Installing backend dependencies..."
cd backend && npm install --silent
cd ..

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd frontend && npm install --silent
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "▶  Run these in two separate terminals:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "   Then open: http://localhost:5173"
echo ""
