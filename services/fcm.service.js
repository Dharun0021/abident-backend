const { admin, firebaseInitialized } = require("../config/firebase");

const sendNotification = async (token, title, body, data = {}) => {
  if (!token) {
    return { success: false, reason: "MISSING_TOKEN" };
  }

  if (!firebaseInitialized) {
    return { success: false, reason: "FIREBASE_NOT_INITIALIZED" };
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {}),
  };

  const response = await admin.messaging().send(message);
  return { success: true, messageId: response };
};

module.exports = { sendNotification };
