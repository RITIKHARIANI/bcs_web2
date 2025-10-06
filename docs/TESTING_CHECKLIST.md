# 🧪 BCS E-Textbook Platform - Comprehensive Testing Checklist

**Version**: 2.0.0
**Last Updated**: January 2025
**Tester**: _______________
**Test Date**: _______________
**Environment**: □ Development □ Production

---

## Testing Instructions

1. ✅ Complete each test scenario in order
2. 📝 Fill in **Actual Result** after testing
3. ✔️ Mark **Status** as Pass/Fail/NA (Not Applicable)
4. 💬 Add **Notes** for any issues or observations
5. 🐛 Create GitHub issues for any failures

---

## Test Summary

| Category | Total Tests | Passed | Failed | NA |
|----------|-------------|--------|--------|-----|
| Authentication | 7 | ___ | ___ | ___ |
| Faculty Dashboard | 8 | ___ | ___ | ___ |
| User Profiles | 5 | ___ | ___ | ___ |
| Course Catalog | 6 | ___ | ___ | ___ |
| Course & Module Viewing | 7 | ___ | ___ | ___ |
| Playgrounds | 6 | ___ | ___ | ___ |
| Network Visualization | 3 | ___ | ___ | ___ |
| API Endpoints | 5 | ___ | ___ | ___ |
| Performance & Accessibility | 6 | ___ | ___ | ___ |
| Error Handling | 5 | ___ | ___ | ___ |
| **TOTAL** | **58** | **___** | **___** | **___** |

---

# 1. Authentication & Authorization

## TEST-AUTH-001: User Registration

**Feature**: User Registration
**Priority**: Critical

### Test Steps:
1. Navigate to `/auth/register`
2. Fill in registration form:
   - Name: "Test Faculty"
   - Email: "test@university.edu"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
   - Role: Faculty
3. Click "Create Account"

### Expected Result:
- ✅ User account created successfully
- ✅ Redirected to email verification page
- ✅ Verification email sent (check email inbox)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-AUTH-002: Email Verification

**Feature**: Email Verification
**Priority**: Critical

### Prerequisites:
- Completed TEST-AUTH-001

### Test Steps:
1. Check email inbox for verification email
2. Click verification link or copy token
3. Navigate to `/auth/verify-email?token=<token>`

### Expected Result:
- ✅ Email verified successfully
- ✅ Success message displayed
- ✅ Can now login

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-AUTH-003: User Login

**Feature**: Login
**Priority**: Critical

### Prerequisites:
- Completed TEST-AUTH-002 (verified account)

### Test Steps:
1. Navigate to `/auth/login`
2. Enter credentials:
   - Email: "test@university.edu"
   - Password: "SecurePass123!"
3. Click "Sign In"

### Expected Result:
- ✅ Login successful
- ✅ Redirected to faculty dashboard
- ✅ Session created (check browser cookies)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-AUTH-004: Invalid Login

**Feature**: Login Error Handling
**Priority**: High

### Test Steps:
1. Navigate to `/auth/login`
2. Enter wrong credentials:
   - Email: "test@university.edu"
   - Password: "WrongPassword"
3. Click "Sign In"

### Expected Result:
- ❌ Login fails
- ✅ Error message: "Invalid credentials"
- ✅ User stays on login page

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-AUTH-005: Forgot Password

**Feature**: Password Reset Request
**Priority**: High

### Test Steps:
1. Navigate to `/auth/forgot-password`
2. Enter email: "test@university.edu"
3. Click "Send Reset Link"

### Expected Result:
- ✅ Success message displayed
- ✅ Password reset email sent
- ✅ Email contains reset token

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-AUTH-006: Password Reset

**Feature**: Password Reset
**Priority**: High

### Prerequisites:
- Completed TEST-AUTH-005

### Test Steps:
1. Get reset token from email
2. Navigate to `/auth/reset-password?token=<token>`
3. Enter new password: "NewSecurePass123!"
4. Confirm new password
5. Click "Reset Password"

### Expected Result:
- ✅ Password updated successfully
- ✅ Redirected to login page
- ✅ Can login with new password

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-AUTH-007: Logout

**Feature**: User Logout
**Priority**: High

### Prerequisites:
- User is logged in

### Test Steps:
1. Click user menu in top-right
2. Click "Logout"

### Expected Result:
- ✅ User logged out
- ✅ Session cleared
- ✅ Redirected to home page or login
- ✅ Cannot access faculty pages without re-login

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 2. Faculty Dashboard

