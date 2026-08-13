const { Announcement } = require("../../../database/models");

/*
@API: GET /dealer/announcements
@Desc: Get announcements
@Access: Private
*/
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
        where: { targetAudience: { [Op.in]: ["dealers","both"] } },
    });
    return res.apiSuccess("Announcements fetched successfully", announcements);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
