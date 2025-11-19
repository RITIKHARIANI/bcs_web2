# Week 4: Progress Tracking System - Implementation Plan

**Status:** Ready to Start
**Estimated Time:** 2-3 days
**Priority:** High - Core learning feature
**Dependencies:** Week 3 (Enrollment System) ✅ Complete

---

## 🎯 Goals

Enable students, faculty, and admins to track learning progress including:
- Module completion tracking (manual + automatic)
- Time spent on modules (auto-tracked via heartbeat)
- Learning streaks (consecutive days)
- Progress visualization (percentage complete)
- Faculty analytics (course completion rates, engagement)

---

## 📊 Overview

### What We're Building

```
Student enrolls in course
         ↓
Views module → Auto-tracking starts
         ↓
     [5-min heartbeat]
     - Time spent updates
     - Scroll depth tracked
     - Status: in_progress
         ↓
Clicks "Mark Complete" → Status: completed
         ↓
Course progress updates (X% complete)
         ↓
Learning session recorded (for streaks)
         ↓
Faculty sees analytics
```

---

## 📋 Phase 1: Database Schema (30 mins)

### 1.1 Create `module_progress` Table

Tracks individual module completion for each learner.

```prisma
model module_progress {
  id              String    @id @default(cuid())
  user_id         String    // Changed from student_id for inclusivity
  module_id       String
  course_id       String    // Link to enrolled course

  // Progress tracking
  status          String    @default("not_started") // not_started | in_progress | completed
  started_at      DateTime?
  completed_at    DateTime?
  last_accessed   DateTime?

  // Time tracking
  time_spent_mins Int       @default(0)
  visit_count     Int       @default(0)

  // Completion data
  scroll_depth_pct Float    @default(0) // 0-100, how far scrolled
  manually_marked  Boolean  @default(false) // Did user click "Mark Complete"?

  // Relations
  user    users   @relation(fields: [user_id], references: [id], onDelete: Cascade)
  module  modules @relation(fields: [module_id], references: [id], onDelete: Cascade)
  course  courses @relation(fields: [course_id], references: [id], onDelete: Cascade)

  @@unique([user_id, module_id, course_id])
  @@index([user_id])
  @@index([module_id])
  @@index([course_id])
  @@index([status])
}
```

### 1.2 Create `learning_sessions` Table

Daily learning activity for streak tracking.

```prisma
model learning_sessions {
  id                String    @id @default(cuid())
  user_id           String
  date              DateTime  @db.Date // Date only, no time

  // Daily metrics
  minutes_studied   Int       @default(0)
  modules_viewed    Int       @default(0)
  modules_completed Int       @default(0)
  courses_accessed  Int       @default(0)

  // Session tracking
  first_activity    DateTime?
  last_activity     DateTime?

  // Relations
  user              users     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, date]) // One record per user per day
  @@index([user_id, date(sort: Desc)])
  @@index([date(sort: Desc)])
}
```

### 1.3 Update Existing Tables

```prisma
// Add to courses table
model courses {
  // ... existing fields
  module_progress   module_progress[] // New relation
}

// Add to modules table
model modules {
  // ... existing fields
  progress_records  module_progress[] // New relation
}

// Add to users table
model users {
  // ... existing fields
  module_progress    module_progress[]
  learning_sessions  learning_sessions[]
}

// Update course_tracking table (already has user_id from Week 3)
model course_tracking {
  // ... existing fields

  // Add progress metrics
  completion_pct     Float  @default(0) // 0-100
  modules_completed  Int    @default(0)
  modules_total      Int    @default(0)
}
```

### Migration Command

```bash
npm run db:migrate:dev -- --name progress_tracking_system
```

---

## 📋 Phase 2: API Endpoints (3 hours)

### 2.1 Module Progress Endpoints

**File:** `/src/app/api/progress/module/route.ts`

```typescript
// POST /api/progress/module/start
// Marks module as started (status: in_progress)
export async function POST(request: Request) {
  const { moduleId, courseId } = await request.json()
  // Create or update module_progress record
  // Set status = 'in_progress', started_at = now()
  // Increment visit_count
}

// PUT /api/progress/module/complete
// Marks module as completed
export async function PUT(request: Request) {
  const { moduleId, courseId, manually_marked } = await request.json()
  // Update module_progress record
  // Set status = 'completed', completed_at = now()
  // Update course_tracking completion_pct
  // Update learning_session for today
}

// PUT /api/progress/module/heartbeat
// Updates time spent (called every 5 minutes)
export async function PUT(request: Request) {
  const { moduleId, courseId, incrementMins, scrollDepthPct } = await request.json()
  // Update module_progress: time_spent_mins += incrementMins
  // Update scroll_depth_pct if higher
  // Update last_accessed = now()
  // Update learning_session: minutes_studied += incrementMins
}
```