## TEST-FACULTY-001: Dashboard Access

**Feature**: Faculty Dashboard
**Priority**: Critical

### Prerequisites:
- Logged in as faculty

### Test Steps:
1. Navigate to `/faculty/dashboard`

### Expected Result:
- ✅ Dashboard loads successfully
- ✅ Statistics displayed (total courses, modules, etc.)
- ✅ Recent activity shown
- ✅ Quick action buttons visible

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-FACULTY-002: Create Module

**Feature**: Module Creation
**Priority**: Critical

### Prerequisites:
- Logged in as faculty

### Test Steps:
1. Navigate to `/faculty/modules/create`
2. Fill in module form:
   - Title: "Introduction to Cognitive Science"
   - Description: "Overview of key concepts"
   - Content: Add rich text content with formatting
   - Tags: Add "intro", "cognitive-science"
3. Click "Save as Draft"

### Expected Result:
- ✅ Module created successfully
- ✅ Redirected to module list
- ✅ New module appears in list
- ✅ Status shows as "Draft"

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-FACULTY-003: Edit Module

**Feature**: Module Editing
**Priority**: Critical

### Prerequisites:
- At least one module exists (from TEST-FACULTY-002)

### Test Steps:
1. Navigate to `/faculty/modules`
2. Click "Edit" on a module
3. Modify title: "Introduction to Cognitive Science - Updated"
4. Change status to "Published"
5. Click "Save Changes"

### Expected Result:
- ✅ Module updated successfully
- ✅ Changes reflected in module list
- ✅ Status changed to "Published"

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-FACULTY-004: Module Pagination

**Feature**: Module Library Pagination
**Priority**: Medium

### Prerequisites:
- More than 50 modules exist (or adjust test based on count)

### Test Steps:
1. Navigate to `/faculty/modules`
2. Scroll to bottom of page
3. Click "Next" or page number

### Expected Result:
- ✅ Pagination controls visible
- ✅ Shows "Showing X-Y of Z modules"
- ✅ Page navigation works
- ✅ URL updates with ?page=2

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-FACULTY-005: Create Course

**Feature**: Course Creation
**Priority**: Critical

### Prerequisites:
- Logged in as faculty
- At least one published module exists

### Test Steps:
1. Navigate to `/faculty/courses/create`
2. Fill in course form:
   - Title: "Introduction to Brain Sciences"
   - Description: "Comprehensive brain science course"
   - Slug: "intro-brain-sciences"
   - Tags: Add "neuroscience", "beginner"
3. Add modules to course
4. Reorder modules using drag-and-drop
5. Click "Save as Draft"

### Expected Result:
- ✅ Course created successfully
- ✅ Modules added to course
- ✅ Module order saved
- ✅ Appears in course list

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-FACULTY-006: Publish Course

**Feature**: Course Publishing
**Priority**: Critical

### Prerequisites:
- Draft course exists (from TEST-FACULTY-005)

### Test Steps:
1. Navigate to `/faculty/courses`
2. Edit the draft course
3. Change status to "Published"
4. Click "Save Changes"

### Expected Result:
- ✅ Course status changed to "Published"
- ✅ Course now visible on public course catalog
- ✅ Can be accessed via `/courses/[slug]`

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-FACULTY-007: Delete Module

**Feature**: Module Deletion
**Priority**: High

### Prerequisites:
- A draft module exists that's not used in any course

### Test Steps:
1. Navigate to `/faculty/modules`
2. Find a module not in use
3. Click "Delete" button
4. Confirm deletion in modal

### Expected Result:
- ✅ Confirmation modal appears
- ✅ Module deleted after confirmation
- ✅ Removed from module list
- ✅ Cannot delete if module is in a published course

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-FACULTY-008: Media Upload

**Feature**: Media File Upload
**Priority**: High

### Prerequisites:
- Logged in as faculty
- Editing a module

### Test Steps:
1. Navigate to module editor
2. Click "Upload Image" in toolbar
3. Select an image file (PNG, JPG)
4. Wait for upload to complete
5. Insert image into content

### Expected Result:
- ✅ Upload progress shown
- ✅ Image uploaded successfully
- ✅ Image appears in editor
- ✅ Image saved with module

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 3. User Profiles

## TEST-PROFILE-001: View Own Profile

**Feature**: User Profile Display
**Priority**: High

### Prerequisites:
- Logged in as faculty

### Test Steps:
1. Click on user menu
2. Click "View Profile" or navigate to `/profile/[your-user-id]`

