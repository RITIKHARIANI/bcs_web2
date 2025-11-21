# 🔧 Technical Documentation - BCS E-Textbook Platform

## Overview
Comprehensive technical documentation for developers, system administrators, and technical stakeholders working with the BCS E-Textbook Platform.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Component Architecture](#component-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [Graph Visualization System](#graph-visualization-system)
8. [Performance Optimization](#performance-optimization)
9. [Development Workflow](#development-workflow)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Architecture](#deployment-architecture)
12. [Monitoring & Logging](#monitoring--logging)

---

## 🏗️ Architecture Overview

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router │ React 19 │ Tailwind CSS │ TypeScript │
├─────────────────────────────────────────────────────────────┤
│                  Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│  API Routes │ Middleware │ Auth │ Validation │ Business Logic │
├─────────────────────────────────────────────────────────────┤
│                   Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│       Prisma ORM │ PostgreSQL Database │ File Storage        │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles
1. **Component-Based Architecture**: Modular, reusable UI components
2. **Server-Side Rendering**: Next.js App Router for optimal performance
3. **Type Safety**: Full TypeScript implementation
4. **Responsive Design**: Mobile-first approach with Tailwind CSS
5. **Data Consistency**: Prisma ORM with PostgreSQL for ACID compliance
6. **Security First**: NextAuth.js with proper authorization patterns

### Directory Structure
```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API route handlers
│   ├── courses/           # Public course pages
│   ├── faculty/           # Faculty-only pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── faculty/           # Faculty-specific components
│   ├── public/            # Public user components
│   ├── ui/                # Reusable UI components
│   └── visualization/     # Graph visualization components
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication configuration
│   ├── db.ts              # Database connection
│   └── utils.ts           # Common utilities
└── types/                 # TypeScript type definitions
```

---

## 🛠️ Technology Stack

### Frontend Technologies
```json
{
  "framework": "Next.js 15.5.0",
  "react": "19.1.0",
  "styling": "Tailwind CSS 4.0",
  "ui_components": "Radix UI + Custom Neural Components",
  "icons": "Lucide React",
  "forms": "React Hook Form + Zod validation",
  "rich_text": "Tiptap Editor",
  "drag_drop": "@dnd-kit",
  "graph_viz": "React Flow",
  "state_management": "React Query + React Context"
}
```

### Backend Technologies
```json
{
  "runtime": "Node.js 18+",
  "framework": "Next.js API Routes",
  "database": "PostgreSQL 15+",
  "orm": "Prisma 5.x",
  "authentication": "NextAuth.js v5",
  "validation": "Zod schemas",
  "password_hashing": "bcryptjs"
}
```

### Development Tools
```json
{
  "language": "TypeScript 5.x",
  "linting": "ESLint + Next.js config",
  "formatting": "Prettier",
  "build_tool": "Next.js with Turbopack",
  "package_manager": "npm"
}
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram
```
Users (Faculty)
├── id: String (primary key)
├── name: String
├── email: String (unique)
├── password: String (hashed)
├── role: Role (FACULTY)
├── createdAt: DateTime
└── updatedAt: DateTime
     │
     ├─── Modules (1:many)
     │    ├── id: String (primary key)
     │    ├── title: String
     │    ├── slug: String (unique)
     │    ├── description: String?
     │    ├── content: String (rich text)
     │    ├── status: Status (DRAFT, PUBLISHED)
     │    ├── authorId: String (foreign key)
     │    ├── parentModuleId: String? (self-reference)
     │    ├── sortOrder: Int
     │    ├── createdAt: DateTime
     │    └── updatedAt: DateTime
     │
     └─── Courses (1:many)
          ├── id: String (primary key)
          ├── title: String
          ├── slug: String (unique)
          ├── description: String?
          ├── featured: Boolean
          ├── status: Status (DRAFT, PUBLISHED)
          ├── authorId: String (foreign key)
          ├── createdAt: DateTime
          ├── updatedAt: DateTime
          └── courseModules: CourseModule[] (join table)
               ├── courseId: String
               ├── moduleId: String
               └── sortOrder: Int
```

### Database Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_modules_author_status ON modules(author_id, status);
CREATE INDEX idx_courses_author_status ON courses(author_id, status);
CREATE INDEX idx_courses_featured_status ON courses(featured, status);
CREATE INDEX idx_course_modules_course_sort ON course_modules(course_id, sort_order);
CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_courses_slug ON courses(slug);
```

### Prisma Schema Definition
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(FACULTY)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  modules Module[]
  courses Course[]
  
  @@map("users")
}

model Module {
  id             String   @id @default(cuid())
  title          String
  slug           String   @unique
  description    String?
  content        String
  status         Status   @default(DRAFT)
  authorId       String
  parentModuleId String?
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  author        User           @relation(fields: [authorId], references: [id])
  parentModule  Module?        @relation("ModuleHierarchy", fields: [parentModuleId], references: [id])
  childModules  Module[]       @relation("ModuleHierarchy")
  courseModules CourseModule[]
  
  @@map("modules")
}

model Course {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  featured    Boolean  @default(false)
  status      Status   @default(DRAFT)
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  author        User           @relation(fields: [authorId], references: [id])
  courseModules CourseModule[]
  
  @@map("courses")
}

model CourseModule {
  courseId  String
  moduleId  String
  sortOrder Int    @default(0)
  
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  @@id([courseId, moduleId])
  @@map("course_modules")
}

enum Role {
  FACULTY
  ADMIN
}

enum Status {
  DRAFT
  PUBLISHED
}
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/[...nextauth]`
NextAuth.js dynamic route handling all authentication flows.

**Supported Providers:**
- Credentials (email/password)
- Future: OAuth providers (Google, Microsoft)

### Module Management APIs

#### GET `/api/modules`
Retrieve modules for authenticated faculty.

**Query Parameters:**
- `status`: Filter by DRAFT or PUBLISHED
- `search`: Text search in title/description
- `limit`: Pagination limit (default: 50)
- `offset`: Pagination offset

**Response:**
```json
{
  "modules": [
    {
      "id": "clx123...",
      "title": "Neural Network Basics",
      "slug": "neural-network-basics",
      "description": "Introduction to neural networks",
      "status": "PUBLISHED",
      "createdAt": "2025-01-19T10:00:00Z",
      "updatedAt": "2025-01-19T10:30:00Z",
      "author": {
        "name": "Dr. Smith",
        "email": "smith@university.edu"
      }
    }
  ],
  "total": 42,
  "hasMore": true
}
```

#### POST `/api/modules`
Create new module.

**Request Body:**
```json
{
  "title": "Module Title",
  "description": "Optional description",
  "content": "Rich text content",
  "status": "DRAFT",
  "parentModuleId": "optional_parent_id"
}
```

#### GET `/api/modules/[id]`
Retrieve specific module by ID.

#### PUT `/api/modules/[id]`
Update existing module.

#### DELETE `/api/modules/[id]`
Delete module (cascades to course relationships).

### Course Management APIs

#### GET `/api/courses`
Retrieve courses for authenticated faculty.

**Query Parameters:**
- `status`: Filter by DRAFT or PUBLISHED
- `featured`: Filter featured courses
- `search`: Text search

#### POST `/api/courses`
Create new course with module relationships.

**Request Body:**
```json
{
  "title": "Course Title",
  "description": "Course description",
  "status": "DRAFT",
  "featured": false,
  "moduleIds": ["module_id_1", "module_id_2"]
}
```

#### GET `/api/courses/[id]`
Retrieve course with populated module relationships.

#### GET `/api/courses/by-slug/[slug]`
Public endpoint for retrieving published courses by slug.

### Visualization APIs

#### GET `/api/visualization/course-structure`
Retrieve data for graph visualization.

**Response:**
```json
{
  "courses": [
    {
      "id": "course_id",
      "title": "Course Title",
      "modules": [
        {
          "id": "module_id",
          "title": "Module Title",
          "connections": ["other_module_id"]
        }
      ]
    }
  ]
}
```

### Error Handling
All APIs follow consistent error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## 🧩 Component Architecture

### Design System Components

#### Core UI Components
Located in `src/components/ui/`:

**NeuralButton** - Custom button with neural-inspired styling
```tsx
interface NeuralButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

**NeuralCard** - Container component with neural design
```tsx
interface NeuralCardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  elevated?: boolean;
}
```

**NeuralInput** - Form input with consistent styling
```tsx
interface NeuralInputProps {
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}
```

### Feature Components

#### Authentication Components
- `LoginForm`: Handles user authentication
- `AuthProvider`: Manages authentication state
- `ProtectedRoute`: Route protection wrapper

#### Faculty Components
- `ModuleLibrary`: Grid/list view of modules
- `CreateModuleForm`: Module creation interface
- `CourseBuilder`: Drag-and-drop course construction
- `FacultyDashboard`: Overview and quick actions

#### Public Components
- `CourseViewer`: Public course reading interface
- `EnhancedCourseViewer`: Advanced reading features
- `CourseCard`: Course preview cards
- `Hero`: Homepage hero section

#### Visualization Components
- `IntegratedGraphSystem`: Main visualization wrapper
- `CourseGraphViewer`: Interactive course structure
- `ModuleRelationshipViewer`: Cross-course analysis
- `FacultyGraphEditor`: Drag-and-drop course editor

### Component Patterns

#### Compound Components
```tsx
// Example: Card component composition
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

#### Render Props Pattern
```tsx
// Example: Data fetching component
<DataFetcher url="/api/modules">
  {({ data, loading, error }) => (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {data && <ModuleList modules={data.modules} />}
    </div>
  )}
</DataFetcher>
```

#### Custom Hooks
```tsx
// useModules hook
const useModules = (filters: ModuleFilters) => {
  return useQuery({
    queryKey: ['modules', filters],
    queryFn: () => fetchModules(filters)
  });
};

// useAuth hook
const useAuth = () => {
  const session = useSession();
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isFaculty: session?.user?.role === 'FACULTY'
  };
};
```

---

## 🔐 Authentication & Authorization

### NextAuth.js Configuration

#### Authentication Providers
```typescript
// src/lib/auth/config.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await validateUser(credentials.email, credentials.password);
        return user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
};
```

### Route Protection

#### Middleware Implementation
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || 
                request.cookies.get('next-auth.session-token')?.value;

  // Protect faculty routes
  if (request.nextUrl.pathname.startsWith('/faculty')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/faculty/:path*', '/api/modules/:path*', '/api/courses/:path*']
};
```

#### Component-Level Protection
```tsx
// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({
  children,
  role
}) => {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;
  
  if (!session) {
    redirect('/auth/login');
  }

  if (role && session.user.role !== role) {
    return <UnauthorizedError />;
  }

  return <>{children}</>;
};
```

### Password Security
```typescript
// src/lib/auth/password.ts
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string, 
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

---

## 📊 Graph Visualization System

### React Flow Integration

#### Core Implementation
```tsx
// CourseGraphViewer component structure
const CourseGraphViewer = ({ course }: { course: Course }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Transform course data to React Flow format
  useEffect(() => {
    const graphNodes = course.modules.map((module, index) => ({
      id: `module-${module.id}`,
      type: 'courseModule',
      position: calculatePosition(index, course.modules.length),
      data: {
        title: module.title,
        description: module.description,
        status: module.status,
        onClick: () => navigateToModule(module.slug)
      }
    }));

    const graphEdges = course.modules.slice(0, -1).map((module, index) => ({
      id: `edge-${index}`,
      source: `module-${module.id}`,
      target: `module-${course.modules[index + 1].id}`,
      type: 'smoothstep',
      animated: true
    }));

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [course]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </ReactFlowProvider>
  );
};
```

#### Custom Node Types
```tsx
// Custom module node component
const CourseModuleNode = ({ data }: NodeProps) => {
  return (
    <div className="neural-graph-node">
      <div className="node-header">
        <h4>{data.title}</h4>
        <StatusBadge status={data.status} />
      </div>
      <div className="node-content">
        <p>{data.description}</p>
      </div>
      <div className="node-actions">
        <Button size="sm" onClick={data.onClick}>
          View Module
        </Button>
      </div>
    </div>
  );
};

const nodeTypes = {
  courseModule: CourseModuleNode,
  // Add more node types as needed
};
```

#### Layout Algorithms
```typescript
// Position calculation for circular layout
const calculatePosition = (index: number, total: number) => {
  const radius = Math.max(200, total * 30);
  const angle = (index / total) * 2 * Math.PI;
  
  return {
    x: Math.cos(angle) * radius + 400,
    y: Math.sin(angle) * radius + 300
  };
};

// Hierarchical layout for complex structures
const calculateHierarchicalPosition = (
  node: ModuleNode, 
  depth: number, 
  index: number
) => {
  return {
    x: depth * 250,
    y: index * 100 + 50
  };
};
```

### Graph Data Processing

#### Module Relationship Analysis
```typescript
// Build relationship graph from course data
const buildModuleRelationshipGraph = (courses: Course[]) => {
  const moduleUsage = new Map<string, ModuleUsage>();
  
  courses.forEach(course => {
    course.modules.forEach(module => {
      if (!moduleUsage.has(module.id)) {
        moduleUsage.set(module.id, {
          module,
          courses: [],
          connections: new Set()
        });
      }
      
      const usage = moduleUsage.get(module.id)!;
      usage.courses.push(course);
      
      // Build connections between modules in same course
      course.modules.forEach(otherModule => {
        if (otherModule.id !== module.id) {
          usage.connections.add(otherModule.id);
        }
      });
    });
  });
  
  return moduleUsage;
};
```

---

## ⚡ Performance Optimization

### Frontend Optimizations

#### Code Splitting
```typescript
// Dynamic imports for large components
const GraphVisualization = dynamic(
  () => import('@/components/visualization/IntegratedGraphSystem'),
  { 
    loading: () => <GraphLoadingSkeleton />,
    ssr: false // Client-side only for performance
  }
);

const RichTextEditor = dynamic(
  () => import('@/components/editor/NeuralRichTextEditor'),
  { loading: () => <EditorLoadingSkeleton /> }
);
```

#### Image Optimization
```tsx
// Next.js Image component configuration
<Image
  src={module.imageUrl}
  alt={module.title}
  width={800}
  height={450}
  priority={index < 3} // Prioritize above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Results show:
# - Main bundle: ~102 kB
# - React Flow: ~45 kB (code split)
# - Rich Text Editor: ~35 kB (code split)
```

### Database Optimizations

#### Query Optimization
```typescript
// Efficient course query with relations
const getCourseWithModules = async (slug: string) => {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      courseModules: {
        orderBy: { sortOrder: 'asc' },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              content: true,
              status: true
            }
          }
        }
      },
      author: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
};
```

#### Connection Pooling
```typescript
// Prisma client configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
});

