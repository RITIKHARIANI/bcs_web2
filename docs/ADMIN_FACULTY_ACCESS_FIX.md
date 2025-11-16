# Admin Superuser Faculty Access Fix

**Created:** 2025-01-16
**Status:** In Progress
**Goal:** Allow admin users to access all faculty features using helper functions instead of inline role checks

---

## Problem

Admin users were being blocked from faculty features because components and API routes used inline checks like:
```typescript
if (session.user.role === 'faculty') // ❌ Blocks admin
```

Instead of using helper functions:
```typescript
if (hasFacultyAccess(session)) // ✅ Allows both faculty and admin
```

---

## Solution

Create helper functions in `/src/lib/auth/utils.ts` and replace ALL inline checks with function calls:

### Helper Functions Created

```typescript
// Check if user has faculty-level access (faculty OR admin)
export function hasFacultyAccess(session: Session | null): boolean

// Check if a role string has faculty access (for API routes)
export function roleHasFacultyAccess(role?: string): boolean

// Check if user can create content (same as hasFacultyAccess)
export function canCreateContent(session: Session | null): boolean
```

---

## All Locations Requiring Fix (52 total)

### Category 1: Faculty Page Guards (9 files)
**Purpose:** Prevent non-faculty from accessing faculty pages
**Fix:** Change `role !== 'faculty'` to `!hasFacultyAccess(session)`

| File | Line | Current Check | Test After Fix |
|------|------|---------------|----------------|
| `src/app/faculty/visualization/page.tsx` | 19 | `session.user.role !== "faculty"` | Admin can view visualization |
| `src/app/faculty/dashboard/page.tsx` | 13 | `session.user.role !== "faculty"` | Admin can view dashboard |
| `src/app/faculty/courses/edit/[id]/page.tsx` | 18 | `session.user.role !== "faculty"` | Admin can edit courses |
| `src/app/faculty/courses/page.tsx` | 13 | `session.user.role !== "faculty"` | Admin can view courses list |
| `src/app/faculty/courses/create/page.tsx` | 12 | `session.user.role !== "faculty"` | Admin can create courses |
| `src/app/faculty/modules/edit/[id]/page.tsx` | 17 | `session.user.role !== "faculty"` | Admin can edit modules |
| `src/app/faculty/modules/[id]/page.tsx` | 16 | `session.user.role !== "faculty"` | Admin can view module details |
| `src/app/faculty/modules/page.tsx` | 13 | `session.user.role !== "faculty"` | Admin can view modules list |
| `src/app/faculty/modules/create/page.tsx` | 12 | `session.user.role !== "faculty"` | Admin can create modules |

### Category 2: API Route Authorization (29 files)
**Purpose:** Restrict API operations to faculty only
**Fix:** Change `session.user.role !== 'faculty'` to `!hasFacultyAccess(session)`

#### Courses API (8 checks)

| File | Line | Current Check | Test After Fix |
|------|------|---------------|----------------|
| `src/app/api/courses/route.ts` | 23 | `session.user.role !== 'faculty'` | Admin can GET courses |
| `src/app/api/courses/route.ts` | 168 | `session.user.role !== 'faculty'` | Admin can POST new course |
| `src/app/api/courses/route.ts` | 235 | `session.user.role !== 'faculty'` | Admin can DELETE course |
| `src/app/api/courses/[id]/route.ts` | 94 | `session.user.role !== 'faculty'` | Admin can PUT/update course |
| `src/app/api/courses/[id]/route.ts` | 300 | `session.user.role !== 'faculty'` | Admin can DELETE specific course |
| `src/app/api/courses/[id]/modules/[moduleId]/route.ts` | 21 | `session.user.role !== 'faculty'` | Admin can add module to course |
| `src/app/api/courses/[id]/modules/[moduleId]/route.ts` | 106 | `session.user.role !== 'faculty'` | Admin can remove module from course |
| `src/app/api/courses/[id]/activity/route.ts` | 23 | `session.user.role !== 'faculty'` | Admin can view course activity |

#### Modules API (9 checks)