### Expected Result:
- ✅ Profile page loads
- ✅ User information displayed (name, email, role, university)
- ✅ "Edit Profile" button visible (own profile)
- ✅ Courses created section shows courses
- ✅ Avatar or initials displayed

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-002: Edit Profile

**Feature**: Profile Editing
**Priority**: High

### Prerequisites:
- Logged in as faculty

### Test Steps:
1. Navigate to `/profile/edit`
2. Update profile fields:
   - About: "Researcher in cognitive neuroscience"
   - Speciality: "Cognitive Neuroscience"
   - University: "University of Illinois"
   - Interested Fields: Add "Memory", "Attention"
   - Avatar URL: (optional - add image URL)
3. Click "Save Changes"

### Expected Result:
- ✅ Profile updated successfully
- ✅ Success message shown
- ✅ Redirected to profile view
- ✅ Changes reflected on profile page

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-003: Profile Validation

**Feature**: Profile Form Validation
**Priority**: Medium

### Test Steps:
1. Navigate to `/profile/edit`
2. Clear the "Name" field
3. Try to save

### Expected Result:
- ❌ Validation error shown
- ✅ "Name is required" message displayed
- ✅ Form not submitted

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-004: View Other User Profile

**Feature**: Public Profile View
**Priority**: Medium

### Prerequisites:
- Another user exists in system

### Test Steps:
1. Navigate to a course created by another user
2. Click on the instructor's name/avatar
3. View their profile

### Expected Result:
- ✅ Other user's profile loads
- ✅ Profile information visible
- ✅ "Edit Profile" button NOT visible
- ✅ Their courses displayed

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-005: Profile Interested Fields

**Feature**: Interested Fields Management
**Priority**: Low

### Test Steps:
1. Navigate to `/profile/edit`
2. Add new interested field: "Neural Networks"
3. Click "Add"
4. Remove an existing field by clicking X
5. Save changes

### Expected Result:
- ✅ New field added to list
- ✅ Field removed when X clicked
- ✅ Changes saved successfully
- ✅ Fields displayed as tags on profile

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 4. Public Course Catalog

## TEST-CATALOG-001: Browse Course Catalog

**Feature**: Course Catalog Display
**Priority**: Critical

### Test Steps:
1. Navigate to `/courses` (as public user or logged in)

### Expected Result:
- ✅ Course catalog page loads
- ✅ Published courses displayed in grid/list view
- ✅ Each course shows: title, description, author, module count
- ✅ Featured courses highlighted
- ✅ View mode toggle (Grid/List) works

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-002: Course Search

**Feature**: Course Search
**Priority**: High

### Test Steps:
1. Navigate to `/courses`
2. Type "brain" in search box
3. Results update in real-time

### Expected Result:
- ✅ Search filters courses by title/description/author
- ✅ Results update as you type
- ✅ Matching courses highlighted
- ✅ "No results" message if no matches

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-003: Featured Filter

**Feature**: Featured Course Filter
**Priority**: Medium

### Test Steps:
1. Navigate to `/courses`
2. Click "Show Featured Only" toggle

### Expected Result:
- ✅ Only featured courses displayed
- ✅ Course count updates
- ✅ Filter can be toggled off

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-004: Course Pagination

**Feature**: Course Catalog Pagination
**Priority**: High

### Prerequisites:
- More than 20 published courses exist

### Test Steps:
1. Navigate to `/courses`
2. Scroll to bottom
3. Click pagination controls (Next, page numbers)

### Expected Result:
- ✅ Pagination controls visible
- ✅ Shows "Showing X-Y of Z courses"
- ✅ 20 courses per page
- ✅ Page navigation works smoothly
- ✅ URL updates with ?page=N

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-005: View Course Details

**Feature**: Course Detail Page
**Priority**: Critical

### Test Steps:
1. Navigate to `/courses`
2. Click on a course card
3. View course details page

### Expected Result:
- ✅ Redirected to `/courses/[slug]`
- ✅ Course overview section displayed
- ✅ Instructor section with avatar shown
- ✅ Module list displayed
- ✅ Breadcrumb navigation present

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-006: Mobile Responsiveness

**Feature**: Mobile Course Catalog
**Priority**: High

### Test Steps:
1. Open `/courses` on mobile device or resize browser to 375px width
2. Test all interactions

### Expected Result:
- ✅ Layout adapts to mobile screen
- ✅ Cards stack vertically
- ✅ Touch targets at least 44px
- ✅ Search bar accessible
- ✅ Pagination usable on mobile

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 5. Course & Module Viewing

