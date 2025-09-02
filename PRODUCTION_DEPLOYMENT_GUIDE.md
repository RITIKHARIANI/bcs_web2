# 🚀 Production Deployment Guide - BCS E-Textbook Platform

## **Complete Production Setup & Deployment Instructions**

This guide provides step-by-step instructions for deploying the BCS E-Textbook Platform to production environments with enterprise-grade security, performance, and reliability.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Configuration](#application-configuration)
5. [Security Configuration](#security-configuration)
6. [SSL/TLS Setup](#ssltls-setup)
7. [Deployment Methods](#deployment-methods)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)
11. [Final Testing](#final-testing)
12. [Go-Live Checklist](#go-live-checklist)

---

## ✅ Pre-Deployment Checklist

### **System Requirements**
- [ ] **Server**: 2+ CPU cores, 4GB+ RAM, 50GB+ storage
- [ ] **Node.js**: Version 18.17.0 or higher
- [ ] **PostgreSQL**: Version 12.0 or higher
- [ ] **Domain**: Configured with DNS pointing to your server
- [ ] **SSL Certificate**: Valid SSL certificate for your domain
- [ ] **Backup Storage**: Configured backup destination

### **Access Requirements**
- [ ] **Server Access**: SSH access to production server
- [ ] **Database Access**: PostgreSQL admin credentials
- [ ] **Domain Control**: Ability to configure DNS records
- [ ] **Email Service**: SMTP credentials for notifications
- [ ] **Storage Service**: AWS S3 or Cloudinary credentials (optional)

### **Development Prerequisites**
- [ ] **Local Testing**: Application tested locally
- [ ] **Environment Variables**: All production values prepared
- [ ] **Database Schema**: Latest migrations ready
- [ ] **Build Process**: Production build tested
- [ ] **Documentation Review**: All guides reviewed

---

## 🔧 Environment Setup

### **1. Server Preparation**

#### **Ubuntu/Debian Setup**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required system packages
sudo apt install -y curl wget git nginx postgresql-client redis-server

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash bcsapp
sudo usermod -aG sudo bcsapp
```

#### **CentOS/RHEL Setup**
```bash
# Update system packages
sudo yum update -y

# Install required packages
sudo yum install -y curl wget git nginx postgresql redis

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash bcsapp
sudo usermod -aG wheel bcsapp
```

### **2. Application Deployment**

```bash
# Switch to application user
sudo su - bcsapp

# Clone repository
git clone https://github.com/RITIKHARIANI/bcs_web2.git
cd bcs-etextbook-redesigned

# Make scripts executable
chmod +x scripts/*.sh

# Run production setup script
./scripts/production-setup.sh
```

---

## 🗄️ Database Configuration

### **1. PostgreSQL Installation & Setup**

#### **Install PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
```

#### **Configure PostgreSQL**
```bash
# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE bcs_etextbook_prod;
CREATE USER bcsuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bcs_etextbook_prod TO bcsuser;
ALTER USER bcsuser CREATEDB;
\q
EOF
```

#### **Configure PostgreSQL for Production**
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Add/modify these settings:
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Configure authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add this line for local connections:
local   bcs_etextbook_prod   bcsuser                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **2. Database URL Configuration**

```bash
# Production database URL format
DATABASE_URL="postgresql://bcsuser:your_secure_password@localhost:5432/bcs_etextbook_prod?sslmode=prefer&connect_timeout=60&pool_timeout=60&socket_timeout=60&connection_limit=20"
```

---

## ⚙️ Application Configuration

### **1. Environment Variables Setup**

```bash
# Create production environment file
cp env.production.template .env.production

# Edit with your actual values
nano .env.production
```

#### **Required Environment Variables**
```env
# Core Configuration
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://bcsuser:your_password@localhost:5432/bcs_etextbook_prod?sslmode=prefer&connection_limit=20"

# Authentication
NEXTAUTH_SECRET="your-32-character-super-secure-production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Security
FORCE_HTTPS=true
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
RATE_LIMIT_REQUESTS=100

# File Storage
NEXT_PUBLIC_UPLOAD_MAX_SIZE=52428800
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,video/mp4,application/pdf"

# Optional: AWS S3 Storage
AWS_S3_BUCKET_NAME="your-s3-bucket"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_REGION="us-east-1"

# Optional: Monitoring
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"

# Logging
LOG_LEVEL=info
REQUEST_LOGGING=true
```

### **2. Application Build & Install**

```bash
# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Test the build
node -e "console.log('Build test passed')" && npm run start &
sleep 5 && curl -f http://localhost:3000/api/health && echo "✓ Application is running"
pkill -f "node.*server.js"
```

---

## 🔒 Security Configuration

### **1. Firewall Setup**

```bash
# Configure UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000/tcp   # Block direct app access
sudo ufw enable

# Configure firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### **2. Application Security**

```bash
# Set proper file permissions
chmod 600 .env.production
chmod -R 755 public
chmod -R 755 uploads
chmod 700 nginx/ssl

# Configure fail2ban for SSH protection
sudo apt install -y fail2ban

# Create jail configuration
sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

sudo systemctl restart fail2ban
```

---

## 🔐 SSL/TLS Setup

### **Method 1: Let's Encrypt (Recommended)**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test certificate auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### **Method 2: Custom SSL Certificate**

```bash
# Place your certificate files
sudo mkdir -p /etc/nginx/ssl
sudo cp your-certificate.crt /etc/nginx/ssl/certificate.crt
sudo cp your-private-key.key /etc/nginx/ssl/private.key
sudo chmod 600 /etc/nginx/ssl/private.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
```

---

## 🚀 Deployment Methods

### **Method 1: Docker Deployment (Recommended)**

#### **1. Build and Deploy with Docker Compose**
```bash
# Create production docker-compose file
cp docker-compose.production.yml docker-compose.yml

# Set environment variables
export POSTGRES_PASSWORD="your_secure_db_password"
export REDIS_PASSWORD="your_secure_redis_password"

# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

#### **2. Container Health Monitoring**
```bash
# Monitor container health
docker-compose exec app curl -f http://localhost:3000/api/health

# Scale if needed
docker-compose up -d --scale app=2
```

### **Method 2: PM2 Deployment**

#### **1. Create PM2 Ecosystem File**
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bcs-etextbook',
    script: 'npm',
    args: 'start',
    cwd: '/home/bcsapp/bcs-etextbook-redesigned',
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
    time: true,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF
```

#### **2. Start with PM2**
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u bcsapp --hp /home/bcsapp

# Monitor application
pm2 status
pm2 logs
pm2 monit
```

---

## 🌐 Nginx Reverse Proxy Setup

### **1. Configure Nginx**

```bash
# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Create application configuration
sudo tee /etc/nginx/sites-available/bcs-etextbook << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;
    
    # Client settings
    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript text/xml application/xml application/json;
    
    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
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
    
    # Main application
    location / {
        limit_req zone=general burst=50 nodelay;
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
EOF

# Enable configuration
sudo ln -s /etc/nginx/sites-available/bcs-etextbook /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## ⚡ Performance Optimization

### **1. Database Optimization**

```sql
-- Connect to database and run optimizations
psql "$DATABASE_URL" << 'EOF'

-- Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modules_author_status 
ON modules(author_id, status) WHERE status = 'PUBLISHED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_featured_status 
ON courses(featured, status) WHERE featured = true AND status = 'PUBLISHED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_modules_course_sort 
ON course_modules(course_id, sort_order);

-- Analyze tables for query planner
ANALYZE modules;
ANALYZE courses;
ANALYZE course_modules;
ANALYZE users;

-- Set PostgreSQL performance parameters
ALTER SYSTEM SET effective_cache_size = '512MB';
ALTER SYSTEM SET shared_buffers = '128MB';
ALTER SYSTEM SET random_page_cost = 1.1;

SELECT pg_reload_conf();

EOF
```

### **2. Application Optimization**

```bash
# Configure Node.js performance
export NODE_OPTIONS="--max-old-space-size=2048"

# Enable production optimizations
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production

# Configure PM2 for optimal performance
pm2 start ecosystem.config.js --node-args="--max-old-space-size=2048"
```

---

## 📊 Monitoring & Logging

### **1. Log Management**

```bash
# Create log rotation configuration
sudo tee /etc/logrotate.d/bcs-etextbook << 'EOF'
/home/bcsapp/bcs-etextbook-redesigned/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 bcsapp bcsapp
    postrotate
        pm2 restart bcs-etextbook > /dev/null
    endscript
}
EOF

# Configure syslog for application
echo "local0.*    /var/log/bcs-etextbook.log" | sudo tee -a /etc/rsyslog.conf
sudo systemctl restart rsyslog
```

### **2. Health Monitoring**

```bash
# Create health check script
cat > /home/bcsapp/health-check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:3000/api/health"
RESPONSE=$(curl -s -w "%{http_code}" "$HEALTH_URL" -o /dev/null)

if [ "$RESPONSE" != "200" ]; then
    echo "$(date): Health check failed - HTTP $RESPONSE" >> /var/log/bcs-health.log
    # Restart application if health check fails
    pm2 restart bcs-etextbook
fi
EOF

chmod +x /home/bcsapp/health-check.sh

# Add to crontab for monitoring every 5 minutes
echo "*/5 * * * * /home/bcsapp/health-check.sh" | crontab -
```

---

## 💾 Backup & Recovery

### **1. Database Backup Setup**

```bash
# Create backup directory
sudo mkdir -p /var/backups/bcs-etextbook
sudo chown bcsapp:bcsapp /var/backups/bcs-etextbook

# Create database backup script
cat > /home/bcsapp/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/bcs-etextbook"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="bcs_etextbook_prod"

# Create backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "$(date): Database backup completed - db_backup_$DATE.sql.gz"
EOF

chmod +x /home/bcsapp/backup-database.sh

# Schedule daily backups at 2 AM
echo "0 2 * * * /home/bcsapp/backup-database.sh >> /var/log/backup.log 2>&1" | crontab -
```

### **2. File Backup Setup**

```bash
# Create file backup script
cat > /home/bcsapp/backup-files.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/bcs-etextbook"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/bcsapp/bcs-etextbook-redesigned"

# Backup uploads and important files
tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" \
    -C "$APP_DIR" \
    uploads/ \
    .env.production \
    ecosystem.config.js

# Remove file backups older than 7 days
find "$BACKUP_DIR" -name "files_backup_*.tar.gz" -mtime +7 -delete

echo "$(date): File backup completed - files_backup_$DATE.tar.gz"
EOF

chmod +x /home/bcsapp/backup-files.sh

# Schedule weekly file backups on Sundays at 3 AM
echo "0 3 * * 0 /home/bcsapp/backup-files.sh >> /var/log/backup.log 2>&1" | crontab -
```

---

## 🧪 Final Testing

### **1. Run Production Tests**

```bash
# Make test script executable and run
chmod +x scripts/production-test.sh
./scripts/production-test.sh
```

### **2. Manual Verification Checklist**

- [ ] **Homepage loads**: Visit https://yourdomain.com
- [ ] **Faculty login works**: Test authentication flow
- [ ] **Module creation**: Create a test module with rich content
- [ ] **Course creation**: Create a test course using modules
- [ ] **Public access**: Test course viewing without authentication
- [ ] **File uploads**: Test image and document uploads
- [ ] **Graph visualization**: Test interactive course graphs
- [ ] **Mobile responsiveness**: Test on mobile devices
- [ ] **Performance**: Check page load times
- [ ] **SSL certificate**: Verify HTTPS and certificate validity

### **3. Load Testing (Optional)**

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << 'EOF'
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
  processor: "./test-functions.js"

scenarios:
  - name: "Homepage and course browsing"
    requests:
      - get:
          url: "/"
      - get:
          url: "/courses"
      - get:
          url: "/api/health"
EOF

# Run load test
artillery run load-test.yml
```

---

## ✅ Go-Live Checklist

### **Pre-Launch (T-24 hours)**
- [ ] **Final backup**: Complete database and file backup
- [ ] **DNS preparation**: Prepare DNS records for switch
- [ ] **SSL verification**: Confirm SSL certificates are valid
- [ ] **Monitoring setup**: Ensure all monitoring is active
- [ ] **Team notification**: Inform stakeholders of go-live time

### **Launch (T-0)**
- [ ] **DNS switch**: Update DNS records to point to production server
- [ ] **Health check**: Verify all services are running
- [ ] **Functionality test**: Complete end-to-end testing
- [ ] **Performance check**: Verify response times are acceptable
- [ ] **SSL validation**: Confirm HTTPS is working properly

### **Post-Launch (T+1 hour)**
- [ ] **Monitoring review**: Check all metrics and logs
- [ ] **User testing**: Conduct user acceptance testing
- [ ] **Performance monitoring**: Monitor response times and errors
- [ ] **Backup verification**: Ensure backups are running
- [ ] **Documentation update**: Update internal documentation

### **Post-Launch (T+24 hours)**
- [ ] **Stability review**: Review 24-hour performance metrics
- [ ] **Log analysis**: Analyze application and server logs
- [ ] **User feedback**: Collect and review user feedback
- [ ] **Issue tracking**: Document any issues and resolutions
- [ ] **Success metrics**: Measure against success criteria

---

## 🆘 Troubleshooting

### **Common Issues & Solutions**

#### **Application Won't Start**
```bash
# Check logs
pm2 logs bcs-etextbook

# Check process status
pm2 status

# Restart application
pm2 restart bcs-etextbook

# Check environment variables
env | grep -E "(NODE_ENV|DATABASE_URL|NEXTAUTH)"
```

#### **Database Connection Issues**
```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql

# Review database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### **SSL Certificate Problems**
```bash
# Check certificate validity
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

#### **Performance Issues**
```bash
# Check system resources
htop
df -h
free -h

# Monitor application performance
pm2 monit

# Check database performance
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

---

## 📞 Support & Maintenance

### **Regular Maintenance Tasks**
- **Daily**: Monitor logs and performance metrics
- **Weekly**: Review security updates and apply patches
- **Monthly**: Analyze performance trends and optimize
- **Quarterly**: Security audit and penetration testing

### **Emergency Contacts**
- **System Administrator**: [Your contact info]
- **Database Administrator**: [DBA contact info]
- **Development Team Lead**: [Dev lead contact info]
- **Hosting Provider Support**: [Provider support info]

### **Maintenance Windows**
- **Preferred Time**: Sunday 2:00 AM - 4:00 AM UTC
- **Duration**: 2 hours maximum
- **Notification**: 48 hours advance notice
- **Rollback Plan**: Always prepared and tested

---

**Production Deployment Guide Version**: 1.0  
**Last Updated**: January 19, 2025  
**Next Review**: April 19, 2025  
**Status**: ✅ **Production Ready**
