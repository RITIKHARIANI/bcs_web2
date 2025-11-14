# Clone Feature Testing Scenarios

**Feature**: Module Cloning with Enhanced Discoverability
**Date**: January 2025
**Test Environment**: Development (bcs-web2.vercel.app)

---

## Test Scenarios Overview

| ID | Scenario | User Type | Page | Expected Result |
|----|----------|-----------|------|-----------------|
| TC-01 | View clone button on public catalog | Faculty | `/modules` | Clone button visible |
| TC-02 | Public user cannot see clone button | Public | `/modules` | Clone button hidden |
| TC-03 | Clone from public catalog | Faculty | `/modules` | Module cloned successfully |
| TC-04 | Clone from My Modules | Faculty | `/faculty/modules` (My Modules tab) | Module cloned successfully |
| TC-05 | Clone from Shared With Me | Faculty | `/faculty/modules` (Shared tab) | Module cloned successfully |
| TC-06 | Browse Public Modules CTA | Faculty | `/faculty/modules` | Navigates to `/modules` |
| TC-07 | Clone dialog validation | Faculty | Any | Cannot submit without title |
| TC-08 | Clone with media | Faculty | Any | Media associations copied |
| TC-09 | Clone without media | Faculty | Any | Media not copied |
| TC-10 | Clone with collaborators | Faculty | Any | Collaborators copied |
| TC-11 | Clone without collaborators | Faculty | Any | Collaborators not copied |
| TC-12 | Unique slug generation | Faculty | Any | Slug auto-generated as "original-copy" |
| TC-13 | Database verification | Faculty | Any | Correct data in DB |
| TC-14 | Clone count increment | Faculty | Any | Original module clone_count incremented |

---

## Detailed Test Cases

### TC-01: View Clone Button on Public Catalog (Faculty User)

**Preconditions:**
- User is logged in as faculty
- Public modules exist in the database
- User navigates to `/modules`

**Steps:**
1. Navigate to https://bcs-web2.vercel.app/modules
2. Scroll to "All Modules" section
3. Locate any module card

**Expected Results:**
- Each module card shows TWO buttons:
  - "View" button (outline style)
  - "Clone" button (neural style with Copy icon)
- Both buttons are visible and clickable
- Layout is responsive (stacks on mobile)

**Database Checks:**
- N/A (read-only operation)

**MCP Playwright Commands:**
```javascript
// Navigate and verify buttons
await page.goto('https://bcs-web2.vercel.app/modules');
await page.waitForSelector('[data-testid="module-card"]'); // or similar selector
const cloneButtons = await page.locator('button:has-text("Clone")');
expect(await cloneButtons.count()).toBeGreaterThan(0);
```

---

### TC-02: Public User Cannot See Clone Button

**Preconditions:**
- User is NOT logged in
- User navigates to `/modules`

**Steps:**
1. Clear cookies/logout if needed
2. Navigate to https://bcs-web2.vercel.app/modules
3. Locate any module card

**Expected Results:**
- Each module card shows ONLY ONE button:
  - "Explore Module" button
- NO clone button visible
- Public users cannot access cloning functionality

**Database Checks:**
- N/A (read-only operation)

**MCP Playwright Commands:**
```javascript
// Verify no clone buttons for public users
await page.goto('https://bcs-web2.vercel.app/modules');
const cloneButtons = await page.locator('button:has-text("Clone")');
expect(await cloneButtons.count()).toBe(0);
```

---

### TC-03: Clone from Public Catalog

**Preconditions:**
- User is logged in as faculty (ritikh2@illinois.edu / Test234!)
- Public modules exist
- User is on `/modules`

**Test Data:**
- Original module: Any published public module
- New title: "Test Clone from Public Catalog"
- Clone media: TRUE
- Clone collaborators: FALSE

**Steps:**
1. Navigate to `/modules`
2. Click "Clone" button on any module card
3. Verify clone dialog opens
4. Observe pre-filled title: "{Original Title} (Copy)"
5. Change title to "Test Clone from Public Catalog"
6. Verify "Clone media" checkbox is checked
7. Verify "Clone collaborators" checkbox is unchecked
8. Click "Clone Module" button
9. Wait for toast notification: "Module cloned successfully!"
10. Verify navigation to `/faculty/modules/{new-module-id}`

