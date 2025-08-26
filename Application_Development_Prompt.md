# Complete Application Development Prompt

## 🎯 PROJECT OVERVIEW

You are tasked with building a **comprehensive Interactive Modular Educational Platform** for a university Brain and Cognitive Sciences department. This platform will replace an existing Flask-based website with a modern, scalable solution featuring interactive demonstrations, hierarchical content organization, and advanced faculty/student management.

---

## 📋 TECHNICAL REQUIREMENTS

### **Core Technology Stack:**
- **Frontend:** Next.js 14 (App Router) + TypeScript + React 18
- **Styling:** Tailwind CSS + Radix UI + Framer Motion
- **Database:** PostgreSQL with Supabase (free tier: 500MB, 50K users)
- **Authentication:** Supabase Auth with role-based access
- **Hosting:** Netlify (free tier with custom domain support)
- **State Management:** Zustand + React Query (TanStack Query)
- **Code Editor:** CodeMirror 6
- **Rich Text:** TipTap Editor with LaTeX support
- **Interactive Demos:** Pyodide (Python) + p5.js integration

### **Database Schema (Implement exactly as specified):**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS ltree;

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  course_code VARCHAR(50),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hierarchical modules (supports unlimited nesting)
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  parent_module_id UUID REFERENCES modules(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB,
  module_path LTREE,
  order_index INTEGER DEFAULT 0,
  module_type VARCHAR(50) DEFAULT 'content', -- 'content', 'demo', 'assessment'
  is_published BOOLEAN DEFAULT false,
  estimated_duration INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactive demonstrations
CREATE TABLE interactive_demos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  demo_type VARCHAR(50) NOT NULL, -- 'p5js', 'python', 'simulation'
  code_content TEXT,
  html_content TEXT,
  config JSONB,
  assets JSONB,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE user_progress (
  user_id UUID REFERENCES auth.users(id),
  module_id UUID REFERENCES modules(id),
  course_id UUID REFERENCES courses(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0,
  interaction_data JSONB,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

-- Course enrollments
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  role VARCHAR(20) DEFAULT 'student', -- 'student', 'ta', 'instructor'
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'dropped'
  UNIQUE(user_id, course_id)
);

-- Module analytics
CREATE TABLE module_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id),
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(50), -- 'view', 'demo_interaction', 'completion'
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content versions
CREATE TABLE content_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id),
  version_number INTEGER,
  content JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_notes TEXT,
  UNIQUE(module_id, version_number)
);

