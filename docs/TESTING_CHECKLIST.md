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
| Faculty Collaboration | 34 | ___ | ___ | ___ |
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
| **TOTAL** | **117** | **___** | **___** | **___** |

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
✅ PASS (Tested October 10, 2025)
- Success message displayed: "If an account with this email exists, a password reset link has been sent."
- Password reset email sent to inbox
- Token generated using crypto.randomBytes(32) - 64 character hex string
- Token expiration set to 1 hour from request time
- Database stores both password_reset_token and password_reset_expires
- Generic message correctly implements security best practice (no email enumeration)
```

**Status**: ✅ Pass □ Fail □ NA
**Notes**: Security-conscious: Doesn't reveal whether email exists in system. 1-hour expiration enforced at database level.

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
✅ PASS (Tested October 10, 2025)
- Reset page loads and validates token via GET request
- Email address displayed correctly when token is valid
- Password requirements shown with real-time validation (green checkmarks)
- Password updated successfully via POST request
- Token and expiration cleared from database after successful reset (confirmed single-use)
- Redirected to login page with message: "Password reset successfully! Please sign in."
- Successfully logged in with new password
- Old password rejected (properly invalidated)
- Password hashed with bcrypt (12 rounds) in database
```

**Status**: ✅ Pass □ Fail □ NA
**Notes**: Password reset uses POST for actual reset (same pattern as email verification). Double validation: token checked on page load AND submit. 1-hour timeout enforced at database level.

---

## TEST-AUTH-007: Resend Verification Email

**Feature**: Resend Verification Email (Two UI Touchpoints)
**Priority**: Medium

### Prerequisites:
- Registered but unverified account

### Test Scenario A: Resend from Login Page

#### Test Steps:
1. Navigate to `/auth/login`
2. Enter unverified account credentials
3. Click "Sign In"
4. Observe "Please verify your email" error
5. Click "Resend Verification Email" button (appears below error)
6. Wait for success message
7. Check email inbox

#### Expected Result:
- ✅ Login fails with verification error
- ✅ "Resend Verification Email" button appears below error
- ✅ Button disabled for 60 seconds after click (client-side cooldown)
- ✅ Success message: "Verification email sent! Please check your inbox."
- ✅ New verification email received

### Test Scenario B: Resend from Verification Error Page

#### Test Steps:
1. Navigate to `/auth/verify-email?token=<expired_or_invalid_token>`
2. Click "Verify My Email" (should fail)
3. Observe error message
4. Enter email address in "Need a new verification link?" input
5. Click "Resend Verification Email"
6. Wait for success message
7. Check email inbox

#### Expected Result:
- ✅ Verification fails with appropriate error
- ✅ Resend UI section visible with email input
- ✅ Button disabled for 60 seconds after click (client-side cooldown)
- ✅ Generic success message: "If an account with this email exists and is unverified, a verification email has been sent."
- ✅ New verification email received (if account exists and is unverified)

### Test Scenario C: Rate Limiting

#### Test Steps:
1. Request resend verification email
2. Wait 30 seconds
3. Request again (should succeed)
4. Immediately request again (should fail)
5. Wait 20 minutes
6. Request again (should succeed)

#### Expected Result:
- ✅ First request: Success
- ✅ Second request (after 30s but before 20min): HTTP 429 error
- ✅ Error message: "Please wait X minutes before requesting another verification email."
- ✅ Third request (after 20min): Success
- ✅ Rate limiting: Maximum 3 attempts per hour (20 minute intervals)
- ✅ Rate limiting tracked via `last_verification_email_sent_at` database field

### Test Scenario D: Security Tests

#### Test Steps:
1. Request resend for non-existent email
2. Request resend for already-verified account
3. Verify response messages are generic
4. Check database for token updates

#### Expected Result:
- ✅ Non-existent email: Generic success message (no enumeration)
- ✅ Already verified: "Email is already verified." message
- ✅ No information leakage about account existence
- ✅ New token invalidates old token (verified in database)
- ✅ Token generated with crypto.randomBytes(32) - 64 character hex string
- ✅ New 24-hour expiration set
- ✅ `last_verification_email_sent_at` timestamp updated in database

