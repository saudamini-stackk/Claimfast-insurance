const fs = require("fs");
const admin = require("firebase-admin");

let firebaseReady = false;

try {
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json";

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(require("path").resolve(serviceAccountPath));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    firebaseReady = true;
    console.log("Firebase Admin connected");
  } else {
    console.log("Firebase service account not found. Firebase features are disabled.");
  }
} catch (error) {
  console.log("Firebase setup skipped:", error.message);
}

async function verifyFirebaseToken(idToken) {
  if (!firebaseReady) {
    throw new Error("Firebase is not configured. Add firebase-service-account.json.");
  }

  return admin.auth().verifyIdToken(idToken);
}

async function sendPushNotification(token, title, body) {
  if (!firebaseReady) {
    return {
      sent: false,
      message: "Firebase is not configured. Notification saved as a mock notification."
    };
  }

  const response = await admin.messaging().send({
    token,
    notification: { title, body }
  });

  return { sent: true, messageId: response };
}

module.exports = {
  verifyFirebaseToken,
  sendPushNotification
};
