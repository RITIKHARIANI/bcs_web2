# Gamified Learning Quest Map - Implementation Plan

**Project**: BCS E-Textbook Platform Quest Map Feature
**Date**: November 20, 2025
**Author**: Implementation Planning Agent
**Status**: Proposal for Review

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Feature Overview](#feature-overview)
3. [Current System Analysis](#current-system-analysis)
4. [Architecture Design](#architecture-design)
5. [Database Schema Changes](#database-schema-changes)
6. [API Implementation](#api-implementation)
7. [Frontend Components](#frontend-components)
8. [Implementation Phases](#implementation-phases)
9. [Technical Considerations](#technical-considerations)
10. [Risk Assessment](#risk-assessment)

---

## Executive Summary

This document outlines the implementation plan for a **Gamified Learning Quest Map** feature inspired by LeetCode Study Plans and video game skill trees. The feature transforms the traditional linear course structure into an interactive, visual learning journey with two distinct modes:

### Dual-Mode Design
1. **Public Mode** (Non-authenticated users)
   - View complete course structure as an interactive roadmap
   - See all modules and their prerequisite connections
   - Click any node to navigate to that module (may prompt login)
   - Purpose: Course discovery, marketing, syllabus preview

2. **Authenticated Mode** (Logged-in users)
   - Personalized progress visualization
   - Quest states: `locked`, `available`, `active`, `completed`
   - Prerequisites enforce unlocking logic
   - Gamification: XP, achievements, progress tracking
   - Purpose: Guided learning journey with motivation

### Key Benefits
- **Engagement**: Visual progression increases motivation
- **Clarity**: Clear learning path with prerequisites
- **Discovery**: Public users can explore course structure before enrolling
- **Retention**: Gamification elements encourage completion
- **Marketing**: Beautiful visual representation of course content

---

## Feature Overview

### User Stories

#### As a **Public User** (Not logged in):
1. I can view the quest map to understand the course structure
2. I can see how modules connect and build upon each other
3. I can click any module node to learn more about it
4. I am encouraged to sign up to track my progress

#### As a **Logged-In User** (Enrolled in course):
1. I can see my personalized progress on the quest map
2. I can identify which modules are unlocked and ready to start
3. I can see which modules are locked and what prerequisites I need
4. I can click unlocked modules to start learning
5. I can review completed modules to reinforce learning
6. I earn XP and achievements as I complete quests
7. I can track my overall course completion visually

#### As a **Faculty Member**:
1. I can design quest maps by setting module prerequisites
2. I can assign XP values and difficulty levels to modules
3. I can create branching learning paths
4. I can view student progress on the quest map
5. I can identify bottleneck modules where students struggle

### Visual Reference
Based on the provided LeetCode-style reference implementation, with adaptations for dual-mode operation.

---

## Current System Analysis

### Strengths
✅ **Database Foundation**
- `courses` and `modules` tables with relationships
- `course_modules` junction table for course-specific module ordering
- `course_tracking` for enrollment
- `module_progress` for completion tracking
- Hierarchical module structure with `parent_module_id`

✅ **Existing Infrastructure**
- React Flow visualization system (network visualization)
- Progress tracking UI components
- Course enrollment system
- Analytics endpoints

✅ **User Flow**
- Course browsing → Enrollment → Learning dashboard → Course viewer
- Module navigation with hierarchical tree view

### Critical Gaps

❌ **Missing API Endpoints**
- `/api/progress/course/[id]` - GET user progress (referenced but not implemented)
- `/api/progress/module/complete` - POST mark complete (referenced but not implemented)

❌ **No Prerequisite System**
- Database has no `prerequisite_module_ids` field
- No dependency validation logic
- No unlocking mechanism

❌ **No Gamification Data**
- No XP/points system
- No achievement tracking
- No difficulty levels
- No estimated completion times

❌ **Limited Progress States**
- Only binary: `not_started` | `completed`
- No `in_progress` or `available` states

---

## Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  Public Quest Map              │  Authenticated Quest Map       │
│  - All nodes visible           │  - Personalized progress       │
│  - Neutral color scheme        │  - Lock/unlock states          │
│  - Click → Module page         │  - Gamification overlay        │
│  - Marketing/Discovery         │  - XP, achievements            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Public API                    │  Authenticated API             │
│  /api/courses/[slug]/map       │  /api/courses/[slug]/quest-map │
│  - Course modules + tree       │  - Modules + user progress     │
│  - Prerequisite connections    │  - Unlock states               │
│  - No auth required            │  - Achievement data            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Quest Map Service                                              │
│  - Build module tree with prerequisites                         │
│  - Calculate unlock states based on completion                  │
│  - Generate SVG path coordinates                                │
│  - Compute XP and achievement progress                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────┤
│  Core Tables           │  New Tables (Gamification)             │
│  - courses             │  - quest_map_layouts                   │
│  - modules             │  - achievements                        │
│  - course_modules      │  - user_achievements                   │
│  - course_tracking     │                                        │
│  - module_progress     │                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagrams

#### **Public User Flow**
```
User visits /courses/intro-ml/map (not logged in)
  ↓
Next.js Server Component fetches course data
  ↓
GET /api/courses/intro-ml/map (public endpoint)
  ↓
Returns: {
  course: { id, title, description }
  modules: [{ id, title, position, prerequisites }]
  connections: [{ from, to }]
}
  ↓
QuestMapPublic component renders:
  - All nodes in neutral state (gray/blue)
  - All prerequisite lines visible
  - Click handler → navigate to /courses/intro-ml/[moduleSlug]
  - "Sign in to track progress" CTA
```

#### **Authenticated User Flow**
```
User visits /courses/intro-ml/map (logged in, enrolled)
  ↓
Next.js Server Component fetches course + user data
  ↓
GET /api/courses/intro-ml/quest-map (requires auth)
  ↓
Returns: {
  course: { id, title, description }
  quests: [{
    id, title, description, xp, difficulty,
    position: { x, y },
    prerequisites: [id],
    status: 'locked' | 'available' | 'active' | 'completed',
    completedAt: timestamp | null
  }]
  userProgress: {
    totalXP, level, completionPct,
    achievements: [...]
  }
}
  ↓
QuestMapAuthenticated component renders:
  - Nodes colored by status (green=completed, blue=active, gray=locked)
  - Prerequisites colored (blue=path open, gray=path locked)
  - Pulsing animation on active quests
  - Click handler → open quest drawer or navigate
  - Progress HUD at top
```

#### **Quest Completion Flow**
```
User clicks "Mark Complete" on module
  ↓
POST /api/progress/module/complete
  Body: { moduleId, courseId }
  ↓
Server:
  1. Validate user enrolled
  2. Update module_progress (completed_at = now)
  3. Calculate new unlock states
  4. Check achievement triggers
  5. Award XP
  6. Update course_tracking.completion_pct
  ↓
Response: {
  success: true,
  newlyUnlockedModules: [ids],
  xpAwarded: 150,
  newAchievements: [{ id, title, icon }],
  nextRecommendedModule: id
}
  ↓
Client updates:
  - Quest node changes from active → completed
  - Dependent nodes unlock (locked → available)
  - Show XP gain animation
  - Show achievement toast
  - Update progress HUD
```

---

## Database Schema Changes

### Phase 1: Core Prerequisites

#### Add Prerequisites to Modules
```prisma
model modules {
  // ... existing fields ...

  // NEW: Prerequisites
  prerequisite_module_ids String[]  @default([])  // Array of module IDs that must be completed first

  // NEW: Quest Map Positioning
  quest_map_position_x    Float?   @default(50)  // Percentage (0-100) for horizontal position
  quest_map_position_y    Float?   @default(50)  // Percentage (0-100) for vertical position

  // NEW: Gamification
  xp_reward              Int      @default(100)  // XP earned on completion
  difficulty_level       String   @default("beginner")  // beginner, intermediate, advanced, boss
  estimated_minutes      Int?                     // Estimated time to complete

  // NEW: Quest Type
  quest_type             String   @default("standard")  // standard, challenge, boss, bonus
}
```

**Migration**:
```sql
-- Add new columns
ALTER TABLE modules
ADD COLUMN prerequisite_module_ids TEXT[] DEFAULT '{}',
ADD COLUMN quest_map_position_x FLOAT DEFAULT 50,
ADD COLUMN quest_map_position_y FLOAT DEFAULT 50,
ADD COLUMN xp_reward INTEGER DEFAULT 100,
ADD COLUMN difficulty_level TEXT DEFAULT 'beginner',
ADD COLUMN estimated_minutes INTEGER,
ADD COLUMN quest_type TEXT DEFAULT 'standard';

-- Create index for prerequisite lookups
CREATE INDEX idx_modules_prerequisites ON modules USING GIN (prerequisite_module_ids);
```

### Phase 2: Progress Enhancement

#### Enhance module_progress
```prisma
model module_progress {
  // ... existing fields ...

  // UPDATE: More granular status
  status         String    @default("not_started")  // not_started, available, in_progress, completed

  // NEW: Progress tracking
  started_at     DateTime?
  time_spent_minutes Int  @default(0)
  xp_earned      Int      @default(0)
  attempts       Int      @default(0)  // For challenge modules
}
```

**Migration**:
```sql
-- Update status enum (if using enum, or keep as text)
ALTER TABLE module_progress
ADD COLUMN started_at TIMESTAMP,
ADD COLUMN time_spent_minutes INTEGER DEFAULT 0,
ADD COLUMN xp_earned INTEGER DEFAULT 0,
ADD COLUMN attempts INTEGER DEFAULT 0;

-- Update existing records: if completed_at is set, set status='completed'
UPDATE module_progress
SET status = 'completed'
WHERE completed_at IS NOT NULL;
```

### Phase 3: Gamification System

#### Achievements Table
```prisma
model achievements {
  id           String   @id @default(cuid())
  title        String
  description  String
  icon         String   // emoji or lucide icon name
  category     String   // completion, speed, consistency, mastery
  criteria     Json     // { type: 'complete_n_modules', count: 10 }
  xp_reward    Int      @default(0)
  badge_color  String   @default("gray")  // gray, bronze, silver, gold
  created_at   DateTime @default(now())

  // Relations
  user_achievements user_achievements[]

  @@index([category])
}

model user_achievements {
  id             String   @id @default(cuid())
  user_id        String
  achievement_id String
  earned_at      DateTime @default(now())
  progress       Int      @default(100)  // % progress if partially earned

  // Relations
  user        users        @relation(fields: [user_id], references: [id], onDelete: Cascade)
  achievement achievements @relation(fields: [achievement_id], references: [id], onDelete: Cascade)

  @@unique([user_id, achievement_id])
  @@index([user_id])
  @@index([earned_at])
}
```

#### User Gamification Stats
```prisma
model user_gamification_stats {
  id              String   @id @default(cuid())
  user_id         String   @unique
  total_xp        Int      @default(0)
  level           Int      @default(1)
  current_streak  Int      @default(0)  // days
  longest_streak  Int      @default(0)  // days
  last_active_date DateTime?
  total_time_minutes Int   @default(0)

  // Relations
  user users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([total_xp])
  @@index([level])
}
```

### Phase 4: Quest Map Layouts (Optional)

#### quest_map_layouts Table
```prisma
model quest_map_layouts {
  id         String   @id @default(cuid())
  course_id  String   @unique
  layout_data Json    // Store custom positioning, styling, themes
  version    Int      @default(1)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Relations
  course courses @relation(fields: [course_id], references: [id], onDelete: Cascade)
}
```

**Purpose**: Allow faculty to customize quest map appearance per course (positions, colors, themes).

---

## API Implementation

### 1. Public Quest Map Endpoint

**Route**: `/api/courses/[slug]/map` (GET)
**Auth**: None (public)
**Purpose**: Fetch course structure for preview

```typescript
// src/app/api/courses/[slug]/map/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const data = await withDatabaseRetry(async () => {
    // Fetch course with modules
    const course = await prisma.courses.findUnique({
      where: { slug, status: 'published' },
      include: {
        course_modules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                module_number: true,
                parent_module_id: true,
                sort_order: true,
                prerequisite_module_ids: true,
                quest_map_position_x: true,
                quest_map_position_y: true,
                xp_reward: true,
                difficulty_level: true,
                estimated_minutes: true,
                quest_type: true,
              }
            }
          },
          orderBy: { sort_order: 'asc' }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true
          }
        }
      }
    });

    if (!course) {
      return null;
    }

    // Transform to quest map format
    const modules = course.course_modules.map(cm => cm.module);

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        author: course.author,
        featured_image: course.featured_image
      },
      quests: modules.map(m => ({
        id: m.id,
        title: m.title,
        slug: m.slug,
        description: m.description || '',
        position: {
          x: m.quest_map_position_x || 50,
          y: m.quest_map_position_y || 50
        },
        prerequisites: m.prerequisite_module_ids || [],
        xp: m.xp_reward,
        difficulty: m.difficulty_level,
        estimatedMinutes: m.estimated_minutes,
        type: m.quest_type,
        // Public mode: all quests are "viewable"
        status: 'viewable' as const
      }))
    };
  });

  if (!data) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

### 2. Authenticated Quest Map Endpoint

**Route**: `/api/courses/[slug]/quest-map` (GET)
**Auth**: Required (session)
**Purpose**: Fetch course structure with user progress

```typescript
// src/app/api/courses/[slug]/quest-map/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const userId = session.user.id;

  const data = await withDatabaseRetry(async () => {
    // Fetch course with modules and user progress
    const course = await prisma.courses.findUnique({
      where: { slug, status: 'published' },
      include: {
        course_modules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                prerequisite_module_ids: true,
                quest_map_position_x: true,
                quest_map_position_y: true,
                xp_reward: true,
                difficulty_level: true,
                estimated_minutes: true,
                quest_type: true,
              }
            }
          },
          orderBy: { sort_order: 'asc' }
        }
      }
    });

    if (!course) {
      return null;
    }

    // Check enrollment
    const enrollment = await prisma.course_tracking.findUnique({
      where: {
        course_id_user_id: {
          course_id: course.id,
          user_id: userId
        }
      }
    });

    if (!enrollment) {
      return { error: 'Not enrolled in course', enrolled: false };
    }

    // Fetch user progress for all modules in course
    const moduleIds = course.course_modules.map(cm => cm.module.id);
    const progressRecords = await prisma.module_progress.findMany({
      where: {
        user_id: userId,
        course_id: course.id,
        module_id: { in: moduleIds }
      }
    });

    const progressMap = new Map(
      progressRecords.map(p => [p.module_id, p])
    );

    // Calculate unlock states
    const modules = course.course_modules.map(cm => cm.module);
    const questsWithStatus = modules.map(m => {
      const progress = progressMap.get(m.id);
      const status = calculateQuestStatus(m, progressMap);

      return {
        id: m.id,
        title: m.title,
        slug: m.slug,
        description: m.description || '',
        position: {
          x: m.quest_map_position_x || 50,
          y: m.quest_map_position_y || 50
        },
        prerequisites: m.prerequisite_module_ids || [],
        xp: m.xp_reward,
        difficulty: m.difficulty_level,
        estimatedMinutes: m.estimated_minutes,
        type: m.quest_type,
        status,
        completedAt: progress?.completed_at || null,
        startedAt: progress?.started_at || null,
        xpEarned: progress?.xp_earned || 0
      };
    });

    // Calculate user stats
    const totalXP = questsWithStatus.reduce((sum, q) => sum + (q.xpEarned || 0), 0);
    const completedCount = questsWithStatus.filter(q => q.status === 'completed').length;
    const completionPct = Math.round((completedCount / questsWithStatus.length) * 100);

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description
      },
      quests: questsWithStatus,
      userProgress: {
        totalXP,
        completedCount,
        totalCount: questsWithStatus.length,
        completionPct,
        // TODO: Add achievements, level, streak
      }
    };
  });

  if (!data) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  if ('error' in data && !data.enrolled) {
    return NextResponse.json(data, { status: 403 });
  }

  return NextResponse.json(data);
}

// Helper function to calculate quest status
function calculateQuestStatus(
  module: any,
  progressMap: Map<string, any>
): 'locked' | 'available' | 'active' | 'completed' {
  const progress = progressMap.get(module.id);

  // If completed
  if (progress?.status === 'completed') {
    return 'completed';
  }

  // Check prerequisites
  const prerequisites = module.prerequisite_module_ids || [];
  const allPrereqsCompleted = prerequisites.every(prereqId => {
    const prereqProgress = progressMap.get(prereqId);
    return prereqProgress?.status === 'completed';
  });

  if (!allPrereqsCompleted) {
    return 'locked';
  }

  // If started but not completed
  if (progress?.status === 'in_progress') {
    return 'active';
  }

  // If prerequisites met but not started
  return 'available';
}
```

### 3. Module Complete Endpoint (IMPLEMENT MISSING)

**Route**: `/api/progress/module/complete` (POST)
**Auth**: Required
**Purpose**: Mark module as complete, award XP, unlock dependents

```typescript
// src/app/api/progress/module/complete/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { moduleId, courseId } = body;

  if (!moduleId || !courseId) {
    return NextResponse.json(
      { error: 'moduleId and courseId required' },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  const result = await withDatabaseRetry(async () => {
    // Verify enrollment
    const enrollment = await prisma.course_tracking.findUnique({
      where: {
        course_id_user_id: { course_id: courseId, user_id: userId }
      }
    });

    if (!enrollment) {
      return { error: 'Not enrolled', status: 403 };
    }

    // Get module data
    const module = await prisma.modules.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        xp_reward: true,
        quest_type: true
      }
    });

    if (!module) {
      return { error: 'Module not found', status: 404 };
    }

    // Upsert progress record
    const progress = await prisma.module_progress.upsert({
      where: {
        user_id_module_id_course_id: {
          user_id: userId,
          module_id: moduleId,
          course_id: courseId
        }
      },
      update: {
        status: 'completed',
        completed_at: new Date(),
        xp_earned: module.xp_reward
      },
      create: {
        user_id: userId,
        module_id: moduleId,
        course_id: courseId,
        status: 'completed',
        completed_at: new Date(),
        started_at: new Date(),
        xp_earned: module.xp_reward
      }
    });

    // Update course tracking
    const allProgress = await prisma.module_progress.findMany({
      where: { user_id: userId, course_id: courseId }
    });
    const completedCount = allProgress.filter(p => p.status === 'completed').length;

    const courseModules = await prisma.course_modules.findMany({
      where: { course_id: courseId }
    });
    const totalModules = courseModules.length;
    const completionPct = Math.round((completedCount / totalModules) * 100);

    await prisma.course_tracking.update({
      where: {
        course_id_user_id: { course_id: courseId, user_id: userId }
      },
      data: {
        modules_completed: completedCount,
        completion_pct: completionPct,
        last_accessed: new Date()
      }
    });

    // Find newly unlocked modules
    const allModules = await prisma.course_modules.findMany({
      where: { course_id: courseId },
      include: { module: true }
    });

    const newlyUnlocked = allModules
      .map(cm => cm.module)
      .filter(m => {
        // Check if this module is now unlocked
        const prereqs = m.prerequisite_module_ids || [];
        if (prereqs.length === 0) return false; // No prereqs = already unlocked
        if (!prereqs.includes(moduleId)) return false; // This module not a dependency

        // Check if ALL prereqs are now completed
        const allPrereqsComplete = prereqs.every(prereqId => {
          return allProgress.some(
            p => p.module_id === prereqId && p.status === 'completed'
          );
        });

        return allPrereqsComplete;
      })
      .map(m => ({ id: m.id, title: m.title }));

    // TODO: Check achievement triggers
    // TODO: Update user_gamification_stats

    return {
      success: true,
      xpAwarded: module.xp_reward,
      newlyUnlockedModules: newlyUnlocked,
      completionPct,
      modulesCompleted: completedCount,
      totalModules
    };
  });

  if ('error' in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(result);
}
```

### 4. Course Progress Endpoint (IMPLEMENT MISSING)

**Route**: `/api/progress/course/[id]` (GET)
**Auth**: Required
**Purpose**: Get user's progress for a specific course

```typescript
// src/app/api/progress/course/[id]/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { withDatabaseRetry } from '@/lib/retry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: courseId } = await params;
  const userId = session.user.id;

  const data = await withDatabaseRetry(async () => {
    const progress = await prisma.module_progress.findMany({
      where: {
        user_id: userId,
        course_id: courseId
      },
      select: {
        module_id: true,
        status: true,
        completed_at: true,
        started_at: true,
        xp_earned: true
      }
    });

    const progressMap: Record<string, any> = {};
    progress.forEach(p => {
      progressMap[p.module_id] = {
        status: p.status,
        completedAt: p.completed_at,
        startedAt: p.started_at,
        xpEarned: p.xp_earned
      };
    });

    return { progress: progressMap };
  });

  return NextResponse.json(data);
}
```

---

## Frontend Components

### Component Hierarchy

```
/courses/[slug]/map
  ├── QuestMapPage (Server Component)
  │   └── Checks authentication
  │       ├── Not logged in → QuestMapPublic
  │       └── Logged in → QuestMapAuthenticated
  │
  ├── QuestMapPublic (Client Component)
  │   ├── QuestMapCanvas
  │   │   ├── SVGConnectionLayer
  │   │   └── QuestNodePublic[]
  │   └── PublicCallToAction
  │
  └── QuestMapAuthenticated (Client Component)
      ├── QuestMapHUD (Progress header)
      ├── QuestMapCanvas
      │   ├── SVGConnectionLayer
      │   └── QuestNodeAuthenticated[]
      └── QuestDetailDrawer
