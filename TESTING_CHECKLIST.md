# ✅ Testing Checklist

Use this checklist to verify all features of the Insurance Claim System.

---

## 🚀 Initial Setup

- [ ] Docker and Docker Compose installed
- [ ] Project cloned/extracted
- [ ] `.env` file created from `.env.example`
- [ ] Run `docker-compose up --build`
- [ ] All 4 containers running (postgres, redis, backend, frontend)
- [ ] Database seeded with `docker-compose exec backend npm run seed`
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:5000

---

## 🔐 Authentication & User Management

### Registration
- [ ] Can access registration page
- [ ] Form validation works (required fields)
- [ ] Password minimum length enforced (6 chars)
- [ ] Email format validated
- [ ] Can register new user account
- [ ] Redirected to dashboard after registration
- [ ] User data saved in database
- [ ] Password is hashed (not plain text)

### Login
- [ ] Can access login page
- [ ] Can login with test account (john@example.com)
- [ ] Invalid credentials show error
- [ ] JWT token stored in localStorage
- [ ] User object stored in localStorage
- [ ] Redirected to dashboard after login
- [ ] Token included in API requests

### Authorization
- [ ] Logged-in users can access protected routes
- [ ] Non-logged-in users redirected to login
- [ ] Users can only see their own claims
- [ ] Insurers can see all claims
- [ ] Insurers can update claim status
- [ ] Users cannot access insurer dashboard
- [ ] Logout clears token and redirects to login

---

## 📋 User Dashboard

### UI Elements
- [ ] Dashboard loads without errors
- [ ] User name displayed in header
- [ ] User role displayed in header
- [ ] Navigation menu visible
- [ ] Stats cards show correct counts
- [ ] Claims table displays user's claims
- [ ] Status badges color-coded correctly
- [ ] "Submit New Claim" button visible (users only)

### Functionality
- [ ] Can view list of own claims
- [ ] Claims sorted by date (newest first)
- [ ] Status filtering works
- [ ] Can click to view claim details
- [ ] Empty state shown when no claims
- [ ] Stats update when claims change

---

## 📝 Claim Submission

### Step 1: Policy Selection
- [ ] User's policies displayed
- [ ] Policy details shown (number, type, coverage)
- [ ] Can select a policy
- [ ] "Next" button enabled after selection
- [ ] Cannot proceed without selecting policy
- [ ] Error message if no policies available

### Step 2: Claim Details
- [ ] Amount field accepts numbers
- [ ] Amount cannot be negative
- [ ] Date picker works
- [ ] Cannot select future dates
- [ ] Description requires minimum 10 characters
- [ ] Form validation on "Next" click
- [ ] Error messages clear and helpful

### Step 3: Document Upload
- [ ] Can select multiple files
- [ ] Drag-and-drop works
- [ ] File type validation (images, PDF)
- [ ] File size validation (10MB limit)
- [ ] Selected files list displayed
- [ ] Can remove selected files
- [ ] File size shown for each file
- [ ] Can proceed without documents (warning)

### Step 4: Review & Submit
- [ ] All entered data displayed correctly
- [ ] Policy number shown
- [ ] Claim type shown
- [ ] Amount formatted with currency
- [ ] Description displayed
- [ ] Document count shown
- [ ] Submit button enabled
- [ ] "Previous" button works

### Submission
- [ ] Loading state during submission
- [ ] Files uploaded successfully
- [ ] Claim created in database
- [ ] Claim number generated
- [ ] Redirected to claim details page
- [ ] Success message displayed
- [ ] Validation pipeline triggered

---

## 🔍 Claim Details

### Information Display
- [ ] Claim number prominently displayed
- [ ] Status badge shown with correct color
- [ ] Submission date formatted correctly
- [ ] Policy details shown
- [ ] Claimant information displayed
- [ ] Claim type shown
- [ ] Amount claimed displayed
- [ ] Incident date shown
- [ ] Description readable
- [ ] "Back" button works

### Documents Section
- [ ] All uploaded documents listed
- [ ] Document names displayed
- [ ] Document types shown
- [ ] Download buttons work
- [ ] Can open documents in new tab
- [ ] Section hidden if no documents

