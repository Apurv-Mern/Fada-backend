const { Announcement } = require("../../../../database/models");

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
        status: 1,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn(
              "JSON_CONTAINS",
              Sequelize.col("channels"),
              JSON.stringify("in_app"),
            ),
            1,
          ),
        ],
      },
    });
    return res.apiSuccess("Announcements fetched successfully", announcements);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