## TEST-VIEWING-001: Course Overview Display

**Feature**: Course Overview Section
**Priority**: High

### Test Steps:
1. Navigate to `/courses/[slug]` without selecting a module
2. Verify overview section

### Expected Result:
- ✅ Course Overview card displayed
- ✅ Shows course description
- ✅ Module count displayed
- ✅ Last updated date shown
- ✅ Featured badge if applicable

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-VIEWING-002: Instructor Section Display

**Feature**: Instructor Information
**Priority**: High

### Test Steps:
1. Navigate to `/courses/[slug]` without selecting a module
2. Scroll to instructor section

### Expected Result:
- ✅ Instructor section displayed
- ✅ Instructor avatar/initials shown
- ✅ Name, speciality, university displayed
- ✅ Clicking instructor navigates to their profile

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-VIEWING-003: Module Navigation

**Feature**: Module Selection
**Priority**: Critical

### Test Steps:
1. Navigate to `/courses/[slug]`
2. Click on a module from sidebar
3. Module content loads

### Expected Result:
- ✅ Module content displayed in main area
- ✅ Module highlighted in sidebar
- ✅ URL updates to include module slug
- ✅ Breadcrumb updates
- ✅ Content rendered with proper formatting

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-VIEWING-004: Module Search

**Feature**: Search Within Course
**Priority**: Medium

### Test Steps:
1. Navigate to `/courses/[slug]`
2. Type search term in sidebar search box
3. Modules filter in real-time

### Expected Result:
- ✅ Modules filtered by title/description/content
- ✅ Matching modules shown
- ✅ Non-matching modules hidden
- ✅ Can clear search to see all modules

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-VIEWING-005: Keyboard Navigation

**Feature**: Keyboard Navigation
**Priority**: Medium

### Test Steps:
1. Navigate to `/courses/[slug]` with module selected
2. Press Left Arrow key
3. Press Right Arrow key

### Expected Result:
- ✅ Left arrow goes to previous module
- ✅ Right arrow goes to next module
- ✅ Smooth transition between modules
- ✅ Works at start/end of course

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-VIEWING-006: Share Functionality

**Feature**: Share Course/Module
**Priority**: Low

### Test Steps:
1. Navigate to `/courses/[slug]`
2. Click share button
3. URL copied to clipboard

### Expected Result:
- ✅ Share button visible
- ✅ URL copied successfully
- ✅ Success feedback shown
- ✅ Shared URL includes module if one selected

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-VIEWING-007: Reading Progress

**Feature**: Reading Progress Bar
**Priority**: Low

### Test Steps:
1. Navigate to module with long content
2. Scroll down page
3. Observe progress bar at top

### Expected Result:
- ✅ Progress bar visible at top
- ✅ Fills as you scroll
- ✅ Reaches 100% at bottom
- ✅ Visual feedback while reading

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 6. Interactive Playgrounds

## TEST-PLAYGROUND-001: View Playground

**Feature**: Playground Viewer
**Priority**: High

### Test Steps:
1. Navigate to `/playgrounds`
2. Click on a playground (or direct link `/playgrounds/[id]`)

### Expected Result:
- ✅ Playground loads successfully
- ✅ Controls panel visible on left
- ✅ Visualization canvas on right
- ✅ Initial state rendered

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PLAYGROUND-002: Python Execution

**Feature**: Pyodide Python Runtime
**Priority**: Critical

### Test Steps:
1. Navigate to `/python` or a playground
2. Wait for Python initialization
3. Code executes automatically

### Expected Result:
- ✅ Pyodide loads successfully
- ✅ "Running..." indicator shown
- ✅ Python code executes
- ✅ Output displayed
- ✅ No errors in console

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PLAYGROUND-003: Control Interactions

**Feature**: Interactive Controls
**Priority**: High

### Test Steps:
1. Open a playground with controls
2. Test each control type:
   - Slider: Drag to change value
   - Button: Click to trigger action
   - Dropdown: Select different options
   - Checkbox: Toggle on/off

### Expected Result:
- ✅ Slider updates value in real-time
- ✅ Button triggers correct action
- ✅ Dropdown changes parameters
- ✅ Checkbox toggles state
- ✅ Changes reflected in visualization

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PLAYGROUND-004: Braitenberg Vehicles Demo

**Feature**: Braitenberg Vehicles Simulation
**Priority**: High

### Prerequisites:
- Python playground loaded