// Connection pool settings in DATABASE_URL
// ?connection_limit=10&pool_timeout=20&socket_timeout=60
```

### Caching Strategy

#### Next.js Caching
```typescript
// Static generation for public course pages
export async function generateStaticParams() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true }
  });

  return courses.map(course => ({
    slug: course.slug
  }));
}

// Revalidation strategy
export const revalidate = 3600; // 1 hour
```

#### React Query Configuration
```typescript
// Query client setup with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

---

## 🔄 Development Workflow

### Local Development Setup

#### Prerequisites Installation
```bash
# Node.js 18+ required
node --version  # Should be 18.0.0 or higher

# PostgreSQL installation
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu
```

#### Environment Configuration
```bash
# Clone repository
git clone https://github.com/RITIKHARIANI/bcs_web2.git
cd bcs-etextbook-redesigned

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Database setup
npx prisma migrate dev
npx prisma generate
npx prisma db seed  # Optional: seed with test data

# Start development server
npm run dev
```

### Code Quality Tools

#### ESLint Configuration
```javascript
// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      'prefer-const': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'error'
    }
  }
];
```

#### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Git Workflow

#### Branch Strategy
```bash
# Main branches
main          # Production-ready code
develop       # Integration branch for features

# Feature branches
feature/module-creation
feature/graph-visualization
feature/mobile-responsiveness

# Hotfix branches
hotfix/critical-security-fix
```