```

### 1. Page Route

**File**: `/src/app/courses/[slug]/map/page.tsx`

```typescript
import { Metadata } from 'next';
import { auth } from '@/lib/auth/config';
import { QuestMapPublic } from '@/components/quest-map/QuestMapPublic';
import { QuestMapAuthenticated } from '@/components/quest-map/QuestMapAuthenticated';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Fetch course title for metadata
  return {
    title: `Quest Map - ${slug}`,
    description: 'Interactive learning journey visualization'
  };
}

export default async function QuestMapPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;

  // Determine which component to render
  if (session?.user) {
    return <QuestMapAuthenticated courseSlug={slug} userId={session.user.id} />;
  }

  return <QuestMapPublic courseSlug={slug} />;
}
```

### 2. Public Quest Map Component

**File**: `/src/components/quest-map/QuestMapPublic.tsx`

```typescript
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Map as MapIcon, LogIn, Eye } from 'lucide-react';
import Link from 'next/link';
import { NeuralButton } from '@/components/ui/neural-button';

interface Quest {
  id: string;
  title: string;
  slug: string;
  description: string;
  position: { x: number; y: number };
  prerequisites: string[];
  xp: number;
  difficulty: string;
  estimatedMinutes: number | null;
  type: string;
  status: 'viewable';
}

