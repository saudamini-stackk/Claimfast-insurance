# ClaimFast - Insurance Claim Portal Backend

ClaimFast is a student-friendly insurance claim management backend built using Node.js, Express.js and MongoDB.

It provides APIs for managing users, policies, claims, documents, adjusters, payouts, renewals, reports and notifications.

---

## Features

- User registration and login
- JWT authentication
- Firebase Authentication
- Role-based authorization
- Policy management
- Claim management and status tracking
- Photo and document uploads
- Adjuster management
- Mock payout processing
- Renewal reminders
- Claim reports
- Firebase push notification support
- Socket.IO real-time claim updates
- REST API testing with Hoppscotch/Postman

---

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Firebase Admin SDK
- Firebase Authentication
- Firebase Cloud Messaging
- Socket.IO

---

## Project Structure

```text
ClaimFast_Backend/
│
├── server.js
├── seed.js
├── package.json
├── package-lock.json
├── README.md
├── .env.example
├── .gitignore
│
├── docs/
│   ├── API.md
│   ├── ClaimFast.postman_collection.json
│   ├── DEPLOYMENT.md
│   └── Hoppscotch_Testing.md
│
├── src/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
└── uploads/
```

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 3. Configure Firebase

Place the Firebase service account file in the project root:

```text
firebase-service-account.json
```

Keep this file private and do not upload it to GitHub.

### 4. Start the Server

```bash
npm start
```

Server:

```text
http://localhost:5001
```

---

## User Roles

### Policyholder

- Manage own claims
- View policies
- Upload claim documents

### Adjuster

- View claims
- Update claim status
- Manage adjuster records
- Process payouts

### Admin

- Manage system records
- Manage adjusters
- Update claim status
- Access reports

---

## Main API Modules

```text
Authentication
Policies
Claims
Documents
Adjusters
Payouts
Renewals
Reports
Notifications
```

Detailed endpoints and request formats are available in:

```text
docs/API.md
```

---

## Testing

The API can be tested using Hoppscotch or Postman.

Detailed testing requests, sample data, authentication steps and expected responses are available in:

```text
docs/Hoppscotch_Testing.md
```

The Postman collection can be imported into Hoppscotch:

```text
docs/ClaimFast.postman_collection.json
```

---

## Additional Documentation

| File | Purpose |
|---|---|
| `docs/API.md` | API endpoint documentation |
| `docs/Hoppscotch_Testing.md` | Step-by-step API testing |
| `docs/DEPLOYMENT.md` | Deployment instructions |
| `docs/ClaimFast.postman_collection.json` | API request collection |

---

## Security

The following files must not be uploaded to GitHub:

```text
.env
firebase-service-account.json
node_modules/
```

The project uses `.gitignore` to exclude sensitive and generated files.

---

## Deployment

The ClaimFast backend is deployed on Render.

**Live API:** https://claimfast-insurance.onrender.com

---

## Project Note

The payout system uses a mock bank transfer because a real banking API is outside the scope of the student project.

Firebase Cloud Messaging is integrated for claim status notifications. Actual push delivery requires an FCM registration token from a client device or browser.

---

## Author

**ClaimFast**

Insurance Claim Portal Backend  
 Saudamini Nayak
