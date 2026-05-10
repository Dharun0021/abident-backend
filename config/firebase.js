const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let initialized = false;

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (parseError) {
      throw new Error(
        `Invalid FIREBASE_SERVICE_ACCOUNT_JSON value: ${parseError.message}`
      );
    }
  }

  const defaultPath = path.join(__dirname, "serviceAccountKey.json");
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : defaultPath;

  if (fs.existsSync(envPath)) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(envPath);
  }

  if (envPath !== defaultPath && fs.existsSync(defaultPath)) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(defaultPath);
  }

  throw new Error(
    `Firebase service account not found. Checked: ${envPath} and ${defaultPath}. ` +
      "Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON."
  );
};

try {
  if (!admin.apps.length) {
    const serviceAccount = loadServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
    });
    initialized = true;
    console.log("Firebase Admin initialized successfully.");
  } else {
    initialized = true;
  }
} catch (error) {
  console.warn("Firebase not initialized. Add serviceAccountKey.json to enable FCM.");
  console.warn(error.message);
}

module.exports = { admin, firebaseInitialized: initialized };
