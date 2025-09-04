const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      firebaseInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }
};

// Send push notification to a single user
const sendPushNotification = async (userId, notification) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    const user = await User.findById(userId).select('fcmToken deviceTokens');
    if (!user || (!user.fcmToken && (!user.deviceTokens || user.deviceTokens.length === 0))) {
      console.log(`No FCM token found for user ${userId}`);
      return false;
    }

    const { title, body, data = {}, icon, badge } = notification;

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        userId: userId.toString(),
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          icon: icon || 'ic_notification',
          color: '#007bff',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body
            },
            badge: badge || 1,
            sound: 'default'
          }
        }
      }
    };

    // Send to primary FCM token
    if (user.fcmToken) {
      try {
        message.token = user.fcmToken;
        const response = await admin.messaging().send(message);
        console.log('Push notification sent successfully:', response);
        return true;
      } catch (error) {
        console.error('Error sending to primary FCM token:', error);
      }
    }

    // Send to device tokens if primary token failed or doesn't exist
    if (user.deviceTokens && user.deviceTokens.length > 0) {
      const tokens = user.deviceTokens.map(device => device.token).filter(token => token);

      if (tokens.length > 0) {
        try {
          message.tokens = tokens;
          const response = await admin.messaging().sendMulticast(message);
          console.log('Push notification sent to device tokens:', response);

          // Remove invalid tokens
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, index) => {
              if (!resp.success) {
                failedTokens.push(tokens[index]);
              }
            });

            if (failedTokens.length > 0) {
              await User.findByIdAndUpdate(userId, {
                $pull: { deviceTokens: { token: { $in: failedTokens } } }
              });
            }
          }

          return response.successCount > 0;
        } catch (error) {
          console.error('Error sending to device tokens:', error);
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
};

// Send push notification to multiple users
const sendPushNotificationToUsers = async (userIds, notification) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    const users = await User.find({ _id: { $in: userIds } })
      .select('fcmToken deviceTokens')
      .lean();

    const tokens = [];
    users.forEach(user => {
      if (user.fcmToken) {
        tokens.push(user.fcmToken);
      }
      if (user.deviceTokens && user.deviceTokens.length > 0) {
        user.deviceTokens.forEach(device => {
          if (device.token) {
            tokens.push(device.token);
          }
        });
      }
    });

    if (tokens.length === 0) {
      console.log('No FCM tokens found for the specified users');
      return false;
    }

    const { title, body, data = {}, icon, badge } = notification;

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      tokens,
      android: {
        priority: 'high',
        notification: {
          icon: icon || 'ic_notification',
          color: '#007bff',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body
            },
            badge: badge || 1,
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Bulk push notification sent:', response);

    return response.successCount > 0;
  } catch (error) {
    console.error('Bulk push notification error:', error);
    return false;
  }
};

// Send push notification to all admins
const sendPushNotificationToAdmins = async (notification) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true })
      .select('_id')
      .lean();

    const adminIds = admins.map(admin => admin._id);
    return await sendPushNotificationToUsers(adminIds, notification);
  } catch (error) {
    console.error('Admin push notification error:', error);
    return false;
  }
};

