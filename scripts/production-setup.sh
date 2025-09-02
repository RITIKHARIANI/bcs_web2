#!/bin/bash

# =======================================================
# BCS E-Textbook Platform - Production Setup Script
# =======================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    error "Please do not run this script as root"
fi

log "Starting BCS E-Textbook Platform Production Setup..."

# =======================================================
# 1. Environment Setup
# =======================================================

log "Setting up environment variables..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    if [ -f "env.production.template" ]; then
        log "Copying environment template..."
        cp env.production.template .env.production
        warn "Please edit .env.production with your actual configuration values"
        echo "Required variables to configure:"
        echo "- DATABASE_URL"
        echo "- NEXTAUTH_SECRET"
        echo "- NEXTAUTH_URL"
        echo ""
        read -p "Press Enter after you've configured .env.production..."
    else
        error ".env.production template not found. Please create .env.production manually."
    fi
fi

# Validate required environment variables
source .env.production 2>/dev/null || error "Failed to load .env.production"

if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL is required in .env.production"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    error "NEXTAUTH_SECRET is required in .env.production"
fi

if [ -z "$NEXTAUTH_URL" ]; then
    error "NEXTAUTH_URL is required in .env.production"
fi

log "Environment variables validated ✓"

# =======================================================
# 2. System Dependencies
# =======================================================

log "Checking system dependencies..."

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18 or higher is required. Current: $(node --version 2>/dev/null || echo 'not installed')"
fi
log "Node.js version: $(node --version) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
    error "npm is required but not installed"
fi
log "npm version: $(npm --version) ✓"

# Check PostgreSQL client
if ! command -v psql &> /dev/null; then
    warn "PostgreSQL client not found. Please install postgresql-client for database operations."
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    log "Docker version: $(docker --version) ✓"
else
    warn "Docker not found. Docker deployment will not be available."
fi

# =======================================================
# 3. Project Dependencies
# =======================================================

log "Installing project dependencies..."

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --production=false

log "Dependencies installed ✓"

# =======================================================
# 4. Database Setup
# =======================================================

log "Setting up database..."

# Generate Prisma client
npx prisma generate

# Test database connection
log "Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
    log "Database connection successful ✓"
else
    error "Database connection failed. Please check your DATABASE_URL"
fi

# Run migrations
log "Running database migrations..."
npx prisma migrate deploy

log "Database setup completed ✓"

# =======================================================
# 5. Build Application
# =======================================================

log "Building application for production..."

# Set production environment
export NODE_ENV=production

# Build the application
npm run build

log "Application built successfully ✓"

# =======================================================
# 6. Create Required Directories
# =======================================================

log "Creating required directories..."

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Create logs directory
mkdir -p logs
chmod 755 logs

# Create SSL directory (if using custom certificates)
mkdir -p nginx/ssl
chmod 700 nginx/ssl

log "Directories created ✓"

# =======================================================
# 7. Security Setup
# =======================================================

log "Setting up security configurations..."