### Validation Results
- [ ] Validation results displayed
- [ ] Pass/Fail/Warning indicators clear
- [ ] Rule names readable
- [ ] Details messages helpful
- [ ] Auto-approval badge shown if applicable
- [ ] OCR results shown if available

### Notes & Comments
- [ ] Can add new note
- [ ] Note form validates input
- [ ] Notes list displayed chronologically
- [ ] Author name shown
- [ ] Timestamp displayed
- [ ] Internal note indicator (for insurers)
- [ ] Empty state when no notes

### Status Updates (Insurer Only)
- [ ] Status dropdown visible to insurers
- [ ] Can select new status
- [ ] Rejection reason field appears when rejecting
- [ ] Approved amount field appears when approving
- [ ] Update button works
- [ ] Status updates in database
- [ ] Audit log created
- [ ] Page refreshes with new status

---

## 🏢 Insurer Dashboard

### UI Elements
- [ ] Dashboard accessible to insurer role
- [ ] Blocked for regular users
- [ ] Stats cards show aggregated data
- [ ] Claims table shows all claims
- [ ] Filters visible and functional
- [ ] Search bar works

### Statistics
- [ ] Total claims count correct
- [ ] Pending review count correct
- [ ] Approved count correct
- [ ] Total amount calculated correctly
- [ ] Stats update when claims change

### Filtering & Search
- [ ] Can filter by status
- [ ] Can filter by type
- [ ] Search by claim number works
- [ ] Search by name works
- [ ] Search by email works
- [ ] Filters can be combined
- [ ] Clear filters button works
- [ ] Filtered count displayed

### Claims Table
- [ ] All claims displayed (not just own)
- [ ] Claim number shown
- [ ] Claimant name and email shown
- [ ] Policy number shown
- [ ] Claim type shown
- [ ] Amount displayed
- [ ] Status badge shown
- [ ] Submission date shown
- [ ] Auto-approval indicator shown
- [ ] "Review" button works
- [ ] Table sortable
- [ ] Pagination works (if many claims)

---

## 🤖 Automated Validation

### Validation Pipeline
- [ ] Triggered automatically on claim submission
- [ ] Background job created in Redis
- [ ] Worker processes job
- [ ] Validation rules executed:
  - [ ] Policy active check
  - [ ] Date range check
  - [ ] Coverage amount check
  - [ ] Documents uploaded check
  - [ ] OCR performed (if images uploaded)
  - [ ] Amount verification (if OCR successful)
- [ ] Results saved to database
- [ ] Claim status updated based on results
- [ ] Audit log created

### Auto-Approval Logic
- [ ] Small claims (<$5,000) auto-approved if all pass
- [ ] Auto-approval flag set
- [ ] Amount approved equals amount claimed
- [ ] Audit log notes auto-approval
- [ ] Badge shown on claim details
- [ ] Badge shown in insurer dashboard

### OCR Processing
- [ ] Text extracted from images
- [ ] OCR text stored with document
- [ ] Amount extraction attempted
- [ ] Date extraction attempted
- [ ] Confidence score calculated
- [ ] Results shown in validation details
- [ ] Warning if OCR fails
- [ ] Warning if amounts don't match

---

## 🔒 Security

### Input Validation
- [ ] Email format validated
- [ ] Password strength enforced
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] File type restrictions enforced
- [ ] File size limits enforced
- [ ] Required fields enforced

### Authentication
- [ ] Passwords hashed
- [ ] Tokens expire
- [ ] Invalid tokens rejected
- [ ] Expired tokens handled
- [ ] Protected routes enforced
- [ ] Role-based access enforced

### API Security
- [ ] Authorization header required
- [ ] CORS configured
- [ ] Error messages don't leak info
- [ ] Rate limiting ready
- [ ] Helmet.js headers applied

---

## 📊 Data Integrity

### Database
- [ ] Foreign keys enforced
- [ ] Cascade deletes work
- [ ] Timestamps auto-updated
- [ ] UUID primary keys generated
- [ ] Enums validated
- [ ] Decimal precision correct
- [ ] Indexes created
- [ ] Relationships working

### File Storage
- [ ] Files saved with unique names
- [ ] File paths stored correctly
- [ ] Files accessible via URL
- [ ] Upload directory created
- [ ] Files persist after restart