### Test Steps:
1. Navigate to Braitenberg vehicle playground
2. Adjust vehicle parameters (speed, sensitivity)
3. Click "Start Simulation"
4. Click "Stop"
5. Click "Reset"

### Expected Result:
- ✅ Vehicles move on canvas
- ✅ Parameters affect behavior
- ✅ Start/Stop/Reset buttons work
- ✅ Smooth animation
- ✅ Canvas clears on reset

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PLAYGROUND-005: Playground Builder

**Feature**: Playground Builder Interface
**Priority**: Medium

### Prerequisites:
- Logged in as faculty

### Test Steps:
1. Navigate to `/playgrounds/builder`
2. Select a template
3. Customize controls
4. Edit code
5. Save playground

### Expected Result:
- ✅ Builder interface loads
- ✅ Templates available
- ✅ Can add/remove/edit controls
- ✅ Code editor functional
- ✅ Save functionality works

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PLAYGROUND-006: Canvas Graphics

**Feature**: Turtle Graphics / Canvas Drawing
**Priority**: Medium

### Test Steps:
1. Open playground with canvas
2. Trigger drawing operations
3. Observe canvas updates

### Expected Result:
- ✅ Canvas renders correctly
- ✅ Graphics draw smoothly
- ✅ Colors and shapes accurate
- ✅ No flickering or artifacts

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 7. Network Visualization

## TEST-NETWORK-001: Course Structure Graph

**Feature**: Course Network Visualization
**Priority**: Medium

### Test Steps:
1. Navigate to `/network`
2. Wait for graph to load

### Expected Result:
- ✅ Graph displays courses and modules as nodes
- ✅ Edges show relationships
- ✅ Layout is readable
- ✅ Can zoom and pan

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-NETWORK-002: Interactive Nodes

**Feature**: Node Interactions
**Priority**: Medium

### Test Steps:
1. Navigate to `/network`
2. Hover over nodes
3. Click on a node
4. Drag nodes to reposition

### Expected Result:
- ✅ Hover shows tooltip with details
- ✅ Click navigates to course/module
- ✅ Nodes can be dragged
- ✅ Layout adjusts dynamically

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-NETWORK-003: Visualization Performance

**Feature**: Large Graph Performance
**Priority**: Low

### Prerequisites:
- Multiple courses and modules exist

### Test Steps:
1. Navigate to `/network`
2. Test interactions with many nodes

### Expected Result:
- ✅ Graph renders in < 5 seconds
- ✅ Smooth interactions
- ✅ No lag when panning/zooming
- ✅ Browser doesn't freeze

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 8. API Endpoints

## TEST-API-001: Health Check

**Feature**: API Health Check
**Priority**: Low

### Test Steps:
1. Send GET request to `/api/health`
2. Check response

### Expected Result:
- ✅ Returns 200 status
- ✅ Response: `{ "status": "ok" }`

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-API-002: Pagination API

**Feature**: API Pagination
**Priority**: High

### Test Steps:
1. Send GET to `/api/courses?page=1&limit=10`
2. Check response structure

### Expected Result:
- ✅ Returns courses array
- ✅ Includes pagination object:
  - `page: 1`
  - `limit: 10`
  - `totalCount: X`
  - `totalPages: Y`

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-API-003: Authentication Required

**Feature**: Protected API Routes
**Priority**: Critical

### Test Steps:
1. Log out
2. Send GET to `/api/modules` without auth
3. Check response

### Expected Result:
- ❌ Returns 401 Unauthorized
- ✅ Error message: "Not authenticated"

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-API-004: CORS Headers

**Feature**: CORS Configuration
**Priority**: Medium

### Test Steps:
1. Check API response headers
2. Verify CORS headers present

### Expected Result:
- ✅ `Access-Control-Allow-Origin` header present
- ✅ `Access-Control-Allow-Methods` header present

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-API-005: Error Handling

**Feature**: API Error Responses
**Priority**: High

### Test Steps:
1. Send invalid request to `/api/courses` (malformed data)
2. Check error response

### Expected Result:
- ✅ Returns appropriate error code (400/422)
- ✅ Error message descriptive
- ✅ No stack traces exposed

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 9. Performance & Accessibility

## TEST-PERF-001: Page Load Performance

**Feature**: Performance Optimization
**Priority**: High

### Test Steps:
1. Open Chrome DevTools > Lighthouse
2. Run performance audit on key pages:
   - Home page
   - Course catalog
   - Course viewer
   - Faculty dashboard
3. Check Core Web Vitals

