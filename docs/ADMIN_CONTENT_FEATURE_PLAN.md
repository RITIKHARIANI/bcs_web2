# Admin Content Management Feature Plan

## Overview
The Admin Content feature provides centralized management of all courses and modules across the platform. It allows administrators to oversee, edit, and maintain content quality at scale.

---

## User Stories

### As an Administrator, I want to:
1. **View all content** - See all courses and modules across the platform in one place
2. **Search & filter** - Quickly find specific content by title, author, status, tags
3. **Manage content lifecycle** - Publish, unpublish, or archive content
4. **Monitor quality** - Review drafts, flag issues, ensure content standards
5. **Perform bulk operations** - Update multiple items at once (tags, status, etc.)
6. **View analytics** - See usage statistics and engagement metrics
7. **Transfer ownership** - Reassign courses/modules to different faculty

---

## Feature Components

### 1. Content Dashboard (`/admin/content`)

**Overview Stats** (Top Cards):
- Total Courses (Published / Draft / Archived)
- Total Modules (Published / Draft / Standalone)
- Active Faculty Contributors
- Content Activity (Last 7 days)

**Recent Activity Feed**:
- Recently published content
- Recently updated content
- Pending reviews (if approval workflow exists)

**Quick Actions**:
- Create new course (as admin)
- Create new module (as admin)
- View reports
- Export content list

---

### 2. Courses Management Tab

**Features**:
- **Table View** with columns:
  - Title (with thumbnail)
  - Author / Collaborators
  - Status (Published / Draft / Archived)
  - Modules Count
  - Enrolled Students
  - Last Updated
  - Tags
  - Actions (Edit, View, Delete, Transfer)

- **Filters**:
  - Status (All / Published / Draft / Archived)
  - Author (Dropdown of all faculty)
  - Tags (Multi-select)
  - Date range (Created / Updated)
  - Featured (Yes / No)

- **Search**:
  - Full-text search across title, description, content

- **Bulk Actions**:
  - Select multiple courses
  - Publish / Unpublish selected
  - Add/remove tags
  - Archive / Restore
  - Export metadata

- **Individual Actions**:
  - Edit (opens course editor)
  - Preview (view as student)
  - Analytics (view detailed stats)
  - Transfer Ownership (reassign to different faculty)
  - Delete (with confirmation)
  - Duplicate (create copy)

---

### 3. Modules Management Tab

**Features**:
- **Table View** with columns:
  - Title (with type badge: Standard/Challenge/Boss)
  - Author
  - Status (Published / Draft)
  - Used In (List of courses)
  - Type (Standard / Standalone)
  - Difficulty (Beginner / Intermediate / Advanced / Boss)
  - XP Reward
  - Last Updated
  - Actions

- **Filters**:
  - Status (Published / Draft)
  - Type (All / Standalone / In Courses)
  - Difficulty level
  - Quest type
  - Author
  - Date range

- **Search**:
  - Full-text search

- **Bulk Actions**:
  - Publish / Unpublish
  - Update difficulty
  - Update XP rewards
  - Archive
  - Export

- **Individual Actions**:
  - Edit module
  - Preview
  - View courses using this module
  - Transfer ownership
  - Delete (with warning if used in courses)
  - Duplicate

---

### 4. Content Review Tab (Optional - Future)

**For Quality Control**:
- Pending drafts awaiting review
- Flagged content (by users or automated checks)
- Content without proper tags/metadata
- Orphaned modules (not in any course)
- Outdated content (not updated in X months)

**Review Actions**:
- Approve / Request changes
- Add notes/comments
- Contact author
- Assign reviewer

---

## Database Schema Updates

### Existing Tables (Already have):
- `courses` - Has status, tags, featured
- `modules` - Has status, difficulty, quest_type
- `course_collaborators` - For ownership tracking

