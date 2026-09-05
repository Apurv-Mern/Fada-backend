const {
  listNotifications,
  getLatestNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../../../services/notificationService");

function getDealerRecipientId(req) {
  return req.currentDealerId || req.auth.id;
}

/*
@API: GET /dealers/notifications
@Desc: Get dealer notifications
@Access: Private
*/
exports.getNotifications = async (req, res) => {
  try {
    const data = await listNotifications(
      { dealerId: getDealerRecipientId(req) },
      req.query,
    );
    return res.apiSuccess("Notifications fetched successfully", data);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/notifications/latest
@Desc: Get latest 5 dealer notifications
@Access: Private
*/
exports.getLatestNotifications = async (req, res) => {
  try {
    const notifications = await getLatestNotifications({
      dealerId: getDealerRecipientId(req),
    });
    return res.apiSuccess("Latest notifications fetched successfully", { notifications });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/notifications/unread-count
@Desc: Get unread notification count
@Access: Private
*/
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadCount({ dealerId: getDealerRecipientId(req) });
    return res.apiSuccess("Unread notification count fetched successfully", { count });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PATCH /dealers/notifications/:id/read
@Desc: Mark notification as read
@Access: Private
*/
exports.markAsRead = async (req, res) => {
  try {
    const notification = await markNotificationRead(req.params.id, {
      dealerId: getDealerRecipientId(req),
    });

    if (!notification) {
      return res.apiError("Notification not found", 404);
    }

    return res.apiSuccess("Notification marked as read", notification);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PATCH /dealers/notifications/read-all
@Desc: Mark all notifications as read
@Access: Private
*/
exports.markAllAsRead = async (req, res) => {
  try {
    const updatedCount = await markAllNotificationsRead({
      dealerId: getDealerRecipientId(req),
    });
    return res.apiSuccess("All notifications marked as read", { updatedCount });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
