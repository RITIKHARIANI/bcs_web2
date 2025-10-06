# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production (includes Prisma generation)
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database Operations
```bash
npm run db:studio        # Open Prisma Studio (visual DB editor)
npm run db:push          # Push schema changes to DB (use this for schema drift)
npm run db:migrate:dev   # Create and apply migration (development)
npm run db:generate      # Generate Prisma Client
npm run local:setup      # Full local setup: generate + push + dev
```

**Important**: Use `db:push` instead of `db:migrate` when there's schema drift to avoid reset.

### Vercel Deployment
```bash
npm run vercel:build     # Build command for Vercel (includes migrations)
npm run vercel:install   # Install with legacy peer deps (required)
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5 (uses `auth()` not `getServerSession()`)
- **Styling**: Tailwind CSS 3.4 + Custom Neural Design System
- **Deployment**: Vercel (serverless)

### Key Architectural Patterns

#### 1. Data Model: Modular Content System
The platform uses a **reusable module architecture**:

- **Modules** are standalone learning units (can be nested hierarchically)
- **Courses** are collections of modules linked via `course_modules` junction table
- Modules can be shared across multiple courses
- Media files are stored separately and linked via `module_media` junction table

**Critical Relations**:
```prisma
courses -> course_modules -> modules
modules -> module_media -> media_files
modules -> modules (self-referential for parent/child)
users -> courses (author_id)
users -> modules (author_id)
```

#### 2. NextAuth v5 Pattern
Always use the `auth()` export from `/src/lib/auth/config.ts`:

```typescript
import { auth } from '@/lib/auth/config'

// Server Components / API Routes
const session = await auth()

// Access user data
const userId = session?.user?.id
const userRole = session?.user?.role
```

**Never** import `getServerSession` from `next-auth` - it's deprecated.

#### 3. Next.js 15 Dynamic Routes
All dynamic route params are now Promises:

```typescript
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ [key: string]: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  // use slug
}
```

#### 4. Image Optimization
Always use Next.js `Image` component, never `<img>`:

```typescript
import Image from 'next/image'

<Image
  src={avatarUrl}
  alt={name}
  width={128}
  height={128}
  className="..."
/>
```

### Directory Structure

```
src/
├── app/                      # Next.js 15 App Router (26 pages)
│   ├── api/                  # API Routes (17 endpoints)
│   │   ├── auth/            # Authentication (login, register, verify-email, reset-password)
│   │   ├── courses/         # Course CRUD + by-slug endpoint
│   │   ├── modules/         # Module CRUD (supports pagination)
│   │   ├── profile/         # User profile (GET/PUT)
│   │   ├── playgrounds/     # Playground CRUD
│   │   └── public/          # Public API (network visualization)
│   ├── faculty/             # Faculty dashboard
│   │   ├── courses/         # Course management
│   │   └── modules/         # Module management
│   ├── courses/[slug]/      # Public course viewer
│   │   └── [moduleSlug]/    # Module viewer
│   ├── profile/             # User profiles
│   │   ├── [userId]/        # View profile
│   │   └── edit/            # Edit own profile
│   ├── playgrounds/         # Interactive playgrounds
│   │   ├── [id]/            # View playground
│   │   └── builder/         # Builder interface
│   ├── auth/                # Auth pages (login, register, etc.)
│   ├── modules/[slug]/      # Public module viewer
│   ├── network/             # Network visualization
│   └── python/              # Python playground demo
│
├── components/              # 65+ React components
│   ├── ui/                  # Radix UI primitives + shadcn
│   ├── faculty/             # Faculty dashboard components
│   ├── public/              # Public-facing (course-catalog, course-viewer, etc.)
│   ├── playground/          # Playground system
│   │   ├── builder/         # Builder UI components
│   │   └── controls/        # Interactive controls (Slider, Button, etc.)
│   ├── python/              # Python execution components
│   ├── visualization/       # React Flow network graphs
│   ├── auth/                # Authentication forms
│   └── layout/              # Layout components
│
├── lib/                     # Core utilities and services
│   ├── auth/                # NextAuth v5 configuration
│   ├── playground/          # Playground execution engine & parameter binder
│   ├── db.ts               # Prisma client singleton
│   ├── pyodide-loader.ts   # Python runtime (Pyodide) loader
│   ├── turtle-manager.ts   # Canvas graphics for simulations
│   ├── web-turtle.ts       # Basic turtle graphics
│   ├── retry.ts            # Database retry logic for serverless
│   └── email.ts            # Email sending utilities
│
├── templates/               # Playground templates
│   ├── index.ts            # Template registry
│   └── braitenberg-vehicles.ts  # Example template
│
└── types/
    └── playground.ts        # Playground TypeScript definitions