### Actual Result:
```
[Enter what actually happened for each scenario]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:
- Two UI touchpoints: Login page (unverified error) and Verification error page
- Server-side rate limiting: 20 minutes between requests (3 attempts/hour max)
- Client-side cooldown: 60 seconds (visual feedback, bypassable)
- Security: No email enumeration, generic messages for non-existent accounts

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

# 3. Faculty Collaboration

## TEST-COLLAB-001: Add Collaborator to Course

**Feature**: Add Collaborator
**Priority**: Critical

### Prerequisites:
- Logged in as faculty (User A)
- At least one course created by User A
- Another faculty user (User B) exists in system

### Test Steps:
1. Navigate to `/faculty/courses`
2. Click "Edit" on a course
3. Locate "Collaborators" panel in sidebar
4. Click "+ Add Collaborator" button
5. Search for User B by name or email
6. Click "Add" next to User B
7. Confirm User B appears in collaborator list

### Expected Result:
- ✅ Add collaborator modal opens
- ✅ Faculty search works
- ✅ User B added successfully
- ✅ User B appears in collaborator list with avatar/name
- ✅ Success message shown
- ✅ Activity logged: "Added [User B] as collaborator"

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-002: Collaborator Can Edit Course

**Feature**: Collaborator Authorization
**Priority**: Critical

### Prerequisites:
- User B is collaborator on User A's course (from TEST-COLLAB-001)

### Test Steps:
1. Log out and log in as User B
2. Navigate to `/faculty/courses`
3. Verify course appears in "Shared with Me" tab
4. Click "Edit" on the shared course
5. Change course title
6. Click "Save Changes"
7. Verify update successful

### Expected Result:
- ✅ Course visible to User B in "Shared with Me"
- ✅ User B can access edit page
- ✅ User B can modify course content
- ✅ Changes saved successfully
- ✅ Activity logged: "[User B] updated course title"
- ✅ No permission errors

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-003: Non-Collaborator Cannot Edit

**Feature**: Authorization Enforcement
**Priority**: Critical

### Prerequisites:
- User A's course with User B as collaborator
- User C exists but is NOT a collaborator

### Test Steps:
1. Log in as User C
2. Try to access `/faculty/courses/edit/[courseId]` directly (URL)
3. Check response

### Expected Result:
- ❌ Access denied (403 Forbidden)
- ✅ Error message: "You don't have permission to edit this course"
- ✅ Redirected to faculty dashboard or courses page
- ✅ Course not visible in User C's course list

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-004: Remove Collaborator

**Feature**: Remove Collaborator
**Priority**: High

### Prerequisites:
- User B is collaborator on User A's course

### Test Steps:
1. Log in as User A (or User B - anyone can remove)
2. Navigate to course edit page
3. Locate collaborators panel
4. Click "X" (remove) button next to User B
5. Confirm removal in dialog
6. Log out, log in as User B
7. Verify course no longer accessible

### Expected Result:
- ✅ Confirmation dialog appears
- ✅ User B removed from collaborator list
- ✅ Activity logged: "[User A] removed [User B] as collaborator"
- ✅ User B can no longer see or edit course
- ✅ User B gets 403 error if accessing directly

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-005: Activity Feed Display

**Feature**: Activity Tracking
**Priority**: High

### Prerequisites:
- Course with multiple edits and collaborator changes

### Test Steps:
1. Navigate to course edit page
2. Locate "Recent Activity" panel in sidebar
3. Verify activities shown:
   - Course created
   - Collaborator added
   - Content updated
   - Status changed

### Expected Result:
- ✅ Activity feed displays all actions
- ✅ Shows user avatar, name, action, timestamp
- ✅ Actions sorted by most recent first
- ✅ Relative timestamps ("2 hours ago")
- ✅ Pagination or "Load More" if many activities
- ✅ Clear descriptions: "Updated course title", "Published course"

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-006: Add Collaborator to Module

**Feature**: Module Collaboration
**Priority**: High

### Prerequisites:
- Logged in as faculty (User A)
- At least one module created by User A
- Another faculty user (User B) exists

### Test Steps:
1. Navigate to `/faculty/modules`
2. Click "Edit" on a module
3. Add User B as collaborator (same flow as course)
4. Verify User B can edit module

### Expected Result:
- ✅ Collaborator management works same as courses
- ✅ User B added successfully
- ✅ User B can edit module
- ✅ Activity logged
- ✅ Module appears in User B's "Shared with Me"

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-007: Collaborator Count Badge

**Feature**: Collaborator Count Display
**Priority**: Medium

### Prerequisites:
- Course with 2-3 collaborators

### Test Steps:
1. Navigate to `/faculty/courses`
2. Find course with collaborators
3. Verify badge shows collaborator count

### Expected Result:
- ✅ Badge visible on course card
- ✅ Shows correct count (e.g., "👥 3 collaborators")
- ✅ Clicking card opens course
- ✅ Badge styled appropriately

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-008: Prevent Duplicate Collaborators

**Feature**: Duplicate Prevention
**Priority**: Medium

### Prerequisites:
- User B already collaborator on course

### Test Steps:
1. Try to add User B as collaborator again
2. Click "Add"
3. Check response

### Expected Result:
- ❌ Addition fails
- ✅ Error message: "User is already a collaborator"
- ✅ User B not duplicated in list
- ✅ No database changes

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-009: Cannot Remove Original Author

**Feature**: Author Protection
**Priority**: High

### Prerequisites:
- User A is original author
- User B is collaborator

### Test Steps:
1. Log in as User B
2. Navigate to course edit page
3. Try to remove User A (original author)
4. Check if remove button even appears

### Expected Result:
- ✅ No remove button shown for original author
- ✅ Or if button shown, removal fails with error
- ✅ Error: "Cannot remove original author"
- ✅ Original author remains in collaborator list

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-010: Multiple Collaborators Editing

**Feature**: Concurrent Editing
**Priority**: Medium

### Prerequisites:
- Course with User A and User B as collaborators
- Two separate browser sessions

### Test Steps:
1. User A opens course for editing (Browser 1)
2. User B opens same course for editing (Browser 2)
3. User A makes changes and saves
4. User B makes different changes and saves
5. Refresh both browsers

### Expected Result:
- ✅ Both can edit simultaneously
- ✅ Changes from both users saved
- ✅ Activity feed shows both users' actions
- ✅ Last save wins (expected behavior for simple model)
- ⚠️ Optional: Warning shown if content was updated since loading

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**: Simple co-author model means last save wins. Conflict detection is optional enhancement.

---

## TEST-COLLAB-011: API - Add Collaborator Endpoint

**Feature**: POST /api/courses/[id]/collaborators
**Priority**: Critical

### Test Steps:
1. Get authentication token/cookie
2. Send POST request to `/api/courses/[courseId]/collaborators`
3. Body: `{ "userId": "[collaboratorUserId]" }`
4. Check response

### Expected Result:
- ✅ Returns 201 Created
- ✅ Response includes collaborator object with user info
- ✅ Database record created in course_collaborators table
- ✅ Activity logged in collaboration_activity table

### Test Negative Cases:
- ❌ 401 if not authenticated
- ❌ 404 if course doesn't exist
- ❌ 403 if user not author/collaborator
- ❌ 409 if user already collaborator
- ❌ 400 if userId invalid or user is course author

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-012: API - List Collaborators Endpoint

**Feature**: GET /api/courses/[id]/collaborators
**Priority**: High

### Test Steps:
1. Send GET request to `/api/courses/[courseId]/collaborators`
2. Check response structure
3. Verify collaborator list includes user details

### Expected Result:
- ✅ Returns 200 OK
- ✅ Response: `{ collaborators: [...], count: N }`
- ✅ Each collaborator includes: id, userId, user object, addedBy, addedAt, editCount
- ✅ Ordered by addedAt ascending

### Test Negative Cases:
- ❌ 401 if not authenticated
- ❌ 404 if course doesn't exist or no access

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-013: API - Remove Collaborator Endpoint

**Feature**: DELETE /api/courses/[id]/collaborators/[userId]
**Priority**: High

### Test Steps:
1. Add a collaborator first
2. Send DELETE request to `/api/courses/[courseId]/collaborators/[userId]`
3. Check response
4. Verify removal in database

### Expected Result:
- ✅ Returns 200 OK with `{ success: true }`
- ✅ Database record deleted from course_collaborators
- ✅ Activity logged: "[User] removed [Collaborator] as collaborator"
- ✅ Collaborator immediately loses access

### Test Negative Cases:
- ❌ 401 if not authenticated
- ❌ 404 if collaborator not found
- ❌ 403 if user cannot manage collaborators

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-014: API - Activity Feed Endpoint

**Feature**: GET /api/courses/[id]/activity
**Priority**: High

### Test Steps:
1. Perform several actions on course (edit, add collaborator, etc.)
2. Send GET request to `/api/courses/[courseId]/activity?page=1&limit=20`
3. Test pagination: `?page=2`
4. Test filtering: `?userId=[userId]&action=updated`

### Expected Result:
- ✅ Returns 200 OK
- ✅ Response includes `activities` array and `pagination` object
- ✅ Activities sorted by createdAt DESC (newest first)
- ✅ Pagination works correctly
- ✅ Filters by userId work
- ✅ Filters by action type work
- ✅ Each activity includes: user info, action, description, timestamp

### Test Negative Cases:
- ❌ 401 if not authenticated
- ❌ 404 if course doesn't exist or no access
- ❌ 400 if invalid query parameters

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-015: Database - Cascade Delete Course

**Feature**: Cascade Delete Integrity
**Priority**: Critical

### Test Steps:
1. Create course with 2 collaborators
2. Delete the course via API or database
3. Check course_collaborators table
4. Check collaboration_activity table

### Expected Result:
- ✅ All collaborator records deleted automatically (CASCADE)
- ✅ All activity records deleted automatically (CASCADE)
- ✅ No orphaned records left in database
- ✅ Foreign key constraints work correctly

### Actual Result:
```
[Check database directly:
SELECT * FROM course_collaborators WHERE course_id = '[deleted-course-id]';
Result: (empty)
]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-016: Database - Cascade Delete User

