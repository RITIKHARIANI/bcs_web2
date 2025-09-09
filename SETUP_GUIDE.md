# 🚀 BCS E-Textbook Platform - Complete Setup Guide

This guide covers both **local development** and **Vercel deployment** for the University of Illinois BCS E-Textbook Platform.

---

## 📋 **Prerequisites**

### **System Requirements**
- **Node.js**: 18.17.0 or higher
- **npm**: 8.0.0 or higher  
- **PostgreSQL**: 12+ (for local development)
- **Git**: Latest version

### **Account Requirements**
- **GitHub account** (for repository access)
- **Vercel account** (free tier sufficient for testing)
- **Database provider account** (Supabase recommended)

---

## 🏠 **Local Development Setup**

### **Step 1: Clone and Install**

```bash
# Clone the repository
git clone https://github.com/RITIKHARIANI/bcs_web2.git
cd bcs-etextbook-redesigned

# Install dependencies
npm install
```

### **Step 2: Environment Configuration**

**Create `.env.local` file** (you need to create this manually):

```env
# ==========================================
# BCS E-Textbook Platform - Local Development
# ==========================================

# Core Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
# Option A: Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/bcs_etextbook_dev?schema=public"

# Option B: Supabase (recommended for consistency with production)
# DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?schema=public"

# Authentication & Security
NEXTAUTH_SECRET="your-local-32-character-secret-key-for-development"
NEXTAUTH_URL="http://localhost:3000"

# File Upload Configuration
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf"

# Development Features
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_GRAPH_VISUALIZATION=true
NEXT_PUBLIC_ENABLE_RICH_TEXT_EDITOR=true

# Security Configuration
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
RATE_LIMIT_REQUESTS=1000
FORCE_HTTPS=false

# Session Configuration
SESSION_MAX_AGE=604800
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_HTTPONLY=true

# Logging
LOG_LEVEL=debug
REQUEST_LOGGING=true
```

### **Step 3: Database Setup**

#### **Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb bcs_etextbook_dev

# Update DATABASE_URL in .env.local with your local PostgreSQL connection
```

#### **Option B: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project: `ui-bcs-etextbook-dev`
3. Go to **Settings > Database** and copy the connection string
4. Update `DATABASE_URL` in `.env.local`

### **Step 4: Initialize Database Schema**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Optional: Open Prisma Studio to view database
npm run db:studio
```

### **Step 5: Create Initial Faculty User**

Run this SQL in your database (Prisma Studio or database console):

```sql
-- Create a faculty user for testing
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES (
    'faculty-test-id',
    'faculty@illinois.edu',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwGZF1p0bAQwQ8W2.',  -- password: 'password123'
    'Test Faculty',
    'faculty',
    NOW(),
    NOW()
);
```

### **Step 6: Start Development Server**

```bash
# Automated setup script
chmod +x scripts/local-setup.sh
./scripts/local-setup.sh

# Or manual start
npm run dev
```

**Your application will be available at:**
- **Main App**: http://localhost:3000
- **Faculty Dashboard**: http://localhost:3000/faculty/dashboard
- **Login**: http://localhost:3000/auth/login
- **Prisma Studio**: http://localhost:5555 (if enabled)

---

## ☁️ **Vercel Deployment**

### **Step 1: Database Setup (Production)**

#### **Recommended: Supabase**
1. Create a new Supabase project: `ui-bcs-etextbook-prod`
2. Go to **Settings > Database** and copy the connection string
3. In **SQL Editor**, run the database schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (run the full schema from prisma/schema.prisma)
-- You can use: npx prisma db push --preview-feature
```

### **Step 2: Vercel Project Setup**

#### **Method A: Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository: `bcs_web2`
4. Configure:
   - **Project Name**: `ui-bcs-etextbook`
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`

#### **Method B: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

### **Step 3: Environment Variables (Vercel)**

In **Vercel Dashboard > Settings > Environment Variables**, add:

