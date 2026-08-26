const { sequelize, Announcement, Outlet, Dealer, Brand, OrganizationStructure } = require("../../../../database/models");
const { Op } = require("sequelize");

/*
@API: GET /employee/announcements
@Desc: Get employee announcements
@Access: Private
*/
exports.getAnnouncements = async (req, res) => {
  try {
    const channels = ["in_app"];

    const announcements = await Announcement.findAll({
      where: {
        targetAudience: {
          [Op.in]: ["employees", "both"],
        },
        [Op.and]: sequelize.where(
          sequelize.fn(
            "JSON_CONTAINS",
            sequelize.col("deliveryChannels"),
            '"in_app"',
          ),
          1,
        ),
      },
    });

    const announcementCounts = await Announcement.count({
      where: {
        targetAudience: {
          [Op.in]: ["employees", "both"],
        },
    
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              "JSON_CONTAINS",
              sequelize.col("deliveryChannels"),
              JSON.stringify("in_app")
            ),
            1
          ),
        ],
      },
    
      group: ["postType"],
    });
    
    return res.apiSuccess("Announcements fetched successfully", announcements,{
      announcementCounts
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};