// Predefined notification templates
const notificationTemplates = {
  bookingConfirmed: (bookingData) => ({
    title: 'Booking Confirmed! 🎉',
    body: `Your booking for ${bookingData.carName} has been confirmed.`,
    data: {
      type: 'booking_confirmed',
      bookingId: bookingData.bookingId,
      carId: bookingData.carId
    },
    icon: 'ic_booking_confirmed'
  }),

  bookingCancelled: (bookingData) => ({
    title: 'Booking Cancelled',
    body: `Your booking for ${bookingData.carName} has been cancelled.`,
    data: {
      type: 'booking_cancelled',
      bookingId: bookingData.bookingId,
      carId: bookingData.carId
    },
    icon: 'ic_booking_cancelled'
  }),

  paymentSuccessful: (paymentData) => ({
    title: 'Payment Successful 💳',
    body: `Payment of $${paymentData.amount} has been processed successfully.`,
    data: {
      type: 'payment_successful',
      bookingId: paymentData.bookingId,
      amount: paymentData.amount.toString()
    },
    icon: 'ic_payment_successful'
  }),

  paymentFailed: (paymentData) => ({
    title: 'Payment Failed',
    body: `Payment of $${paymentData.amount} could not be processed. Please try again.`,
    data: {
      type: 'payment_failed',
      bookingId: paymentData.bookingId,
      amount: paymentData.amount.toString()
    },
    icon: 'ic_payment_failed'
  }),

  bookingReminder: (bookingData) => ({
    title: 'Booking Reminder ⏰',
    body: `Your booking for ${bookingData.carName} starts in ${bookingData.hoursUntil} hours.`,
    data: {
      type: 'booking_reminder',
      bookingId: bookingData.bookingId,
      carId: bookingData.carId,
      startTime: bookingData.startTime
    },
    icon: 'ic_booking_reminder'
  }),

  carApproved: (carData) => ({
    title: 'Car Listing Approved ✅',
    body: `Your car ${carData.carName} has been approved and is now live!`,
    data: {
      type: 'car_approved',
      carId: carData.carId
    },
    icon: 'ic_car_approved'
  }),

  carRejected: (carData) => ({
    title: 'Car Listing Rejected',
    body: `Your car ${carData.carName} listing was rejected. Reason: ${carData.reason}`,
    data: {
      type: 'car_rejected',
      carId: carData.carId
    },
    icon: 'ic_car_rejected'
  }),

  newMessage: (messageData) => ({
    title: 'New Message 💬',
    body: `You have a new message regarding your booking.`,
    data: {
      type: 'new_message',
      bookingId: messageData.bookingId,
      senderId: messageData.senderId
    },
    icon: 'ic_new_message'
  }),

  reviewReceived: (reviewData) => ({
    title: 'New Review ⭐',
    body: `Someone left a review for your car ${reviewData.carName}.`,
    data: {
      type: 'review_received',
      carId: reviewData.carId,
      reviewId: reviewData.reviewId
    },
    icon: 'ic_review_received'
  }),

  adminAlert: (alertData) => ({
    title: 'Admin Alert ⚠️',
    body: alertData.message,
    data: {
      type: 'admin_alert',
      alertType: alertData.alertType,
      referenceId: alertData.referenceId
    },
    icon: 'ic_admin_alert'
  })
};

// Convenience functions using templates
const sendBookingConfirmation = async (userId, bookingData) => {
  const notification = notificationTemplates.bookingConfirmed(bookingData);
  return await sendPushNotification(userId, notification);
};

const sendBookingCancellation = async (userId, bookingData) => {
  const notification = notificationTemplates.bookingCancelled(bookingData);
  return await sendPushNotification(userId, notification);
};

const sendPaymentSuccess = async (userId, paymentData) => {
  const notification = notificationTemplates.paymentSuccessful(paymentData);
  return await sendPushNotification(userId, notification);
};

const sendPaymentFailure = async (userId, paymentData) => {
  const notification = notificationTemplates.paymentFailed(paymentData);
  return await sendPushNotification(userId, notification);
};

const sendBookingReminder = async (userId, bookingData) => {
  const notification = notificationTemplates.bookingReminder(bookingData);
  return await sendPushNotification(userId, notification);
};

const sendCarApproval = async (userId, carData) => {
  const notification = notificationTemplates.carApproved(carData);
  return await sendPushNotification(userId, notification);
};

const sendCarRejection = async (userId, carData) => {
  const notification = notificationTemplates.carRejected(carData);
  return await sendPushNotification(userId, notification);
};

const sendNewMessageNotification = async (userId, messageData) => {
  const notification = notificationTemplates.newMessage(messageData);
  return await sendPushNotification(userId, notification);
};

const sendReviewNotification = async (userId, reviewData) => {
  const notification = notificationTemplates.reviewReceived(reviewData);
  return await sendPushNotification(userId, notification);
};

const sendAdminAlert = async (alertData) => {
  const notification = notificationTemplates.adminAlert(alertData);
  return await sendPushNotificationToAdmins(notification);
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendPushNotificationToUsers,
  sendPushNotificationToAdmins,
  notificationTemplates,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendPaymentSuccess,
  sendPaymentFailure,
  sendBookingReminder,
  sendCarApproval,
  sendCarRejection,
  sendNewMessageNotification,
  sendReviewNotification,
  sendAdminAlert
};
