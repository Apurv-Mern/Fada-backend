const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { Announcement, Admin, Employee, Dealer } = require("../../../database/models");

const { addPushJobs, addEmailJobs } = require("../../../queues");

const POST_TYPES = ["updates", "reminders", "celebration", "announcement"];
const TARGET_AUDIENCES = [
  "employees",
  "dealers",
  "members_and_dealers",
  "all",
];
const STATUSES = ["draft", "published", "scheduled"];
const DELIVERY_CHANNELS = ["in_app", "email", "push"];

const announcementValidationRules = {
  postType: `in:${POST_TYPES.join(",")}`,
  title: "required|string",
  messageBody: "string",
  targetAudience: `required|in:${TARGET_AUDIENCES.join(",")}`,
  status: `in:${STATUSES.join(",")}`,
  scheduledAt: "date",
};

const adminInclude = {
  model: Admin,
  as: "createdBy",
  attributes: ["id", "name", "email"],
  required: false,
};

function normalizeDeliveryChannels(channels) {
  if (channels === undefined || channels === null) {
    return { value: ["in_app"] };
  }
  if (!Array.isArray(channels) || channels.length === 0) {
    return { error: "At least one delivery channel is required" };
  }
  const invalid = channels.some(
    (channel) => !DELIVERY_CHANNELS.includes(channel),
  );
  if (invalid) {
    return {
      error: `deliveryChannels must only contain: ${DELIVERY_CHANNELS.join(", ")}`,
    };
  }
  return { value: [...new Set(channels)] };
}

function applyStatusTimestamps(payload, existing) {
  const status = payload.status ?? existing?.status ?? "draft";

  if (status === "published") {
    payload.publishedAt = payload.publishedAt ?? new Date();
    payload.scheduledAt = null;
  }

  if (status === "scheduled") {
    if (!payload.scheduledAt && !existing?.scheduledAt) {
      return { error: "scheduledAt is required when status is scheduled" };
    }
    payload.publishedAt = null;
  }

  if (status === "draft") {
    payload.publishedAt = null;
    payload.scheduledAt = null;
  }

  return { value: payload };
}

function buildAnnouncementPayload(body, existing) {
  const channelsResult = normalizeDeliveryChannels(body.deliveryChannels);
  if (channelsResult.error) {
    return channelsResult;
  }

  let audience = body.targetAudience ?? existing?.targetAudience;
  if (audience === "all") {
    audience = "both";
  }

  const payload = {
    postType: body.postType ?? existing?.postType ?? "announcement",
    title: body.title?.trim() ?? existing?.title,
    messageBody: body.messageBody ?? existing?.messageBody ?? null,
    targetAudience: audience,
    deliveryChannels: channelsResult.value,
    status: body.status ?? existing?.status ?? "draft",
    scheduledAt: body.scheduledAt ?? existing?.scheduledAt ?? null,
    publishedAt: existing?.publishedAt ?? null,
  };

  const timestamps = applyStatusTimestamps(payload, existing);
  if (timestamps.error) {
    return timestamps;
  }

  return { value: timestamps.value };
}

async function findAnnouncementOrError(id, res) {
  const announcement = await Announcement.findByPk(id, {
    include: [adminInclude],
  });
  if (!announcement) {
    res.apiError("Announcement not found", 404);
    return null;
  }
  return announcement;
}

exports.getAnnouncements = async (req, res) => {
  try {
    const { search, status, targetAudience } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};

    if (status && STATUSES.includes(status)) {
      where.status = status;
    }

    if (targetAudience && TARGET_AUDIENCES.includes(targetAudience)) {
      where.targetAudience = targetAudience;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { messageBody: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: announcements, count: total } =
      await Announcement.findAndCountAll({
        where,
        include: [adminInclude],
        order: [["id", "DESC"]],
        limit,
        offset,
      });

    return res.apiSuccess("Announcements fetched successfully", {
      announcements,
      pagination: { total, limit, offset },
    });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await findAnnouncementOrError(req.params.id, res);
    if (!announcement) return;

    return res.apiSuccess("Announcement fetched successfully", announcement);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const validator = new Validator(req.body, announcementValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const payloadResult = buildAnnouncementPayload(req.body);
    if (payloadResult.error) {
      return res.apiError(payloadResult.error, 422);
    }

    const announcement = await Announcement.create({
      ...payloadResult.value,
      createdByAdminId: req.auth.id,
    });

    const created = await Announcement.findByPk(announcement.id, {
      include: [adminInclude],
    });

    return res.apiSuccess("Announcement created successfully", created);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const validator = new Validator(req.body, announcementValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const announcement = await findAnnouncementOrError(req.params.id, res);
    if (!announcement) return;

    const payloadResult = buildAnnouncementPayload(req.body, announcement);
    if (payloadResult.error) {
      return res.apiError(payloadResult.error, 422);
    }

    await announcement.update(payloadResult.value);

    await announcement.reload({ include: [adminInclude] });

    return res.apiSuccess("Announcement updated successfully", announcement);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await findAnnouncementOrError(req.params.id, res);
    if (!announcement) return;

    await announcement.destroy();

    return res.apiSuccess("Announcement deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/announcements/:id/send-now
@Desc: Publish a draft announcement immediately
@Access: Private
*/
exports.sendNow = async (req, res) => {
  try {
    const announcement = await findAnnouncementOrError(req.params.id, res);
    if (!announcement) return;

    if (announcement.status !== "draft") {
      return res.apiError("Only draft announcements can be sent now", 400);
    }

    let targets = [];

    if (announcement.targetAudience === "employees") {
      targets = await Employee.findAll({
        attributes: ["id", "name", "email", "deviceToken"],
        where: {
          isActive: true,
        },
      });
    } else if (announcement.targetAudience === "dealers") {
      targets = await Dealer.findAll({
        attributes: ["id", "name", "email"],
        where: {
          isActive: true,
        },
      });
    } else if (announcement.targetAudience === "both") {
      const employees = await Employee.findAll({
        attributes: ["id", "name", "email", "deviceToken"],
        where: {
          isActive: true,
        },
      });
      const dealers = await Dealer.findAll({
        attributes: ["id", "name", "email"],
        where: {
          isActive: true,
        },
      });
      targets = [...employees, ...dealers];
    }

    //send push notification to targets
    if (announcement.deliveryChannels.includes("push")) {
      await addPushJobs(
        targets
          .filter((target) => target.deviceToken)
          .map((target) => ({
            tokens: [target.deviceToken],
            title: announcement.title,
            body: announcement.messageBody,
            data: {
              announcementId: announcement.id,
              userId: target.id,
              userName: target.name,
            },
          })),
      );
    }

    //send email to targets using template announcement.ejs
    if (announcement.deliveryChannels.includes("email")) {
      await addEmailJobs(
        targets.map((target) => ({
          to: target.email,
          subject: announcement.title,
          templateName: "announcement.ejs",
          data: {
            userName: target.name,
            title: announcement.title,
            messageBody: announcement.messageBody,
          },
        }))
      );
    }

    await announcement.update({
      status: "published",
      publishedAt: new Date(),
      scheduledAt: null,
    });
 
    return res.apiSuccess("Announcement sent successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
