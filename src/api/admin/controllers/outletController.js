const Validator = require("validatorjs");
const { Op } = require("sequelize");
const {
  sequelize,
  Outlet,
  OutletBrandCategory,
  Dealer,
  Brand,
} = require("../../../database/models");
const {
  brandCategoryIncludes,
  validateFunctions,
  validateBrandCategories,
  validateOutletCode,
  syncBrandCategories,
  buildOutletPayload,
  enrichOutletFunctions,
} = require("../../../utils/outletUtil");

const outletValidationRules = {
  dealerId: "required|integer",
  name: "required|string",
  code: "string",
  manager: "string",
  pinCode: "string|size:6",
  city: "string",
  state: "string",
  address: "string",
  isActive: "boolean",
};

const outletIncludes = [
  {
    model: Dealer,
    as: "company",
    attributes: ["id", "name", "dealerCode"],
  },
  ...brandCategoryIncludes,
];

const findOutletOrError = async (outletId, res, transaction) => {
  const outlet = await Outlet.findByPk(outletId, {
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
@API: GET /admin/outlets?search=&dealerId=&isActive=&limit=&offset=
@Desc: Get all outlets
@Access: Private
*/
exports.getOutlets = async (req, res) => {
  try {
    const { search, dealerId, isActive } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};

    if (dealerId) {
      where.dealerId = dealerId;
    }

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
@API: GET /admin/outlets/parent/:parentId
@Desc: Get all outlets by parent id
@Access: Private
*/
exports.getOutletsByParent = async (req, res) => {
  try {
      
    const outlets = await Outlet.findAll({
      attributes: ["id", "name"],
      where: { dealerId: req.params.parentId, isActive: true }, 
      order: [["name", "ASC"]],
    });

    return res.apiSuccess("Outlets fetched successfully",outlets);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/outlets/:id
@Desc: Get an outlet by id
@Access: Private
*/
exports.getOutletById = async (req, res) => {
  try {
    const outlet = await findOutletOrError(req.params.id, res);
    if (!outlet) return;

    await enrichOutletFunctions(outlet);

    return res.apiSuccess("Outlet fetched successfully", outlet);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/outlets
@Desc: Create an outlet
@Access: Private
*/
exports.createOutlet = async (req, res) => {
  try {
    const validator = new Validator(req.body, outletValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const functionsResult = await validateFunctions(req.body.functions ?? [], res);
    if (!functionsResult.valid) return;
    if (!(await validateBrandCategories(req.body.brandCategories, res))) return;

    const codeResult = await validateOutletCode({
      code: req.body.code,
      dealerId: req.body.dealerId,
      res,
    });
    if (!codeResult.valid) return;

    const dealer = await Dealer.findByPk(req.body.dealerId);
    if (!dealer) {
      return res.apiError("Company not found", 404);
    }

    let outletId;

    await sequelize.transaction(async (transaction) => {
      const createdOutlet = await Outlet.create(
        buildOutletPayload(req.body, req.body.dealerId, functionsResult.normalized),
        {
        transaction,
      });

      await syncBrandCategories(
        createdOutlet.id,
        req.body.brandCategories,
        transaction
      );

      outletId = createdOutlet.id;
    });

    const outlet = await Outlet.findByPk(outletId, {
      include: outletIncludes,
    });

    return res.apiSuccess("Outlet created successfully", outlet);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("An outlet with this code already exists for the company", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/outlets/:id
@Desc: Update an outlet
@Access: Private
*/
exports.updateOutlet = async (req, res) => {
  try {
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

    if (!(await validateBrandCategories(req.body.brandCategories, res))) return;

    const existingOutlet = await Outlet.findByPk(req.params.id);
    if (!existingOutlet) {
      return res.apiError("Outlet not found", 404);
    }

    const dealer = await Dealer.findByPk(req.body.dealerId);
    if (!dealer) {
      return res.apiError("Company not found", 404);
    }

    const codeResult = await validateOutletCode({
      code: req.body.code,
      dealerId: req.body.dealerId,
      excludeOutletId: existingOutlet.id,
      res,
    });
    if (!codeResult.valid) return;

    await sequelize.transaction(async (transaction) => {
      await existingOutlet.update(
        buildOutletPayload(req.body, req.body.dealerId, normalizedFunctions),
        { transaction }
      );

      if (req.body.brandCategories !== undefined) {
        await syncBrandCategories(
          existingOutlet.id,
          req.body.brandCategories,
          transaction
        );
      }
    });

    const outlet = await Outlet.findByPk(existingOutlet.id, {
      include: outletIncludes,
    });

    return res.apiSuccess("Outlet updated successfully", outlet);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("An outlet with this code already exists for the company", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/outlets/:id
@Desc: Delete an outlet
@Access: Private
*/
exports.deleteOutlet = async (req, res) => {
  try {
    const outlet = await Outlet.findByPk(req.params.id);
    if (!outlet) {
      return res.apiError("Outlet not found", 404);
    }

    await sequelize.transaction(async (transaction) => {
      await OutletBrandCategory.destroy({
        where: { outletId: outlet.id },
        transaction,
      });
      await outlet.update({ code: null }, { transaction });
      await outlet.destroy({ transaction });
    });

    return res.apiSuccess("Outlet deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