**Feature**: User Deletion Handling
**Priority**: High

### Test Steps:
1. User B is collaborator on User A's course
2. Delete User B's account
3. Check course_collaborators table
4. Check collaboration_activity table

### Expected Result:
- ✅ Collaborator record deleted (CASCADE on user_id)
- ✅ Activity records deleted (CASCADE on user_id)
- ✅ Course still exists
- ✅ User A's ownership unaffected
- ✅ No foreign key violations

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-017: Database - Null Safety for Inviter

**Feature**: Inviter Deletion Handling
**Priority**: Medium

### Test Steps:
1. User A adds User B as collaborator
2. Delete User A's account (the inviter)
3. Check User B's collaborator record
4. Verify User B can still access course

### Expected Result:
- ✅ Collaboration still exists
- ✅ `added_by` field becomes NULL (onDelete: SetNull)
- ✅ User B retains access to course
- ✅ No errors when viewing collaborators
- ✅ UI handles null inviter gracefully

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-018: Database - Unique Constraint

**Feature**: Duplicate Prevention at Database Level
**Priority**: High

### Test Steps:
1. Try to insert duplicate collaborator via direct SQL:
```sql
INSERT INTO course_collaborators (course_id, user_id, added_by)
VALUES ('[existing-course]', '[existing-user]', '[inviter]');
```
2. Check error response