### 2.2 Progress Query Endpoints

**File:** `/src/app/api/progress/[userId]/route.ts`

```typescript
// GET /api/progress/[userId]
// Get overall progress for a user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Auth: User can only view own progress (unless admin)
  // Return:
  // - Total courses enrolled
  // - Total modules completed
  // - Total time spent
  // - Current streak
  // - Recent activity
}
```

**File:** `/src/app/api/progress/course/[courseId]/route.ts`

```typescript
// GET /api/progress/course/[courseId]
// Get user's progress for a specific course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // Auth: User must be enrolled in course
  // Return:
  // - Course info
  // - Module list with progress status
  // - Completion percentage
  // - Time spent on course
}
```

### 2.3 Streak Endpoint

**File:** `/src/app/api/progress/streaks/route.ts`

```typescript
// GET /api/progress/streaks
// Get learning streak data for current user
export async function GET(request: Request) {
  // Fetch learning_sessions for user (last 365 days)
  // Calculate current streak
  // Calculate longest streak
  // Return calendar heatmap data
}
```

### 2.4 Faculty Analytics Endpoint

**File:** `/src/app/api/faculty/analytics/[courseId]/route.ts`

```typescript
// GET /api/faculty/analytics/[courseId]
// Course analytics for faculty
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // Auth: Faculty must be course author or collaborator
  // Return:
  // - Enrollment count
  // - Completion rate (% of enrolled learners who completed)
  // - Average time per module
  // - Drop-off points (modules where learners stop)
  // - Most/least engaging modules
  // - Recent activity
}
```

---

## 📋 Phase 3: Client-Side Tracking (2 hours)

### 3.1 Progress Tracker Hook

**File:** `/src/hooks/useModuleProgress.ts`

```typescript
export function useModuleProgress(moduleId: string, courseId: string) {
  const [isTracking, setIsTracking] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [scrollDepth, setScrollDepth] = useState(0)

  // Start tracking when module page loads
  useEffect(() => {
    startModule(moduleId, courseId)
    setIsTracking(true)

    return () => setIsTracking(false)
  }, [moduleId, courseId])

  // Heartbeat: Update time every 5 minutes
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isIdle()) {
        sendHeartbeat(moduleId, courseId, 5, getCurrentScrollDepth())
        setTimeSpent(t => t + 5)
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [isTracking, moduleId, courseId])

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const depth = calculateScrollDepth()
      setScrollDepth(depth)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const markComplete = async () => {
    await completeModule(moduleId, courseId, true)
  }

  return { timeSpent, scrollDepth, markComplete, isTracking }
}
```

### 3.2 Helper Functions

**File:** `/src/lib/progress/tracking.ts`

```typescript
export async function startModule(moduleId: string, courseId: string) {
  await fetch('/api/progress/module/start', {
    method: 'POST',
    body: JSON.stringify({ moduleId, courseId })
  })
}

export async function sendHeartbeat(
  moduleId: string,
  courseId: string,
  incrementMins: number,
  scrollDepthPct: number
) {
  await fetch('/api/progress/module/heartbeat', {
    method: 'PUT',
    body: JSON.stringify({ moduleId, courseId, incrementMins, scrollDepthPct })
  })
}

export async function completeModule(
  moduleId: string,
  courseId: string,
  manually_marked: boolean
) {
  await fetch('/api/progress/module/complete', {
    method: 'PUT',
    body: JSON.stringify({ moduleId, courseId, manually_marked })
  })
}

export function calculateScrollDepth(): number {
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  return Math.round(((scrollTop + windowHeight) / documentHeight) * 100)
}

export function isIdle(): boolean {
  // Check if user has been inactive for > 5 minutes
  // Use mouse/keyboard events to track activity
  return false // Simplified - implement properly
}
```

### 3.3 Streak Calculation

**File:** `/src/lib/progress/streaks.ts`