**Expected Results:**
- Clone dialog opens immediately
- Title is pre-filled correctly
- Clone button disabled until title is non-empty
- After cloning, user is navigated to new module viewer
- Toast shows success message

**Database Checks (Supabase MCP):**
```sql
-- 1. Verify new module exists
SELECT id, title, slug, status, visibility, cloned_from, author_id
FROM modules
WHERE title = 'Test Clone from Public Catalog';

-- Expected:
-- - status = 'draft'
-- - visibility = 'private'
-- - cloned_from = {original_module_id}
-- - author_id = {current_user_id}
-- - slug LIKE '%copy%'

-- 2. Verify media copied (if original had media)
SELECT COUNT(*)
FROM module_media
WHERE module_id = (SELECT id FROM modules WHERE title = 'Test Clone from Public Catalog');

-- Expected: Count > 0 if original had media

-- 3. Verify collaborators NOT copied
SELECT COUNT(*)
FROM module_collaborators
WHERE module_id = (SELECT id FROM modules WHERE title = 'Test Clone from Public Catalog');

-- Expected: Count = 0

-- 4. Verify original module clone_count incremented
SELECT clone_count
FROM modules
WHERE id = {original_module_id};

-- Expected: Previous count + 1
```

**MCP Playwright Commands:**
```javascript
// Login as faculty
await page.goto('https://bcs-web2.vercel.app/auth/login');
await page.fill('input[name="email"]', 'ritikh2@illinois.edu');
await page.fill('input[name="password"]', 'Test234!');
await page.click('button[type="submit"]');

// Navigate to modules
await page.goto('https://bcs-web2.vercel.app/modules');

// Click first clone button
await page.click('button:has-text("Clone")').first();

// Fill dialog
await page.waitForSelector('input#new-title');
await page.fill('input#new-title', 'Test Clone from Public Catalog');

// Click clone button
await page.click('button:has-text("Clone Module")');

// Wait for navigation
await page.waitForURL(/\/faculty\/modules\/.+/);

// Verify toast
await page.waitForSelector('text=Module cloned successfully!');
```

---

### TC-04: Clone from My Modules Tab

**Preconditions:**
- User is logged in as faculty
- User has at least one authored module
- User is on `/faculty/modules` (My Modules tab)

**Test Data:**
- Original module: User's own module
- New title: "Test Clone from My Modules"
- Clone media: TRUE
- Clone collaborators: FALSE

**Steps:**
1. Navigate to `/faculty/modules`
2. Verify "My Modules" tab is active
3. Locate a module card
4. Click the Copy icon button (outline style, icon-only)
5. Verify clone dialog opens
6. Change title to "Test Clone from My Modules"
7. Click "Clone Module" button

**Expected Results:**
- Copy button visible on all module cards
- Clone dialog opens on click
- Cloning works identically to public catalog

**Database Checks:**
```sql
-- Verify cloned module exists
SELECT id, title, slug, status, visibility, cloned_from, author_id
FROM modules
WHERE title = 'Test Clone from My Modules'
  AND author_id = {current_user_id};

-- Expected: Same as TC-03
```

---

### TC-05: Clone from Shared With Me Tab