### Expected Result:
- ❌ Database rejects insert
- ✅ Unique constraint violation error
- ✅ Error message includes: "course_id_user_id" unique constraint
- ✅ No duplicate record created

### Actual Result:
```
[Enter database error message]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-019: Security - Cross-User Access Prevention

**Feature**: Authorization Security
**Priority**: Critical

### Test Steps:
1. User C (not author or collaborator) gets session cookie
2. User C tries to add collaborator to User A's course via API
3. User C tries to access edit endpoint directly
4. User C tries to view activity feed

### Expected Result:
- ❌ All requests fail with 403 Forbidden or 404 Not Found
- ✅ No information leakage about course existence
- ✅ Cannot bypass authorization via API
- ✅ Cannot access collaborator data
- ✅ Activity not logged for failed attempts

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-020: Performance - Permission Check Speed

**Feature**: Permission Query Performance
**Priority**: Medium

### Prerequisites:
- Course with 10+ collaborators

### Test Steps:
1. Measure time for permission check: `canEditCourse(userId, courseId)`
2. Repeat 100 times
3. Calculate P95 latency
4. Check database query plan

### Expected Result:
- ✅ P95 latency < 200ms
- ✅ Uses composite index on (course_id, user_id)
- ✅ No full table scans
- ✅ Query plan shows index usage
- ✅ Consistent performance across requests

### Actual Result:
```
Average: ___ ms
P95: ___ ms
P99: ___ ms
Query plan: [EXPLAIN output]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-021: UI - CollaboratorPanel Display

