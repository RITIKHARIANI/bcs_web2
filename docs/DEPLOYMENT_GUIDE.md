# 🚀 BCS E-Textbook Platform - Production Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the BCS E-Textbook Platform to production environments.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.17.0 or higher
- **PostgreSQL**: 12.0 or higher
- **Memory**: 2GB RAM minimum (4GB recommended)
- **Storage**: 10GB available space minimum

### Required Services
- **Database**: PostgreSQL instance
- **File Storage**: AWS S3 (for media uploads) or local storage
- **Email**: SMTP server (for notifications)
- **Domain**: SSL certificate for HTTPS

---

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/RITIKHARIANI/bcs_web2.git
cd bcs-etextbook-redesigned
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Environment Variables
Create `.env.production` file:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-super-secret-jwt-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Node Environment
NODE_ENV="production"

# Optional: File Upload Configuration
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760  # 10MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,video/mp4"

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="your-ga-id"

# Optional: Error Tracking
SENTRY_DSN="your-sentry-dsn"

# Optional: Email Configuration (for future features)
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
```

### 4. Database Setup
```bash
# Install Prisma CLI globally
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

---

## 🐳 Docker Deployment (Recommended)

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NODE_ENV=production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bcs_etextbook
      POSTGRES_USER: ${POSTGRES_USER:-bcsuser}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Build and Deploy
```bash
# Build and start containers
docker-compose up -d --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f app
```

---

## ☁️ Cloud Platform Deployment

### Vercel (Recommended for Next.js)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### 3. Database Setup
- Use Vercel Postgres or external PostgreSQL service
- Update `DATABASE_URL` in Vercel environment variables
- Run migrations: `npx prisma migrate deploy`

### AWS Deployment

#### 1. EC2 Instance Setup
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL
sudo amazon-linux-extras install postgresql12

# Install PM2 for process management
npm install -g pm2
```

#### 2. Application Setup
```bash
# Clone and setup application
git clone https://github.com/RITIKHARIANI/bcs_web2.git
cd bcs-etextbook-redesigned
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 3. Create ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'bcs-etextbook',
    script: 'npm',
    args: 'start',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

---

## 🔒 Security Configuration

### 1. SSL Certificate Setup
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Firewall Setup
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# AWS Security Groups
# - Allow HTTP (80) from 0.0.0.0/0
# - Allow HTTPS (443) from 0.0.0.0/0
# - Allow SSH (22) from your IP
```

---

## 📊 Monitoring and Logging

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
iotop
```

### 2. Log Management
```bash
# PM2 logs
pm2 logs

# System logs
sudo journalctl -u nginx
tail -f /var/log/nginx/error.log
```

### 3. Health Checks
Create `health-check.js`:
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/api/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR:', err);
  process.exit(1);
});

request.end();
```

---

## 🔄 Backup Strategy

### 1. Database Backup
```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="bcs_etextbook"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### 2. File System Backup
```bash
#!/bin/bash
# backup-files.sh

APP_DIR="/var/www/bcs-etextbook"
BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C $APP_DIR .

# Remove old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 3. Automated Backup Schedule
```bash
# Add to crontab
crontab -e

# Daily database backup at 2 AM
0 2 * * * /usr/local/bin/backup-db.sh

# Weekly file backup on Sundays at 3 AM
0 3 * * 0 /usr/local/bin/backup-files.sh
```

---

## 🚀 Performance Optimization

### 1. Next.js Configuration
```javascript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 300,
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
}
```

### 2. Database Performance
```sql
-- Add database indexes
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_featured ON courses(featured);
CREATE INDEX idx_modules_status ON modules(status);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);

-- Analyze query performance
ANALYZE courses;
ANALYZE modules;
ANALYZE course_modules;
```

### 3. CDN Configuration
- Configure AWS CloudFront or Cloudflare
- Cache static assets with long TTL
- Optimize image delivery

---

## 📋 Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Backup strategy implemented
- [ ] Monitoring setup completed
- [ ] Security headers configured
- [ ] Performance optimizations applied

### Post-Deployment
- [ ] Health checks passing
- [ ] All routes accessible
- [ ] Authentication working
- [ ] Database connections stable
- [ ] File uploads functioning
- [ ] Email notifications working (if configured)
- [ ] Performance metrics within targets
- [ ] Error tracking operational

### Testing in Production
- [ ] Faculty login and dashboard access
- [ ] Module creation and editing
- [ ] Course creation and management
- [ ] Public course access
- [ ] Graph visualization functionality
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

---

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check Prisma client
npx prisma db pull
```

#### Application Won't Start
```bash
# Check Node.js version
node --version

# Clear build cache
rm -rf .next
npm run build

# Check PM2 status
pm2 status
pm2 logs
```

#### High Memory Usage
```bash
# Monitor memory
free -h
ps aux --sort=-%mem

# Restart application
pm2 restart all

# Check for memory leaks
node --inspect server.js
```

### Log Locations
- **Application logs**: `/var/log/pm2/`
- **Nginx logs**: `/var/log/nginx/`
- **PostgreSQL logs**: `/var/log/postgresql/`
- **System logs**: `/var/log/syslog`

---

## 📞 Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check system resources and logs
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review performance metrics and optimize
4. **Annually**: Security audit and backup testing

### Emergency Contacts
- **System Administrator**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **Development Team**: [Contact Info]

### Documentation Updates
Keep this deployment guide updated with:
- Configuration changes
- New environment variables
- Updated procedures
- Lessons learned from incidents

---

**Deployment Guide Version**: 1.0  
**Last Updated**: January 19, 2025  
**Next Review**: April 19, 2025
