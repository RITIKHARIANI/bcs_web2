#!/bin/bash

# ==========================================
# Quick Development Start Script
# (Use this after initial setup is complete)
# ==========================================

set -e

echo "🚀 Starting BCS E-Textbook Platform development server..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please run ./scripts/local-setup.sh first"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client if needed
if [ ! -d node_modules/.prisma ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
fi

# Quick database connection test
echo "🗄️  Testing database connection..."
npx prisma db pull --preview-feature > /dev/null 2>&1 || {
    echo "⚠️  Database connection issue. Attempting to push schema..."
    npx prisma db push
}

echo "✅ Database ready!"

# Start development server
echo "🏃 Starting Next.js development server..."
echo "📍 Application: http://localhost:3000"
echo "🎓 Faculty Login: http://localhost:3000/auth/login"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

npm run dev