| File | Line | Current Check | Test After Fix |
|------|------|---------------|----------------|
| `src/app/api/modules/route.ts` | 21 | `session.user.role !== 'faculty'` | Admin can GET modules |
| `src/app/api/modules/route.ts` | 157 | `session.user.role !== 'faculty'` | Admin can POST new module |
| `src/app/api/modules/route.ts` | 269 | `session.user.role !== 'faculty'` | Admin can DELETE module |
| `src/app/api/modules/route.ts` | 395 | `session.user.role === 'faculty' \|\| 'admin'` | ✅ Already fixed |
| `src/app/api/modules/route.ts` | 569 | `session.user.role === 'faculty' \|\| 'admin'` | ✅ Already fixed |
| `src/app/api/modules/[id]/route.ts` | 43 | `session.user.role !== 'faculty'` | Admin can GET specific module |
| `src/app/api/modules/[id]/route.ts` | 141 | `session.user.role !== 'faculty'` | Admin can PUT/update module |
| `src/app/api/modules/[id]/route.ts` | 300 | `session.user.role !== 'faculty'` | Admin can DELETE specific module |
| `src/app/api/modules/[id]/clone/route.ts` | 41 | `session.user.role !== 'faculty'` | Admin can clone modules |

#### Collaborators API (6 checks)

| File | Line | Current Check | Test After Fix |
|------|------|---------------|----------------|
| `src/app/api/courses/[id]/collaborators/route.ts` | 24 | `session.user.role !== 'faculty'` | Admin can GET course collaborators |
| `src/app/api/courses/[id]/collaborators/route.ts` | 108 | `session.user.role !== 'faculty'` | Admin can POST add collaborator |
| `src/app/api/courses/[id]/collaborators/[userId]/route.ts` | 17 | `session.user.role !== 'faculty'` | Admin can DELETE collaborator |
| `src/app/api/modules/[id]/collaborators/route.ts` | 23 | `session.user.role !== 'faculty'` | Admin can GET module collaborators |
| `src/app/api/modules/[id]/collaborators/route.ts` | 107 | `session.user.role !== 'faculty'` | Admin can POST add collaborator |
| `src/app/api/modules/[id]/collaborators/[userId]/route.ts` | 17 | `session.user.role !== 'faculty'` | Admin can DELETE collaborator |

#### Media API (3 checks)

| File | Line | Current Check | Test After Fix |
|------|------|---------------|----------------|
| `src/app/api/media/confirm/route.ts` | 19 | `session.user.role !== 'faculty'` | Admin can confirm media upload |
| `src/app/api/media/upload-url/route.ts` | 18 | `session.user.role !== 'faculty'` | Admin can get upload URL |
| `src/app/api/media/upload/route.ts` | 19 | `session.user.role !== 'faculty'` | Admin can upload media |

#### Other APIs (3 checks)

| File | Line | Current Check | Test After Fix |
|------|------|---------------|----------------|
| `src/app/api/visualization/course-structure/route.ts` | 9 | `session.user.role !== 'faculty'` | Admin can view visualizations |
| `src/app/api/dashboard/stats/route.ts` | 9 | `session.user.role !== 'faculty'` | Admin can view dashboard stats |
| `src/app/api/users/route.ts` | 17 | `session.user.role !== 'faculty'` | Admin can search users |

### Category 3: UI Components (8 files)
**Purpose:** Show/hide UI elements based on role
**Fix:** Use `hasFacultyAccess(session)` or already fixed

| File | Line | Current Check | Test After Fix | Status |
|------|------|---------------|----------------|--------|
| `src/components/Header.tsx` | 77 | `role === 'faculty' \|\| 'admin'` | Admin sees faculty nav | ✅ Fixed |
| `src/components/Header.tsx` | 206 | `role === 'faculty' \|\| 'admin'` | Admin sees faculty dropdown | ✅ Fixed |
| `src/components/public/module-catalog.tsx` | 92 | `role === 'faculty' \|\| 'admin'` | Admin sees create button | ✅ Fixed |
| `src/components/profile/ProfileView.tsx` | 102 | `user.role === 'faculty'` | Admin edit link works | ⏳ Needs fix |
| `src/components/profile/ProfileView.tsx` | 159 | `user.role === 'faculty'` | Admin courses shown | ⏳ Needs fix |
| `src/components/search/SearchResultCard.tsx` | 179 | `person.role === 'faculty'` | Admin card shows courses | ⏳ Needs fix |
| `src/components/search/SearchResultCard.tsx` | 203 | `person.role === 'faculty'` | Admin card shows modules | ⏳ Needs fix |
| `src/components/collaboration/FacultySearchInput.tsx` | 30 | `?role=faculty` | Include admin in search | ⏳ Needs fix |