#### Commit Convention
```bash
# Commit message format
type(scope): description

# Examples
feat(modules): add rich text editor support
fix(auth): resolve session timeout issue
docs(api): update API documentation
perf(graph): optimize large dataset rendering
test(modules): add module creation test suite
```

### Database Migrations

#### Creating Migrations
```bash
# Create migration after schema changes
npx prisma migrate dev --name add_module_hierarchy

# Reset database (development only)
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

#### Migration Best Practices
```sql
-- Example migration: Add indexes
-- migrations/20250119000001_add_performance_indexes/migration.sql

-- Add indexes for query performance
CREATE INDEX CONCURRENTLY idx_modules_author_status 
ON modules(author_id, status) 
WHERE status = 'PUBLISHED';

-- Add partial index for featured courses
CREATE INDEX CONCURRENTLY idx_courses_featured 
ON courses(featured, status) 
WHERE featured = true AND status = 'PUBLISHED';
```

---

## 🧪 Testing Strategy

### Testing Pyramid

#### Unit Tests (70%)
```typescript
// Example: Module utility function test
// __tests__/lib/utils.test.ts
import { generateSlug, validateModuleData } from '@/lib/utils';

describe('generateSlug', () => {
  it('should convert title to URL-friendly slug', () => {
    expect(generateSlug('Neural Networks & AI')).toBe('neural-networks-ai');
  });

  it('should handle special characters', () => {
    expect(generateSlug('Cognitive Science: Mind & Brain')).toBe('cognitive-science-mind-brain');
  });
});

