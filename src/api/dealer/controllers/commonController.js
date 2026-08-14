const { sequelize, Announcement } = require("../../../database/models");
const { Op } = require("sequelize");

/*
@API: GET /dealers/announcements
@Desc: Get published in-app announcements for dealers
@Access: Private
*/
exports.getAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.findAll({
      where: {
        targetAudience: {
          [Op.in]: ["dealers","both"],
        },
        status: "published",
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              "JSON_CONTAINS",
              sequelize.col("deliveryChannels"),
              '"in_app"',
            ),
            1,
          ), 
        ],
      },
      order: [
        ["publishedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.apiSuccess("Announcements fetched successfully", announcements);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
