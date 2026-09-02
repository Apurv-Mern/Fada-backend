const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { sequelize, Outlet } = require("../../../database/models");
const {
  buildOutletIncludes,
  validateFunctions,
  validateBrandId,
  buildOutletPayload,
  enrichOutletFunctions,
} = require("../../../utils/outletUtil");
const { generateUniqueOutletPublicCode } = require("../../../utils/entityCodeUtil");

const outletValidationRules = {
  name: "required|string",
  manager: "string",
  pinCode: "string|size:6",
  city: "string",
  state: "string",
  address: "string",
  brandId: "required|integer",
  isActive: "boolean",
};

const outletIncludes = buildOutletIncludes();

const getDealerId = (req) => req.currentDealerId;

const findDealerOutletOrError = async (outletId, dealerId, res, transaction) => {
  const outlet = await Outlet.findOne({
    where: { id: outletId, dealerId },
    include: outletIncludes,
    transaction,
  });

  if (!outlet) {
    res.apiError("Outlet not found", 404);
    return null;
  }

  return outlet;
};

/*
@API: GET /dealers/outlets?groupDealerId=1&isActive=true&search=test&limit=10&offset=0
@Desc: Get authenticated dealer outlets
@Access: Private
*/
exports.getOutlets = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const { search, isActive, groupDealerId } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = { dealerId };

    /* if (groupDealerId) {
      where.dealerId = groupDealerId;
    } */

    if (isActive !== undefined) {
      where.isActive = isActive === "true" || isActive === "1";
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { manager: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: outlets, count: total } = await Outlet.findAndCountAll({
      attributes: ["id", "name", "code", "city", "state", "manager", "pinCode", "isActive", "dealerId", "createdAt",
        "updatedAt", "functions", "address", "brandId",
        [sequelize.literal("(SELECT COUNT(*) FROM EmployeeAssignments WHERE EmployeeAssignments.outletId = Outlet.id AND EmployeeAssignments.isCurrentlyWorking = true)"), "employeeCount"],
        [
          sequelize.literal(`
            (
              SELECT GROUP_CONCAT(OutletFunctions.name)
              FROM OutletFunctions
              WHERE JSON_CONTAINS(Outlet.functions, CAST(OutletFunctions.id AS JSON))
            )
          `),
          "functionNames"
        ]
      ],
      where,
      include: outletIncludes,
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.apiSuccess("Outlets fetched successfully", {
      outlets,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/outlets/options
@Desc: Get active outlet options for dropdowns
@Access: Private
*/
exports.getOutletOptions = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const outlets = await Outlet.findAll({
      attributes: ["id", "name"],
      where: { dealerId, isActive: true },
      order: [["name", "ASC"]],
    });

    return res.apiSuccess("Outlets fetched successfully", outlets);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/outlets/:id
@Desc: Get outlet by id
@Access: Private
*/
exports.getOutletById = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const outlet = await findDealerOutletOrError(req.params.id, dealerId, res);
    if (!outlet) return;

    await enrichOutletFunctions(outlet);

    return res.apiSuccess("Outlet fetched successfully", outlet);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /dealers/outlets
@Desc: Create outlet
@Access: Private
*/
exports.createOutlet = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const validator = new Validator(req.body, outletValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const functionsResult = await validateFunctions(req.body.functions ?? [], res);
    if (!functionsResult.valid) return;
    if (!(await validateBrandId(req.body.brandId, res))) return;

    const outletCode = await generateUniqueOutletPublicCode(Outlet);

    const outlet = await Outlet.create(
      buildOutletPayload(req.body, dealerId, functionsResult.normalized, outletCode),
    );

    const createdOutlet = await Outlet.findByPk(outlet.id, {
      include: outletIncludes,
    });

    return res.apiSuccess("Outlet created successfully", createdOutlet);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("An outlet with this code already exists", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/outlets/:id
@Desc: Update outlet
@Access: Private
*/
exports.updateOutlet = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const validator = new Validator(req.body, outletValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    let normalizedFunctions;
    if (req.body.functions !== undefined) {
      const functionsResult = await validateFunctions(req.body.functions, res);
      if (!functionsResult.valid) return;
      normalizedFunctions = functionsResult.normalized;
    }

    if (!(await validateBrandId(req.body.brandId, res))) return;

    const existingOutlet = await Outlet.findOne({
      where: { id: req.params.id, dealerId },
    });

    if (!existingOutlet) {
      return res.apiError("Outlet not found", 404);
    }

    await existingOutlet.update(
      buildOutletPayload(req.body, dealerId, normalizedFunctions, existingOutlet.code),
    );

    const outlet = await Outlet.findByPk(existingOutlet.id, {
      include: outletIncludes,
    });

    return res.apiSuccess("Outlet updated successfully", outlet);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("An outlet with this code already exists", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /dealers/outlets/:id
@Desc: Delete outlet
@Access: Private
*/
exports.deleteOutlet = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const outlet = await Outlet.findOne({
      where: { id: req.params.id, dealerId },
    });

    if (!outlet) {
      return res.apiError("Outlet not found", 404);
    }

    await sequelize.transaction(async (transaction) => {
      await outlet.destroy({ transaction });
    });

    return res.apiSuccess("Outlet deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