describe('validateModuleData', () => {
  it('should validate complete module data', () => {
    const validModule = {
      title: 'Test Module',
      content: 'Module content',
      status: 'DRAFT'
    };
    
    expect(validateModuleData(validModule)).toBe(true);
  });

  it('should reject invalid status', () => {
    const invalidModule = {
      title: 'Test Module',
      content: 'Module content',
      status: 'INVALID'
    };
    
    expect(validateModuleData(invalidModule)).toBe(false);
  });
});
```

#### Integration Tests (20%)
```typescript
// Example: API route integration test
// __tests__/api/modules.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/modules/route';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db');

describe('/api/modules', () => {
  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'faculty-1', role: 'FACULTY' }
    });
  });

  it('should create module with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Module',
        description: 'Test description',
        content: 'Test content',
        status: 'DRAFT'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.module.title).toBe('Test Module');
  });

  it('should require authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });
});
```

#### E2E Tests (10%)
```typescript
// Example: Playwright E2E test
// e2e/module-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Module Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as faculty
    await page.goto('/auth/login');
    await page.fill('[data-testid=email]', 'faculty@test.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/faculty/dashboard');
  });

  test('should create and publish module', async ({ page }) => {
    // Navigate to module creation
    await page.click('[data-testid=modules-nav]');
    await page.click('[data-testid=create-module-button]');

    // Fill form
    await page.fill('[data-testid=module-title]', 'Test E2E Module');
    await page.fill('[data-testid=module-description]', 'E2E test description');
    
    // Add content using rich text editor
    await page.click('[data-testid=rich-text-editor]');
    await page.keyboard.type('This is test content for the module.');

    // Save as draft
    await page.click('[data-testid=save-draft-button]');
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();

    // Publish module
    await page.click('[data-testid=publish-button]');
    await expect(page.locator('[data-testid=module-status]')).toHaveText('Published');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/faculty/modules/create');
    
    // Try to save without title
    await page.click('[data-testid=save-draft-button]');
    
    await expect(page.locator('[data-testid=title-error]')).toHaveText('Title is required');
  });
});
```

### Test Configuration

#### Jest Setup
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
});
```

