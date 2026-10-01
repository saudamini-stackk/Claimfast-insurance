# ClaimFast Hoppscotch Testing Guide

This document contains the API testing steps used to test the ClaimFast backend using Hoppscotch.

## Base URL

```text
http://localhost:5001
```

## Before Testing

Start the backend from the ClaimFast project folder:

```bash
npm start
```

The server should show:

```text
Firebase Admin connected
MongoDB connected
ClaimFast server running on http://localhost:5001
```

---

# 1. Authentication

## 1.1 Register

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/auth/register
```

### Body

Select:

```text
Body → JSON
```

Use:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "123456"
}
```

### Expected Result

```text
Status: 201 Created
```

A new policyholder account is created.

---

# 2. Login

## Request

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/auth/login
```

### Body

```json
{
  "email": "demo@example.com",
  "password": "123456"
}
```

### Expected Result

```text
Status: 200 OK
```

The response contains a ClaimFast JWT.

Copy the JWT and use it for protected requests:

```text
Authorization: Bearer YOUR_JWT
```

Do not save the actual JWT in project documentation.

---

# 3. Firebase Authentication

Firebase Authentication was also tested successfully.

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/auth/firebase
```

### Body

```json
{
  "idToken": "FIREBASE_ID_TOKEN"
}
```

The Firebase ID token is obtained from Firebase Authentication.

### Expected Result

```text
Status: 200 OK
```

The response confirms:

```text
Firebase authentication successful
```

A ClaimFast JWT is also returned.

---

# 4. Policies

## 4.1 Get Policies

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/policies
```

### Header

```text
Authorization: Bearer YOUR_JWT
```

### Expected Result

```text
Status: 200 OK
```

---

## 4.2 Tested Policy

The following policy was used during testing.

```text
Policy ID:
6abcc68a811277aa0fccd7dc

Policy Number:
POL-1790756490365-591
```

---

## 4.3 Get Specific Policy

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/policies/6abcc68a811277aa0fccd7dc
```

### Header

```text
Authorization: Bearer YOUR_JWT
```

### Expected Result

```text
Status: 200 OK
```

The policy details are returned successfully.

---

# 5. Claims

## 5.1 Create Claim

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/claims
```

### Header

```text
Authorization: Bearer YOUR_JWT
```

### Body

Select:

```text
Body → Multipart Form
```

Add:

```text
policy        = 6abcc68a811277aa0fccd7dc
description   = Car dent after minor accident
damageAmount  = 25000
firNumber     = FIR001
photos        = Select an image file
```

### Expected Result

```text
Status: 201 Created
```

A claim number and claim ID are generated.

---

## 5.2 Tested Claim

The following claim was used for the remaining tests.

```text
Claim ID:
6abcd267aa54bc4a34491a33

Claim Number:
CLM-1790759527482-734
```

---

## 5.3 Get Claims

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/claims
```

### Header

```text
Authorization: Bearer YOUR_JWT
```

### Expected Result

```text
Status: 200 OK
```

---

## 5.4 Get Specific Claim

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/claims/6abcd267aa54bc4a34491a33
```

### Expected Result

```text
Status: 200 OK
```

---

## 5.5 Update Claim

### Method

```text
PUT
```

### URL

```text
http://localhost:5001/api/claims/6abcd267aa54bc4a34491a33
```

### Header

```text
Authorization: Bearer YOUR_JWT
```

### Body

```json
{
  "description": "Updated accident description",
  "damageAmount": 28000
}
```

### Expected Result

```text
Status: 200 OK
```

---

# 6. Claim Status Update

Only an adjuster or admin can update claim status.

### Method

```text
PUT
```

### URL

```text
http://localhost:5001/api/claims/6abcd267aa54bc4a34491a33/status
```

### Header

```text
Authorization: Bearer ADJUSTER_OR_ADMIN_JWT
```

### Body

```json
{
  "status": "approved"
}
```

### Expected Result

```text
Status: 200 OK
```

The claim status becomes:

```text
approved
```

The system also:

- assigns the adjuster
- creates a notification
- emits the Socket.IO event
- attempts Firebase push notification if an FCM token exists

---

# 7. Documents

## 7.1 Upload Document

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/documents
```

### Header

```text
Authorization: Bearer YOUR_JWT
```

### Body

Select:

```text
Body → Multipart Form
```

Fields:

```text
title = Accident FIR
type = FIR
claim = 6abcd267aa54bc4a34491a33
file = Select a file
```

### Expected Result

```text
Status: 201 Created
```

---

## 7.2 Get Documents

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/documents
```

### Expected Result

```text
Status: 200 OK
```

---

## 7.3 Get Claim Documents

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/documents/claims/6abcd267aa54bc4a34491a33
```

### Expected Result

```text
Status: 200 OK
```

---