| Variable | Value | Environment |
|----------|--------|-------------|
| `DATABASE_URL` | `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres` | Production, Preview |
| `NEXTAUTH_SECRET` | `your-production-32-character-secret-key` | Production, Preview |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Production |
| `NEXTAUTH_URL` | Auto-filled by Vercel | Preview |
| `NODE_ENV` | `production` | Production |
| `NEXT_TELEMETRY_DISABLED` | `1` | All |
| `NEXT_PUBLIC_UPLOAD_MAX_SIZE` | `4194304` | All |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | `image/jpeg,image/png,image/webp` | All |
| `CORS_ORIGINS` | `https://your-project.vercel.app` | Production |
| `RATE_LIMIT_REQUESTS` | `100` | Production |
| `FORCE_HTTPS` | `true` | Production |

### **Step 4: Deploy**

```bash
# If using Git integration (recommended)
git add .
git commit -m "Configure for Vercel deployment"
git push origin main

# Vercel will automatically deploy on push
```

### **Step 5: Run Database Migrations**

After successful deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy

# Or trigger a rebuild which will run migrations automatically
```

### **Step 6: Create Production Faculty User**

In your Supabase SQL Editor:

```sql
-- Create production faculty user
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES (
    gen_random_uuid()::text,
    'faculty@illinois.edu',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LwGZF1p0bAQwQ8W2.',
    'Faculty User',
    'faculty',
    NOW(),
    NOW()
);
```

---

## 🧪 **Testing Your Setup**

### **Local Development Tests**
```bash
# Test API health
curl http://localhost:3000/api/health

# Test authentication endpoint
curl -X POST http://localhost:3000/api/auth/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "faculty@illinois.edu", "password": "password123"}'
```

### **Production Tests**
```bash
# Test production deployment
curl https://your-project.vercel.app/api/health

# Test faculty login
# Visit: https://your-project.vercel.app/auth/login
```

### **Functionality Checklist**
- [ ] **Homepage loads** with University of Illinois branding
- [ ] **Faculty authentication** works
- [ ] **Module creation** with rich text editor
- [ ] **Course creation** and management
- [ ] **Public course viewing** without authentication
- [ ] **Graph visualization** renders properly
- [ ] **Mobile responsiveness** works correctly

---

## 🔧 **Development Workflow**

### **Daily Development**
```bash
# Start development
npm run dev

# View database
npm run db:studio

# Reset database (if needed)
npm run db:reset
```

### **Deploying Changes**
```bash
# Test locally first
npm run build
npm run start

# If everything works, push to trigger Vercel deployment
git add .
git commit -m "Your changes"
git push origin main
```

### **Database Migrations**
```bash
# Create migration (local development)
npx prisma migrate dev --name description-of-changes

# Deploy migration (production)
npx prisma migrate deploy
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Database Connection Failed**
```bash
# Check your DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

#### **Build Fails on Vercel**
- Ensure all environment variables are set
- Check Vercel function logs
- Verify Prisma schema is valid

#### **Authentication Not Working**
- Verify NEXTAUTH_SECRET is set (32+ characters)
- Check NEXTAUTH_URL matches your domain
- Ensure password hashing is correct

#### **Slow Local Development**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 **Free Tier Limits**

### **Vercel Free**
- 100 GB bandwidth/month
- 100 GB-hours function execution
- Custom domains not included

### **Supabase Free**
- 500 MB database storage
- 50,000 monthly active users
- 5 GB bandwidth

---

## 📈 **Upgrade Recommendations**

### **When to Upgrade**
- **Traffic > 1000 monthly users**: Vercel Pro ($20/month)
- **Database > 400 MB**: Supabase Pro ($25/month)
- **Need custom domain**: Vercel Pro required

### **Recommended Production Setup**
- **Vercel Pro** + **Supabase Free**: $20/month
- Perfect for university courses up to 500 students
- Professional features with cost control

---

**🎉 Your University of Illinois BCS E-Textbook Platform is now ready for both local development and production deployment!**

For additional help, check:
- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