---

## 🚀 Deployment Architecture

### Production Infrastructure

#### Docker Containerization
```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Builder stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bcs-etextbook
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bcs-etextbook
  template:
    metadata:
      labels:
        app: bcs-etextbook
    spec:
      containers:
      - name: app
        image: bcs-etextbook:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: DATABASE_URL
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secret
              key: NEXTAUTH_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: docker build -t ${{ secrets.REGISTRY_URL }}/bcs-etextbook:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.REGISTRY_TOKEN }} | docker login ${{ secrets.REGISTRY_URL }} -u ${{ secrets.REGISTRY_USER }} --password-stdin
        docker push ${{ secrets.REGISTRY_URL }}/bcs-etextbook:${{ github.sha }}
    
    - name: Deploy to production
      uses: azure/k8s-deploy@v1
      with:
        manifests: k8s/
        images: ${{ secrets.REGISTRY_URL }}/bcs-etextbook:${{ github.sha }}
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      database: 'connected'
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

#### Performance Metrics
```typescript
// Performance monitoring middleware
export function withMetrics(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    
    try {
      await handler(req, res);
    } finally {
      const duration = Date.now() - startTime;
      
      // Log performance metrics
      console.log(JSON.stringify({
        method: req.method,
        url: req.url,
        duration,
        status: res.statusCode,
        timestamp: new Date().toISOString()
      }));
    }
  };
}
```

### Error Tracking

#### Error Boundary Implementation
```tsx
// src/components/error/error-boundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>We've been notified of this error and are working to fix it.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Logging Configuration