## 7.4 Generate Policy Document

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/documents/generate
```

### Body

```json
{
  "policy": "6abcc68a811277aa0fccd7dc",
  "title": "Generated Policy Document"
}
```

### Expected Result

```text
Status: 201 Created
```

A policy document is generated successfully.

---

# 8. Adjusters

An adjuster account was created for testing.

```text
Employee ID:
ADJ-001
```

The department was later updated to:

```text
Claims & Verification
```

## Create Adjuster

Only an admin can create an adjuster.

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/adjusters
```

### Expected Result

```text
Status: 201 Created
```

---

## Authorization Test

An adjuster token was used to attempt the admin-only create-adjuster operation.

### Result

```text
Status: 403 Forbidden
```

This confirmed that role-based authorization is working.

---

# 9. Payouts

The tested claim was:

```text
Claim ID:
6abcd267aa54bc4a34491a33
```

The claim was first changed to:

```text
approved
```

## Create Payout

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/payouts
```

### Header

```text
Authorization: Bearer ADJUSTER_OR_ADMIN_JWT
```

### Body

```json
{
  "claim": "6abcd267aa54bc4a34491a33",
  "amount": 25000,
  "bankAccount": "XXXX1234"
}
```

### Expected Result

```text
Status: 201 Created
```

The payout was successfully created using the mock bank transfer system.

The payout status became:

```text
paid
```

---

## Get Payouts

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/payouts
```

### Expected Result

```text
Status: 200 OK
```

---

## Get Payout by Claim

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/payouts/claim/6abcd267aa54bc4a34491a33
```

### Expected Result

```text
Status: 200 OK
```

---

# 10. Renewals

The tested policy was:

```text
Policy ID:
6abcc68a811277aa0fccd7dc
```

## Create Renewal Reminder

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/renewals
```

### Body

```json
{
  "policy": "6abcc68a811277aa0fccd7dc",
  "reminderDate": "2026-10-15"
}
```

### Expected Result

```text
Status: 201 Created
```

---

## Get Renewals

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/renewals
```

### Expected Result

```text
Status: 200 OK
```

The response contains:

```text
Saved renewal reminders
Upcoming policies within 30 days
```

---

# 11. Reports

Reports are available to adjusters and admins.

## Claims Report

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/reports/claims
```

### Expected Result

```text
Status: 200 OK
```

The response contains:

```text
totalClaims
approvedClaims
rejectedClaims
paidClaims
```

---

## Monthly Report

### Method

```text
GET
```

### URL

```text
http://localhost:5001/api/reports/monthly
```

### Expected Result

```text
Status: 200 OK
```

The response contains monthly:

```text
claim count
total damage amount
```

---

# 12. Notifications

## Send Notification

### Method

```text
POST
```

### URL

```text
http://localhost:5001/api/notifications/send
```

### Body

```json
{
  "user": "USER_ID",
  "title": "Claim Update",
  "body": "Your claim has been approved."
}
```

### Expected Result

```text
Status: 201 Created
```

The notification is saved in MongoDB.

Firebase push delivery requires an actual FCM registration token.

---

# 13. Socket.IO

ClaimFast uses Socket.IO for real-time claim status updates.

### Event

```text
claimStatusUpdated
```

When an adjuster or admin changes a claim status, connected clients receive the updated claim information.

Example:

```json
{
  "claimId": "6abcd267aa54bc4a34491a33",
  "status": "approved"
}
```

---

# 14. Error and Authorization Testing

The following error cases were also tested.

## Missing Required Field

A required field was removed from a request.

### Result

```text
400 Bad Request
```

---

## Invalid Resource

An invalid policy/resource ID was used.

### Result

```text
404 Not Found
```

---

## Unauthorized Role

An adjuster attempted an admin-only operation.

### Result

```text
403 Forbidden
```

This confirmed that role-based access control is working.

---

# 15. Main Testing Flow for Viva

The main ClaimFast workflow can be demonstrated in this order:

```text
1. Login
      ↓
2. Get Policy
      ↓
3. Create Claim
      ↓
4. Get Claim
      ↓
5. Adjuster updates claim status
      ↓
6. Notification is created
      ↓
7. Upload Claim Document
      ↓
8. Create Payout
      ↓
9. Check Payout
      ↓
10. Create Renewal Reminder
      ↓
11. View Reports
```

Important tested IDs:

```text
Policy ID:
6abcc68a811277aa0fccd7dc

Policy Number:
POL-1790756490365-591

Claim ID:
6abcd267aa54bc4a34491a33

Claim Number:
CLM-1790759527482-734

Adjuster Employee ID:
ADJ-001
```

The backend was tested successfully using Hoppscotch with authentication, CRUD operations, role-based authorization, file uploads, payouts, renewals, reports, notifications and real-time claim updates.