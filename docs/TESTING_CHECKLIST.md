# 🧪 BCS E-Textbook Platform - Comprehensive Testing Checklist

**Version**: 2.1.0
**Last Updated**: October 10, 2025
**Tester**: _______________
**Test Date**: _______________
**Environment**: □ Development □ Production

**Recent Updates**:
- Updated email verification flow (two-step POST-based verification)
- Added token expiration enforcement (24 hours)
- Added email verification requirement for login
- Updated authentication test scenarios

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
| Authentication | 10 | ___ | ___ | ___ |
| Faculty Dashboard | 8 | ___ | ___ | ___ |
| User Profiles | 5 | ___ | ___ | ___ |
| Course Catalog | 6 | ___ | ___ | ___ |
| Enhanced Catalog Features | 9 | ___ | ___ | ___ |
| Universal Search | 6 | ___ | ___ | ___ |
| Profile Enhancements | 7 | ___ | ___ | ___ |
| Course & Module Viewing | 7 | ___ | ___ | ___ |
| Playgrounds | 6 | ___ | ___ | ___ |
| Network Visualization | 3 | ___ | ___ | ___ |
| API Endpoints | 5 | ___ | ___ | ___ |
| Performance & Accessibility | 6 | ___ | ___ | ___ |
| Error Handling | 5 | ___ | ___ | ___ |
| **TOTAL** | **83** | **___** | **___** | **___** |

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
- ✅ Redirected to login page with message about email verification
- ✅ Verification email sent (check email inbox)
- ✅ Success message: "Registration successful! Please check your email to verify your account."

### Actual Result:
```
✅ PASS (Tested October 10, 2025)
- Account created successfully
- Redirected to login page with verification message
- Verification email sent to inbox
- Message correctly states: "Registration successful! Please check your email to verify your account."
```

**Status**: ✅ Pass □ Fail □ NA
**Notes**: Registration flow correctly guides users to verify email before attempting login

---

## TEST-AUTH-002: Email Verification

**Feature**: Email Verification (Two-Step Process)
**Priority**: Critical

### Prerequisites:
- Completed TEST-AUTH-001

### Test Steps:
1. Check email inbox for verification email
2. Click verification link in email
3. Should be redirected to `/auth/verify-email?token=<token>`
4. **Click the "Verify My Email" button** on the verification page
5. Wait for verification to complete

### Expected Result:
- ✅ Verification page loads with "Verify My Email" button (not automatic)
- ✅ Clicking button sends POST request to API
- ✅ Email verified successfully after button click
- ✅ Success message displayed
- ✅ Redirected to login page after 3 seconds
- ✅ Token expires after 24 hours (server-side enforced)
- ✅ Token can only be used once (cleared after verification)

### Actual Result:
```
✅ PASS (Tested October 10, 2025)
- Verification page loaded correctly with "Verify My Email" button
- Button click sent POST request (confirmed via network tab)
- Email verified successfully
- Success message: "Email verified successfully! You can now sign in."
- Automatic redirect to login page after 3 seconds
- Two-step process prevents auto-verification by email scanners
```

**Status**: ✅ Pass □ Fail □ NA
**Notes**: Two-step verification prevents email scanners from auto-verifying accounts. Works as designed.

---

## TEST-AUTH-003: User Login (Verified Account)

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
- ✅ Redirected to faculty dashboard (`/faculty/dashboard`)
- ✅ Session created (check browser cookies)
- ✅ Session cookie name: `__Secure-authjs.session-token` (HTTPS) or `authjs.session-token` (HTTP)
- ✅ JWT token contains user role and email verification status

### Actual Result:
```
✅ PASS (Tested October 10, 2025)
- Login successful with verified account
- Redirected to /faculty/dashboard
- Session cookie created: __Secure-authjs.session-token
- Cookie contains JWT with user id, role, and email verification status
- Dashboard loads with user information displayed
```

**Status**: ✅ Pass □ Fail □ NA
**Notes**: Email verification is required before login. Unverified users will be blocked (see TEST-AUTH-003A). Session cookie uses NextAuth v5 naming convention.

---

## TEST-AUTH-003A: Login with Unverified Email

**Feature**: Email Verification Enforcement
**Priority**: Critical

