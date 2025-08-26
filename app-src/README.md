# BCS E-Textbook Platform

A modern e-textbook platform for the Brain and Cognitive Sciences department, built with Next.js 14, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- npm or yarn

### Setup Instructions

1. **Clone and install dependencies**
   ```bash
   cd app-src
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL and other settings:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/bcs_platform"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema (creates tables)
   npx prisma db push
   
   # Optional: View database in Prisma Studio
   npx prisma studio
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── faculty/           # Faculty dashboard & tools
│   ├── api/               # API routes
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── faculty/           # Faculty-specific components
│   └── providers/         # Context providers
├── lib/
│   ├── auth/              # Authentication utilities
│   ├── db.ts              # Database client
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript definitions
```

## 🎯 Phase 1 Features

### ✅ Completed
- Faculty authentication (register, login, logout)
- Project structure and database schema
- UI components and styling with Tailwind CSS
- Protected routes and middleware

### 🚧 In Progress
- Module creation system
- Course assembly from modules
- Rich text editing with media support

### 📋 Planned
- Public course catalog
- Hierarchical module navigation
- Media file management
- Password reset functionality

## 🔐 Authentication

### Faculty Registration
- Navigate to `/auth/register`
- Only faculty accounts are supported in Phase 1
- Password requirements: 8+ characters, uppercase, lowercase, number

### Faculty Login
- Navigate to `/auth/login`
- Access faculty dashboard at `/faculty/dashboard`

## 💾 Database Schema

The database supports:
- User management with role-based access
- Hierarchical module structure (unlimited nesting)
- Module reusability across multiple courses
- Media file storage and references
- Future-ready for student features

Key tables:
- `users` - Faculty authentication
- `modules` - Reusable learning content
- `courses` - Collections of modules
- `course_modules` - Many-to-many module/course relationships
- `media_files` - File storage references

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes
- `npx prisma studio` - Open database browser
- `npx prisma migrate dev` - Create and apply migration

## 🚀 Deployment

### Environment Variables for Production

```bash
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-secret-key"
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📚 Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Headless UI
- **Validation:** Zod
- **Forms:** React Hook Form

## 🔄 Future Enhancements

Phase 2 will include:
- Student authentication and profiles
- Course enrollment system
- Progress tracking
- Interactive demonstrations
- Advanced analytics
- Mobile app development

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Build Errors
- Run `npm run lint` to check for errors
- Ensure all environment variables are set
- Try deleting `.next` folder and rebuilding

## 📞 Support

For issues and feature requests, please check the project documentation or contact the development team.