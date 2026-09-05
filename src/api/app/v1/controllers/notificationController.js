const {
  listNotifications,
  getLatestNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../../../../services/notificationService");

/*
@API: GET /api/v1/employee/notifications
@Desc: Get employee notifications
@Access: Private
*/
exports.getNotifications = async (req, res) => {
  try {
    const data = await listNotifications({ employeeId: req.auth.id }, req.query);
    return res.apiSuccess("Notifications fetched successfully", data);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /api/v1/employee/notifications/latest
@Desc: Get latest 5 employee notifications
@Access: Private
*/
exports.getLatestNotifications = async (req, res) => {
  try {
    const notifications = await getLatestNotifications({ employeeId: req.auth.id });
    return res.apiSuccess("Latest notifications fetched successfully", { notifications });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /api/v1/employee/notifications/unread-count
@Desc: Get unread notification count
@Access: Private
*/
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadCount({ employeeId: req.auth.id });
    return res.apiSuccess("Unread notification count fetched successfully", { count });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PATCH /api/v1/employee/notifications/:id/read
@Desc: Mark notification as read
@Access: Private
*/
exports.markAsRead = async (req, res) => {
  try {
    const notification = await markNotificationRead(req.params.id, {
      employeeId: req.auth.id,
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
@API: PATCH /api/v1/employee/notifications/read-all
@Desc: Mark all notifications as read
@Access: Private
*/
exports.markAllAsRead = async (req, res) => {
  try {
    const updatedCount = await markAllNotificationsRead({ employeeId: req.auth.id });
    return res.apiSuccess("All notifications marked as read", { updatedCount });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
