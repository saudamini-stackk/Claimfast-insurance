# ClaimFast Deployment Notes

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 3. Start the Server

```bash
npm start
```

The local server runs at:

```text
http://localhost:5001
```

---

## Render Deployment

### 1. Push the Project to GitHub

Make sure the following are excluded from GitHub:

```text
.env
firebase-service-account.json
node_modules/
```

### 2. Create a Render Web Service

Connect the ClaimFast GitHub repository to Render and create a Web Service.

### 3. Configure Build Command

```text
npm install
```

### 4. Configure Start Command

```text
npm start
```

### 5. Add Environment Variables

Add the required environment variables in the Render dashboard:

```text
MONGO_URI
JWT_SECRET
```

If Firebase is enabled, configure the Firebase service account securely using deployment secrets or the deployment platform's secret management.

### 6. MongoDB

Use a MongoDB Atlas connection string for the deployed application.

Do not place database credentials directly in the source code.

---

## Security

Never upload the following files to GitHub:

```text
.env
firebase-service-account.json
node_modules/
```

Keep database credentials, JWT secrets and Firebase credentials in environment variables or secure deployment secrets.