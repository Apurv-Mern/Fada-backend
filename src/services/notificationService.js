const { Op } = require("sequelize");
const {
  Notification,
  Admin,
  Employee,
  Dealer,
} = require("../database/models");
const { addPushJob } = require("../queues");

const NOTIFICATION_TYPES = {
  GENERAL: "general",
  ANNOUNCEMENT: "announcement",
  DEALER: "dealer",
  OUTLET: "outlet",
  EMPLOYEE: "employee",
  EMPLOYMENT: "employment",
  INVITATION: "invitation",
  SYSTEM: "system",
};

function buildRecipientWhere({ employeeId, dealerId, adminId }) {
  if (employeeId) return { employeeId };
  if (dealerId) return { dealerId };
  if (adminId) return { adminId };
  return null;
}

async function createNotification(payload = {}) {
  const { employeeId, dealerId, adminId, title, body, type, data, sourceType, sourceId, push } =
    payload;

  if (!employeeId && !dealerId && !adminId) {
    throw new Error("Notification recipient is required");
  }

  if (!title?.trim()) {
    throw new Error("Notification title is required");
  }

  const notification = await Notification.create({
    employeeId: employeeId || null,
    dealerId: dealerId || null,
    adminId: adminId || null,
    title: title.trim(),
    body: body || null,
    type: type || NOTIFICATION_TYPES.GENERAL,
    data: data || null,
    sourceType: sourceType || null,
    sourceId: sourceId || null,
  });

  if (push && employeeId) {
    const employee = await Employee.findByPk(employeeId, {
      attributes: ["deviceToken"],
    });

    if (employee?.deviceToken) {
      await addPushJob({
        token: employee.deviceToken,
        title: notification.title,
        body: notification.body || "",
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...(data || {}),
        },
      });
    }
  }

  return notification;
}

async function createNotifications(notifications = []) {
  if (!notifications.length) return [];

  const rows = notifications.map((item) => ({
    employeeId: item.employeeId || null,
    dealerId: item.dealerId || null,
    adminId: item.adminId || null,
    title: item.title?.trim(),
    body: item.body || null,
    type: item.type || NOTIFICATION_TYPES.GENERAL,
    data: item.data || null,
    sourceType: item.sourceType || null,
    sourceId: item.sourceId || null,
  }));

  return Notification.bulkCreate(rows);
}

async function notifyEmployee(employeeId, payload = {}) {
  return createNotification({
    employeeId,
    push: true,
    ...payload,
  });
}

async function notifyDealer(dealerId, payload = {}) {
  return createNotification({
    dealerId,
    ...payload,
  });
}

async function notifyAdmin(adminId, payload = {}) {
  return createNotification({
    adminId,
    ...payload,
  });
}

async function notifyAllAdmins(payload = {}) {
  const admins = await Admin.findAll({
    attributes: ["id"],
    where: { isActive: true,roleId : 1 },
  });

  if (!admins.length) return [];

  return createNotifications(
    admins.map((admin) => ({
      adminId: admin.id,
      ...payload,
    })),
  );
}

async function listNotifications(recipient, query = {}) {
  const where = buildRecipientWhere(recipient);
  if (!where) {
    throw new Error("Notification recipient is required");
  }

  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const offset = Math.max(Number(query.offset) || 0, 0);

  if (query.isRead !== undefined) {
    where.isRead = query.isRead === "true" || query.isRead === true;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query.search}%` } },
      { body: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const { rows: notifications, count: total } = await Notification.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    notifications,
    pagination: { total, limit, offset },
  };
}

async function getLatestNotifications(recipient, limit = 5) {
  const { notifications } = await listNotifications(recipient, {
    limit,
    offset: 0,
  });

  return notifications;
}

async function getUnreadCount(recipient) {
  const where = buildRecipientWhere(recipient);
  if (!where) {
    throw new Error("Notification recipient is required");
  }

  where.isRead = false;

  return Notification.count({ where });
}

async function markNotificationRead(id, recipient) {
  const where = { id, ...buildRecipientWhere(recipient) };

  const notification = await Notification.findOne({ where });
  if (!notification) return null;

  if (!notification.isRead) {
    await notification.update({
      isRead: true,
      readAt: new Date(),
    });
  }

  return notification;
}

async function markAllNotificationsRead(recipient) {
  const where = {
    ...buildRecipientWhere(recipient),
    isRead: false,
  };

  const [updatedCount] = await Notification.update(
    { isRead: true, readAt: new Date() },
    { where },
  );

  return updatedCount;
}

async function getAnnouncementTargets(announcement) {
  if (announcement.targetAudience === "employees") {
    const employees = await Employee.findAll({
      attributes: ["id", "name", "email", "deviceToken"],
      where: { isActive: true },
    });

    return employees.map((employee) => ({
      ...employee.toJSON(),
      recipientType: "employee",
    }));
  }

  if (announcement.targetAudience === "dealers") {
    const dealers = await Dealer.findAll({
      attributes: ["id", "name", "email"],
      where: { isActive: true },
    });

    return dealers.map((dealer) => ({
      ...dealer.toJSON(),
      recipientType: "dealer",
    }));
  }

  if (announcement.targetAudience === "both") {
    const [employees, dealers] = await Promise.all([
      Employee.findAll({
        attributes: ["id", "name", "email", "deviceToken"],
        where: { isActive: true },
      }),
      Dealer.findAll({
        attributes: ["id", "name", "email"],
        where: { isActive: true },
      }),
    ]);

    return [
      ...employees.map((employee) => ({
        ...employee.toJSON(),
        recipientType: "employee",
      })),
      ...dealers.map((dealer) => ({
        ...dealer.toJSON(),
        recipientType: "dealer",
      })),
    ];
  }

  return [];
}

async function persistAnnouncementNotifications(announcement, targets = []) {
  if (!announcement.deliveryChannels.includes("in_app") || !targets.length) {
    return [];
  }

  const notifications = targets.map((target) => ({
    employeeId: target.recipientType === "employee" ? target.id : null,
    dealerId: target.recipientType === "dealer" ? target.id : null,
    title: announcement.title,
    body: announcement.messageBody,
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    sourceType: "Announcement",
    sourceId: announcement.id,
    data: {
      announcementId: announcement.id,
      postType: announcement.postType,
      screen: "announcement-detail",
    },
  }));

  return createNotifications(notifications);
}

async function safeNotify(task) {
  try {
    return await task();
  } catch (error) {
    console.error("[notification]", error.message);
    return null;
  }
}

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  createNotifications,
  notifyEmployee,
  notifyDealer,
  notifyAdmin,
  notifyAllAdmins,
  listNotifications,
  getLatestNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  getAnnouncementTargets,
  persistAnnouncementNotifications,
  safeNotify,
};