```

### Custom Design System

The platform uses a **neural-inspired design system** defined in `tailwind.config.ts`:

- **Colors**: `neural-primary`, `synapse-primary`, `cognition-teal`, etc.
- **Components**: Use `cognitive-card`, `neural-content` classes
- **Buttons**: Custom `NeuralButton` component with gradient variants

## Important Implementation Details

### Pagination Implementation
API routes support pagination via query parameters:

```typescript
// API: /api/courses?page=1&limit=20
const page = parseInt(searchParams.get('page') || '1', 10)
const limit = parseInt(searchParams.get('limit') || '20', 10)
const skip = (page - 1) * limit

const [items, totalCount] = await Promise.all([
  prisma.model.findMany({ skip, take: limit }),
  prisma.model.count()
])

return { items, pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) }}
```

### Interactive Playgrounds
The playground system uses:
- **Parameter Binder**: Connects UI controls to Python/JS variables
- **Execution Engine**: Runs code via Pyodide (Python in browser)
- **Turtle Manager**: Provides canvas graphics for simulations
- **Templates**: Predefined playground configurations in `/src/templates/`

Key files:
- `/src/lib/playground/parameter-binder.ts` - Two-way data binding
- `/src/lib/playground/execution-engine.ts` - Code execution
- `/src/components/playground/PlaygroundRenderer.tsx` - Main renderer

### React Hook Dependencies
When modifying playground components, ensure proper dependency arrays:

```typescript
// Callbacks passed as props should be in dependencies
useEffect(() => {
  onParameterChange?.(params)
}, [params, onParameterChange])

// For mount-only effects, use eslint-disable
useEffect(() => {
  // mount only
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

### Database Retry Pattern
API routes use retry logic for serverless/edge environments:

```typescript
import { withDatabaseRetry } from '@/lib/retry'

const data = await withDatabaseRetry(async () => {
  return await prisma.model.findMany()
}, { maxAttempts: 3, baseDelayMs: 500 })
```

## Common Gotchas

1. **Schema Changes**: Always use `npm run db:push` in development. Migrations are for production only.

2. **NextAuth Session**: User data is in `session.user.id` and `session.user.role`, not `session.userId`.

3. **Prisma Queries**: Use transaction pooler (port 6543) for production, session pooler (port 5432) for development.

4. **Content Security Policy**: Python playgrounds require specific CSP headers for Pyodide (see `next.config.ts`).

5. **Image Domains**: External images must be added to `remotePatterns` in `next.config.ts`.

6. **Prisma Client**: Generated client is gitignored. Always run `prisma generate` after pulling schema changes.

## Recent Features & Current Status

### Implemented (January 2025)
1. **User Profile System** - Faculty profiles with custom fields (about, speciality, university, interested_fields, avatar)
2. **Pagination** - Course catalog (20/page) and module library (50/page) with smart page controls
3. **Enhanced Course View** - Overview section and instructor display when no module selected
4. **Optimized Layouts** - Module content maximized with fixed 280px sidebar
5. **Interactive Playgrounds** - Python execution with Pyodide, parameter binding, template system
6. **Email Verification** - User account verification system
7. **Password Reset** - Forgot password functionality

### Testing Approach
The project uses manual testing. When adding features:
- Test in both development (`npm run dev`) and production builds (`npm run build && npm start`)
- Verify mobile responsiveness across devices
- Check authentication flows for faculty and public users
- Test with PostgreSQL database (not SQLite)

## Deployment

**Production**: Automatically deployed to Vercel on push to `main` branch.

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string (port 6543 for serverless)
- `NEXTAUTH_URL` - Production URL
- `NEXTAUTH_SECRET` - Random secure string

**Build Process**:
1. Vercel runs `npm run vercel:build`
2. This executes: `prisma generate && prisma migrate deploy && next build`
3. Deploys to edge network

## Code Style

- **TypeScript**: Strict mode, no implicit `any`
- **Imports**: Use `@/` path alias for absolute imports
- **Components**: Prefer server components, use `"use client"` only when necessary
- **Naming**:
  - Files: `kebab-case.tsx`
  - Components: `PascalCase`
  - Functions: `camelCase`
  - Database: `snake_case`

## Documentation

**All documentation is in `/docs` directory** (not root). Key files:

- `TECHNICAL_DOCUMENTATION.md` - Full architecture details
- `FACULTY_USER_GUIDE.md` - End-user guide for educators
- `PLAYGROUND_BUILDER_ARCHITECTURE.md` - Playground system design
- `PLAYGROUND_QUICK_START.md` - Getting started with playgrounds
- `PLAYGROUND_TESTING_GUIDE.md` - Testing interactive components
- `IMPLEMENTATION_STATUS.md` - Current development status
- `Development_Guide.md` - Developer onboarding
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Production-specific guidance
- `TESTING_GUIDE.md` - Testing procedures
- `MOBILE_RESPONSIVENESS.md` - Mobile optimization details
- `UNIVERSITY_OF_ILLINOIS_BRANDING.md` - Design guidelines

**Note**: Outdated files have been removed. All AI development prompts, task reports, and debug documentation have been cleaned up.
