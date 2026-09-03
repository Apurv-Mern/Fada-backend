var admin = require("firebase-admin");
 
var serviceAccount = require("./../config/fada-id-firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// send single push notification to a device
const sendPushNotification = async (
  { tokens, title, body, data }
) => {
  try {
    const message = {
      tokens: tokens,

      notification: {
        title: title,
        body: body,
      },

      data: {
        ...data,
      },

      android: {
        priority: "high",
      },
    };

    const response = await admin.messaging().send(message);

    return response;
  } catch (error) {
    throw error;
  }
};
 

module.exports = { 
  sendPushNotification, 
};
