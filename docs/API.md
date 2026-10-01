# ClaimFast API Documentation

ClaimFast provides REST APIs for authentication, policies, claims, documents, adjusters, payouts, renewals, reports and notifications.

## Base URL

```text
http://localhost:5001
```

Protected endpoints require a JWT:

```text
Authorization: Bearer YOUR_JWT
```

---

## 1. Authentication

### Register

```http
POST /api/auth/register
```

Creates a new policyholder account.

```json
{
  "name": "User",
  "email": "user@example.com",
  "password": "123456"
}
```

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Returns a JWT for authenticated API requests.

### Firebase Authentication

```http
POST /api/auth/firebase
```

```json
{
  "idToken": "FIREBASE_ID_TOKEN",
  "fcmToken": "OPTIONAL_FCM_TOKEN"
}
```

Authenticates a Firebase user and returns a ClaimFast JWT.

---

## 2. Policies

### Create Policy

```http
POST /api/policies
```

```json
{
  "policyType": "Car Insurance",
  "vehicleNumber": "MH46AB1234",
  "coverageAmount": 500000,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

### Get All Policies

```http
GET /api/policies
```

### Get Policy by ID

```http
GET /api/policies/:id
```

### Update Policy

```http
PUT /api/policies/:id
```

### Delete Policy

```http
DELETE /api/policies/:id
```

---

## 3. Claims

### Create Claim

```http
POST /api/claims
```

Uses `multipart/form-data`.

Fields:

```text
policy
description
damageAmount
firNumber
photos
```

### Get All Claims

```http
GET /api/claims
```

### Get Claim by ID

```http
GET /api/claims/:id
```

### Update Claim

```http
PUT /api/claims/:id
```

### Update Claim Status

```http
PUT /api/claims/:id/status
```

```json
{
  "status": "approved"
}
```

Allowed statuses:

```text
submitted
under_review
approved
rejected
paid
```

Only adjusters and admins can update claim status.

### Delete Claim

```http
DELETE /api/claims/:id
```

---

## 4. Documents

### Generate Policy Document

```http
POST /api/documents/generate
```

```json
{
  "policy": "POLICY_ID",
  "title": "My Policy Document"
}
```

### Upload Document

```http
POST /api/documents
```

Uses `multipart/form-data`.

Fields:

```text
title
type
claim or policy
file
```

### Get All Documents

```http
GET /api/documents
```

### Get Claim Documents

```http
GET /api/documents/claims/:id
```

### Delete Document

```http
DELETE /api/documents/:id
```

---

## 5. Adjusters

### Get All Adjusters

```http
GET /api/adjusters
```

### Get Adjuster by ID

```http
GET /api/adjusters/:id
```

### Create Adjuster

```http
POST /api/adjusters
```

```json
{
  "user": "USER_ID",
  "employeeId": "ADJ001",
  "department": "Claims"
}
```

Only admins can create adjusters.

### Update Adjuster

```http
PUT /api/adjusters/:id
```

### Delete Adjuster

```http
DELETE /api/adjusters/:id
```

Only admins can delete adjusters.

---

## 6. Payouts

### Create Payout

```http
POST /api/payouts
```

Only adjusters and admins can create payouts.

```json
{
  "claim": "CLAIM_ID",
  "amount": 25000,
  "bankAccount": "XXXX1234"
}
```

The claim must be approved before creating a payout.

### Get All Payouts

```http
GET /api/payouts
```

### Get Payout by Claim

```http
GET /api/payouts/claim/:id
```

### Update Payout

```http
PUT /api/payouts/:id
```

### Delete Payout

```http
DELETE /api/payouts/:id
```

The payout system uses a mock bank transfer for the case study.

---

## 7. Renewals

### Get Renewals

```http
GET /api/renewals
```

Returns saved renewal reminders and policies ending within the next 30 days.

### Create Renewal Reminder

```http
POST /api/renewals
```

```json
{
  "policy": "POLICY_ID",
  "reminderDate": "2026-10-15"
}
```

---

## 8. Reports

### Claim Summary Report

```http
GET /api/reports/claims
```

Returns:

- Total claims
- Approved claims
- Rejected claims
- Paid claims

### Monthly Report

```http
GET /api/reports/monthly
```

Returns monthly claim count and total damage amount.

Only adjusters and admins can access reports.

---

## 9. Notifications

### Send Notification

```http
POST /api/notifications/send
```

```json
{
  "user": "USER_ID",
  "title": "Claim Update",
  "body": "Your claim has been approved.",
  "token": "OPTIONAL_FCM_TOKEN"
}
```

The notification is stored in MongoDB.

If an FCM token is provided and Firebase is configured, the system also attempts to send a Firebase push notification.

---

## 10. Socket.IO

ClaimFast supports real-time claim status updates using Socket.IO.

### Event

```text
claimStatusUpdated
```

When a claim status is changed, connected clients receive:

```json
{
  "claimId": "CLAIM_ID",
  "status": "approved"
}
```

---

## 11. Role Summary

| API Area | Policyholder | Adjuster | Admin |
|---|---|---|---|
| Authentication | Yes | Yes | Yes |
| Policies | Yes | Yes | Yes |
| Claims | Own claims | All claims | All claims |
| Claim Status | No | Yes | Yes |
| Adjusters | Read | Read/Update | Manage |
| Payouts | Read | Manage | Manage |
| Reports | No | Yes | Yes |
| Notifications | Yes | Yes | Yes |

---

## Authentication Flow

1. Register or log in.
2. Receive a JWT.
3. Add the JWT to protected requests.
4. Use the required role for restricted endpoints.

```text
Authorization: Bearer YOUR_JWT
```