```typescript
interface LearningSession {
  date: Date
  minutes_studied: number
}

export function calculateStreak(sessions: LearningSession[]): number {
  if (sessions.length === 0) return 0

  let streak = 0
  let currentDate = startOfDay(new Date())

  const sortedSessions = sessions.sort((a, b) =>
    b.date.getTime() - a.date.getTime()
  )

  for (const session of sortedSessions) {
    const sessionDate = startOfDay(session.date)

    if (isSameDay(sessionDate, currentDate)) {
      streak++
      currentDate = subDays(currentDate, 1)
    } else if (isSameDay(sessionDate, subDays(currentDate, 1))) {
      streak++
      currentDate = subDays(currentDate, 1)
    } else {
      break
    }
  }

  return streak
}

export function getLongestStreak(sessions: LearningSession[]): number {
  if (sessions.length === 0) return 0

  let maxStreak = 0
  let currentStreak = 1

  const sortedSessions = sessions.sort((a, b) =>
    a.date.getTime() - b.date.getTime()
  )

  for (let i = 1; i < sortedSessions.length; i++) {
    const prevDate = startOfDay(sortedSessions[i - 1].date)
    const currDate = startOfDay(sortedSessions[i].date)

    if (isSameDay(currDate, addDays(prevDate, 1))) {
      currentStreak++
    } else {
      maxStreak = Math.max(maxStreak, currentStreak)
      currentStreak = 1
    }
  }

  return Math.max(maxStreak, currentStreak)
}
```

---

## 📋 Phase 4: UI Components (4 hours)

### 4.1 Progress Tracking Components

**Components to Create:**

1. **MarkCompleteButton** - Manual completion
   - File: `/src/components/progress/MarkCompleteButton.tsx`
   - Green button: "Mark as Complete" / "Completed ✓"
   - Disabled if already completed
   - Confetti animation on completion

2. **ProgressBar** - Visual indicator
   - File: `/src/components/progress/ProgressBar.tsx`
   - 0-100% gradient bar
   - Shows percentage text
   - Color: green (complete), blue (in progress), gray (not started)

3. **ModuleProgressCard** - Module with status
   - File: `/src/components/progress/ModuleProgressCard.tsx`
   - Module title + description
   - Progress badge (completed, in progress, not started)
   - Time spent indicator
   - Link to module

4. **CourseProgressCard** - Course with percentage
   - File: `/src/components/progress/CourseProgressCard.tsx`
   - Course card with progress bar
   - "X/Y modules completed"
   - Time spent on course
   - Continue learning button

### 4.2 Statistics Components

5. **ProgressStats** - Overall dashboard stats
   - File: `/src/components/progress/ProgressStats.tsx`
   - Grid of stat cards:
     - Courses enrolled
     - Modules completed
     - Time spent (hours)
     - Current streak

6. **StreakBadge** - Streak indicator
   - File: `/src/components/progress/StreakBadge.tsx`
   - "🔥 X-day streak"
   - Animated flame icon
   - Shows in dashboard header

7. **LearningStreakCalendar** - Heatmap
   - File: `/src/components/progress/LearningStreakCalendar.tsx`
   - GitHub-style contribution calendar
   - Color intensity based on minutes studied
   - Shows last 365 days
   - Hover shows date + minutes
   - Use library: react-calendar-heatmap

### 4.3 Visualization Components

8. **ProgressLegend** - Roadmap legend
   - File: `/src/components/progress/ProgressLegend.tsx`
   - Color key:
     - Green: Completed
     - Blue: In Progress
     - Gray: Not Started

9. **ProgressTimeline** - Recent activity
   - File: `/src/components/progress/ProgressTimeline.tsx`
   - Vertical timeline
   - Shows recent module completions
   - Time stamps (e.g., "2 hours ago")
   - Module names + course context

### 4.4 Faculty Analytics Components

10. **FacultyCourseAnalytics** - Analytics dashboard
    - File: `/src/components/faculty/FacultyCourseAnalytics.tsx`
    - Completion rate chart (bar chart)
    - Engagement over time (line chart)
    - Top performing modules (sorted list)
    - Drop-off points (heatmap)
    - Use library: recharts

---

## 📋 Phase 5: Pages (2 hours)

### 5.1 Module Page Enhancement

**File:** `/src/app/courses/[slug]/[moduleSlug]/page.tsx`

```typescript
// Add to existing module viewer page:
export default async function ModulePage({ params }) {
  const { slug, moduleSlug } = await params
  const session = await auth()

  // ... existing code to fetch course and module

  // If user is enrolled, check progress
  let progress = null
  if (session?.user) {
    progress = await prisma.module_progress.findUnique({
      where: {
        user_id_module_id_course_id: {
          user_id: session.user.id,
          module_id: module.id,
          course_id: course.id
        }
      }
    })
  }

  return (
    <ModuleViewer
      module={module}
      course={course}
      progress={progress}
      enableTracking={!!session?.user}
    />
  )
}
```

### 5.2 Progress Page

**File:** `/src/app/student/progress/page.tsx`