**Feature**: Collaborator Panel UI Component
**Priority**: High

### Prerequisites:
- Logged in as faculty (User A)
- On module or course edit page
- At least one module/course created

### Test Steps:
1. Navigate to `/faculty/modules/edit/[moduleId]`
2. Scroll to sidebar
3. Locate "Collaborators" panel
4. Verify panel renders correctly

### Expected Result:
- ✅ Collaborators card visible in sidebar
- ✅ Shows "Users" icon and "Collaborators" title
- ✅ "Add" button visible in header
- ✅ Empty state: "No collaborators yet" message with icon
- ✅ Helpful text: "Add faculty members to collaborate on this module"
- ✅ Card styled with cognitive-card class (neural design)
- ✅ Responsive on mobile

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-022: UI - Add Collaborator Dialog

**Feature**: Add Collaborator Modal
**Priority**: Critical

### Prerequisites:
- On module/course edit page with no collaborators

### Test Steps:
1. Click "Add" button in Collaborators panel
2. Verify dialog opens
3. Check all dialog elements present
4. Click "Cancel" to close

### Expected Result:
- ✅ Modal opens centered on screen
- ✅ Dark overlay (50% black) behind modal
- ✅ Modal title: "Add Collaborator" with UserPlus icon
- ✅ Description text visible
- ✅ Faculty search input field present
- ✅ "Cancel" button visible
- ✅ Clicking outside modal does NOT close it (must click Cancel)
- ✅ ESC key closes modal (optional)
- ✅ Modal z-index above other content (z-50)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-023: UI - Faculty Search Input

**Feature**: Faculty Search Autocomplete
**Priority**: Critical

### Prerequisites:
- Add Collaborator dialog open
- At least 2 other faculty users exist in database

### Test Steps:
1. Click in "Search Faculty" input field
2. Type 2 characters (minimum for search)
3. Observe dropdown appears with results
4. Type more characters to refine
5. Hover over a result
6. Use arrow keys to navigate results
7. Press ESC to close dropdown

### Expected Result:
- ✅ Search icon displayed in input
- ✅ Placeholder text: "Search by name or email..."
- ✅ No dropdown shown until 2+ characters typed
- ✅ Loading spinner appears while searching
- ✅ Dropdown appears below input with results
- ✅ Each result shows: avatar/initials, name, email, university
- ✅ Hover highlights result (blue background)
- ✅ Arrow keys navigate (visual highlight)
- ✅ ESC key closes dropdown
- ✅ "No results" message if no matches
- ✅ Dropdown scrollable if many results
- ✅ Max height 256px (overflow scroll)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-024: UI - Faculty Search Selection

**Feature**: Select Faculty from Search
**Priority**: Critical

### Prerequisites:
- Add Collaborator dialog open
- Search results visible

### Test Steps:
1. Type search query with results
2. Click on a faculty member result
3. Observe behavior
4. Check if added to collaborator list
5. Verify dialog closes
6. Check for success toast message

### Expected Result:
- ✅ Clicking result triggers add action
- ✅ Selected user shows check icon briefly
- ✅ Search input clears after selection
- ✅ Dialog closes automatically
- ✅ Success toast: "Collaborator added successfully"
- ✅ Collaborators panel updates immediately
- ✅ New collaborator appears in list
- ✅ No page refresh required

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-025: UI - Collaborator List Display

**Feature**: Collaborator List with Details
**Priority**: High

### Prerequisites:
- Module/course has 2-3 collaborators added

### Test Steps:
1. Navigate to edit page
2. View Collaborators panel
3. Examine each collaborator card

### Expected Result:
- ✅ Each collaborator shown in separate card
- ✅ Avatar or initials displayed (40x40px circle)
- ✅ Full name displayed
- ✅ Edit count shown with pencil icon
- ✅ Last accessed date shown with clock icon
- ✅ Date formatted (e.g., "10/26/2025")
- ✅ Remove button (X icon) on right side
- ✅ Hover effect on card (border changes to neural-primary)
- ✅ Cards stacked vertically with spacing
- ✅ Ordered by added date (oldest first)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-026: UI - Remove Collaborator Confirmation