### Audit Trail
- [ ] Every action logged
- [ ] Actor ID recorded
- [ ] Timestamp recorded
- [ ] Details captured
- [ ] Logs immutable
- [ ] Logs queryable

---

## 🎨 UI/UX

### Responsiveness
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Navigation collapses on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Forms stack on mobile

### Visual Feedback
- [ ] Loading states show spinners
- [ ] Buttons show hover states
- [ ] Links show hover states
- [ ] Forms show validation errors
- [ ] Success messages displayed
- [ ] Error messages displayed
- [ ] Empty states show helpful messages
- [ ] Disabled states clearly visible

### Accessibility
- [ ] Keyboard navigation works
- [ ] Form labels present
- [ ] Color contrast sufficient
- [ ] Alt text on images
- [ ] ARIA labels where needed
- [ ] Focus indicators visible

---

## 🚀 Performance

### Load Times
- [ ] Frontend loads <3 seconds
- [ ] API responses <100ms
- [ ] File uploads <5 seconds (for 10MB)
- [ ] Database queries optimized
- [ ] Images lazy loaded

### Scalability
- [ ] Can handle 10 concurrent users
- [ ] Can handle 100 claims
- [ ] Can handle 1000 documents
- [ ] Background jobs don't block
- [ ] Redis queue handles backlog

---

## 🐛 Error Handling

### User Errors
- [ ] Invalid login shows error
- [ ] Network errors caught
- [ ] File upload errors shown
- [ ] Form validation errors displayed
- [ ] 404 pages handled
- [ ] Friendly error messages

### Server Errors
- [ ] 500 errors caught
- [ ] Database errors handled
- [ ] File system errors handled
- [ ] OCR errors handled
- [ ] Redis errors handled
- [ ] Graceful degradation

---

## 📦 Docker & Deployment

### Containers
- [ ] All 4 containers start
- [ ] Health checks pass
- [ ] Volumes persist data
- [ ] Networks isolated
- [ ] Environment variables work
- [ ] Can restart without issues
- [ ] Can rebuild without errors

### Commands
- [ ] `docker-compose up` works
- [ ] `docker-compose down` works
- [ ] `docker-compose logs` works
- [ ] `docker-compose exec` works
- [ ] Seed script runs
- [ ] Setup scripts work

---

## 🎯 End-to-End Scenarios

### Scenario 1: Happy Path (User)
- [ ] Register account
- [ ] Submit health claim <$5K with documents
- [ ] Claim auto-approved
- [ ] View approved claim
- [ ] See validation results (all passed)
- [ ] Download receipt

### Scenario 2: Manual Review (User)
- [ ] Login
- [ ] Submit vehicle claim >$5K
- [ ] Claim marked "under review"
- [ ] Add note requesting update
- [ ] Wait for insurer decision

### Scenario 3: Claim Review (Insurer)
- [ ] Login as insurer
- [ ] View pending claims
- [ ] Filter by "under_review"
- [ ] Open claim details
- [ ] Review documents
- [ ] Check validations
- [ ] Approve with adjusted amount
- [ ] Add note explaining decision

### Scenario 4: Rejection (Insurer)
- [ ] Login as insurer
- [ ] Find claim with failed validations
- [ ] Review validation failures
- [ ] Reject claim with reason
- [ ] Add internal note
- [ ] Verify audit log updated

### Scenario 5: OCR Validation
- [ ] Submit claim with invoice image
- [ ] OCR extracts amount
- [ ] Amount matches claim
- [ ] Validation passes
- [ ] See OCR results in validation

---

## ✅ Final Checks

- [ ] No console errors
- [ ] No React warnings
- [ ] No database errors
- [ ] No memory leaks
- [ ] All links work
- [ ] All buttons work
- [ ] All forms submit
- [ ] All API calls succeed
- [ ] Documentation complete
- [ ] README accurate
- [ ] Demo credentials work

---

## 📝 Notes

Record any issues found:

```
Issue: [Description]
Steps to Reproduce:
1. 
2. 
3. 
Expected: 
Actual: 
Severity: [Low/Medium/High]
Fixed: [Yes/No]
```

---

**Testing completed on:** [Date]
**Tested by:** [Name]
**Result:** [Pass/Fail]
**Comments:**

---

🎉 **If all items checked, system is ready for demo/production!**