#### Structured Logging
```typescript
// src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bcs-etextbook' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

### Database Monitoring

#### Query Performance Logging
```typescript
// Prisma middleware for query monitoring
const queryLogger = Prisma.middleware(async (params, next) => {
  const before = Date.now();
  
  const result = await next(params);
  
  const after = Date.now();
  const duration = after - before;
  
  // Log slow queries
  if (duration > 1000) { // Log queries over 1 second
    logger.warn('Slow query detected', {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
      args: params.args
    });
  }
  
  return result;
});
```

---

**Technical Documentation Version**: 1.0  
**Last Updated**: January 19, 2025  
**Platform Version**: 2.0.0  
**Next Review**: April 19, 2025

---

## Quest Map and Gamification System

The Quest Map and Gamification system adds game-like elements to the learning experience, including XP rewards, achievements, and visual learning paths.

### Architecture Overview

**Components**:
- Quest Map Visualizer (public and authenticated views)
- Achievement System (definitions, checker, UI components)
- XP and Leveling System (user_gamification_stats)
- Visual Quest Map Editor (faculty tool)

**Database Tables**:
- `user_gamification_stats`: XP, level, streaks
- `achievements`: Achievement definitions
- `user_achievements`: Earned achievements per user
- `learning_sessions`: Daily activity tracking
- `learning_paths`: Curated learning journeys
- `curriculum_maps`: Course relationship mapping

### Module Quest Map Fields

**Database Schema** (`modules` table):
```typescript
interface ModuleQuestMap {
  prerequisite_module_ids: string[];     // Array of prerequisite module IDs
  quest_map_position_x: number;         // 0-100 (percentage)
  quest_map_position_y: number;         // 0-100 (percentage)
  xp_reward: number;                    // 0-10000
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'boss';
  estimated_minutes: number | null;      // 0-999
  quest_type: 'standard' | 'challenge' | 'boss' | 'bonus';
}
```

**API Endpoints**:
- `PUT /api/modules/[id]`: Update module with quest map fields
- `POST /api/modules`: Create module with quest map fields (defaults apply)
- `GET /api/faculty/quest-map/layout`: Fetch all modules for layout editor
- `PUT /api/faculty/quest-map/layout`: Bulk update positions and prerequisites

### Achievement System

**Achievement Definitions** (`src/lib/achievements/definitions.ts`):
```typescript
interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;  // Emoji or Lucide icon name
  category: 'completion' | 'speed' | 'consistency' | 'mastery';
  xp_reward: number;
  badge_color: 'gray' | 'bronze' | 'silver' | 'gold';
  criteria: {
    type: string;
    [key: string]: any;
  };
}
```

**Achievement Criteria Types**:
- `modules_completed`: Completed N modules total
- `courses_completed`: Completed N courses at 100%
- `streak`: Learned for N consecutive days
- `perfect_course`: Completed a course with 100%
- `module_difficulty`: Completed a boss/advanced module
- `challenge_modules_completed`: Completed N challenge modules
- `modules_per_day`: Completed N modules in one day
- `level_reached`: Reached level N
- `learning_paths_completed`: Completed N learning paths
- `prerequisite_chain_completed`: Completed a course with prerequisites
- `foundation_courses_completed`: Completed all foundation courses

**Achievement Checker** (`src/lib/achievements/checker.ts`):
```typescript
// Called after module completion
await checkAchievementsAfterModuleCompletion(
  userId: string,
  completedModuleId: string,
  courseId?: string
);