**Feature**: Remove Collaborator Dialog
**Priority**: High

### Prerequisites:
- At least one collaborator exists

### Test Steps:
1. Click "X" (remove) button next to a collaborator
2. Verify confirmation dialog appears
3. Read dialog content
4. Click "Cancel"
5. Verify no change
6. Click "X" again
7. Click "Remove" to confirm

### Expected Result:
- ✅ Confirmation modal appears
- ✅ Red warning icon displayed
- ✅ Title: "Remove Collaborator" (red text)
- ✅ Warning message about losing access
- ✅ "Cancel" and "Remove" buttons shown
- ✅ Cancel button closes modal, no action
- ✅ Remove button shows "Removing..." when clicked
- ✅ After removal: collaborator disappears from list
- ✅ Success toast: "Collaborator removed successfully"
- ✅ No page refresh

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-027: UI - Activity Feed Display

**Feature**: Activity Feed Component
**Priority**: High

### Prerequisites:
- Module/course with activity (edits, collaborator changes)

### Test Steps:
1. Navigate to edit page
2. Scroll to "Activity Feed" panel in sidebar
3. Examine activity entries

### Expected Result:
- ✅ Activity Feed card visible below Collaborators
- ✅ Activity icon and "Activity Feed" title
- ✅ Description: "No activity yet" or activity count
- ✅ Each activity shows:
  - User avatar/initials
  - User name
  - Action description (e.g., "updated course title")
  - Relative timestamp ("2 hours ago")
  - Action badge (color-coded by type)
  - Action icon (Edit, UserPlus, Trash, etc.)
- ✅ Activities sorted newest first
- ✅ Badges color-coded:
  - Created: blue
  - Updated: orange
  - Published: green
  - Deleted: red
  - Invited/Removed User: outline

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-028: UI - Activity Feed Pagination

**Feature**: Activity Feed Pagination Controls
**Priority**: Medium

### Prerequisites:
- More than 10 activities exist for module/course

### Test Steps:
1. Scroll to Activity Feed panel
2. Check if pagination controls visible at bottom
3. Click "Next" button
4. Click "Previous" button
5. Verify page info displayed

### Expected Result:
- ✅ Pagination only shows if > 10 activities (default limit)
- ✅ Shows "Page X of Y (Z total)" text
- ✅ "Previous" and "Next" buttons visible
- ✅ Previous button disabled on page 1
- ✅ Next button disabled on last page
- ✅ Clicking Next loads next page
- ✅ Clicking Previous goes back
- ✅ No full page reload (AJAX)
- ✅ Loading state during fetch (optional)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-029: UI - Empty States

**Feature**: Empty State Messages
**Priority**: Medium

### Test Steps:
1. Create new module/course (no collaborators yet)
2. Navigate to edit page
3. View Collaborators panel
4. View Activity Feed panel

### Expected Result:
**Collaborators Empty State:**
- ✅ Users icon (large, centered, faded)
- ✅ Message: "No collaborators yet. Add faculty members to collaborate on this module."
- ✅ Add button still functional

**Activity Feed Empty State:**
- ✅ Activity icon (large, centered, faded)
- ✅ Message: "No activity yet. Changes and collaboration events will appear here."
- ✅ Helpful, not discouraging

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-030: UI - Search Keyboard Navigation

**Feature**: Keyboard Accessibility in Search
**Priority**: High

### Prerequisites:
- Add Collaborator dialog open
- Search results visible

### Test Steps:
1. Type search query
2. Press Tab (should NOT change focus)
3. Press Down Arrow key
4. Press Down Arrow again
5. Press Up Arrow key
6. Press Enter on highlighted result
7. Press ESC to close dropdown

### Expected Result:
- ✅ Down Arrow highlights first result
- ✅ Subsequent Down Arrows move highlight down
- ✅ Up Arrow moves highlight up
- ✅ Highlight wraps at top/bottom (optional)
- ✅ Enter key selects highlighted result
- ✅ ESC closes dropdown without selecting
- ✅ Visual highlight clear (background color change)
- ✅ Smooth keyboard-only workflow

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-031: UI - Error Handling Display

**Feature**: UI Error Messages
**Priority**: High

### Prerequisites:
- Development mode with ability to trigger errors