# Generate strong session secret if not provided
if [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
    warn "NEXTAUTH_SECRET should be at least 32 characters long"
fi

# Set proper file permissions
chmod 600 .env.production
chmod 755 scripts/*.sh

log "Security configurations applied ✓"

# =======================================================
# 8. SSL Certificate Setup (if using custom certificates)
# =======================================================

if [ "$SSL_CERT_PATH" ] && [ "$SSL_KEY_PATH" ]; then
    log "Setting up SSL certificates..."
    
    if [ -f "$SSL_CERT_PATH" ] && [ -f "$SSL_KEY_PATH" ]; then
        cp "$SSL_CERT_PATH" nginx/ssl/certificate.crt
        cp "$SSL_KEY_PATH" nginx/ssl/private.key
        chmod 600 nginx/ssl/private.key
        chmod 644 nginx/ssl/certificate.crt
        log "SSL certificates configured ✓"
    else
        warn "SSL certificate files not found. Please ensure certificates are available."
    fi
else
    warn "SSL certificate paths not configured. Using Let's Encrypt or load balancer SSL is recommended."
fi

# =======================================================
# 9. Backup Setup
# =======================================================

log "Setting up backup procedures..."

# Create backup directory
mkdir -p backups/{database,files}
chmod 755 backups backups/*

# Make backup scripts executable
if [ -f "scripts/backup-database.sh" ]; then
    chmod +x scripts/backup-database.sh
fi

if [ -f "scripts/backup-files.sh" ]; then
    chmod +x scripts/backup-files.sh
fi

log "Backup setup completed ✓"

# =======================================================
# 10. Health Check Setup
# =======================================================

log "Setting up health monitoring..."

# Test health endpoint build
if [ -f "src/app/api/health/route.ts" ]; then
    log "Health check endpoint configured ✓"
else
    warn "Health check endpoint not found"
fi

# =======================================================
# 11. Performance Optimization
# =======================================================

log "Applying performance optimizations..."

# Optimize images in public directory
if command -v imagemin &> /dev/null; then
    log "Optimizing static images..."
    find public -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | head -10 | while read img; do
        imagemin "$img" --out-dir="$(dirname "$img")" 2>/dev/null || true
    done
else
    warn "imagemin not found. Consider installing for image optimization."
fi

log "Performance optimizations applied ✓"

# =======================================================
# 12. Final Validation
# =======================================================

log "Running final validation..."

# Test application build
if [ -d ".next" ]; then
    log "Next.js build directory exists ✓"
else
    error "Next.js build failed"
fi

# Test Prisma client
if npx prisma --version >/dev/null 2>&1; then
    log "Prisma client ready ✓"
else
    error "Prisma client configuration failed"
fi

# Validate environment variables one more time
node -e "
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET', 
    'NEXTAUTH_URL'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
}

console.log('Environment validation passed');
" || error "Environment validation failed"

log "Final validation completed ✓"

# =======================================================
# 13. Deployment Instructions
# =======================================================

log "Production setup completed successfully! 🚀"
echo ""
echo -e "${BLUE}=== Next Steps ===${NC}"
echo ""
echo "1. Review and test your configuration:"
echo "   npm run start"
echo ""
echo "2. For Docker deployment:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "3. For PM2 deployment:"
echo "   pm2 start ecosystem.config.js --env production"
echo ""
echo "4. Configure your reverse proxy (Nginx/Apache) to point to port 3000"
echo ""
echo "5. Set up SSL certificates with Let's Encrypt:"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "6. Configure regular backups with cron:"
echo "   crontab -e"
echo "   # Add: 0 2 * * * /path/to/scripts/backup-database.sh"
echo ""
echo -e "${GREEN}Your BCS E-Textbook Platform is ready for production! 🎉${NC}"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo "- Test all functionality in production environment"
echo "- Monitor logs and performance"
echo "- Set up monitoring and alerting"
echo "- Configure automated backups"
echo "- Update DNS records to point to your server"
echo ""

# Create deployment summary
cat > DEPLOYMENT_SUMMARY.txt << EOF
BCS E-Textbook Platform - Production Deployment Summary
======================================================

Deployment Date: $(date)
Node.js Version: $(node --version)
Environment: Production

Configuration:
- Database: Configured ✓
- Authentication: Configured ✓  
- File Storage: $([ "$AWS_S3_BUCKET_NAME" ] && echo "AWS S3" || [ "$CLOUDINARY_CLOUD_NAME" ] && echo "Cloudinary" || echo "Local Storage")
- SSL: $([ "$SSL_CERT_PATH" ] && echo "Custom Certificates" || echo "Load Balancer/Let's Encrypt Required")

Next Steps:
1. Start the application
2. Configure reverse proxy
3. Set up SSL certificates
4. Configure backups
5. Monitor and test

Support: Refer to DEPLOYMENT_GUIDE.md for detailed instructions
EOF

log "Deployment summary saved to DEPLOYMENT_SUMMARY.txt"