### Category 4: Special Cases (6 files)
**Purpose:** Business logic that references 'faculty' role
**Action:** Review case-by-case - may not need changes

| File | Line | Current Check | Action Required |
|------|------|---------------|-----------------|
| `src/app/admin/dashboard/page.tsx` | 34 | Count faculty users | ✅ No change - counting actual faculty |
| `src/app/admin/dashboard/page.tsx` | 220 | Display role badge | ✅ No change - showing user's actual role |
| `src/app/api/auth/register/route.ts` | 31 | Role enum validation | ✅ No change - registration options |
| `src/app/api/courses/[id]/collaborators/route.ts` | 137 | Check if user is faculty | ⚠️ Should allow admin too |
| `src/app/api/modules/[id]/collaborators/route.ts` | 136 | Check if user is faculty | ⚠️ Should allow admin too |

---

## Implementation Plan

### Phase 1: Import Helper Functions ✅ DONE
- [x] Created helper functions in `/src/lib/auth/utils.ts`
- [x] Added `hasFacultyAccess()` for session checks
- [x] Added `roleHasFacultyAccess()` for role string checks

### Phase 2: Fix Critical UI (Partial) ✅ DONE
- [x] Header navigation
- [x] Module catalog
- [ ] Profile view components
- [ ] Search result cards

### Phase 3: Fix All Faculty Page Guards ⏳ IN PROGRESS
Replace in 9 files:
```typescript
// Before
if (session.user.role !== "faculty") {
  redirect('/')
}

// After
import { hasFacultyAccess } from '@/lib/auth/utils'

if (!hasFacultyAccess(session)) {
  redirect('/')
}
```

### Phase 4: Fix All API Routes ⏳ PENDING
Replace in 29 files:
```typescript
// Before
if (!session?.user || session.user.role !== 'faculty') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// After
import { hasFacultyAccess } from '@/lib/auth/utils'

if (!hasFacultyAccess(session)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Phase 5: Fix Remaining UI Components ⏳ PENDING
Update 4 components to use helper functions

### Phase 6: Fix Collaborator Validation ⏳ PENDING
Allow admin to be added as collaborator:
```typescript
// src/app/api/courses/[id]/collaborators/route.ts:137
// src/app/api/modules/[id]/collaborators/route.ts:136

// Before
if (userToAdd.role !== 'faculty') {
  return NextResponse.json({ error: 'Only faculty can be collaborators' })
}

// After
import { roleHasFacultyAccess } from '@/lib/auth/utils'