-- Create indexes for performance
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_path ON modules USING GIST(module_path);
CREATE INDEX idx_modules_parent ON modules(parent_module_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
```

### **Row Level Security Policies:**
```sql
-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Course policies
CREATE POLICY "Users can view published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can manage their courses" ON courses
  FOR ALL USING (instructor_id = auth.uid());

-- Module policies
CREATE POLICY "Users can view published modules of enrolled courses" ON modules
  FOR SELECT USING (
    is_published = true AND 
    course_id IN (
      SELECT course_id FROM enrollments 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Instructors can manage modules in their courses" ON modules
  FOR ALL USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );
```

---

## 🎨 USER INTERFACE REQUIREMENTS

### **Application Structure:**
```
/app
├── layout.tsx                 # Root layout with auth
├── page.tsx                   # Landing page
├── (auth)
│   ├── login/page.tsx         # Login page
│   └── register/page.tsx      # Registration page
├── dashboard
│   ├── layout.tsx             # Dashboard layout
│   ├── page.tsx               # Dashboard home
│   ├── courses/               # Course management
│   ├── analytics/             # Analytics dashboard
│   └── settings/              # User settings
├── courses
│   └── [courseId]
│       ├── page.tsx           # Course overview
│       ├── modules/           # Module pages
│       └── analytics/         # Course analytics
├── faculty
│   ├── layout.tsx             # Faculty-specific layout
│   ├── dashboard/page.tsx     # Faculty dashboard
│   ├── courses/               # Course management
│   ├── editor/                # Content editor
│   └── analytics/             # Faculty analytics
└── student
    ├── layout.tsx             # Student-specific layout
    ├── dashboard/page.tsx     # Student dashboard
    ├── courses/               # Enrolled courses
    └── progress/              # Progress tracking
```

### **Key Components to Build:**

**1. Authentication System:**
```typescript
// components/auth/AuthProvider.tsx
interface User {
  id: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  profile: UserProfile;
}

// Implement role-based routing and protection
// Support social login (Google, GitHub)
// Password reset and email verification
```

**2. Course Hierarchy Visualization:**
```typescript
// components/course/CourseMap.tsx
// Interactive node-based course visualization
// Show learning paths and prerequisites
// Progress indicators on each module
// Clickable navigation between modules
```

**3. Module Content System:**
```typescript
// components/modules/ModuleViewer.tsx
// Rich content display with markdown support
// Embedded media (images, videos, documents)
// LaTeX math equation rendering
// Interactive demo integration
// Progress tracking and bookmarking
```

**4. Interactive Demo Framework:**
```typescript
// components/demos/InteractiveDemo.tsx
// Support for p5.js simulations
// Pyodide integration for Python execution
// Real-time parameter manipulation
// Code editor with syntax highlighting
// Save/share demo configurations
```

**5. Faculty Content Editor:**
```typescript
// components/faculty/ContentEditor.tsx
// Rich text editor with TipTap
// Drag-drop module organization
// Media upload and management
// Real-time preview
// Version control integration
// Collaborative editing support
```

**6. Analytics Dashboard:**
```typescript
// components/analytics/AnalyticsDashboard.tsx
// Student engagement metrics
// Module completion rates
// Demo interaction tracking
// Learning outcome analysis
// Export functionality
```

---

## 🔧 CORE FUNCTIONALITY REQUIREMENTS

### **1. Hierarchical Module System:**
- Support unlimited nesting levels (1.1.1.1.1...)
- Drag-drop reordering of modules
- Automatic path generation and maintenance
- Breadcrumb navigation
- Collapsible tree view

### **2. Interactive Demonstrations:**
- **p5.js Integration:** Embed existing simulations like Braitenberg vehicles
- **Python Execution:** Client-side Python using Pyodide
- **Parameter Controls:** Real-time manipulation of demo variables
- **Code Editor:** Syntax-highlighted editing with live preview
- **Sharing:** Save and share demo configurations

### **3. Content Management:**
- **Rich Text Editor:** TipTap with LaTeX math support
- **Media Upload:** Images, videos, documents with CDN
- **Version Control:** Track content changes and rollback
- **Templates:** Reusable content structures
- **Collaborative Editing:** Real-time multi-user editing

### **4. User Management:**
- **Role-Based Access:** Student, Faculty, Admin with different permissions
- **Course Enrollment:** Automatic and manual enrollment systems
- **Progress Tracking:** Individual and aggregate progress analytics
- **Authentication:** Secure login with social options

### **5. Analytics & Reporting:**
- **Student Analytics:** Individual progress, time spent, completion rates
- **Faculty Analytics:** Class performance, content effectiveness
- **Demo Analytics:** Interaction patterns, parameter usage
- **Export Functions:** PDF reports, CSV data export

---

## 📱 RESPONSIVE DESIGN REQUIREMENTS

### **Mobile-First Design:**
- Responsive layouts for all screen sizes
- Touch-friendly interactive demos
- Optimized navigation for mobile
- Offline content caching
- Progressive Web App (PWA) features

### **Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management

---

## 🚀 PERFORMANCE REQUIREMENTS

### **Performance Targets:**
- Initial page load: <2 seconds
- Interactive demo load: <3 seconds
- Database queries: <500ms
- Support 500+ concurrent users
- 99.9% uptime

### **Optimization Strategies:**
- Next.js static generation where possible
- Image optimization and lazy loading
- Code splitting and tree shaking
- Database query optimization
- CDN integration for static assets

---

## 🔒 SECURITY REQUIREMENTS

### **Data Protection:**
- Secure authentication with JWT tokens
- Row-level security in database
- Input validation and sanitization
- XSS and CSRF protection
- File upload restrictions

### **Code Security:**
- Sandboxed demo execution
- Content Security Policy (CSP)
- Regular dependency updates
- Security audit trail
- Backup and recovery procedures

---

## 📊 SPECIFIC FEATURE IMPLEMENTATIONS

### **1. Braitenberg Vehicle Demo Integration:**
```typescript
// Integrate existing p5.js simulation
// Allow parameter modification (vehicle count, world size, behavior type)
// Real-time visualization updates
// Save custom configurations
// Share configurations with other users
```

### **2. Learning Path Visualization:**
```typescript
// Interactive course map using React Flow or similar
// Show prerequisite relationships
// Progress indicators
// Alternative learning paths
// Recommended next modules
```

### **3. Faculty Dashboard:**
```typescript
// Course overview with key metrics
// Quick content editing access
// Student progress monitoring
// Recent activity feed
// Collaboration notifications
```

### **4. Student Dashboard:**
```typescript
// Enrolled courses overview
// Current progress tracking
// Bookmarked content
// Recent activity
// Upcoming deadlines/assignments
```

---

## 🧪 TESTING REQUIREMENTS

### **Testing Strategy:**
- Unit tests for all components (Jest + React Testing Library)
- Integration tests for API endpoints
- End-to-end tests for critical user flows (Playwright)
- Performance testing with realistic data
- Security testing and vulnerability assessment

### **Test Coverage:**
- Minimum 80% code coverage
- All user authentication flows
- Content creation and editing
- Interactive demo functionality
- Database operations
- Error handling and edge cases

---

## 📦 DEPLOYMENT REQUIREMENTS

### **Deployment Configuration:**
- **Frontend:** Deploy to Netlify with automatic builds from Git
- **Database:** Supabase project with proper RLS policies
- **Domain:** Configure custom domain with SSL
- **Environment Variables:** Secure configuration management
- **Monitoring:** Error tracking and performance monitoring

### **CI/CD Pipeline:**
```yaml
# Example GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test
      - name: Deploy to Netlify
        uses: netlify/actions/build@master
```

---

## 📚 CONTENT MIGRATION

### **Existing Content Structure:**
```
Current markdown files follow pattern:
- m1_0.md (Module 1, Section 0)
- m1_1_0.md (Module 1, Section 1, Subsection 0)
- Preserve this hierarchical structure in new system
```

### **Migration Script Requirements:**
```typescript
// Create migration utility to:
// 1. Parse existing markdown files
// 2. Extract frontmatter and content
// 3. Create module hierarchy in database
// 4. Preserve original file naming and paths
// 5. Maintain internal links and references
```

---

## 🎯 SUCCESS CRITERIA

### **Technical Success:**
- All specified features implemented and tested
- Performance targets met
- Security requirements satisfied
- Responsive design across all devices
- Successful content migration

### **User Success:**
- Intuitive interface for faculty content creation
- Engaging student learning experience
- Effective analytics and progress tracking
- Smooth transition from existing system
- Positive user feedback and adoption

---

## 📋 DELIVERABLES

### **Code Deliverables:**
1. Complete Next.js application with all features
2. Supabase database schema and policies
3. Component library and design system
4. Test suite with comprehensive coverage
5. Deployment configuration and documentation

### **Documentation Deliverables:**
1. Technical documentation and API reference
2. User guides for students and faculty
3. Admin documentation and troubleshooting
4. Migration guide and procedures
5. Video tutorials for key features

### **Additional Requirements:**
- Use TypeScript throughout for type safety
- Follow Next.js 14 App Router conventions
- Implement proper error boundaries and loading states
- Use React Server Components where appropriate
- Optimize for Core Web Vitals
- Include proper SEO meta tags
- Implement proper logging and monitoring

**BUILD THIS AS A PRODUCTION-READY APPLICATION** with clean, maintainable code, comprehensive error handling, and excellent user experience. The final product should be a modern, scalable educational platform that significantly enhances the learning experience for Brain and Cognitive Sciences students and faculty.
