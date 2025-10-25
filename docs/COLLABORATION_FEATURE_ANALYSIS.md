# Faculty Collaboration Feature - Implementation Options Analysis

**Document Version:** 1.0
**Date:** January 2025
**Status:** Technical Specification & Recommendation

---

## Executive Summary

This document presents a comprehensive analysis of **5 implementation approaches** for enabling faculty collaboration on courses and modules in the BCS E-Textbook Platform. After thorough examination of the existing codebase architecture, I present detailed specifications for each option including database schemas, API designs, UI components, and trade-off analysis.

**Current State:** Single-author ownership model with no collaboration features
**Recommendation:** **Option 5 (Hybrid Approach)** - Role-based permissions + activity tracking
**Timeline:** 4-6 weeks implementation
**Complexity:** Medium (balanced for educational use)

---

## Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Option 1: Simple Co-Author Model](#option-1-simple-co-author-model)
3. [Option 2: Role-Based Collaboration](#option-2-role-based-collaboration)
4. [Option 3: Real-Time Collaborative Editing](#option-3-real-time-collaborative-editing)
5. [Option 4: Branching & Merge Model](#option-4-branching--merge-model)
6. [Option 5: Hybrid Approach (RECOMMENDED)](#option-5-hybrid-approach-recommended)
7. [Comparison Matrix](#comparison-matrix)
8. [Recommendation & Rationale](#recommendation--rationale)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Current System Analysis

### Architecture Overview

**Database Schema:**
- **courses table:** Single `author_id` field (foreign key to users)
- **modules table:** Single `author_id` field (foreign key to users)
- **No collaboration tables:** No co-author, permissions, or sharing mechanisms
- **Access model:** Binary - you're either the author or you're not

**Authorization Pattern:**
```typescript
// Typical pattern throughout API routes (PUT /api/courses/[id]):
const course = await prisma.courses.findFirst({
  where: {
    id: courseId,
    author_id: session.user.id  // Ownership check
  }
})

if (!course) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

**UI Components:**
- `CreateCourseForm` (650 lines) - Course creation with module assembly
- `CreateModuleForm` (430 lines) - Module creation with rich text editor
- `EditModuleForm` (250+ lines) - Module editing with delete capability
- **All forms:** Author-only access, no sharing UI

**API Endpoints:**
```
POST   /api/courses          (Faculty only - creates with author_id)
PUT    /api/courses/[id]     (Author only - validates author_id match)
DELETE /api/courses/[id]     (Author only)

POST   /api/modules          (Faculty only)
PUT    /api/modules/[id]     (Author only)
DELETE /api/modules/[id]     (Author only - prevents delete if has children or in use)
```

### Current Workflow

**Course Creation:**
1. Faculty navigates to `/faculty/courses/create`
2. Fills form (title, slug, description, modules, tags, status)
3. Drag-and-drop to reorder selected modules
4. Submit → `POST /api/courses` with `author_id: session.user.id`
5. Redirect to `/faculty/courses`

**Module Editing:**
1. Faculty navigates to `/faculty/modules/edit/[id]`
2. Form loads via `GET /api/modules/[id]` (author check)
3. Edit content in Tiptap rich text editor
4. Submit → `PUT /api/modules/[id]` (validates author_id)
5. Activity tracked: `updated_at` timestamp only

### Integration Points Identified

**Database Layer:**
- Need to add collaborator junction tables
- Modify queries to check collaboration permissions

**API Layer:**
- 2 routes need authorization logic updates (`/courses/[id]`, `/modules/[id]`)
- 4 new endpoints needed (collaborator management)
- Permission checking helper functions required

**UI Layer:**
- Add collaborator management UI to edit pages
- Add activity feed component
- Add permission-aware button rendering
- Add presence indicators (optional)

### Strengths of Current System

✅ Clean, simple ownership model
✅ Transaction-based operations (data integrity)
✅ Comprehensive input validation (Zod schemas)
✅ Hierarchical module structure (parent/child)
✅ Role-based access control (faculty vs student)
✅ Database retry logic (serverless resilience)
✅ Rich text editing (Tiptap)

### Limitations

❌ No multi-author support
❌ No permission granularity
❌ No activity tracking (only updated_at timestamp)
❌ No content versioning
❌ No conflict detection for simultaneous edits
❌ No audit trail
❌ No sharing mechanisms

---

## Option 1: Simple Co-Author Model

**Concept:** Multiple faculty can be added as co-authors with equal editing rights. No role distinction - all collaborators have full edit access.

### Database Schema

```prisma
model course_collaborators {
  id              String   @id @default(cuid())
  course_id       String
  user_id         String
  added_by        String   // Who invited them
  added_at        DateTime @default(now())

  course          courses  @relation(fields: [course_id], references: [id], onDelete: Cascade)
  collaborator    users    @relation("CourseCollaborator", fields: [user_id], references: [id], onDelete: Cascade)
  inviter         users    @relation("CourseInviter", fields: [added_by], references: [id])

  @@unique([course_id, user_id])
  @@index([course_id])
  @@index([user_id])
}

model module_collaborators {
  id              String   @id @default(cuid())
  module_id       String
  user_id         String
  added_by        String
  added_at        DateTime @default(now())

  module          modules  @relation(fields: [module_id], references: [id], onDelete: Cascade)
  collaborator    users    @relation("ModuleCollaborator", fields: [user_id], references: [id], onDelete: Cascade)
  inviter         users    @relation("ModuleInviter", fields: [added_by], references: [id])

  @@unique([module_id, user_id])
  @@index([module_id])
  @@index([user_id])
}
```

### API Endpoints

**New Routes:**
```typescript
POST   /api/courses/[id]/collaborators
// Add collaborator (owner only)
// Body: { userId: string }
// Returns: Created collaborator object

GET    /api/courses/[id]/collaborators
// List all collaborators
// Returns: Array of users with metadata

DELETE /api/courses/[id]/collaborators/[userId]
// Remove collaborator (owner only)
// Returns: Success boolean

// Identical endpoints for modules:
POST   /api/modules/[id]/collaborators
GET    /api/modules/[id]/collaborators
DELETE /api/modules/[id]/collaborators/[userId]
```

**Modified Authorization Logic:**
```typescript
// In PUT /api/courses/[id]/route.ts
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  // OLD:
  // const course = await prisma.courses.findFirst({
  //   where: { id, author_id: session.user.id }
  // })

  // NEW:
  const course = await prisma.courses.findFirst({
    where: {
      id,
      OR: [
        { author_id: session.user.id },  // Original author
        {
          collaborators: {
            some: { user_id: session.user.id }  // Or collaborator
          }
        }
      ]
    }
  })

  if (!course) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // ... rest of update logic
}
```

### UI Components

**CollaboratorManager Component:**
```typescript
// components/collaboration/CollaboratorManager.tsx
interface CollaboratorManagerProps {
  entityType: 'course' | 'module'
  entityId: string
  isOwner: boolean  // Only owner can add/remove
}

export function CollaboratorManager({ entityType, entityId, isOwner }: CollaboratorManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaborators</CardTitle>
      </CardHeader>
      <CardContent>
        {/* List of current collaborators */}
        <CollaboratorList collaborators={collaborators} />

        {/* Add collaborator (owner only) */}
        {isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <FacultySearchInput onSelect={handleAddCollaborator} />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
```

**CollaboratorList Component:**
```typescript
function CollaboratorList({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <div className="space-y-2">
      {collaborators.map(collab => (
        <div key={collab.id} className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={collab.user.avatar_url} />
              <AvatarFallback>{collab.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{collab.user.name}</p>
              <p className="text-sm text-muted-foreground">{collab.user.email}</p>
            </div>
            {collab.user.id === ownerId && (
              <Badge variant="default">
                <Crown className="mr-1 h-3 w-3" />
                Owner
              </Badge>
            )}
          </div>

          {isOwner && collab.user.id !== ownerId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(collab.user.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
```

**Integration in Edit Forms:**
```typescript
// In edit-module-form.tsx, add sidebar panel:
<div className="col-span-3">
  <CollaboratorManager
    entityType="module"
    entityId={moduleId}
    isOwner={session.user.id === module.author_id}
  />
</div>
```

### Implementation Checklist

**Week 1:**
- [ ] Create Prisma migration for collaborator tables
- [ ] Run migration on dev database
- [ ] Create API routes for collaborator management
- [ ] Update authorization logic in existing routes

**Week 2:**
- [ ] Build CollaboratorManager component
- [ ] Build CollaboratorList component
- [ ] Build FacultySearchInput component
- [ ] Integrate into edit forms
- [ ] Test add/remove flow
- [ ] Update course/module list to show collaborator count

### Pros & Cons

**Advantages:**
✅ **Simplest to implement** - 2 weeks total
✅ **Easy to understand** - no complex roles
✅ **Works well for small teams** - 2-3 co-teachers
✅ **Minimal code changes** - focused updates
✅ **No role confusion** - everyone equal
✅ **Low maintenance** - simple logic

**Disadvantages:**
❌ **No permission granularity** - can't restrict publish/delete
❌ **No review workflow** - no approval process
❌ **Anyone can remove anyone** - potential conflicts
❌ **No edit history** - can't see who changed what
❌ **No conflict detection** - simultaneous edits can overwrite
❌ **Not scalable** - becomes chaotic with 5+ collaborators

**Best Use Cases:**
- Small teaching teams (2-3 faculty)
- Co-instructors with equal authority
- Simple course co-creation
- Low collaboration complexity
- Tight-knit departments

**Not Suitable For:**
- Large teams with hierarchies
- TA/professor workflows
- Review/approval processes
- Audit requirements
- High-stakes content

**Timeline:** 2 weeks

**Cost:** $0 (no external services)

---

## Option 2: Role-Based Collaboration

**Concept:** Differentiate collaborators by role with specific permissions. Supports delegation, review workflows, and hierarchical teams.

### Role Definitions

```typescript
type CollaboratorRole = 'owner' | 'editor' | 'reviewer' | 'viewer'

const ROLE_PERMISSIONS = {
  owner: {
    can_edit: true,
    can_publish: true,
    can_delete: true,
    can_invite: true,
    can_manage_collaborators: true,
    can_transfer_ownership: true,
    description: 'Full control over course/module'
  },
  editor: {
    can_edit: true,
    can_publish: false,          // Can save drafts, not publish
    can_delete: false,
    can_invite: false,
    can_manage_collaborators: false,
    description: 'Can edit content but not publish or delete'
  },
  reviewer: {
    can_edit: false,
    can_publish: false,
    can_delete: false,
    can_invite: false,
    can_comment: true,           // New feature
    can_suggest_changes: true,
    description: 'Can review and comment, but not edit'
  },
  viewer: {
    can_edit: false,
    can_publish: false,
    can_delete: false,
    can_invite: false,
    can_view_drafts: true,
    description: 'Read-only access to drafts'
  }
}
```

### Database Schema

```prisma
model course_collaborators {
  id              String   @id @default(cuid())
  course_id       String
  user_id         String
  role            String   // 'owner', 'editor', 'reviewer', 'viewer'

  // Permissions (cached for performance)
  can_edit        Boolean  @default(false)
  can_publish     Boolean  @default(false)
  can_delete      Boolean  @default(false)
  can_invite      Boolean  @default(false)

  // Metadata
  added_by        String
  added_at        DateTime @default(now())
  accepted_at     DateTime? // Null until invitation accepted

  course          courses  @relation(fields: [course_id], references: [id], onDelete: Cascade)
  collaborator    users    @relation("CourseCollaborator", fields: [user_id], references: [id], onDelete: Cascade)
  inviter         users    @relation("CourseInviter", fields: [added_by], references: [id])

  @@unique([course_id, user_id])
  @@index([course_id])
  @@index([user_id])
  @@index([role])
}

model module_collaborators {
  id              String   @id @default(cuid())
  module_id       String
  user_id         String
  role            String

  can_edit        Boolean  @default(false)
  can_publish     Boolean  @default(false)
  can_delete      Boolean  @default(false)
  can_invite      Boolean  @default(false)

  added_by        String
  added_at        DateTime @default(now())
  accepted_at     DateTime?

  module          modules  @relation(fields: [module_id], references: [id], onDelete: Cascade)
  collaborator    users    @relation("ModuleCollaborator", fields: [user_id], references: [id], onDelete: Cascade)
  inviter         users    @relation("ModuleInviter", fields: [added_by], references: [id])

  @@unique([module_id, user_id])
  @@index([module_id])
  @@index([user_id])
  @@index([role])
}
```

### Permission Checking System

**Helper Functions:**
```typescript
// lib/collaboration/permissions.ts

export async function checkPermission(
  userId: string,
  entityType: 'course' | 'module',
  entityId: string,
  permission: 'edit' | 'publish' | 'delete' | 'invite'
): Promise<boolean> {
  // Check if owner
  const table = entityType === 'course' ? 'courses' : 'modules'
  const entity = await prisma[table].findFirst({
    where: { id: entityId, author_id: userId }
  })

  if (entity) return true // Owner has all permissions

  // Check collaborator role
  const collabTable = `${entityType}_collaborators`
  const collaborator = await prisma[collabTable].findFirst({
    where: {
      [`${entityType}_id`]: entityId,
      user_id: userId,
      accepted_at: { not: null } // Must have accepted invitation
    }
  })

  if (!collaborator) return false

  return collaborator[`can_${permission}`]
}

export async function getUserRole(
  userId: string,
  entityType: 'course' | 'module',
  entityId: string
): Promise<CollaboratorRole | null> {
  // Check if owner
  const table = entityType === 'course' ? 'courses' : 'modules'
  const entity = await prisma[table].findFirst({
    where: { id: entityId, author_id: userId }
  })

  if (entity) return 'owner'

  // Check collaborator
  const collabTable = `${entityType}_collaborators`
  const collaborator = await prisma[collabTable].findFirst({
    where: {
      [`${entityType}_id`]: entityId,
      user_id: userId
    }
  })

  return collaborator?.role || null
}

export async function getPermissions(
  userId: string,
  entityType: 'course' | 'module',
  entityId: string
) {
  const role = await getUserRole(userId, entityType, entityId)
  if (!role) return null

  return ROLE_PERMISSIONS[role]
}
```

### API Endpoints

**New Routes:**
```typescript
POST   /api/courses/[id]/collaborators
// Body: { userId: string, role: 'editor' | 'reviewer' | 'viewer' }
// Requires: can_invite permission
// Returns: Created collaborator with role

PUT    /api/courses/[id]/collaborators/[userId]
// Body: { role: string }
// Requires: can_manage_collaborators permission (owner only)
// Returns: Updated collaborator

GET    /api/courses/[id]/permissions
// Query: ?userId=xxx (optional, defaults to session user)
// Returns: { role, permissions: {...} }

POST   /api/courses/[id]/transfer-ownership
// Body: { newOwnerId: string }
// Requires: owner role
// Returns: Success boolean
```

**Modified Authorization:**
```typescript
// PUT /api/courses/[id]/route.ts
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  const body = await request.json()

  // Check edit permission
  const canEdit = await checkPermission(session.user.id, 'course', id, 'edit')
  if (!canEdit) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // If changing status to published, check publish permission
  if (body.status === 'published') {
    const canPublish = await checkPermission(session.user.id, 'course', id, 'publish')
    if (!canPublish) {
      return NextResponse.json({ error: 'Cannot publish - insufficient permissions' }, { status: 403 })
    }
  }

  // ... rest of update logic
}

// DELETE /api/courses/[id]/route.ts
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  // Only owner can delete
  const canDelete = await checkPermission(session.user.id, 'course', id, 'delete')
  if (!canDelete) {
    return NextResponse.json({ error: 'Only owner can delete' }, { status: 403 })
  }

  // ... deletion logic
}
```

### UI Components

**RoleBadge Component:**
```typescript
// components/collaboration/RoleBadge.tsx
export function RoleBadge({ role }: { role: CollaboratorRole }) {
  const config = {
    owner: { icon: Crown, color: 'bg-yellow-100 text-yellow-800', label: 'Owner' },
    editor: { icon: Pencil, color: 'bg-blue-100 text-blue-800', label: 'Editor' },
    reviewer: { icon: Eye, color: 'bg-purple-100 text-purple-800', label: 'Reviewer' },
    viewer: { icon: BookOpen, color: 'bg-gray-100 text-gray-800', label: 'Viewer' }
  }

  const { icon: Icon, color, label } = config[role]

  return (
    <Badge className={color}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  )
}
```

**Enhanced CollaboratorManager:**
```typescript
// components/collaboration/CollaboratorManager.tsx
export function CollaboratorManager({
  entityType,
  entityId,
  currentUserRole,
  currentUserPermissions
}: CollaboratorManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaborators</CardTitle>
        <CardDescription>
          Manage who can access and edit this {entityType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current collaborators */}
          {collaborators.map(collab => (
            <div key={collab.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={collab.user.avatar_url} />
                  <AvatarFallback>{collab.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{collab.user.name}</p>
                  <p className="text-sm text-muted-foreground">{collab.user.email}</p>
                </div>
                <RoleBadge role={collab.role} />
                {!collab.accepted_at && (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Change role dropdown (if has permission) */}
                {currentUserPermissions.can_manage_collaborators && collab.role !== 'owner' && (
                  <Select value={collab.role} onValueChange={(role) => handleChangeRole(collab.user.id, role)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Remove button (if has permission) */}
                {currentUserPermissions.can_manage_collaborators && collab.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(collab.user.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Add collaborator button */}
          {currentUserPermissions.can_invite && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Collaborator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Collaborator</DialogTitle>
                  <DialogDescription>
                    Search for faculty members and assign a role
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <FacultySearchInput onSelect={setSelectedUser} />

                  {selectedUser && (
                    <>
                      <div>
                        <Label>Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">
                              <div>
                                <p className="font-medium">Editor</p>
                                <p className="text-sm text-muted-foreground">
                                  Can edit content but not publish
                                </p>
                              </div>
                            </SelectItem>
                            <SelectItem value="reviewer">
                              <div>
                                <p className="font-medium">Reviewer</p>
                                <p className="text-sm text-muted-foreground">
                                  Can review and comment
                                </p>
                              </div>
                            </SelectItem>
                            <SelectItem value="viewer">
                              <div>
                                <p className="font-medium">Viewer</p>
                                <p className="text-sm text-muted-foreground">
                                  Read-only access
                                </p>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handleAddCollaborator}>
                        Add Collaborator
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Permission matrix (collapsible) */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="mr-2 h-4 w-4" />
                View Permission Details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Edit</TableHead>
                    <TableHead>Publish</TableHead>
                    <TableHead>Delete</TableHead>
                    <TableHead>Invite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                    <TableRow key={role}>
                      <TableCell><RoleBadge role={role} /></TableCell>
                      <TableCell>{perms.can_edit ? '✓' : '✗'}</TableCell>
                      <TableCell>{perms.can_publish ? '✓' : '✗'}</TableCell>
                      <TableCell>{perms.can_delete ? '✓' : '✗'}</TableCell>
                      <TableCell>{perms.can_invite ? '✓' : '✗'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Permission-Aware Form Actions:**
```typescript
// In edit-module-form.tsx
export function EditModuleForm({ moduleId }: { moduleId: string }) {
  const { data: permissions } = useQuery({
    queryKey: ['permissions', 'module', moduleId],
    queryFn: () => fetch(`/api/modules/${moduleId}/permissions`).then(r => r.json())
  })

  return (
    <form>
      {/* ... form fields ... */}

      {/* Read-only mode for viewers/reviewers */}
      {!permissions?.can_edit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>View-Only Access</AlertTitle>
          <AlertDescription>
            You have {permissions?.role} access and cannot edit this module.
          </AlertDescription>
        </Alert>
      )}

      {/* Conditional action buttons */}
      <div className="flex gap-2">
        {permissions?.can_edit && (
          <Button type="submit">Save Changes</Button>
        )}

        {permissions?.can_publish && (
          <Button onClick={handlePublish}>Publish</Button>
        )}

        {permissions?.can_delete && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
```

### Pros & Cons

**Advantages:**
✅ **Granular permission control** - fine-grained access
✅ **Supports academic hierarchies** - professor + TAs
✅ **Clear responsibility separation** - who can do what
✅ **Review workflow enabled** - reviewer role
✅ **Invitation/acceptance flow** - explicit consent
✅ **Flexible** - can adjust roles as needed
✅ **Scales well** - works for large teams

**Disadvantages:**
❌ **More complex UX** - users must understand roles
❌ **Longer implementation** - 3 weeks vs 2 weeks
❌ **Potential confusion** - permission boundaries
❌ **Still no conflict resolution** - simultaneous edits
❌ **More maintenance** - role logic to maintain

**Best Use Cases:**
- Hierarchical teams (professor + TAs + guest lecturers)
- Review/approval workflows (dept head approval)
- Large departments with clear roles
- Need for audit trails (who can change what)
- Delegation workflows (assign tasks to editors)

**Timeline:** 3 weeks

**Cost:** $0 (no external services)

---

## Option 3: Real-Time Collaborative Editing

**Concept:** Multiple faculty can edit simultaneously with live cursor positions, real-time synchronization using Conflict-free Replicated Data Types (CRDTs).

### Technology Stack

**CRDT Library:** Yjs (most mature) or Automerge
**WebSocket Provider:** Pusher, Ably, or Supabase Realtime
**Rich Text Integration:** Tiptap + Y-Prosemirror
**Presence Tracking:** Yjs Awareness API

### Database Schema

```prisma
// Keep role-based collaborators from Option 2
model course_collaborators {
  // ... same as Option 2
}

// Add real-time session tracking
model collaboration_sessions {
  id              String   @id @default(cuid())
  entity_type     String   // 'course', 'module'
  entity_id       String
  user_id         String
  session_token   String   @unique

  // Presence data (synced via WebSocket)
  cursor_position Int?     // Character offset in document
  selection_start Int?
  selection_end   Int?
  is_active       Boolean  @default(true)
  last_heartbeat  DateTime @default(now())

  joined_at       DateTime @default(now())
  left_at         DateTime?

  user            users    @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([entity_type, entity_id, is_active])
  @@index([session_token])
  @@index([last_heartbeat])  // For cleanup of stale sessions
}

// Store CRDT updates for persistence and sync
model collaboration_updates {
  id              String   @id @default(cuid())
  entity_type     String
  entity_id       String
  user_id         String

  // Yjs update as binary data
  update_data     Bytes    // Yjs update vector
  clock_value     BigInt   // Yjs clock for ordering

  created_at      DateTime @default(now())

  user            users    @relation(fields: [user_id], references: [id])

  @@index([entity_type, entity_id, clock_value])
  @@index([created_at])  // For pruning old updates
}
```

### Implementation Architecture

**Yjs Provider Setup:**
```typescript
// lib/collaboration/yjs-provider.ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

export class CollaborationProvider {
  private ydoc: Y.Doc
  private wsProvider: WebsocketProvider
  private indexeddbProvider: IndexeddbPersistence

  constructor(
    entityType: string,
    entityId: string,
    userId: string,
    token: string
  ) {
    // Create Yjs document
    this.ydoc = new Y.Doc()

    // Local persistence (offline support)
    this.indexeddbProvider = new IndexeddbPersistence(
      `${entityType}:${entityId}`,
      this.ydoc
    )

    // WebSocket connection for real-time sync
    this.wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || 'wss://your-app.com/collaboration',
      `${entityType}:${entityId}`,
      this.ydoc,
      {
        params: { userId, token },
        connect: true,
        awareness: new awarenessProtocol.Awareness(this.ydoc)
      }
    )

    // Sync status handlers
    this.wsProvider.on('status', (event: { status: string }) => {
      console.log('WebSocket status:', event.status)
    })

    this.wsProvider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        console.log('Document synced with server')
      }
    })

    // Awareness (presence) handlers
    this.wsProvider.awareness.on('change', () => {
      const states = Array.from(this.wsProvider.awareness.getStates().values())
      console.log('Collaborators:', states)
    })
  }

  // Get shared content fragment for Tiptap
  getSharedContent(): Y.XmlFragment {
    return this.ydoc.getXmlFragment('content')
  }

  // Get shared metadata (title, description, etc.)
  getSharedMetadata(): Y.Map<any> {
    return this.ydoc.getMap('metadata')
  }

  // Get awareness for presence
  getAwareness() {
    return this.wsProvider.awareness
  }

  // Set user info for presence
  setLocalState(state: { name: string, color: string, cursor?: number }) {
    this.wsProvider.awareness.setLocalState(state)
  }

  // Cleanup
  destroy() {
    this.wsProvider.disconnect()
    this.wsProvider.destroy()
    this.indexeddbProvider.destroy()
    this.ydoc.destroy()
  }
}
```

**WebSocket Server (Separate Service):**
```typescript
// Can use y-websocket server, Hocuspocus, or custom implementation
// Example with Hocuspocus (production-ready):

import { Server } from '@hocuspocus/server'
import { Database } from '@hocuspocus/extension-database'

const server = Server.configure({
  port: 1234,

  extensions: [
    new Database({
      // Fetch document from database
      fetch: async ({ documentName }) => {
        const [entityType, entityId] = documentName.split(':')

        // Load all CRDT updates from database
        const updates = await prisma.collaboration_updates.findMany({
          where: { entity_type: entityType, entity_id: entityId },
          orderBy: { clock_value: 'asc' }
        })

        // Merge all updates into single state
        return Y.mergeUpdates(updates.map(u => u.update_data))
      },

      // Store updates to database
      store: async ({ documentName, state }) => {
        const [entityType, entityId] = documentName.split(':')

        await prisma.collaboration_updates.create({
          data: {
            entity_type: entityType,
            entity_id: entityId,
            user_id: userId,
            update_data: state,
            clock_value: Y.encodeStateVector(state).length
          }
        })
      }
    })
  ],

  // Authentication
  onAuthenticate: async ({ token }) => {
    // Verify JWT token
    const session = await verifyToken(token)
    if (!session) throw new Error('Unauthorized')

    return { userId: session.user.id }
  },

  // Authorization (per document)
  onConnect: async ({ documentName, context }) => {
    const [entityType, entityId] = documentName.split(':')
    const userId = context.userId

    // Check if user has edit permission
    const hasAccess = await checkPermission(userId, entityType, entityId, 'edit')
    if (!hasAccess) {
      throw new Error('Insufficient permissions')
    }
  }
})

server.listen()
```

### API Endpoints

**WebSocket Connection (not REST):**
```
WS /collaboration/:entityType/:entityId
// Params: token (JWT for authentication)
// Sends/receives: Yjs update messages in binary format
// Protocol: Yjs sync protocol (v1)
```

**REST Endpoints (for metadata):**
```typescript
POST   /api/collaboration/sessions
// Create new collaboration session
// Body: { entityType, entityId }
// Returns: { sessionToken, wsUrl }

DELETE /api/collaboration/sessions/[token]
// End session (heartbeat stopped)

GET    /api/collaboration/presence/:entityType/:entityId
// Get list of currently active collaborators
// Returns: [{ userId, name, color, cursorPosition, ... }]

GET    /api/collaboration/history/:entityType/:entityId
// Get document history (CRDT updates log)
// Returns: Array of update events with timestamps
```

### UI Components

**CollaborativeEditor Component:**
```typescript
// components/collaboration/CollaborativeEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { CollaborationProvider } from '@/lib/collaboration/yjs-provider'

export function CollaborativeEditor({
  entityType,
  entityId,
  userId,
  userName,
  userColor
}: CollaborativeEditorProps) {
  const [provider, setProvider] = useState<CollaborationProvider | null>(null)
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // Initialize collaboration provider
  useEffect(() => {
    const token = await getAuthToken()
    const collab = new CollaborationProvider(entityType, entityId, userId, token)

    collab.wsProvider.on('status', (e: { status: string }) => {
      setStatus(e.status === 'connected' ? 'connected' : 'connecting')
    })

    setProvider(collab)

    return () => collab.destroy()
  }, [entityType, entityId, userId])

  // Initialize Tiptap editor with collaboration extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false  // Disable local history, use Yjs
      }),
      Collaboration.configure({
        document: provider?.ydoc
      }),
      CollaborationCursor.configure({
        provider: provider?.wsProvider,
        user: {
          name: userName,
          color: userColor
        }
      })
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none'
      }
    }
  })

  return (
    <div className="border rounded-lg">
      {/* Header with status and presence */}
      <div className="border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <span className="text-sm text-muted-foreground">
            {status === 'connected' ? 'Synced' : 'Connecting...'}
          </span>
        </div>

        <PresenceAvatars provider={provider} />
      </div>

      {/* Editor content */}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
```

**PresenceAvatars Component:**
```typescript
// Shows who's currently editing
function PresenceAvatars({ provider }: { provider: CollaborationProvider | null }) {
  const [users, setUsers] = useState<AwarenessUser[]>([])

  useEffect(() => {
    if (!provider) return

    const awareness = provider.getAwareness()

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().values())
      setUsers(states.filter(s => s.user))
    }

    awareness.on('change', updateUsers)
    updateUsers()

    return () => awareness.off('change', updateUsers)
  }, [provider])

  return (
    <div className="flex -space-x-2">
      {users.map((user, i) => (
        <Tooltip key={i}>
          <TooltipTrigger>
            <Avatar
              className="border-2 border-background"
              style={{ borderColor: user.color }}
            >
              <AvatarFallback style={{ backgroundColor: user.color }}>
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span>{user.name}</span>
              {user.cursor && <span className="text-muted-foreground">is editing</span>}
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
```

**Collaboration Cursor Display:**
```typescript
// Tiptap extension shows cursors of other users inline
// Example CSS:
.collaboration-cursor__caret {
  border-left: 2px solid var(--cursor-color);
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

.collaboration-cursor__label {
  background-color: var(--cursor-color);
  border-radius: 3px 3px 3px 0;
  color: white;
  font-size: 12px;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 2px 6px;
  position: absolute;
  top: -1.4em;
  user-select: none;
  white-space: nowrap;
}
```

### Infrastructure Requirements

**WebSocket Server:**
- Dedicated WebSocket server (Hocuspocus recommended)
- Can run on same Vercel deployment (serverless WebSocket support)
- Or separate server (Railway, Heroku, AWS)
- **Cost:** $0-50/month depending on scale

**Storage:**
- CRDT updates stored in PostgreSQL
- IndexedDB for client-side persistence
- Periodic compaction of update history
- **Cost:** Included in existing database

**External Services (Optional):**
- **Pusher** - $49/month for 100 concurrent connections
- **Ably** - $29/month for 200 concurrent connections
- **Supabase Realtime** - Included with Supabase plan
- **Self-hosted** - $0 (just server costs)

### Pros & Cons

**Advantages:**
✅ **Modern UX** - Google Docs experience
✅ **Automatic conflict resolution** - CRDT handles it
✅ **Live collaboration** - see changes instantly
✅ **Cursor positions visible** - awareness of others
✅ **Offline support** - IndexedDB persistence
✅ **No save button** - auto-saves continuously
✅ **Undo/redo works** - even with multiple users

**Disadvantages:**
❌ **Very complex implementation** - 5-6 weeks
❌ **Infrastructure costs** - WebSocket server needed
❌ **Ongoing maintenance** - CRDT sync issues
❌ **Performance concerns** - large documents
❌ **Browser compatibility** - needs modern browsers
❌ **Debugging difficulty** - CRDT state is opaque
❌ **Overkill for most use cases** - educational content rarely edited simultaneously
❌ **Learning curve** - unfamiliar auto-save behavior

**Best Use Cases:**
- Real-time workshops/seminars
- Synchronous content creation sessions
- Highly collaborative environments
- Tech-savvy teams familiar with Google Docs

**Not Suitable For:**
- Asynchronous collaboration (most academic content)
- Mobile-heavy users (WebSocket battery drain)
- Poor internet connections
- Large documents (performance issues)

**Timeline:** 5-6 weeks + ongoing maintenance

**Cost:** $50-200/month (WebSocket infrastructure)

---

## Option 4: Branching & Merge Model

**Concept:** Git-style workflow where collaborators create branches, make changes, then create merge requests for owner approval.

### Database Schema

```prisma
model content_branches {
  id              String   @id @default(cuid())
  entity_type     String   // 'course', 'module'
  entity_id       String   // Reference to original course/module
  branch_name     String   // 'main', 'feature/add-quiz', etc.

  created_by      String
  created_from    String?  // Parent branch ID (for feature branches)
  merged_to       String?  // Target branch ID if merged

  // Branch status
  status          String   @default("active") // active, merged, abandoned
  is_default      Boolean  @default(false)    // 'main' branch flag

  // Snapshot of content at branch creation
  content_snapshot Json

  // Metadata
  description     String?  @db.Text

  created_at      DateTime @default(now())
  merged_at       DateTime?
  abandoned_at    DateTime?

  author          users    @relation(fields: [created_by], references: [id])
  changes         branch_changes[]
  merge_requests  merge_requests[]

  @@unique([entity_type, entity_id, branch_name])
  @@index([entity_type, entity_id])
  @@index([status])
  @@index([is_default])
}

model branch_changes {
  id              String   @id @default(cuid())
  branch_id       String

  // Change details
  change_type     String   // 'update', 'add', 'delete'
  field_path      String   // JSON path (e.g., 'title', 'content', 'modules[0].title')
  old_value       Json?
  new_value       Json?

  // Metadata
  changed_by      String
  commit_message  String?  @db.Text
  commit_hash     String   @unique // For referencing specific commits

  created_at      DateTime @default(now())

  branch          content_branches @relation(fields: [branch_id], references: [id], onDelete: Cascade)
  author          users    @relation(fields: [changed_by], references: [id])

  @@index([branch_id, created_at])
  @@index([commit_hash])
}

model merge_requests {
  id              String   @id @default(cuid())
  source_branch   String   // Branch to merge from
  target_branch   String   // Usually 'main'

  title           String
  description     String?  @db.Text

  // Status tracking
  status          String   @default("open") // open, approved, rejected, merged, closed

  // Conflict detection
  has_conflicts   Boolean  @default(false)
  conflicts       Json?    // Array of conflicting field paths
  conflict_resolution Json? // Manual resolution if conflicts exist

  // Review
  created_by      String
  reviewed_by     String?
  review_notes    String?  @db.Text
  reviewed_at     DateTime?

  // Merge
  merged_by       String?
  merged_at       DateTime?
  merge_commit    String?  // Reference to merge commit in branch_changes

  created_at      DateTime @default(now())
  closed_at       DateTime?

  source          content_branches @relation("SourceBranch", fields: [source_branch], references: [id])
  target          content_branches @relation("TargetBranch", fields: [target_branch], references: [id])
  creator         users    @relation("MRCreator", fields: [created_by], references: [id])
  reviewer        users?   @relation("MRReviewer", fields: [reviewed_by], references: [id])
  merger          users?   @relation("MRMerger", fields: [merged_by], references: [id])
  comments        merge_request_comments[]

  @@index([status])
  @@index([created_by])
  @@index([reviewed_by])
}

model merge_request_comments {
  id              String   @id @default(cuid())
  merge_request_id String

  content         String   @db.Text
  author_id       String

  // Code review features
  line_reference  String?  // Reference to specific change/line
  is_resolved     Boolean  @default(false)
  resolved_by     String?
  resolved_at     DateTime?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  merge_request   merge_requests @relation(fields: [merge_request_id], references: [id], onDelete: Cascade)
  author          users    @relation(fields: [author_id], references: [id])
  resolver        users?   @relation("CommentResolver", fields: [resolved_by], references: [id])

  @@index([merge_request_id])
  @@index([is_resolved])
}
```

### Workflow Implementation

**1. Create Branch:**
```typescript
POST /api/courses/[id]/branches
// Body: {
//   branchName: 'feature/add-quiz-section',
//   description: 'Adding interactive quiz to section 3'
// }
// Creates snapshot of current 'main' branch content
// Returns: { branchId, branchName }
```

**2. Make Changes on Branch:**
```typescript
PUT /api/courses/branches/[branchId]
// Body: { title, description, modules, ... }
// Each change logged in branch_changes table
// Commit message auto-generated or provided
// Returns: { commitHash, changes: [...] }
```

**3. Create Merge Request:**
```typescript
POST /api/courses/[id]/merge-requests
// Body: {
//   sourceBranch: branchId,
//   targetBranch: 'main',
//   title: 'Add quiz section',
//   description: 'This PR adds...'
// }
// System automatically detects conflicts
// Returns: { mergeRequestId, hasConflicts, conflicts: [...] }
```

**4. Review Process:**
```typescript
GET /api/merge-requests/[mrId]
// Returns full diff between source and target
// Shows: added, modified, deleted content
// Includes all comments

POST /api/merge-requests/[mrId]/comments
// Body: { content, lineReference? }
// Add review comment

PUT /api/merge-requests/[mrId]/review
// Body: { status: 'approved' | 'request_changes', notes }
// Approve or request changes
```

**5. Merge:**
```typescript
POST /api/merge-requests/[mrId]/merge
// Body: { conflictResolution? } // If conflicts exist
// Validates: all comments resolved, approved status
// Applies changes to target branch
// Creates merge commit in branch_changes
// Updates merge_request status to 'merged'
// Returns: { success, mergeCommit }
```

### Conflict Detection Logic

```typescript
// lib/collaboration/conflict-detector.ts

interface Conflict {
  field: string
  baseValue: any
  sourceValue: any
  targetValue: any
  conflictType: 'modification' | 'deletion'
}

export async function detectConflicts(
  sourceBranchId: string,
  targetBranchId: string
): Promise<Conflict[]> {
  const sourceBranch = await prisma.content_branches.findUnique({
    where: { id: sourceBranchId },
    include: { changes: { orderBy: { created_at: 'asc' } } }
  })

  const targetBranch = await prisma.content_branches.findUnique({
    where: { id: targetBranchId },
    include: { changes: { orderBy: { created_at: 'asc' } } }
  })

  // Get content snapshots
  const baseSnapshot = sourceBranch.content_snapshot
  let sourceContent = JSON.parse(JSON.stringify(baseSnapshot))
  let targetContent = JSON.parse(JSON.stringify(baseSnapshot))

  // Apply source changes
  for (const change of sourceBranch.changes) {
    applyChange(sourceContent, change)
  }

  // Apply target changes
  for (const change of targetBranch.changes) {
    applyChange(targetContent, change)
  }

  // Detect conflicts (same field modified in both branches)
  const conflicts: Conflict[] = []

  const sourceFields = getModifiedFields(sourceBranch.changes)
  const targetFields = getModifiedFields(targetBranch.changes)

  const commonFields = sourceFields.filter(f => targetFields.includes(f))

  for (const field of commonFields) {
    const sourceValue = getValueAtPath(sourceContent, field)
    const targetValue = getValueAtPath(targetContent, field)
    const baseValue = getValueAtPath(baseSnapshot, field)

    if (!isEqual(sourceValue, targetValue)) {
      conflicts.push({
        field,
        baseValue,
        sourceValue,
        targetValue,
        conflictType: 'modification'
      })
    }
  }

  return conflicts
}
```

### UI Components

**BranchSelector:**
```typescript
// components/collaboration/BranchSelector.tsx
export function BranchSelector({
  entityType,
  entityId,
  currentBranch,
  onSwitch
}: BranchSelectorProps) {
  const { data: branches } = useQuery({
    queryKey: ['branches', entityType, entityId],
    queryFn: () => fetch(`/api/${entityType}/${entityId}/branches`).then(r => r.json())
  })

  return (
    <Select value={currentBranch} onValueChange={onSwitch}>
      <SelectTrigger className="w-48">
        <GitBranch className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {branches?.map(branch => (
          <SelectItem key={branch.id} value={branch.id}>
            <div className="flex items-center justify-between w-full">
              <span>{branch.branch_name}</span>
              {branch.is_default && (
                <Badge variant="outline" className="ml-2">Main</Badge>
              )}
              {branch.status === 'merged' && (
                <Badge variant="secondary" className="ml-2">Merged</Badge>
              )}
            </div>
          </SelectItem>
        ))}

        <SelectSeparator />

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowCreateBranch(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Branch
        </Button>
      </SelectContent>
    </Select>
  )
}
```

**MergeRequestView:**
```typescript
// components/collaboration/MergeRequestView.tsx
export function MergeRequestView({ mergeRequestId }: { mergeRequestId: string }) {
  const { data: mr } = useQuery({
    queryKey: ['merge-request', mergeRequestId],
    queryFn: () => fetch(`/api/merge-requests/${mergeRequestId}`).then(r => r.json())
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">{mr.title}</h2>
          <StatusBadge status={mr.status} />
        </div>
        <p className="text-muted-foreground">{mr.description}</p>
      </div>

      {/* Conflict warning */}
      {mr.has_conflicts && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Conflicts Detected</AlertTitle>
          <AlertDescription>
            This merge request has {mr.conflicts.length} conflicts that must be resolved.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs: Changes, Commits, Comments */}
      <Tabs defaultValue="changes">
        <TabsList>
          <TabsTrigger value="changes">Changes ({mr.changeCount})</TabsTrigger>
          <TabsTrigger value="commits">Commits ({mr.commitCount})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({mr.comments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="changes">
          <DiffViewer
            sourceBranch={mr.source}
            targetBranch={mr.target}
            conflicts={mr.conflicts}
          />
        </TabsContent>

        <TabsContent value="commits">
          <CommitList commits={mr.commits} />
        </TabsContent>

        <TabsContent value="comments">
          <CommentThread
            comments={mr.comments}
            onAddComment={handleAddComment}
          />
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2">
        {isReviewer && mr.status === 'open' && (
          <>
            <Button onClick={() => handleReview('approved')}>
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" onClick={() => handleReview('request_changes')}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Request Changes
            </Button>
          </>
        )}

        {canMerge && mr.status === 'approved' && !mr.has_conflicts && (
          <Button onClick={handleMerge}>
            <GitMerge className="mr-2 h-4 w-4" />
            Merge
          </Button>
        )}

        {mr.has_conflicts && (
          <Button onClick={() => setShowConflictResolver(true)}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Resolve Conflicts
          </Button>
        )}
      </div>
    </div>
  )
}
```

**DiffViewer:**
```typescript
// Shows side-by-side or unified diff
export function DiffViewer({ sourceBranch, targetBranch, conflicts }) {
  return (
    <div className="border rounded-lg">
      {changes.map(change => (
        <div key={change.field} className="border-b last:border-b-0">
          <div className="bg-muted px-4 py-2 font-mono text-sm">
            {change.field}
          </div>

          <div className="grid grid-cols-2 divide-x">
            {/* Old value */}
            <div className="p-4 bg-red-50">
              <pre className="text-sm text-red-900 line-through">
                {JSON.stringify(change.old_value, null, 2)}
              </pre>
            </div>

            {/* New value */}
            <div className="p-4 bg-green-50">
              <pre className="text-sm text-green-900">
                {JSON.stringify(change.new_value, null, 2)}
              </pre>
            </div>
          </div>

          {/* Conflict marker */}
          {conflicts.find(c => c.field === change.field) && (
            <div className="bg-yellow-100 px-4 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-900">
                Conflict: This field was also modified in the target branch
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Pros & Cons

**Advantages:**
✅ **Explicit review workflow** - formal approval process
✅ **Full change history** - complete audit trail
✅ **Conflict detection** - automatic detection and resolution
✅ **Non-destructive** - can abandon branches
✅ **Parallel work** - multiple features simultaneously
✅ **Familiar to developers** - Git mental model
✅ **Safe experimentation** - changes isolated in branches

**Disadvantages:**
❌ **Steep learning curve** - non-technical users struggle
❌ **Complex UX** - branches, merges, conflicts
❌ **Overhead for simple edits** - overkill for minor changes
❌ **Storage intensive** - multiple content versions
❌ **Implementation complexity** - 6 weeks
❌ **May confuse educators** - unfamiliar with version control
❌ **Requires training** - cannot use intuitively

**Best Use Cases:**
- Large teams (10+ collaborators)
- Formal approval workflows (department head review)
- Complex content with many contributors
- Tech-savvy academic departments (CS, Engineering)
- Need for strict audit trails
- Parallel feature development

**Not Suitable For:**
- Small teams (overkill)
- Non-technical faculty
- Simple collaboration needs
- Quick iterations
- Synchronous editing

**Timeline:** 6 weeks

**Cost:** $0 (no external services)

---

## Option 5: Hybrid Approach (RECOMMENDED)

**Concept:** Combine role-based permissions (Option 2) with lightweight activity tracking and optional real-time presence. Provides balanced complexity vs. value for educational use cases.

### Why Hybrid?

✅ **Right Balance:** Not too simple (Option 1), not overwhelming (Options 3-4)
✅ **Extensible:** Can add real-time later if needed
✅ **Educational Focus:** Designed for academic workflows
✅ **Cost-Effective:** No required external services
✅ **Future-Proof:** Room to grow with the platform

### Database Schema

```prisma
model course_collaborators {
  id              String   @id @default(cuid())
  course_id       String
  user_id         String
  role            String   // 'owner', 'editor', 'reviewer', 'viewer'

  // Permissions (cached for performance)
  can_edit        Boolean  @default(false)
  can_publish     Boolean  @default(false)
  can_delete      Boolean  @default(false)
  can_invite      Boolean  @default(false)

  // Invitation workflow
  invited_by      String
  invited_at      DateTime @default(now())
  accepted_at     DateTime?
  invitation_token String? @unique  // For email invitation link

  // Activity tracking
  last_accessed   DateTime @default(now())
  edit_count      Int      @default(0)

  course          courses  @relation(fields: [course_id], references: [id], onDelete: Cascade)
  collaborator    users    @relation("CourseCollaborator", fields: [user_id], references: [id], onDelete: Cascade)
  inviter         users    @relation("CourseInviter", fields: [invited_by], references: [id])

  @@unique([course_id, user_id])
  @@index([course_id])
  @@index([user_id])
  @@index([role])
  @@index([invitation_token])
}

model module_collaborators {
  id              String   @id @default(cuid())
  module_id       String
  user_id         String
  role            String

  can_edit        Boolean  @default(false)
  can_publish     Boolean  @default(false)
  can_delete      Boolean  @default(false)
  can_invite      Boolean  @default(false)

  invited_by      String
  invited_at      DateTime @default(now())
  accepted_at     DateTime?
  invitation_token String? @unique

  last_accessed   DateTime @default(now())
  edit_count      Int      @default(0)

  module          modules  @relation(fields: [module_id], references: [id], onDelete: Cascade)
  collaborator    users    @relation("ModuleCollaborator", fields: [user_id], references: [id], onDelete: Cascade)
  inviter         users    @relation("ModuleInviter", fields: [invited_by], references: [id])

  @@unique([module_id, user_id])
  @@index([module_id])
  @@index([user_id])
  @@index([role])
}

model collaboration_activity {
  id              String   @id @default(cuid())
  entity_type     String   // 'course', 'module'
  entity_id       String
  user_id         String

  action          String   // 'created', 'updated', 'published', 'invited_user', 'removed_user', 'role_changed'
  description     String   // Human-readable: "Updated course title from 'Intro' to 'Introduction'"

  // Change details (optional, for detailed tracking)
  changes         Json?    // {field: 'title', from: 'Old', to: 'New'}

  created_at      DateTime @default(now())

  user            users    @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([entity_type, entity_id, created_at])
  @@index([user_id])
  @@index([action])
}

// Optional: Real-time presence (Phase 5, can be added later)
model active_editors {
  id              String   @id @default(cuid())
  entity_type     String
  entity_id       String
  user_id         String

  last_heartbeat  DateTime @default(now())
  expires_at      DateTime // Auto-expire after 5 minutes of inactivity

  user            users    @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([entity_type, entity_id, user_id])
  @@index([entity_type, entity_id, expires_at])
  @@index([expires_at])  // For cleanup job
}
```

### Key Features

#### 1. Role-Based Permissions (from Option 2)

**Role Definitions:**
- **Owner:** Full control, can delete, transfer ownership
- **Editor:** Can edit and save drafts, cannot publish/delete
- **Reviewer:** Can view drafts and add comments (future feature)
- **Viewer:** Read-only access to drafts

**Permission Checking:**
```typescript
// lib/collaboration/permissions.ts
export async function checkPermission(
  userId: string,
  entityType: 'course' | 'module',
  entityId: string,
  permission: 'edit' | 'publish' | 'delete' | 'invite'
): Promise<boolean> {
  // Check if owner
  const table = entityType === 'course' ? 'courses' : 'modules'
  const entity = await prisma[table].findFirst({
    where: { id: entityId, author_id: userId }
  })

  if (entity) return true

  // Check collaborator
  const collabTable = `${entityType}_collaborators`
  const collaborator = await prisma[collabTable].findFirst({
    where: {
      [`${entityType}_id`]: entityId,
      user_id: userId,
      accepted_at: { not: null }  // Must have accepted invitation
    }
  })

  if (!collaborator) return false

  return collaborator[`can_${permission}`]
}
```

#### 2. Invitation Workflow

**Send Invitation:**
```typescript
POST /api/courses/[id]/collaborators/invite
// Body: { email: string, role: 'editor' | 'reviewer' | 'viewer' }

async function inviteCollaborator(courseId, email, role) {
  // Find user by email
  const user = await prisma.users.findUnique({ where: { email } })
  if (!user) throw new Error('User not found')

  // Generate unique invitation token
  const token = crypto.randomBytes(32).toString('hex')

  // Create collaborator record
  await prisma.course_collaborators.create({
    data: {
      course_id: courseId,
      user_id: user.id,
      role,
      can_edit: role === 'editor' || role === 'owner',
      can_publish: role === 'owner',
      can_delete: role === 'owner',
      can_invite: role === 'owner',
      invited_by: session.user.id,
      invitation_token: token
    }
  })

  // Send email via Resend
  await sendEmail({
    to: email,
    subject: `You've been invited to collaborate on "${course.title}"`,
    html: `
      <p>Hello ${user.name},</p>
      <p>${inviter.name} has invited you to collaborate on "${course.title}" as ${role}.</p>
      <a href="${process.env.NEXTAUTH_URL}/invitations/${token}/accept">
        Accept Invitation
      </a>
    `
  })
}
```

**Accept Invitation:**
```typescript
GET /api/invitations/[token]/accept
// Validates token, marks accepted_at, redirects to course

async function acceptInvitation(token) {
  const invitation = await prisma.course_collaborators.findUnique({
    where: { invitation_token: token },
    include: { course: true, inviter: true }
  })

  if (!invitation) throw new Error('Invalid invitation')
  if (invitation.accepted_at) throw new Error('Already accepted')

  // Mark as accepted
  await prisma.course_collaborators.update({
    where: { id: invitation.id },
    data: { accepted_at: new Date() }
  })

  // Log activity
  await logActivity({
    entityType: 'course',
    entityId: invitation.course_id,
    userId: invitation.user_id,
    action: 'accepted_invitation',
    description: `${user.name} accepted collaboration invitation as ${invitation.role}`
  })

  return { courseId: invitation.course_id }
}
```

#### 3. Activity Feed

**Logging Activity:**
```typescript
// lib/collaboration/activity.ts
export async function logActivity({
  entityType,
  entityId,
  userId,
  action,
  description,
  changes
}: {
  entityType: 'course' | 'module'
  entityId: string
  userId: string
  action: string
  description: string
  changes?: any
}) {
  await prisma.collaboration_activity.create({
    data: {
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
      action,
      description,
      changes: changes ? JSON.stringify(changes) : null
    }
  })
}

// Usage in API route:
await logActivity({
  entityType: 'course',
  entityId: courseId,
  userId: session.user.id,
  action: 'updated',
  description: `Updated course title from "${oldTitle}" to "${newTitle}"`,
  changes: { field: 'title', from: oldTitle, to: newTitle }
})
```

**Displaying Activity:**
```typescript
GET /api/courses/[id]/activity
// Query: ?page=1&limit=20&userId=xxx&action=updated
// Returns: Paginated activity feed

export function ActivityFeed({ entityType, entityId }: ActivityFeedProps) {
  const { data } = useQuery({
    queryKey: ['activity', entityType, entityId],
    queryFn: () => fetch(`/api/${entityType}/${entityId}/activity`).then(r => r.json())
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.activities.map(activity => (
            <div key={activity.id} className="flex gap-3 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar_url} />
                <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{activity.user.name}</span>
                  {' '}{activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at))} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 4. Conflict Prevention (Not Resolution)

**Strategy:** Warn users before overwriting recent changes

```typescript
PUT /api/courses/[id]
// Body includes: { ...courseData, lastUpdatedAt: timestamp }

async function updateCourse(id, data, lastUpdatedAt) {
  // Check if course was modified since user loaded it
  const currentCourse = await prisma.courses.findUnique({ where: { id } })

  if (currentCourse.updated_at > new Date(lastUpdatedAt)) {
    // Course was modified by someone else
    return NextResponse.json({
      error: 'Course was modified by another user',
      code: 'CONFLICT',
      latestVersion: currentCourse,
      conflictingSince: currentCourse.updated_at
    }, { status: 409 })
  }

  // Proceed with update
  // ...
}
```

**UI Handling:**
```typescript
// In form submission
try {
  await updateCourse({ ...formData, lastUpdatedAt })
} catch (error) {
  if (error.code === 'CONFLICT') {
    // Show dialog with latest version
    showConflictDialog({
      message: 'This course was modified by another user while you were editing.',
      latestVersion: error.latestVersion,
      yourChanges: formData,
      options: ['Reload and lose changes', 'Overwrite anyway']
    })
  }
}
```

#### 5. Optional Real-Time Presence (Phase 5)

**Heartbeat System:**
```typescript
PUT /api/courses/[id]/presence
// Called every 30 seconds while user is editing

async function updatePresence(courseId, userId) {
  await prisma.active_editors.upsert({
    where: {
      entity_type_entity_id_user_id: {
        entity_type: 'course',
        entity_id: courseId,
        user_id: userId
      }
    },
    update: {
      last_heartbeat: new Date(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    },
    create: {
      entity_type: 'course',
      entity_id: courseId,
      user_id: userId,
      last_heartbeat: new Date(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000)
    }
  })
}
```

**Get Active Editors:**
```typescript
GET /api/courses/[id]/presence
// Returns list of users currently editing

async function getActiveEditors(courseId) {
  const now = new Date()

  const activeEditors = await prisma.active_editors.findMany({
    where: {
      entity_type: 'course',
      entity_id: courseId,
      expires_at: { gt: now }
    },
    include: { user: true }
  })

  return activeEditors.map(e => ({
    userId: e.user_id,
    name: e.user.name,
    avatar: e.user.avatar_url,
    lastSeen: e.last_heartbeat
  }))
}
```

**UI Indicator:**
```typescript
export function PresenceIndicator({ entityType, entityId }: PresenceIndicatorProps) {
  const { data: activeEditors } = useQuery({
    queryKey: ['presence', entityType, entityId],
    queryFn: () => fetch(`/api/${entityType}/${entityId}/presence`).then(r => r.json()),
    refetchInterval: 10000 // Poll every 10 seconds
  })

  if (!activeEditors || activeEditors.length === 0) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex -space-x-2">
        {activeEditors.map(editor => (
          <Avatar key={editor.userId} className="h-6 w-6 border-2 border-background">
            <AvatarImage src={editor.avatar} />
            <AvatarFallback>{editor.name[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span>
        {activeEditors.length === 1
          ? `${activeEditors[0].name} is editing`
          : `${activeEditors.length} people are editing`}
      </span>
    </div>
  )
}
```

### API Endpoints Summary

```typescript
// Collaborator Management
POST   /api/courses/[id]/collaborators/invite
// Body: { email, role }
// Send invitation email with token

GET    /api/courses/[id]/collaborators
// List all collaborators (with pending status)

PUT    /api/courses/[id]/collaborators/[userId]
// Body: { role }
// Change user's role (owner only)

DELETE /api/courses/[id]/collaborators/[userId]
// Remove collaborator (owner only)

POST   /api/courses/[id]/transfer-ownership
// Body: { newOwnerId }
// Transfer ownership (owner only, creates new owner + downgrades current to editor)

// Invitations
GET    /api/invitations/[token]
// View invitation details (course/module info, inviter, role)

POST   /api/invitations/[token]/accept
// Accept invitation, mark accepted_at

POST   /api/invitations/[token]/decline
// Decline invitation, delete record

// Activity
GET    /api/courses/[id]/activity
// Query: ?page=1&limit=20&userId=xxx&action=updated
// Get activity feed

// Permissions
GET    /api/courses/[id]/permissions
// Query: ?userId=xxx (optional)
// Returns: { role, can_edit, can_publish, can_delete, can_invite }

// Presence (Optional - Phase 5)
PUT    /api/courses/[id]/presence
// Heartbeat to mark as actively editing

GET    /api/courses/[id]/presence
// Get list of active editors

// Same endpoints for modules (/api/modules/[id]/...)
```

### Implementation Roadmap

**Week 1-2: Foundation**
- [ ] Create Prisma migration (collaborators, activity tables)
- [ ] Run migration on dev database
- [ ] Build permission helper functions
- [ ] Update authorization in existing API routes (PUT, DELETE)
- [ ] Create collaborator management endpoints

**Week 3: Role Management UI**
- [ ] Build RoleBadge component
- [ ] Build CollaboratorManager component
- [ ] Build CollaboratorList component
- [ ] Add role selector to invitation flow
- [ ] Permission-aware button rendering

**Week 4: Invitation System**
- [ ] Build invitation email templates
- [ ] Invitation sending logic (via Resend)
- [ ] Invitation acceptance flow
- [ ] Pending invitations UI
- [ ] Decline invitation functionality

**Week 5: Activity Tracking**
- [ ] Add activity logging throughout API routes
- [ ] Build ActivityFeed component
- [ ] Activity filtering (by user, action)
- [ ] Activity pagination
- [ ] Integration in edit pages

**Week 6 (Optional): Presence**
- [ ] Create active_editors table migration
- [ ] Heartbeat API endpoint
- [ ] Presence query endpoint
- [ ] PresenceIndicator component
- [ ] Cleanup job for expired sessions

### Files to Create

**New API Routes:**
1. `src/app/api/courses/[id]/collaborators/route.ts` - GET, POST
2. `src/app/api/courses/[id]/collaborators/[userId]/route.ts` - PUT, DELETE
3. `src/app/api/courses/[id]/collaborators/invite/route.ts` - POST
4. `src/app/api/courses/[id]/transfer-ownership/route.ts` - POST
5. `src/app/api/courses/[id]/activity/route.ts` - GET
6. `src/app/api/courses/[id]/permissions/route.ts` - GET
7. `src/app/api/courses/[id]/presence/route.ts` - GET, PUT (optional)
8. `src/app/api/invitations/[token]/route.ts` - GET
9. `src/app/api/invitations/[token]/accept/route.ts` - POST
10. `src/app/api/invitations/[token]/decline/route.ts` - POST
11. Mirror all 10 routes for modules (`/api/modules/[id]/...`)

**Library Functions:**
1. `src/lib/collaboration/permissions.ts` - Permission checking
2. `src/lib/collaboration/activity.ts` - Activity logging
3. `src/lib/collaboration/roles.ts` - Role definitions and utilities

**UI Components:**
1. `src/components/collaboration/CollaboratorPanel.tsx` - Main panel
2. `src/components/collaboration/CollaboratorList.tsx` - List display
3. `src/components/collaboration/InviteModal.tsx` - Invitation dialog
4. `src/components/collaboration/RoleBadge.tsx` - Role display
5. `src/components/collaboration/ActivityFeed.tsx` - Activity timeline
6. `src/components/collaboration/PermissionGuard.tsx` - Conditional rendering
7. `src/components/collaboration/PresenceIndicator.tsx` - Active editors (optional)

**Email Templates:**
1. `src/templates/emails/collaboration-invitation.tsx` - Invitation email

### Files to Modify

**API Routes:**
1. `src/app/api/courses/[id]/route.ts`
   - Update PUT authorization to check collaborator permissions
   - Update DELETE authorization (owner only)
   - Add activity logging on successful operations

2. `src/app/api/modules/[id]/route.ts`
   - Same updates as courses route

**UI Components:**
1. `src/components/faculty/edit-module-form.tsx`
   - Add CollaboratorPanel to sidebar
   - Add ActivityFeed below form
   - Add PermissionGuard around action buttons

2. `src/components/faculty/create-course-form.tsx`
   - Optional: Add collaborator invitation during creation

3. `src/components/faculty/course-library.tsx`
   - Show collaborator count badge on course cards
   - Filter: "My Courses" vs "Shared with Me"

4. `src/components/faculty/module-library.tsx`
   - Same updates as course library

### Pros & Cons

**Advantages:**
✅ **Balanced complexity** - not too simple, not overwhelming
✅ **Supports academic workflows** - professor + TAs, reviewers
✅ **Extensible** - can add real-time later
✅ **Clear audit trail** - activity feed
✅ **Invitation system** - explicit consent
✅ **Permission granularity** - role-based
✅ **Cost-effective** - no required external services
✅ **Educational focus** - designed for academic use cases

**Disadvantages:**
❌ **Longer implementation** - 5-6 weeks vs 2 weeks for simple
❌ **Still no automatic conflict resolution** - by design (simplicity)
❌ **Requires user training** - understand roles

**Best For:**
- Most educational institutions
- Small to medium teams (2-15 faculty)
- Balance of control and ease
- Future-proof solution
- Academic hierarchies

**Timeline:** 4-6 weeks (4 weeks without presence)

**Cost:** $0-20/month (optional Pusher/Supabase for presence)

---

## Comparison Matrix

| Feature | Option 1<br/>Simple Co-Author | Option 2<br/>Role-Based | Option 3<br/>Real-Time CRDT | Option 4<br/>Git-Style | Option 5<br/>Hybrid ⭐ |
|---------|-------------------------------|-------------------------|------------------------------|------------------------|------------------------|
| **Implementation Complexity** | Low | Medium | Very High | High | Medium |
| **Timeline** | 2 weeks | 3 weeks | 5-6 weeks | 6 weeks | 4-6 weeks |
| **Permission System** | All equal | 4 roles | Role + CRDT | Branch-based | 4 roles |
| **Simultaneous Editing** | ❌ Conflicts | ❌ Conflicts | ✅ CRDT auto-merge | N/A (branches) | ⚠️ Conflict warning |
| **Activity Tracking** | ❌ None | ❌ None | ⚠️ Basic log | ✅ Full commit history | ✅ Activity feed |
| **Learning Curve** | Easy | Medium | Medium | Steep | Medium |
| **User Scalability** | 2-5 users | 10+ users | 5-10 concurrent | 20+ users | 10+ users |
| **Infrastructure Cost** | $0 | $0 | $50-200/mo | $0 | $0-20/mo |
| **Review Workflow** | ❌ No | ⚠️ Reviewer role | ❌ No | ✅ Merge requests | ⚠️ Reviewer role |
| **Conflict Resolution** | Manual | Manual | Automatic (CRDT) | Explicit merge | Manual (with warning) |
| **Audit Trail** | ❌ None | ❌ None | ⚠️ Basic | ✅ Complete | ✅ Activity log |
| **Offline Support** | ✅ Standard | ✅ Standard | ✅ IndexedDB | ✅ Standard | ✅ Standard |
| **Maintenance Burden** | Low | Low | High | Medium | Low-Medium |
| **Mobile Friendly** | ✅ Yes | ✅ Yes | ⚠️ WebSocket drain | ✅ Yes | ✅ Yes |
| **Best For** | Small co-teachers | Hierarchical teams | Real-time workshops | Large formal teams | General educational use |

---

## Recommendation & Rationale

### ✅ RECOMMENDED: Option 5 (Hybrid Approach)

After comprehensive analysis of all options and deep understanding of the educational platform's needs, **Option 5 (Hybrid Approach)** is the clear winner.

### Why Option 5 is Best

#### 1. **Right Balance of Complexity**

**Not Too Simple (Option 1):**
- Avoids permission chaos with 5+ collaborators
- Prevents accidental deletions by TAs
- Supports review workflows

**Not Too Complex (Options 3-4):**
- No steep learning curve (Git branching, CRDT internals)
- Faculty can understand roles intuitively
- Maintenance burden stays low

#### 2. **Common Academic Workflows Supported**

**Professor + TAs:**
```
Professor (Owner)
├─ Can edit, publish, delete, invite
├─ Full control over course

TA 1 (Editor)
├─ Can edit content, save drafts
├─ Cannot publish (prevents accidental publication)
├─ Cannot delete (safety)

TA 2 (Editor)
└─ Same permissions as TA 1
```

**Department Head Review:**
```
Professor (Owner) creates course
    ↓
Department Head (Reviewer) reviews draft
    ↓
Provides feedback via comments
    ↓
Professor publishes after approval
```

**Co-Instructors:**
```
Professor 1 (Owner)
Professor 2 (Editor with elevated permissions)
    ↓
Both can edit and publish
Only Professor 1 can delete or transfer ownership
```

#### 3. **Transparent Collaboration**

**Activity Feed Shows:**
- "Prof. Smith updated module title at 2:30 PM"
- "TA John added quiz section at 3:15 PM"
- "Dept Head Jane reviewed course at 4:00 PM"

**Benefits:**
- Clear audit trail for accountability
- Easy to track who changed what
- Identify recent modifications
- Debug issues quickly

#### 4. **Invitation Workflow**

**Professional Onboarding:**
```
1. Owner clicks "Invite Collaborator"
2. Enters email + selects role
3. System sends professional email invitation
4. Collaborator clicks link to accept
5. Automatically added with correct permissions
```

**Benefits:**
- Explicit consent (no surprise access)
- Email notification (don't miss invitation)
- Role is clear upfront
- Professional workflow

#### 5. **Extensible Architecture**

**Can Add Later Without Breaking Changes:**
- Real-time presence (Phase 5)
- Comment system on content (Phase 6)
- Advanced conflict resolution (Phase 7)
- Version history (Phase 8)
- Branching (if needed)

**Current Implementation Supports:**
- All future features
- No database restructuring needed
- Incremental enhancement

#### 6. **Cost-Effective**

**Core Features: $0**
- No external services required
- PostgreSQL handles everything
- Email via existing Resend integration
- Serverless-compatible (Vercel)

**Optional Enhancements: $0-20/month**
- Pusher for presence: $0 (free tier up to 200K messages/day)
- Supabase Realtime: Included with Supabase plan
- Ably: $29/month (if scale needs)

#### 7. **Educational Focus**

**Designed for Academic Use Cases:**
- Professor-TA hierarchy (not flat team)
- Review workflows (department approval)
- Semester-based collaboration (not continuous)
- Async editing (not synchronous)
- Safety over speed (prevent accidental publish)

**Not Designed for Software Teams:**
- No branch/merge complexity
- No CI/CD integration
- No code review flows
- Focus on content, not code

### When NOT to Choose Option 5

**Choose Option 1 (Simple) If:**
- Guaranteed 2-3 users maximum
- All users have equal authority
- No review workflow needed
- Urgently needed (2 weeks vs 4-6 weeks)

**Choose Option 3 (Real-Time) If:**
- Synchronous editing is primary workflow
- Budget allows $50-200/month
- Tech-savvy users (CS department)
- Google Docs experience is critical

**Choose Option 4 (Git-Style) If:**
- 20+ collaborators per course
- Formal approval process required
- Users are developers (understand Git)
- Complete audit trail is legally required

### Implementation Priority

**Phase 1 (Weeks 1-2): Core - MUST HAVE**
- Collaborator tables
- Permission system
- Basic add/remove collaborators
- Updated authorization

**Phase 2 (Week 3): Roles - SHOULD HAVE**
- Role selection
- Permission-aware UI
- Owner transfer

**Phase 3 (Week 4): Invitations - SHOULD HAVE**
- Email invitations
- Acceptance flow
- Professional workflow

**Phase 4 (Week 5): Activity - NICE TO HAVE**
- Activity logging
- Activity feed
- Transparency

**Phase 5 (Week 6): Presence - OPTIONAL**
- Active editor tracking
- Presence indicators
- Enhanced awareness

**Minimum Viable Product:** Phases 1-3 (4 weeks)
**Complete Feature:** Phases 1-4 (5 weeks)
**Full Implementation:** Phases 1-5 (6 weeks)

### Success Metrics

**Adoption:**
- 70% of multi-faculty courses use collaboration within 3 months
- 5+ collaborators average per large course

**Satisfaction:**
- Faculty satisfaction > 4.5/5
- "Easy to invite collaborators" > 90% agree
- "Permissions make sense" > 85% agree

**Technical:**
- < 1% permission errors
- < 0.1% conflict incidents
- < 200ms permission check latency

---

## Next Steps

1. **Review with Stakeholders**
   - Present all 5 options to decision makers
   - Gather feedback on Option 5 recommendation
   - Confirm timeline and budget

2. **Design Phase**
   - Create detailed wireframes for UI components
   - Review email templates with branding team
   - User flow documentation

3. **Technical Planning**
   - Assign developers to phases
   - Set up development environment
   - Create detailed task breakdown

4. **Implementation Kickoff**
   - Week 1: Database migrations + permission system
   - Week 2: API endpoints + authorization updates
   - Week 3: UI components (roles, collaborator panel)
   - Week 4: Invitation system + email integration
   - Week 5: Activity tracking + feed
   - Week 6: (Optional) Presence system

5. **Testing & Rollout**
   - Unit tests for permission logic
   - Integration tests for collaboration flows
   - Faculty beta testing (10 users)
   - Phased rollout to production
   - Documentation and training materials

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Next Review:** After stakeholder feedback
**Status:** Awaiting approval to proceed with Option 5 implementation