// Returns:
{
  newAchievements: Achievement[];
  totalXPAwarded: number;
}
```

**Achievement UI Components**:
- `AchievementBadge`: Visual badge with lock state
- `AchievementCard`: Detailed achievement display
- `AchievementToast`: Animated unlock notifications
- `AchievementsView`: Full achievements profile page (`/profile/achievements`)

### XP and Leveling System

**XP Calculation**:
```typescript
// Module completion XP
const moduleXP = module.xp_reward; // From module settings

// Achievement XP
const achievementXP = newAchievements.reduce((sum, a) => sum + a.xp_reward, 0);

// Total XP awarded
const totalXP = moduleXP + achievementXP;
```

**Level Progression**:
```typescript
// Level up formula: Level² × 100 = Total XP required
// Level 1: 0 XP
// Level 2: 100 XP (1² × 100)
// Level 3: 400 XP (2² × 100)
// Level 4: 900 XP (3² × 100)
// Level 5: 1600 XP (4² × 100)
// ...
// Level 50: 250,000 XP (50² × 100)

function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

function xpRequiredForLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}
```

**User Gamification Stats**:
```typescript
interface UserGamificationStats {
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: Date;
  modules_completed_count: number;
  courses_completed_count: number;
}
```

### Quest Map Visualization

**Public Quest Map** (`/courses/[slug]/quest-map`):
- Shows all modules in a course
- Visual difficulty-based colors
- Prerequisite connection lines (SVG paths)
- Shows completion status for authenticated users
- Click module to view details or navigate to content

**Authenticated Quest Map** (same route, with auth):
- Shows personal progress (completed modules highlighted)
- Locked modules if prerequisites not met
- XP rewards displayed
- "Mark as Complete" quick action

**Faculty Quest Map Editor** (`/faculty/quest-map`):
- Drag-and-drop module positioning
- Visual prerequisite editing (checkbox sidebar)
- Auto-layout algorithm (by dependency depth)
- Bulk save positions and prerequisites
- Prerequisite validation (no circular dependencies)

### Quest Map Layout Algorithm

**Auto-Layout** (`src/lib/quest-map-layout.ts`):
```typescript
// Calculates dependency depth for each module
function calculateDepths(modules: Module[]): Map<string, number> {
  // Depth = max(prerequisite depths) + 1
  // Foundation modules (no prereqs) = depth 0
}

// Arranges modules in grid based on depth
function autoLayoutModules(modules: Module[]): ModuleWithDepth[] {
  // X position: depth level (0-100%)
  // Y position: evenly spaced within depth level
}

