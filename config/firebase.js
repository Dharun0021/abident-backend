const admin = require("firebase-admin");
const path = require("path");

let initialized = false;

try {
  if (!admin.apps.length) {
    const serviceAccountPath = path.join(
      __dirname,
      "..",
      "serviceAccountKey.json"
    );

    // Lazy initialization allows API usage even if firebase creds are not set yet.
    // Notification send errors are handled gracefully in the service layer.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  } else {
    initialized = true;
  }
} catch (error) {
  console.warn(
    "Firebase not initialized. Add serviceAccountKey.json to enable FCM."
  );
}

module.exports = { admin, firebaseInitialized: initialized };