if (!roleHasFacultyAccess(userToAdd.role)) {
  return NextResponse.json({ error: 'Only faculty or admin can be collaborators' })
}
```

---

## Testing Checklist

### Manual Testing Required

After all fixes are implemented, test as admin user:

#### Faculty Pages Access
- [ ] `/faculty/dashboard` - Dashboard loads and shows stats
- [ ] `/faculty/modules` - Module list shows admin's modules
- [ ] `/faculty/modules/create` - Can create new module
- [ ] `/faculty/modules/edit/[id]` - Can edit existing module (TEST ELEGANT TABS HERE!)
- [ ] `/faculty/modules/[id]` - Module details page loads
- [ ] `/faculty/courses` - Course list shows admin's courses
- [ ] `/faculty/courses/create` - Can create new course
- [ ] `/faculty/courses/edit/[id]` - Can edit existing course (TEST ELEGANT TABS HERE!)
- [ ] `/faculty/visualization` - Visualization page loads

#### API Operations (via UI)
- [ ] Create new module - POST `/api/modules`
- [ ] Update module - PUT `/api/modules/[id]`
- [ ] Delete module - DELETE `/api/modules/[id]`
- [ ] Clone module - POST `/api/modules/[id]/clone`
- [ ] Create new course - POST `/api/courses`
- [ ] Update course - PUT `/api/courses/[id]`
- [ ] Delete course - DELETE `/api/courses/[id]`
- [ ] Add module to course - POST `/api/courses/[id]/modules/[moduleId]`
- [ ] Remove module from course - DELETE `/api/courses/[id]/modules/[moduleId]`
- [ ] Upload media - POST `/api/media/upload`
- [ ] Add collaborator to module - POST `/api/modules/[id]/collaborators`
- [ ] Remove collaborator from module - DELETE `/api/modules/[id]/collaborators/[userId]`
- [ ] Add collaborator to course - POST `/api/courses/[id]/collaborators`
- [ ] Remove collaborator from course - DELETE `/api/courses/[id]/collaborators/[userId]`
- [ ] View course activity - GET `/api/courses/[id]/activity`
- [ ] View module activity - GET `/api/modules/[id]/activity`

#### UI Components
- [ ] Header shows faculty navigation items
- [ ] User dropdown shows "Dashboard" and "My Modules"
- [ ] Module catalog shows "Create Module" button
- [ ] Module catalog shows "Clone" button on module cards
- [ ] Profile view shows correct edit link for admin
- [ ] Profile view shows courses for admin (if any)
- [ ] Search results show admin with course/module counts
- [ ] Faculty search includes admin users

### Automated Testing (Future)
Consider adding integration tests:
```typescript
describe('Admin Faculty Access', () => {
  it('should allow admin to access faculty dashboard', async () => {
    // Mock admin session
    // Visit /faculty/dashboard
    // Assert page loads without redirect
  })

  it('should allow admin to create module via API', async () => {
    // Mock admin session
    // POST /api/modules
    // Assert 200 response
  })
})
```

---

## Verification Steps

### 1. Code Review Checklist
- [ ] No remaining inline `role === 'faculty'` checks (except in special cases)
- [ ] All faculty page guards use `hasFacultyAccess()`
- [ ] All API routes use `hasFacultyAccess()`
- [ ] Helper functions properly imported in all files
- [ ] Collaborator validation updated to allow admin

### 2. Regression Testing
Ensure faculty users still work:
- [ ] Faculty can access all faculty pages
- [ ] Faculty can perform all API operations
- [ ] Faculty UI shows correctly
- [ ] Faculty collaborations work

### 3. Security Audit
- [ ] Admin cannot access student-only routes
- [ ] Students cannot access faculty routes (even with middleware fix)
- [ ] Pending faculty still blocked from faculty features
- [ ] Role checks are consistent across frontend and backend

---

## Rollback Plan

If issues arise:

1. **Revert Helper Function Changes**
   ```bash
   git revert <commit-hash>
   ```

2. **Emergency Hotfix**
   - Middleware already allows admin to faculty routes
   - Can temporarily add `|| session.user.role === 'admin'` to critical files
   - Schedule proper fix for next release

3. **Alternative: Disable Admin Faculty Access**
   - Revert middleware change
   - Admin goes back to admin-only features
   - Create separate content-creator faculty account

---

## Success Criteria

✅ **Fix is successful when:**
1. Admin user can access ALL faculty features (pages, APIs, UI)
2. No inline `role === 'faculty'` checks remain (except special cases)
3. All helper functions are consistently used
4. Manual testing checklist 100% passed
5. No regressions for faculty or student roles
6. Code is maintainable (easy to add new roles in future)

---

## Files Modified

### Phase 1 (Completed)
- `src/lib/auth/utils.ts` - Added helper functions
- `src/components/Header.tsx` - Fixed navigation and dropdown
- `src/components/public/module-catalog.tsx` - Fixed create button
- `src/app/api/modules/route.ts` - Fixed 2 locations
- `src/middleware.ts` - Allow admin on faculty routes + callback URL fix

### Phase 2 (In Progress)
- 9 faculty page guard files
- 29 API route files
- 4 UI component files
- 2 collaborator validation files

**Total Files to Modify:** ~45 files

---

## Notes

- This fix is necessary because the current approach (inline checks) is not maintainable
- Using helper functions makes it easy to add new roles in the future
- All changes should be backward compatible (faculty access unchanged)
- Consider adding ESLint rule to prevent future inline role checks

---

**Last Updated:** 2025-01-16
**Next Review:** After Phase 6 completion