interface QuestMapData {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    author: { name: string; email: string };
  };
  quests: Quest[];
}

interface QuestMapPublicProps {
  courseSlug: string;
}

export function QuestMapPublic({ courseSlug }: QuestMapPublicProps) {
  const [data, setData] = useState<QuestMapData | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch public quest map data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/courses/${courseSlug}/map`);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching quest map:', error);
      }
    }
    fetchData();
  }, [courseSlug]);

  // Update map dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setMapDimensions({
          width: containerRef.current.scrollWidth,
          height: containerRef.current.scrollHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [data]);

  // Calculate SVG paths for connections
  const connectionPaths = useMemo(() => {
    if (!data || mapDimensions.width === 0) return null;

    return data.quests.flatMap(quest =>
      quest.prerequisites.map(prereqId => {
        const prereq = data.quests.find(q => q.id === prereqId);
        if (!prereq) return null;

        const startX = (prereq.position.x / 100) * mapDimensions.width;
        const startY = (prereq.position.y / 100) * mapDimensions.height;
        const endX = (quest.position.x / 100) * mapDimensions.width;
        const endY = (quest.position.y / 100) * mapDimensions.height;

        const controlY1 = startY + (endY - startY) / 2;
        const controlY2 = startY + (endY - startY) / 2;

        return (
          <path
            key={`${prereq.id}-${quest.id}`}
            d={`M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`}
            fill="none"
            stroke="#64748b"
            strokeWidth="3"
            opacity="0.6"
          />
        );
      })
    );
  }, [data, mapDimensions]);

  const handleNodeClick = (quest: Quest) => {
    router.push(`/courses/${courseSlug}/${quest.slug}`);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        Loading quest map...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Public Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MapIcon size={24} className="text-blue-400" />
          <div>
            <h1 className="text-lg font-bold">{data.course.title}</h1>
            <p className="text-xs text-slate-400">Course Quest Map</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/courses/${courseSlug}`}>
            <NeuralButton variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Course
            </NeuralButton>
          </Link>
          <Link href="/auth/login">
            <NeuralButton variant="neural" size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Track Progress
            </NeuralButton>
          </Link>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1 overflow-auto" ref={containerRef}>
        <div className="relative w-full min-h-[800px] max-w-4xl mx-auto py-20">
          {/* SVG Connections */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {connectionPaths}
          </svg>

          {/* Quest Nodes */}
          {data.quests.map(quest => (
            <button
              key={quest.id}
              onClick={() => handleNodeClick(quest)}
              className="
                absolute w-16 h-16 -ml-8 -mt-8 rounded-full
                bg-slate-700 border-4 border-slate-600
                text-slate-300
                flex items-center justify-center
                transition-all duration-300 hover:scale-110
                hover:bg-slate-600 hover:border-slate-500
                focus:outline-none focus:ring-4 focus:ring-blue-500
                cursor-pointer
              "
              style={{
                left: `${quest.position.x}%`,
                top: `${quest.position.y}%`
              }}
            >
              <Eye size={20} />

              {/* Tooltip */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 border border-slate-700 text-slate-300">
                  {quest.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-6 bg-slate-900 border-t border-slate-800 text-center">
        <p className="text-slate-300 mb-3">
          Sign in to track your progress, earn XP, and unlock achievements!
        </p>
        <Link href="/auth/login">
          <NeuralButton variant="neural">
            Get Started
          </NeuralButton>
        </Link>
      </div>
    </div>
  );
}
```

### 3. Authenticated Quest Map Component

**File**: `/src/components/quest-map/QuestMapAuthenticated.tsx`

This would be similar to the reference code provided, but with these key differences:
- Fetch from `/api/courses/[slug]/quest-map` (authenticated endpoint)
- Display personalized quest states (locked, available, active, completed)
- Show XP, achievements, progress HUD
- Handle quest completion
- Color-code prerequisite paths based on unlock states

*[Full implementation would be ~500 lines, can provide if needed]*

### 4. Supporting Components

**Files to create**:
- `/src/components/quest-map/QuestMapHUD.tsx` - Progress header
- `/src/components/quest-map/QuestNode.tsx` - Individual quest node
- `/src/components/quest-map/QuestDetailDrawer.tsx` - Slide-over panel
- `/src/components/quest-map/SVGConnectionLayer.tsx` - Prerequisite paths
- `/src/components/quest-map/AchievementToast.tsx` - XP/achievement notifications

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Database schema + missing APIs

**Tasks**:
1. ✅ Create database migration for prerequisites and quest map fields
2. ✅ Implement `/api/progress/module/complete` endpoint
3. ✅ Implement `/api/progress/course/[id]` endpoint
4. ✅ Implement `/api/courses/[slug]/map` (public endpoint)
5. ✅ Implement `/api/courses/[slug]/quest-map` (authenticated endpoint)
6. ✅ Test prerequisite unlocking logic
7. ✅ Test XP awarding

**Deliverables**:
- Working prerequisite system
- Module completion tracking with XP
- Public and authenticated quest map data endpoints

**Acceptance Criteria**:
- Faculty can set prerequisites on modules
- Completing a module unlocks dependent modules
- API endpoints return proper quest map data for both modes

---

### Phase 2: Public Quest Map (Week 2)
**Goal**: Non-authenticated preview visualization

**Tasks**:
1. ✅ Create `/courses/[slug]/map` route
2. ✅ Build `QuestMapPublic` component
3. ✅ Implement SVG connection rendering
4. ✅ Add node positioning and click navigation
5. ✅ Design "Sign in to track progress" CTA
6. ✅ Add responsive design for mobile/tablet
7. ✅ Test across different course structures

**Deliverables**:
- Beautiful, interactive public quest map
- All modules visible with connections
- Click navigation to module pages
- Call-to-action for enrollment

**Acceptance Criteria**:
- Public users can view entire course structure
- Quest map is visually appealing and professional
- Navigation works smoothly
- Mobile responsive

---

### Phase 3: Authenticated Quest Map (Week 3)
**Goal**: Personalized progress visualization

**Tasks**:
1. ✅ Build `QuestMapAuthenticated` component
2. ✅ Implement quest status calculation (locked/available/active/completed)
3. ✅ Add color-coded nodes and paths
4. ✅ Build progress HUD header
5. ✅ Add animations (pulse for active, glow for completed)
6. ✅ Implement quest detail drawer
7. ✅ Add "Start Quest" / "Continue" / "Review" buttons
8. ✅ Test unlock logic visually

**Deliverables**:
- Fully functional authenticated quest map
- Visual progress tracking
- Interactive quest drawer
- Smooth animations and transitions

**Acceptance Criteria**:
- Locked quests are grayed out with lock icon
- Available quests are highlighted
- Completed quests show checkmark and green glow
- Clicking quest opens detailed drawer
- Progress HUD shows completion percentage

---

### Phase 4: Gamification (Week 4)
**Goal**: XP, achievements, rewards

**Tasks**:
1. ✅ Implement achievement system (database tables)
2. ✅ Create achievement definitions (JSON config)
3. ✅ Build achievement checking logic
4. ✅ Add XP gain animations
5. ✅ Design achievement unlock toasts
6. ✅ Add user gamification stats endpoint
7. ✅ Create achievements page (`/profile/achievements`)
8. ✅ Add level-up logic

**Deliverables**:
- Working achievement system
- XP notifications on completion
- Achievement badges and progress
- User profile showing stats

**Acceptance Criteria**:
- Users earn XP on module completion
- Achievements unlock automatically
- Toast notifications appear for rewards
- Profile page displays achievements

---

### Phase 5: Faculty Tools (Week 5)
**Goal**: Quest map editor for faculty

**Tasks**:
1. ✅ Create quest map editor page (`/faculty/courses/[id]/quest-map/edit`)
2. ✅ Build drag-and-drop positioning UI
3. ✅ Add prerequisite editor
4. ✅ Add XP and difficulty assignment
5. ✅ Implement save/preview functionality
6. ✅ Add bulk positioning tools
7. ✅ Create quest map templates

**Deliverables**:
- Faculty can design custom quest maps
- Drag-and-drop node positioning
- Visual prerequisite editor
- Save and preview functionality

**Acceptance Criteria**:
- Faculty can position nodes visually
- Prerequisites can be set with UI
- Changes save to database
- Preview shows student view

---

### Phase 6: Polish & Launch (Week 6)
**Goal**: Production-ready quality

**Tasks**:
1. ✅ Comprehensive testing (unit, integration, e2e)
2. ✅ Performance optimization (lazy loading, memoization)
3. ✅ Accessibility audit (WCAG 2.1 AA)
4. ✅ Mobile testing on real devices
5. ✅ Documentation for faculty
6. ✅ User guide for students
7. ✅ Analytics integration
8. ✅ Soft launch with pilot course

**Deliverables**:
- Production-ready quest map feature
- Complete documentation
- Analytics tracking
- Performance benchmarks

**Acceptance Criteria**:
- All tests passing
- Page load < 2s on 3G
- Accessibility score > 90
- Zero critical bugs
- Positive user feedback from pilot

---

## Technical Considerations

### Performance Optimization

1. **SVG Rendering**
   - Use `useMemo` for path calculations
   - Debounce window resize events
   - Virtualize nodes for courses with >50 modules

2. **Data Fetching**
   - Server-side rendering for initial load
   - Client-side caching with SWR or React Query
   - Optimistic updates for completion

3. **State Management**
   - Use Zustand or Context for quest map state
   - Minimize re-renders with shallow comparisons

### Accessibility

1. **Keyboard Navigation**
   - Tab through quest nodes
   - Arrow keys for navigation
   - Enter/Space to open drawer

2. **Screen Readers**
   - ARIA labels for nodes and connections
   - Announce status changes
   - Describe prerequisites

3. **Visual Accessibility**
   - High contrast mode support
   - Color-blind friendly palette
   - Adjustable font sizes

### Mobile Considerations

1. **Touch Interactions**
   - Tap to select quest
   - Pinch to zoom
   - Pan to scroll map

2. **Responsive Layouts**
   - Stack HUD elements on mobile
   - Full-screen drawer on phones
   - Simplified node tooltips

3. **Performance**
   - Reduce animation complexity
   - Lazy load images
   - Optimize for slower connections

### Browser Compatibility

- Tested on: Chrome, Firefox, Safari, Edge
- Fallback for older browsers without SVG support
- Polyfills for missing features

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex prerequisite chains cause performance issues | High | Medium | Implement cycle detection, limit depth to 5 levels |
| SVG rendering breaks on large courses | High | Medium | Add virtualization, limit visible nodes to viewport |
| Database migration causes downtime | High | Low | Test on staging, use zero-downtime migrations |
| Progress tracking race conditions | Medium | Medium | Use database transactions, optimistic locking |

### UX Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users confused by prerequisite system | Medium | High | Add onboarding tooltips, clear messaging |
| Quest map feels gimmicky | High | Medium | A/B test with traditional view, gather feedback |
| Mobile experience feels cramped | Medium | Medium | Prioritize mobile design, test on real devices |
| Faculty struggle with quest map editor | Medium | Medium | Provide templates, video tutorials |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Feature adoption is low | High | Low | Soft launch with pilot courses, iterate based on feedback |
| Increases course completion time | Medium | Low | Make prerequisites optional, provide linear path alternative |
| Faculty resist changing course structure | Medium | Medium | Make quest map optional, support traditional view |

---

## Success Metrics

### Quantitative Metrics
- **Engagement**: Time spent on quest map page
- **Completion**: Course completion rate improvement
- **Retention**: Student return rate after 7 days
- **Enrollment**: Increase in enrollments from public quest map
- **Performance**: Page load time < 2s

### Qualitative Metrics
- Student satisfaction surveys
- Faculty adoption rate
- Support ticket volume
- User feedback sentiment

---

## Open Questions

1. **XP System**: What is the XP to level conversion formula?
2. **Achievements**: What achievement categories do we want?
3. **Branching Paths**: Do we allow multiple paths to the same goal?
4. **Prerequisites**: Should we support "OR" logic (complete A OR B)?
5. **Visual Themes**: Custom themes per course or platform-wide?
6. **Leaderboards**: Do we want competitive elements?
7. **Time Estimates**: How accurate are estimated completion times?
8. **Boss Quests**: Special mechanics for boss/final modules?

---

## Next Steps

1. **Review this document** with stakeholders
2. **Answer open questions** in team meeting
3. **Prioritize phases** based on resources
4. **Create detailed tickets** for Phase 1 tasks
5. **Set up project tracking** (Jira, Linear, etc.)
6. **Begin implementation** with Phase 1

---

## Appendix: Example Quest Map Data

### Example 1: Linear Path
```json
{
  "quests": [
    { "id": "1", "title": "Intro", "position": { "x": 50, "y": 10 }, "prerequisites": [] },
    { "id": "2", "title": "Basics", "position": { "x": 50, "y": 30 }, "prerequisites": ["1"] },
    { "id": "3", "title": "Advanced", "position": { "x": 50, "y": 50 }, "prerequisites": ["2"] },
    { "id": "4", "title": "Final", "position": { "x": 50, "y": 70 }, "prerequisites": ["3"] }
  ]
}
```

### Example 2: Branching Path
```json
{
  "quests": [
    { "id": "1", "title": "Foundation", "position": { "x": 50, "y": 10 }, "prerequisites": [] },
    { "id": "2", "title": "Path A", "position": { "x": 30, "y": 40 }, "prerequisites": ["1"] },
    { "id": "3", "title": "Path B", "position": { "x": 70, "y": 40 }, "prerequisites": ["1"] },
    { "id": "4", "title": "Convergence", "position": { "x": 50, "y": 70 }, "prerequisites": ["2", "3"] }
  ]
}
```

---

## Conclusion

The Gamified Learning Quest Map feature represents a significant enhancement to the BCS E-Textbook Platform. By implementing dual-mode functionality (public preview and authenticated progress tracking), we provide value to both prospective students (discovery) and enrolled students (motivation and clarity). The phased implementation approach minimizes risk while delivering incremental value. With proper execution, this feature can dramatically improve engagement, completion rates, and overall learning outcomes.

**Estimated Timeline**: 6 weeks
**Team Size**: 1-2 developers + 1 designer
**Complexity**: High
**Business Impact**: High

---

*End of Implementation Plan*