**Preconditions:**
- User is logged in as faculty
- User has at least one shared module (collaborator on another faculty's module)
- User is on `/faculty/modules` (Shared With Me tab)

**Test Data:**
- Original module: Module shared with user
- New title: "Test Clone from Shared Module"
- Clone media: TRUE
- Clone collaborators: TRUE (to test difference)

**Steps:**
1. Navigate to `/faculty/modules`
2. Click "Shared With Me" tab
3. Locate a shared module card
4. Click the Copy icon button
5. Verify clone dialog opens
6. Change title to "Test Clone from Shared Module"
7. Check "Clone collaborators" checkbox
8. Click "Clone Module" button

**Expected Results:**
- Copy button visible on shared module cards
- Cloning creates new module owned by current user
- Original collaborators are copied to new module

**Database Checks:**
```sql
-- 1. Verify cloned module
SELECT id, title, author_id, cloned_from
FROM modules
WHERE title = 'Test Clone from Shared Module';

-- Expected: author_id = current_user_id

-- 2. Verify collaborators copied
SELECT user_id, added_by
FROM module_collaborators
WHERE module_id = (SELECT id FROM modules WHERE title = 'Test Clone from Shared Module');

-- Expected: Same collaborators as original, added_by = current_user_id
```

---

### TC-06: Browse Public Modules CTA

**Preconditions:**
- User is logged in as faculty
- User is on `/faculty/modules`

**Steps:**
1. Navigate to `/faculty/modules`
2. Locate "Browse Public Modules" button in header (next to "Create Module")
3. Click the button

**Expected Results:**
- Button is visible and styled with outline variant
- Clicking navigates to `/modules`
- User sees public catalog with clone buttons (because they're faculty)

**MCP Playwright Commands:**
```javascript
await page.goto('https://bcs-web2.vercel.app/faculty/modules');
await page.click('button:has-text("Browse Public Modules")');
await page.waitForURL('https://bcs-web2.vercel.app/modules');
```

---

### TC-07: Clone Dialog Validation

**Preconditions:**
- User is logged in as faculty
- Clone dialog is open

**Steps:**
1. Open clone dialog from any location
2. Clear the title field (if pre-filled)
3. Attempt to click "Clone Module" button

**Expected Results:**
- "Clone Module" button is DISABLED when title is empty
- Button is ENABLED when title has content
- Validation prevents submission with empty title

**MCP Playwright Commands:**
```javascript
// Open dialog
await page.click('button:has-text("Clone")').first();

// Clear title
await page.fill('input#new-title', '');

// Verify button disabled
const cloneBtn = page.locator('button:has-text("Clone Module")');
expect(await cloneBtn.isDisabled()).toBe(true);

// Fill title
await page.fill('input#new-title', 'Valid Title');

// Verify button enabled
expect(await cloneBtn.isDisabled()).toBe(false);
```

---

### TC-08: Clone with Media Associations

**Preconditions:**
- User is logged in as faculty
- Original module has media files attached (images, PDFs, etc.)

**Test Data:**
- Original module: Module with 2+ media files
- Clone media: TRUE (checked)

**Steps:**
1. Clone a module with media associations
2. Verify "Clone media associations" is checked by default
3. Complete cloning

**Expected Results:**
- Media associations are copied to new module
- Media files themselves are NOT duplicated (only associations)

**Database Checks:**
```sql
-- 1. Get original module media
SELECT media_file_id
FROM module_media
WHERE module_id = {original_module_id};

-- 2. Verify cloned module has same media
SELECT media_file_id
FROM module_media
WHERE module_id = (SELECT id FROM modules WHERE title = 'Cloned Module Title');

-- Expected: Same media_file_id values (associations copied, not files)
```

---

### TC-09: Clone without Media Associations

**Preconditions:**
- User is logged in as faculty
- Original module has media files attached

**Test Data:**
- Clone media: FALSE (unchecked)

**Steps:**
1. Open clone dialog
2. Uncheck "Clone media associations" checkbox
3. Complete cloning

**Expected Results:**
- New module has NO media associations
- Content is copied but media is not

**Database Checks:**
```sql
-- Verify no media associations
SELECT COUNT(*)
FROM module_media
WHERE module_id = (SELECT id FROM modules WHERE title = 'Cloned Module No Media');

-- Expected: 0
```

---

### TC-10: Clone with Collaborators

**Preconditions:**
- Original module has collaborators (other faculty members)

**Test Data:**
- Clone collaborators: TRUE (checked)

**Steps:**
1. Open clone dialog
2. Check "Clone collaborators" checkbox
3. Complete cloning

**Expected Results:**
- Collaborators are copied to new module
- Current user is NOT added as collaborator (they're the author)
- `added_by` field shows current user

**Database Checks:**
```sql
-- Verify collaborators copied
SELECT user_id, added_by
FROM module_collaborators
WHERE module_id = (SELECT id FROM modules WHERE title = 'Cloned With Collabs');

-- Expected: Same user_id values as original, added_by = current_user_id
```

---

### TC-11: Clone without Collaborators

**Preconditions:**
- Original module has collaborators

**Test Data:**
- Clone collaborators: FALSE (unchecked, default)

**Steps:**
1. Open clone dialog
2. Verify "Clone collaborators" is unchecked by default
3. Complete cloning

**Expected Results:**
- New module has NO collaborators
- Only author is current user

**Database Checks:**
```sql
-- Verify no collaborators
SELECT COUNT(*)
FROM module_collaborators
WHERE module_id = (SELECT id FROM modules WHERE title = 'Cloned No Collabs');

-- Expected: 0
```

---

### TC-12: Unique Slug Generation

**Preconditions:**
- Original module has slug "neural-networks"

**Test Data:**
- First clone: Should get "neural-networks-copy"
- Second clone: Should get "neural-networks-copy-1"
- Third clone: Should get "neural-networks-copy-2"

**Steps:**
1. Clone the same module 3 times
2. Verify each gets a unique slug

**Expected Results:**
- Slugs are unique and incremented
- No slug conflicts

**Database Checks:**
```sql
-- Verify unique slugs
SELECT slug, cloned_from
FROM modules
WHERE cloned_from = {original_module_id}
ORDER BY created_at;

-- Expected:
-- neural-networks-copy
-- neural-networks-copy-1
-- neural-networks-copy-2
```

---

### TC-13: Database Integrity Check

**Comprehensive database verification after multiple clones**

**Database Checks:**
```sql
-- 1. Verify all cloned modules have correct fields
SELECT
  id,
  title,
  slug,
  status,
  visibility,
  cloned_from,
  author_id,
  created_at
FROM modules
WHERE cloned_from IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Expected for each:
-- - status = 'draft'
-- - visibility = 'private'
-- - cloned_from = original module ID
-- - author_id = user who cloned it

-- 2. Verify clone counts
SELECT
  m1.id,
  m1.title,
  m1.clone_count,
  COUNT(m2.id) AS actual_clones
FROM modules m1
LEFT JOIN modules m2 ON m2.cloned_from = m1.id
WHERE m1.clone_count > 0
GROUP BY m1.id, m1.title, m1.clone_count;

-- Expected: clone_count = actual_clones

-- 3. Verify no orphaned module_media
SELECT mm.*
FROM module_media mm
LEFT JOIN modules m ON mm.module_id = m.id
WHERE m.id IS NULL;

-- Expected: 0 rows

-- 4. Verify no orphaned module_collaborators
SELECT mc.*
FROM module_collaborators mc
LEFT JOIN modules m ON mc.module_id = m.id
WHERE m.id IS NULL;

-- Expected: 0 rows
```

---

### TC-14: Clone Count Increment

**Preconditions:**
- Original module exists with clone_count = 0

**Steps:**
1. Record original clone_count
2. Clone the module
3. Verify clone_count incremented

**Database Checks:**
```sql
-- Before cloning
SELECT clone_count FROM modules WHERE id = {original_id};
-- Record this value (e.g., 0)

-- After cloning
SELECT clone_count FROM modules WHERE id = {original_id};
-- Expected: Previous value + 1
```

---

## Test Execution Plan

### Phase 1: Smoke Tests (Quick Verification)
1. TC-01: Faculty sees clone button
2. TC-02: Public user doesn't see clone button
3. TC-06: Browse Public Modules CTA works

### Phase 2: Core Functionality
1. TC-03: Clone from public catalog
2. TC-04: Clone from My Modules
3. TC-05: Clone from Shared With Me
4. TC-07: Dialog validation

### Phase 3: Advanced Features
1. TC-08: Clone with media
2. TC-09: Clone without media
3. TC-10: Clone with collaborators
4. TC-11: Clone without collaborators

### Phase 4: Edge Cases
1. TC-12: Unique slug generation (multiple clones)
2. TC-13: Database integrity
3. TC-14: Clone count accuracy

---

## Test Environment

**URLs:**
- Development: https://bcs-web2.vercel.app
- Production: https://www.brainandcognitivescience.com (deploy after testing)

**Test Credentials:**
- Faculty: ritikh2@illinois.edu / Test234!

**Database:**
- Development Supabase project (bcs-dev)

**Tools:**
- MCP Playwright: Browser automation
- MCP Supabase: Database verification

---

## Success Criteria

✅ All test cases pass
✅ No console errors
✅ Database integrity maintained
✅ Clone count accurately tracked
✅ No orphaned records
✅ Performance acceptable (<2s per clone)
✅ UI responsive on mobile/desktop

---

## Rollback Plan

If critical issues found:
1. Document the issue
2. Revert commit: `git revert {commit-hash}`
3. Push revert
4. Investigate offline
5. Fix and re-deploy

---

## Notes

- Test on both Chrome and Safari if possible
- Clear browser cache between tests if needed
- Use incognito/private mode to test as public user
- Take screenshots of failures for debugging