### Expected Result:
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ FID (First Input Delay) < 100ms
- ✅ CLS (Cumulative Layout Shift) < 0.1
- ✅ Performance score > 80

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PERF-002: Mobile Performance

**Feature**: Mobile Optimization
**Priority**: High

### Test Steps:
1. Test on mobile device or Chrome DevTools mobile emulation
2. Check all major pages
3. Test touch interactions

### Expected Result:
- ✅ Pages load quickly on 3G
- ✅ Touch targets minimum 44px
- ✅ No horizontal scrolling
- ✅ Text readable without zoom
- ✅ Images optimized for mobile

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PERF-003: Keyboard Navigation

**Feature**: Keyboard Accessibility
**Priority**: High

### Test Steps:
1. Navigate entire site using only keyboard (Tab, Enter, Arrows)
2. Test all interactive elements
3. Verify focus indicators

### Expected Result:
- ✅ All interactive elements reachable
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Can complete all tasks without mouse

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PERF-004: Screen Reader

**Feature**: Screen Reader Support
**Priority**: Medium

### Test Steps:
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate through pages
3. Test form inputs

### Expected Result:
- ✅ All content announced correctly
- ✅ Images have alt text
- ✅ Form labels associated
- ✅ ARIA landmarks present
- ✅ Headings hierarchical

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PERF-005: Browser Compatibility

**Feature**: Cross-Browser Support
**Priority**: High

### Test Steps:
1. Test in Chrome (latest)
2. Test in Firefox (latest)
3. Test in Safari (latest)
4. Test in Edge (latest)
5. Check for layout/functionality differences

### Expected Result:
- ✅ Works in Chrome
- ✅ Works in Firefox
- ✅ Works in Safari
- ✅ Works in Edge
- ✅ Consistent behavior across browsers

### Actual Result:
```
Browser: ___________
Result:


```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PERF-006: SEO Basics

**Feature**: Search Engine Optimization
**Priority**: Medium

### Test Steps:
1. View page source
2. Check meta tags
3. Verify structured data

### Expected Result:
- ✅ Title tags present and descriptive
- ✅ Meta descriptions present
- ✅ Open Graph tags for social sharing
- ✅ Semantic HTML structure
- ✅ No broken links

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 10. Edge Cases & Error Handling

## TEST-ERROR-001: 404 Page

**Feature**: 404 Not Found
**Priority**: Medium

### Test Steps:
1. Navigate to `/non-existent-page`
2. Navigate to `/courses/invalid-slug`

### Expected Result:
- ✅ Custom 404 page displayed
- ✅ Helpful message shown
- ✅ Link to return home
- ✅ No error in console

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-ERROR-002: Invalid Form Data

**Feature**: Form Validation
**Priority**: High

### Test Steps:
1. Try to create module with empty title
2. Try to register with invalid email format
3. Try to set password < 8 characters

### Expected Result:
- ✅ Validation errors shown
- ✅ Form not submitted
- ✅ Clear error messages
- ✅ Fields highlighted

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-ERROR-003: Database Connection Error

**Feature**: Database Error Handling
**Priority**: High

### Test Steps:
1. Simulate database unavailable (if possible)
2. Try to load pages

### Expected Result:
- ✅ Graceful error message
- ✅ Retry mechanism kicks in
- ✅ User informed of issue
- ✅ No crash or blank page

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-ERROR-004: Session Timeout

**Feature**: Session Management
**Priority**: Medium

### Test Steps:
1. Log in
2. Wait for session to expire (or clear session cookie)
3. Try to access faculty page

### Expected Result:
- ✅ Redirected to login
- ✅ Session expired message (optional)
- ✅ Can log in again
- ✅ No data loss

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-ERROR-005: Network Error

**Feature**: Offline/Network Error Handling
**Priority**: Low

### Test Steps:
1. Disconnect internet
2. Try to load a page
3. Try to submit a form

### Expected Result:
- ✅ Appropriate error message
- ✅ User informed of network issue
- ✅ Retry option available
- ✅ No confusing behavior

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## 📊 Test Completion Summary

**Total Tests Completed**: _____ / 58
**Pass Rate**: _____%
**Critical Issues Found**: _____
**High Priority Issues**: _____
**Medium Priority Issues**: _____
**Low Priority Issues**: _____

### Critical Issues (Must Fix Before Production):
```
1.
2.
3.
```

### Recommended Improvements:
```
1.
2.
3.
```

### Overall Assessment:
```
[Write your overall assessment of the platform here]
```

---

**Tester Signature**: _______________
**Date Completed**: _______________
**Next Review Date**: _______________