```typescript
// Overall progress statistics page
export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  // Fetch user's overall progress
  const progress = await getUserProgress(session.user.id)

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1>My Learning Progress</h1>
        <ProgressStats stats={progress} />
        <ProgressTimeline activities={progress.recentActivity} />
      </div>
    </AuthenticatedLayout>
  )
}
```

### 5.3 Streaks Page

**File:** `/src/app/student/streaks/page.tsx`

```typescript
// Learning streak calendar page
export default async function StreaksPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  // Fetch learning sessions
  const sessions = await getLearningSessions(session.user.id)
  const currentStreak = calculateStreak(sessions)
  const longestStreak = getLongestStreak(sessions)

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1>Learning Streaks</h1>
        <StreakBadge streak={currentStreak} />
        <p>Longest streak: {longestStreak} days</p>
        <LearningStreakCalendar sessions={sessions} />
      </div>
    </AuthenticatedLayout>
  )
}
```

### 5.4 Faculty Analytics Page

**File:** `/src/app/faculty/courses/[id]/analytics/page.tsx`

```typescript
// Course analytics for faculty
export default async function CourseAnalyticsPage({ params }) {
  const { id } = await params
  const session = await auth()

  if (!hasFacultyAccess(session)) {
    redirect('/auth/login')
  }

  // Check if user can view this course
  const canEdit = await canEditCourseWithRetry(session.user.id, id)
  if (!canEdit) {
    return <div>You don't have permission to view this course</div>
  }

  // Fetch analytics data
  const analytics = await getCourseAnalytics(id)

  return (
    <FacultyLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1>{analytics.courseTitle} - Analytics</h1>
        <FacultyCourseAnalytics data={analytics} />
      </div>
    </FacultyLayout>
  )
}
```

---

## 📋 Phase 6: Integration & Testing (2 hours)

### 6.1 Update Student Dashboard

Update enrolled course cards to show progress:
- Add progress bar to each course card
- Show "X% complete"
- Show time spent
- "Continue Learning" button

### 6.2 Update Faculty Dashboard

Add analytics link to course cards:
- "View Analytics" button
- Show enrollment count with link
- Show completion rate preview

### 6.3 Update Course Viewer

Integrate progress tracking:
- Module list shows completion status
- Progress indicator in sidebar
- "Mark Complete" button in module viewer
- Auto-tracking on page load

### 6.4 Testing Checklist

- [ ] Module tracking starts when page loads
- [ ] Heartbeat updates every 5 minutes
- [ ] "Mark Complete" changes status to completed
- [ ] Progress percentage calculates correctly
- [ ] Learning session records daily activity
- [ ] Streak calculation works (consecutive days)
- [ ] Faculty analytics shows correct data
- [ ] Progress visualization displays correctly
- [ ] Time spent tracking is accurate
- [ ] Navigation between progress pages works

---

## 🚀 Implementation Order

**Day 1 (4-5 hours):**
1. Database schema + migration
2. API endpoints (module progress)
3. Client-side tracking hook
4. Basic components (MarkCompleteButton, ProgressBar)

**Day 2 (4-5 hours):**
1. API endpoints (streaks, analytics)
2. Statistics components
3. Streak calendar component
4. Progress pages

**Day 3 (3-4 hours):**
1. Faculty analytics components
2. Integration with existing pages
3. Testing & bug fixes
4. UI polish

---

## 📦 Dependencies to Install

```bash
npm install react-calendar-heatmap
npm install recharts  # For charts
npm install date-fns  # For date calculations
```

---

## 🎯 Success Criteria

- ✅ Learners can view their progress for each course
- ✅ Module completion tracked (both automatic and manual)
- ✅ Time spent tracked accurately
- ✅ Learning streaks calculated correctly
- ✅ Progress visualized with bars and percentages
- ✅ Faculty can see course analytics
- ✅ System works for students, faculty, and admin learners

---

## 📝 Notes

**Performance Considerations:**
- Heartbeat API calls should be throttled (max once per 5 minutes)
- Cache progress data in client to avoid excessive API calls
- Use database indexes for fast progress queries
- Aggregate analytics data (don't calculate on-the-fly for large courses)

**Privacy Considerations:**
- Learners can only view their own progress
- Faculty can only view aggregate stats (not individual learner data by default)
- Admin can view all progress data

**Future Enhancements (not in Week 4):**
- Certificates for 100% completion
- Leaderboards (optional, gamification)
- Progress notifications
- Estimated time to complete
- Recommended modules based on progress

---

**Ready to start?** Begin with Phase 1 (Database Schema)!