### Potential New Fields:
```sql
-- Add to courses table
ALTER TABLE courses ADD COLUMN archived_at TIMESTAMP;
ALTER TABLE courses ADD COLUMN review_status VARCHAR(50); -- 'approved', 'pending', 'rejected'
ALTER TABLE courses ADD COLUMN admin_notes TEXT;

-- Add to modules table
ALTER TABLE modules ADD COLUMN archived_at TIMESTAMP;
ALTER TABLE modules ADD COLUMN review_status VARCHAR(50);
ALTER TABLE modules ADD COLUMN admin_notes TEXT;

-- New table for content transfer history
CREATE TABLE content_ownership_history (
  id TEXT PRIMARY KEY,
  content_type VARCHAR(20), -- 'course' or 'module'
  content_id TEXT,
  previous_owner_id TEXT,
  new_owner_id TEXT,
  transferred_by TEXT, -- admin user id
  transferred_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);

-- New table for admin actions log
CREATE TABLE content_admin_actions (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  action_type VARCHAR(50), -- 'publish', 'archive', 'delete', 'transfer', etc.
  content_type VARCHAR(20),
  content_id TEXT,
  details JSON,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Courses Management
- `GET /api/admin/content/courses` - List all courses (with filters, pagination, search)
- `GET /api/admin/content/courses/stats` - Get course statistics
- `PUT /api/admin/content/courses/:id/status` - Change course status
- `PUT /api/admin/content/courses/:id/transfer` - Transfer ownership
- `POST /api/admin/content/courses/bulk` - Bulk operations
- `DELETE /api/admin/content/courses/:id` - Delete course (admin override)

### Modules Management
- `GET /api/admin/content/modules` - List all modules (with filters, pagination)
- `GET /api/admin/content/modules/stats` - Get module statistics
- `GET /api/admin/content/modules/:id/usage` - See which courses use this module
- `PUT /api/admin/content/modules/:id/status` - Change module status
- `PUT /api/admin/content/modules/:id/transfer` - Transfer ownership
- `POST /api/admin/content/modules/bulk` - Bulk operations
- `DELETE /api/admin/content/modules/:id` - Delete module (admin override)

### Analytics
- `GET /api/admin/content/analytics/overview` - Dashboard stats
- `GET /api/admin/content/analytics/activity` - Recent activity feed
- `GET /api/admin/content/analytics/export` - Export content metadata

---

## UI Components to Create

### Pages
1. `/admin/content/page.tsx` - Main content management page
2. `/admin/content/courses/page.tsx` - Courses tab (optional separate route)
3. `/admin/content/modules/page.tsx` - Modules tab (optional separate route)

### Components
1. `ContentDashboard.tsx` - Overview dashboard with stats cards
2. `CoursesTable.tsx` - Courses management table
3. `ModulesTable.tsx` - Modules management table
4. `ContentFilters.tsx` - Shared filter component
5. `BulkActionsBar.tsx` - Bulk actions toolbar
6. `TransferOwnershipDialog.tsx` - Modal for transferring content
7. `ContentAnalytics.tsx` - Analytics charts and stats
8. `ActivityFeed.tsx` - Recent content activity
9. `ContentActionMenu.tsx` - Dropdown menu for individual item actions

---

## Implementation Phases

### Phase 1: Basic Content Listing (MVP)
**Goal**: View all courses and modules in admin dashboard

**Tasks**:
1. Create `/admin/content/page.tsx` with tab navigation
2. Create `CoursesTable.tsx` - basic table listing all courses
3. Create `ModulesTable.tsx` - basic table listing all modules
4. Add API endpoint `GET /api/admin/content/courses`
5. Add API endpoint `GET /api/admin/content/modules`
6. Add search functionality
7. Add basic filters (status, author)
8. Update admin navigation to enable Content link

**Estimated Effort**: 2-3 hours

---

### Phase 2: Content Actions
**Goal**: Enable editing, publishing, deleting content

**Tasks**:
1. Add Edit action (link to existing editor)
2. Add Preview action (open in new tab)
3. Add Publish/Unpublish action
4. Add Delete action with confirmation modal
5. Add API endpoints for status changes
6. Add success/error toast notifications

**Estimated Effort**: 2 hours

---

### Phase 3: Bulk Operations
**Goal**: Allow batch updates on multiple items

**Tasks**:
1. Add checkbox selection to tables
2. Create `BulkActionsBar.tsx` component
3. Implement bulk publish/unpublish
4. Implement bulk tag updates
5. Add API endpoint for bulk operations
6. Add progress indicator for bulk operations

**Estimated Effort**: 2 hours

---

### Phase 4: Advanced Features
**Goal**: Analytics, transfer, and quality tools

**Tasks**:
1. Add Content Dashboard with stats
2. Create analytics charts (engagement, completion rates)
3. Implement transfer ownership feature
4. Add admin notes field
5. Create content audit trail
6. Add export functionality (CSV/JSON)

**Estimated Effort**: 3-4 hours

---

## Security Considerations

1. **Authorization**:
   - ALL content endpoints must check `session.user.role === 'admin'`
   - Use `hasFacultyAccess` helper but verify admin role separately
   - Log all admin actions for audit trail

2. **Data Validation**:
   - Validate all input parameters
   - Prevent SQL injection with Prisma
   - Sanitize user inputs

3. **Deletion Safety**:
   - Soft delete (set archived_at) instead of hard delete
   - Check for dependencies (enrolled students, etc.)
   - Require confirmation for destructive actions

4. **Ownership Transfer**:
   - Verify new owner has faculty role
   - Notify both old and new owner via email
   - Log transfer in audit trail

---

## Testing Checklist

- [ ] Admin can view all courses and modules
- [ ] Search functionality works correctly
- [ ] Filters work correctly (status, author, tags, date)
- [ ] Pagination works for large datasets
- [ ] Edit action opens course/module editor
- [ ] Publish/unpublish updates status correctly
- [ ] Delete requires confirmation and works
- [ ] Bulk select works across pages
- [ ] Bulk operations update multiple items
- [ ] Non-admin users cannot access these endpoints
- [ ] Faculty users cannot access admin content page
- [ ] Transfer ownership updates author correctly
- [ ] Analytics show correct data
- [ ] Export generates correct file format

---

## Future Enhancements

1. **Content Templates**:
   - Create course/module templates
   - Import/export content packages

2. **Version Control**:
   - Track content changes over time
   - Restore previous versions

3. **Approval Workflow**:
   - Faculty submits content for review
   - Admin approves/rejects with feedback
   - Auto-publish on approval

4. **Content Insights**:
   - Popular courses/modules
   - Engagement analytics
   - Completion rate tracking
   - Student feedback summary

5. **Content Recommendations**:
   - Suggest related courses
   - Identify content gaps
   - Recommend prerequisite updates

6. **Automated Quality Checks**:
   - Check for broken links
   - Validate media files exist
   - Check for missing metadata
   - Grammar/spelling checks

---

## Questions to Clarify

1. **Permissions**: Should admins be able to edit faculty content directly, or only manage metadata/status?
2. **Deletion**: Should we implement soft delete (archive) or hard delete?
3. **Notifications**: Should faculty be notified when admins modify their content?
4. **Approval**: Is there a content approval workflow needed, or can faculty publish directly?
5. **Analytics**: What specific metrics are most important to track?

---

## Recommendation: Start with Phase 1

**Why**:
- Delivers immediate value (visibility into all content)
- Establishes foundation for future phases
- Low risk, high impact
- Can be completed quickly (2-3 hours)

**Next Steps**:
1. Review and approve this plan
2. Clarify any questions above
3. Begin implementation of Phase 1
4. Deploy and gather feedback
5. Iterate with Phase 2

---

**Last Updated**: November 21, 2025
**Status**: Planning - Awaiting Approval
