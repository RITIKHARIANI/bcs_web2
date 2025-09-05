#!/bin/bash

# ==========================================
# BCS E-Textbook Platform - Local Development Setup
# ==========================================

set -e  # Exit on any error

echo "🚀 Starting local development setup for BCS E-Textbook Platform..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "📋 Please create .env.local from .env.example and configure your database connection."
    echo "   cp .env.example .env.local"
    echo "   # Edit .env.local with your actual database URL and other settings"
    exit 1
fi

# Check if Node.js version is sufficient
node_version=$(node -v | cut -d'v' -f2)
required_version="18.17.0"

if ! node -p "process.version.localeCompare('v$required_version', undefined, { numeric: true, sensitivity: 'base' }) >= 0" > /dev/null 2>&1; then
    echo "❌ Node.js version $required_version or higher is required. You have: $node_version"
    echo "Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version check passed: $node_version"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check database connection
echo "🗄️  Checking database connection..."
if ! npx prisma db push --preview-feature 2>/dev/null; then
    echo "❌ Database connection failed!"
    echo "Please check your DATABASE_URL in .env.local"
    echo "Make sure your PostgreSQL database is running and accessible."
    exit 1
fi

echo "✅ Database connection successful!"

# Push database schema (for development)
echo "🔄 Pushing database schema..."
npx prisma db push

# Open Prisma Studio (optional)
read -p "🎯 Do you want to open Prisma Studio to view your database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎭 Opening Prisma Studio..."
    npx prisma studio &
    echo "Prisma Studio will open in your browser at http://localhost:5555"
fi

# Start development server
echo "🏃 Starting development server..."
echo "📍 Your application will be available at: http://localhost:3000"
echo "🎓 Faculty login will be available at: http://localhost:3000/auth/login"
echo ""
echo "🎉 Setup complete! Starting the development server..."
echo "Press Ctrl+C to stop the server."
echo ""

# Start the dev server
npm run dev