### Prerequisites:
- Registered account that has NOT completed email verification

### Test Steps:
1. Navigate to `/auth/login`
2. Enter credentials for unverified account
3. Click "Sign In"

### Expected Result:
- ❌ Login blocked
- ✅ Error message: "Please verify your email before signing in"
- ✅ User stays on login page
- ✅ No session created

### Actual Result:
```
✅ PASS (Tested October 10, 2025)
- Login blocked for unverified account
- Error message displayed: "Please verify your email before signing in"
- User remains on login page
- No session cookie created (verified in DevTools)
- Email verification requirement successfully enforced
```

**Status**: ✅ Pass □ Fail □ NA
**Notes**: Email verification is enforced at login to ensure valid email addresses. Security working as designed.

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
- ✅ Error message: "Invalid credentials" or "Sign in failed"
- ✅ User stays on login page

### Actual Result:
```
✅ PASS (Tested October 10, 2025)
- Login failed with wrong password
- Error message displayed correctly
- User remains on login page
- No session created
- Invalid credentials handled properly
```

**Status**: ✅ Pass □ Fail □ NA
**Notes**: Error handling for invalid credentials working correctly

---

## TEST-AUTH-005: Forgot Password

**Feature**: Password Reset Request
**Priority**: High

### Test Steps:
1. Navigate to `/auth/forgot-password`
2. Enter email: "test@university.edu"
3. Click "Send Reset Link"

