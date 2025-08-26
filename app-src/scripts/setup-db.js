#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up BCS E-Textbook Platform Database...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please copy .env.example to .env and configure your database URL.\n');
  console.log('Example:');
  console.log('cp .env.example .env');
  console.log('');
  console.log('Then edit .env and set:');
  console.log('DATABASE_URL="postgresql://username:password@localhost:5432/bcs_platform"');
  process.exit(1);
}

try {
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('\n🗄️  Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('\n✅ Database setup complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Register a faculty account at: http://localhost:3000/auth/register');
  console.log('\nOptional: Run "npx prisma studio" to view your database');

} catch (error) {
  console.error('\n❌ Database setup failed!');
  console.error('Please check:');
  console.error('1. PostgreSQL is running');
  console.error('2. DATABASE_URL in .env is correct');
  console.error('3. Database exists and is accessible');
  console.error('\nError details:', error.message);
  process.exit(1);
}