// Validates prerequisite structure
function validatePrerequisites(modules: Module[]): {
  valid: boolean;
  errors: string[];
} {
  // Checks:
  // - No circular dependencies
  // - All prerequisite IDs exist
  // - No self-references
}
```

### Integration with Progress Tracking

**Module Completion Flow** (`/api/progress/module/complete`):
```typescript
1. Mark module as completed
2. Award module XP
3. Check for achievements (calls checkAchievementsAfterModuleCompletion)
4. Award achievement XP
5. Calculate new level
6. Update user_gamification_stats
7. Update learning_sessions (daily tracking)
8. Return:
   - success: boolean
   - xpAwarded: number
   - achievements: Achievement[]
   - leveledUp: boolean
   - level: number
```

**Frontend Integration** (`MarkCompleteButton`):
```typescript
// Show achievement toasts
if (data.achievements && data.achievements.length > 0) {
  setTimeout(() => {
    showAchievementsSequence(data.achievements);
  }, 500);
}

// Show level up toast
if (data.leveledUp && data.level) {
  const nextLevelXP = Math.pow(data.level + 1, 2) * 100;
  setTimeout(() => {
    showLevelUpToast(data.level, nextLevelXP);
  }, 1500);
}
```

### Responsive Design Considerations

All quest map and achievement UI components are fully responsive:

**Mobile** (< 640px):
- Single column layouts
- Smaller module nodes (80x80px)
- Compact controls and badges
- Touch-friendly tap targets
- Reduced map height (500px)

**Tablet** (640px - 1024px):
- Two column layouts where appropriate
- Medium module nodes (96x96px)
- Full map height (700px)

**Desktop** (> 1024px):
- Multi-column layouts (3:1 grid for editor)
- Large module nodes (96x96px)
- Sidebar panels
- Optimal spacing

### Security and Permissions

**Faculty-Only Endpoints**:
- `/api/faculty/quest-map/layout` (GET/PUT)
- Quest map editor page (`/faculty/quest-map`)

**Auth Checks**:
```typescript
const session = await auth();
if (!hasFacultyAccess(session)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Student Access**:
- View quest maps (public and authenticated)
- See own progress and achievements
- Cannot edit module positions or prerequisites
- Can mark modules as complete (with proper validation)

### Performance Optimizations

**Quest Map Rendering**:
- SVG paths calculated with useMemo
- Module positions stored as percentages (relative, not absolute pixels)
- Drag-and-drop uses transform for smooth animations
- Lazy loading for large module sets

**Achievement Checking**:
- Only checks on module completion (not on every page load)
- Parallel queries for stats (modules, courses, sessions)
- Database indexes on user_id foreign keys
- Upsert pattern for achievements table

**XP Calculations**:
- Level calculated from total XP (not stored separately, computed on read)
- Atomic increments for XP updates (no race conditions)
- Transaction-based achievement awarding

### Data Migration and Seeding

**Seed Achievements**:
```typescript
import { seedAchievements } from '@/lib/achievements/checker';

// Upserts all achievement definitions into database
await seedAchievements();
```

**Default Quest Map Values**:
```typescript
// Module creation defaults (in API schema)
{
  prerequisite_module_ids: [],
  quest_map_position_x: 50,
  quest_map_position_y: 50,
  xp_reward: 100,
  difficulty_level: 'beginner',
  quest_type: 'standard'
}
```

### Testing Recommendations

**Unit Tests** (not yet implemented, recommended):
- Quest map layout algorithm (depth calculation, auto-layout)
- Achievement criteria checkers (each type)
- XP and level calculations
- Prerequisite validation (circular dependency detection)

**Integration Tests**:
- Module completion flow end-to-end
- Achievement unlocking on module completion
- Quest map API endpoints (GET/PUT)
- XP accumulation and level up

**E2E Tests**:
- Complete a module and verify XP awarded
- Unlock an achievement and verify toast shown
- Drag module in quest map editor and save
- Set prerequisites and verify validation

### Related Documentation

- [Quest Map Faculty Guide](./QUEST_MAP_FACULTY_GUIDE.md) - How to use the editor
- [Quest Map Student Guide](./QUEST_MAP_STUDENT_GUIDE.md) - Student-facing features
- [Quest Map Implementation Plan](./QUEST_MAP_IMPLEMENTATION_PLAN.md) - Full feature spec

---