### Expected Result:
- ✅ Success message displayed: "If an account with this email exists, a password reset link has been sent."
- ✅ Password reset email sent (if account exists)
- ✅ Email contains secure reset token (crypto.randomBytes)
- ✅ Token expires in 1 hour (server-side enforced)
- ✅ Generic message shown (doesn't reveal if email exists - security)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**: Security-conscious: Doesn't reveal whether email exists in system

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
- ✅ Reset page validates token on load (GET request)
- ✅ Shows email address if token is valid
- ✅ Password updated successfully (POST request)
- ✅ Token cleared after use (can't reuse)
- ✅ Redirected to login page with success message
- ✅ Can login with new password
- ✅ Old password no longer works

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**: Password reset uses POST for actual reset (same pattern as email verification)

---

## TEST-AUTH-007: Resend Verification Email

**Feature**: Resend Verification Email
**Priority**: Medium

### Prerequisites:
- Registered but unverified account

### Test Steps:
1. Attempt to login with unverified account (should fail)
2. Request a new verification email via POST to `/api/auth/verify-email`
3. Check email inbox for new verification email
4. Verify new token is different from original
5. Complete verification with new token

### Expected Result:
- ✅ New verification email sent
- ✅ New token generated with crypto.randomBytes (secure)
- ✅ New 24-hour expiration set
- ✅ Old token becomes invalid
- ✅ Can verify with new token

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**: API supports both verification (POST with token) and resend (POST with email)

---

## TEST-AUTH-008: Expired Verification Token

**Feature**: Token Expiration (24 hours)
**Priority**: High

### Prerequisites:
- Verification token that is > 24 hours old (or manually expire in database)

### Test Steps:
1. Navigate to `/auth/verify-email?token=<expired_token>`
2. Click "Verify My Email" button

### Expected Result:
- ❌ Verification fails
- ✅ Error message: "Verification token has expired. Please request a new verification email."
- ✅ User can request a new verification email
- ✅ No verification occurs with expired token

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**: Token expiration is server-side enforced (email_verification_token_expires field)

---

## TEST-AUTH-009: Logout

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

# 5. Enhanced Catalog Features

## TEST-CATALOG-007: Course Sorting

**Feature**: Course Catalog Sorting
**Priority**: High

### Test Steps:
1. Navigate to `/courses`
2. Test each sort option:
   - Select "Newest First"
   - Select "Oldest First"
   - Select "A-Z"
   - Select "Z-A"
   - Select "Most Modules"
3. Verify courses reorder correctly for each
4. Apply a filter, verify sort persists

### Expected Result:
- ✅ All 5 sort options work correctly
- ✅ Newest First shows most recent first
- ✅ A-Z shows alphabetical order
- ✅ Most Modules shows courses with most modules first
- ✅ Sort persists when filters applied

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-008: Tag Filtering

**Feature**: Course Tag Filter Pills
**Priority**: High

### Test Steps:
1. Navigate to `/courses`
2. Scroll to tag pills section
3. Click "All Tags" (should be selected by default)
4. Click a specific tag pill
5. Verify only courses with that tag shown
6. Click another tag
7. Type search term, click tag - test combination

### Expected Result:
- ✅ Tag pills display below filters
- ✅ Active tag highlighted (blue background)
- ✅ Clicking tag filters courses correctly
- ✅ Course count updates
- ✅ Works with search filter
- ✅ "All Tags" clears tag filter

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-009: Instructor Filtering

**Feature**: Instructor Filter Dropdown
**Priority**: Medium

### Test Steps:
1. Navigate to `/courses`
2. Locate instructor dropdown in filter toolbar
3. Select "All Instructors" (default)
4. Select a specific instructor
5. Verify only their courses shown
6. Combine with tag filter
7. Combine with search

### Expected Result:
- ✅ Dropdown lists all unique instructors
- ✅ Selecting instructor filters courses
- ✅ "All Instructors" shows all courses
- ✅ Works with other filters (tags, search, featured)
- ✅ Course count updates correctly

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-010: Catalog Statistics

**Feature**: Course Catalog Stats Cards
**Priority**: Medium

### Test Steps:
1. Navigate to `/courses`
2. View stats section above featured courses
3. Verify 4 stat cards display:
   - Total Courses
   - Instructors
   - Total Modules
   - Featured Count
4. Check counts match actual data

### Expected Result:
- ✅ All 4 stat cards visible
- ✅ Icons and colors display correctly
- ✅ Numbers accurate (match course count, etc.)
- ✅ Responsive on mobile (2x2 grid)
- ✅ Gradient backgrounds render properly

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-CATALOG-011: Universal Search Link

**Feature**: Link to Universal Search
**Priority**: Medium

### Test Steps:
1. Navigate to `/courses`
2. Type "memory" in local search bar
3. Verify link appears below search: "Or search across all content..."
4. Click the link
5. Verify redirect to `/search?q=memory`

### Expected Result:
- ✅ Link only appears when search term entered
- ✅ Link text correct
- ✅ Clicking redirects to `/search?q=...`
- ✅ Search term passed correctly in URL
- ✅ Universal search page loads with results

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-MODULE-007: Module Sorting

**Feature**: Module Catalog Sorting
**Priority**: High

### Test Steps:
1. Navigate to `/modules`
2. Test each sort option:
   - Select "Newest First"
   - Select "Oldest First"
   - Select "A-Z"
   - Select "Z-A"
   - Select "Most Submodules"
3. Verify modules reorder correctly for each
4. Apply a filter, verify sort persists

### Expected Result:
- ✅ All 5 sort options work correctly
- ✅ Most Submodules shows parent modules first
- ✅ Sorting logic correct
- ✅ Sort persists with filters

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-MODULE-008: Module Tag & Author Filtering

**Feature**: Module Tag Pills and Author Dropdown
**Priority**: High

### Test Steps:
1. Navigate to `/modules`
2. Click tag pills to filter by tag
3. Select author from dropdown
4. Combine tag + author filters
5. Add "Root Only" filter
6. Test "Clear All Filters" button

### Expected Result:
- ✅ Tag pills work (same as course catalog)
- ✅ Author dropdown filters correctly
- ✅ All filters work together
- ✅ "Clear All Filters" resets everything
- ✅ Module count updates correctly

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-MODULE-009: Module Statistics

**Feature**: Module Catalog Stats Cards
**Priority**: Medium

### Test Steps:
1. Navigate to `/modules`
2. View stats section below hero
3. Verify 4 stat cards:
   - Total Modules
   - Authors
   - Root Modules
   - With Submodules
4. Check counts accurate

### Expected Result:
- ✅ All 4 stat cards visible
- ✅ Numbers accurate
- ✅ Root modules count correct
- ✅ "With Submodules" shows parents only
- ✅ Responsive design works

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 6. Universal Search

## TEST-SEARCH-001: Universal Search from Header

**Feature**: Header Search Navigation
**Priority**: Critical

### Test Steps:
1. Navigate to any page
2. Type "cognitive" in header search bar
3. Press Enter or click search icon
4. Verify redirect to `/search?q=cognitive`

### Expected Result:
- ✅ Redirects to `/search` page
- ✅ Query parameter passed correctly
- ✅ Search results page loads
- ✅ Search term displayed in results header

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-SEARCH-002: Search Across All Content Types

**Feature**: Multi-Entity Search
**Priority**: Critical

### Test Steps:
1. Navigate to `/search?q=neuroscience`
2. Verify results in all tabs:
   - All Results tab
   - Courses tab
   - Modules tab
   - People tab
3. Check that results include matching content from all types

### Expected Result:
- ✅ Courses matching "neuroscience" shown
- ✅ Modules matching "neuroscience" shown
- ✅ People with "neuroscience" in profile shown
- ✅ Search works across title, description, tags, speciality
- ✅ Result counts accurate in tab badges

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-SEARCH-003: Search Result Cards

**Feature**: Search Result Card Display
**Priority**: High

### Test Steps:
1. Perform search with results
2. Verify course result cards show:
   - Title, description
   - Instructor name
   - Module count
   - Proper icon and styling
3. Verify module result cards show:
   - Title, description
   - Author name
   - Parent course (if applicable)
4. Verify person result cards show:
   - Avatar/initials
   - Name, role badge
   - University, speciality
   - Course/module counts
   - Interested fields tags

### Expected Result:
- ✅ All card types render correctly
- ✅ Cards are clickable and link to correct pages
- ✅ Hover states work
- ✅ Information complete and accurate

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-SEARCH-004: Tabbed Results Navigation

**Feature**: Search Results Tabs
**Priority**: High

### Test Steps:
1. Perform search with mixed results
2. Click "All Results" tab - verify all shown
3. Click "Courses" tab - verify only courses
4. Click "Modules" tab - verify only modules
5. Click "People" tab - verify only people
6. Check tab badges show correct counts

### Expected Result:
- ✅ Tab switching works smoothly
- ✅ Only selected category shown per tab
- ✅ Badge counts accurate
- ✅ Active tab highlighted correctly
- ✅ URL doesn't change on tab switch

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-SEARCH-005: Empty Search Results

**Feature**: No Results Handling
**Priority**: Medium

### Test Steps:
1. Search for gibberish: "xyzabc123nonexistent"
2. Verify empty state message
3. Click link to course catalog

### Expected Result:
- ✅ "No results found" message shown
- ✅ Search icon displayed
- ✅ Helpful message with course catalog link
- ✅ Link navigates to `/courses`
- ✅ No errors in console

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-SEARCH-006: Case-Insensitive Fuzzy Search

**Feature**: Search Algorithm
**Priority**: High

### Test Steps:
1. Search for "BRAIN" (all caps)
2. Search for "brain" (lowercase)
3. Search for "Brain" (mixed case)
4. Verify all return same results
5. Search for partial term "cogn"
6. Verify matches "cognitive", "cognition", etc.

### Expected Result:
- ✅ Case-insensitive matching works
- ✅ Partial matching works
- ✅ Results consistent across case variations
- ✅ Searches title, description, tags, content

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 7. Profile Enhancements

## TEST-PROFILE-006: Instructor Badge Display

**Feature**: Faculty Instructor Badge
**Priority**: Medium

### Test Steps:
1. Navigate to faculty user profile
2. Verify "Instructor" badge shown under role badge
3. Navigate to student profile
4. Verify no instructor badge shown

### Expected Result:
- ✅ Faculty profiles show "Instructor" badge
- ✅ Badge has book icon
- ✅ Emerald/teal color scheme
- ✅ Student profiles don't show badge
- ✅ Badge responsive on mobile

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-007: Email Display

**Feature**: Profile Email Display
**Priority**: High

### Test Steps:
1. Navigate to any user profile
2. Verify email displayed with mail icon
3. Click email link
4. Verify mailto: link opens default email client

### Expected Result:
- ✅ Email shown below name
- ✅ Mail icon displayed
- ✅ Clicking opens mailto link
- ✅ Email clickable and styled properly

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-008: Social & Academic Links

**Feature**: Profile Link Buttons
**Priority**: High

### Test Steps:
1. Navigate to profile with social links configured
2. Verify presence of link buttons:
   - Google Scholar (gray)
   - Personal Website (gray)
   - LinkedIn (blue)
   - Twitter (sky blue)
   - GitHub (dark gray)
3. Click each link
4. Verify opens in new tab with correct URL

### Expected Result:
- ✅ All configured links shown
- ✅ Correct icons and colors per platform
- ✅ External link icon displayed
- ✅ Opens in new tab (target="_blank")
- ✅ Proper noopener/noreferrer attributes
- ✅ Hover states work
- ✅ Links not shown if not configured

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-009: Publications Tab

**Feature**: Publications Tab (Coming Soon)
**Priority**: Low

### Test Steps:
1. Navigate to faculty profile
2. Click "Publications" tab
3. Verify placeholder message
4. If Google Scholar link configured, verify button shown
5. Click Google Scholar button

### Expected Result:
- ✅ Tab switches to Publications
- ✅ "Coming Soon" message shown
- ✅ Google Scholar link button displayed (if configured)
- ✅ Button opens Google Scholar in new tab
- ✅ Icon and styling correct

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-010: Research Tab

**Feature**: Research Tab (Coming Soon)
**Priority**: Low

### Test Steps:
1. Navigate to faculty profile
2. Click "Research" tab
3. Verify placeholder message shown

### Expected Result:
- ✅ Tab switches to Research
- ✅ "Coming Soon" message shown
- ✅ Flask icon displayed
- ✅ Descriptive text about future features

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-011: Link Input in Edit Profile

**Feature**: Social/Academic Link Editing
**Priority**: High

### Test Steps:
1. Navigate to `/profile/edit`
2. Scroll to "Academic & Social Links" section
3. Enter URLs in all 5 link fields:
   - Google Scholar URL
   - Personal Website URL
   - LinkedIn URL
   - Twitter URL
   - GitHub URL
4. Click "Save Changes"
5. Return to profile view
6. Verify all links displayed correctly

### Expected Result:
- ✅ All 5 URL input fields present
- ✅ Labels clear and correct
- ✅ URL validation (optional but recommended)
- ✅ Save successfully stores all links
- ✅ Links appear on profile view
- ✅ Can clear/remove links

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-PROFILE-012: Profile Banner Z-Index

**Feature**: Profile Banner Layering
**Priority**: Medium

### Test Steps:
1. Navigate to any user profile
2. Verify gradient banner in background
3. Verify profile card overlaps banner
4. Verify name, avatar, and content clearly visible
5. Test on mobile viewport

### Expected Result:
- ✅ Banner stays in background
- ✅ Profile content in foreground
- ✅ Name not hidden by banner
- ✅ Avatar has proper z-index
- ✅ All text readable
- ✅ Works on all screen sizes

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 8. Course & Module Viewing

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

# 9. Interactive Playgrounds

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

# 10. Network Visualization

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

# 11. API Endpoints

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

# 12. Performance & Accessibility

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

# 13. Edge Cases & Error Handling

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

**Total Tests Completed**: _____ / 83
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

## 📝 Changelog

### Version 2.1.0 (October 10, 2025)
**Authentication & Security Enhancements:**
- Added TEST-AUTH-002: Updated email verification to reflect two-step POST-based process
- Added TEST-AUTH-003A: New test for unverified email login blocking
- Added TEST-AUTH-007: Resend verification email functionality
- Added TEST-AUTH-008: Token expiration enforcement testing
- Updated TEST-AUTH-003: Clarified login requires verified email
- Updated TEST-AUTH-005: Password reset now shows secure token generation details
- Updated TEST-AUTH-006: Password reset follows GET (validate) + POST (reset) pattern

**Key Changes:**
- Email verification now requires button click (POST request) to prevent scanner auto-verification
- All tokens now use `crypto.randomBytes()` instead of `Math.random()` (cryptographically secure)
- Email verification tokens expire after 24 hours (server-side enforced)
- Password reset tokens expire after 1 hour (server-side enforced)
- Tokens are single-use and cleared after verification/reset
- Login now blocks unverified users with clear error message

**Total Tests:** Increased from 80 to 83 tests

---

**Tester Signature**: _______________
**Date Completed**: _______________
**Next Review Date**: _______________