### Test Steps:
1. Add collaborator (simulate API error 500)
2. Check error toast
3. Try adding duplicate collaborator
4. Try adding with invalid userId
5. Check error messages

### Expected Result:
- ✅ API errors show red error toast
- ✅ Error message descriptive (not generic)
- ✅ Duplicate error: "User is already a collaborator"
- ✅ Invalid user: "User not found" or "Invalid user"
- ✅ Network error: "Failed to add collaborator"
- ✅ Toast auto-dismisses after 5 seconds
- ✅ Toast positioned top-right or bottom-right
- ✅ User can manually dismiss toast

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-032: UI - Loading States

**Feature**: Loading Indicators
**Priority**: Medium

### Test Steps:
1. Navigate to edit page (watch initial load)
2. Add a collaborator
3. Remove a collaborator
4. Open Activity Feed
5. Observe loading states

### Expected Result:
**Initial Load:**
- ✅ Collaborators panel shows skeleton/spinner while loading
- ✅ Activity Feed shows skeleton/spinner while loading

**Add Collaborator:**
- ✅ "Add" button shows loading state or disables
- ✅ Search shows spinner icon during API call

**Remove Collaborator:**
- ✅ Remove button shows "Removing..." text
- ✅ Button disabled during removal

**Activity Feed:**
- ✅ Pagination buttons disable during fetch (optional)

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-033: UI - Mobile Responsiveness

**Feature**: Collaboration UI on Mobile
**Priority**: High

### Test Steps:
1. Resize browser to mobile width (375px)
2. Or test on actual mobile device
3. Navigate to module/course edit page
4. Test all collaboration UI interactions

### Expected Result:
- ✅ Sidebar stacks below content on mobile
- ✅ Collaborators panel full width
- ✅ Activity Feed panel full width
- ✅ Add Collaborator dialog responsive
- ✅ Dialog fits mobile screen
- ✅ Search dropdown scrollable on mobile
- ✅ Touch targets minimum 44px
- ✅ No horizontal scroll
- ✅ All text readable
- ✅ Avatars appropriately sized

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

## TEST-COLLAB-034: UI - Accessibility

**Feature**: Collaboration UI Accessibility
**Priority**: High

### Test Steps:
1. Navigate edit page using only keyboard
2. Tab through Collaborators panel
3. Tab through Activity Feed
4. Open Add Collaborator dialog via keyboard
5. Test screen reader (optional)

### Expected Result:
**Keyboard Navigation:**
- ✅ All buttons reachable via Tab
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Can add/remove collaborators keyboard-only
- ✅ Modal traps focus (can't tab outside)

**Screen Reader (Optional):**
- ✅ Collaborator count announced
- ✅ Activity entries have descriptive aria-labels
- ✅ Button purposes clear
- ✅ Form fields have labels

### Actual Result:
```
[Enter what actually happened]
```

**Status**: □ Pass □ Fail □ NA
**Notes**:

---

# 4. User Profiles

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

### Version 2.3.0 (January 2025)
**Faculty Collaboration UI Components:**
- Added TEST-COLLAB-021 through TEST-COLLAB-034: Collaboration UI testing scenarios
- New UI component tests (14 tests)
- Tests cover:
  - CollaboratorPanel component display and interactions
  - Add Collaborator dialog functionality
  - FacultySearchInput autocomplete with keyboard navigation
  - Collaborator list display with avatars and metrics
  - Remove collaborator confirmation flow
  - ActivityFeed component with pagination
  - Empty states for collaborators and activity
  - Error handling and loading states
  - Mobile responsiveness
  - Accessibility (keyboard navigation, screen reader support)
- Updated test total: 103 → 117 tests

### Version 2.2.0 (January 2025)
**Faculty Collaboration Feature:**
- Added TEST-COLLAB-001 through TEST-COLLAB-020: Faculty collaboration backend testing
- New test category: Faculty Collaboration (20 tests)
- Tests cover:
  - API endpoints (add/list/remove collaborators, activity feed)
  - Database integrity (cascade deletes, null safety, unique constraints)
  - Security (cross-user access prevention, authorization)
  - Performance (permission check speed)
  - Authorization checks (collaborators can edit, non-collaborators cannot)
  - Activity tracking and logging
  - Duplicate prevention
  - Original author protection
  - Concurrent editing scenarios
- Updated test total: 83 → 103 tests

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
