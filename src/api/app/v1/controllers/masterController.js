const {
  sequelize,
  Announcement,
  Outlet,
  Dealer,
  Brand,
  OrganizationStructure,
} = require("../../../../database/models");
const { Op } = require("sequelize");

/*
@API: GET /employee/master/dealers?search=test
@Desc: Get employee dealers
@Access: Private
*/
exports.getDealers = async (req, res) => {
  try {
    const { search } = req.query;

    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { dealerId: { [Op.like]: `%${search}%` } },
      ];
    }

    const dealerOutlets = await Outlet.findAll({
      attributes: ["id", "name", "code", "city", "state"],
      include: [
        {
          model: Dealer,
          as: "dealer",
          attributes: ["id", "name", ["dealerId", "dealerCode"]],
          where,
        },
        {
          model: Brand,
          as: "brand",
          attributes: ["id", "name"],
        },
      ],
    });
    return res.apiSuccess("Dealer outlets fetched successfully", dealerOutlets);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
  @API: GET /employee/master/departments
  @Desc: Get employee master departments
  @Access: Private
  */
exports.getDepartments = async (req, res) => {
  try {
    const departments = await OrganizationStructure.findAll({
      where: { flag: "department" },
    });
    return res.apiSuccess("Departments fetched successfully", departments);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
  @API: GET /employee/master/designations?parentId=1
  @Desc: Get employee master designations
  @Access: Private
  */
exports.getDesignations = async (req, res) => {
  try {
    const { parentId } = req.query;

    const where = { flag: "role" };

    if (parentId) {
      where.parentId = parentId;
    }

    const designations = await OrganizationStructure.findAll({
      where,
      attributes: ["id", "name"],
    });
    return res.apiSuccess("Designations fetched successfully", designations);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};