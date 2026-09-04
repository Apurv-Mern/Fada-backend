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
  buildOutletIncludes,
  validateFunctions,
  validateFunctionsSafe,
  validateBrandId,
  buildOutletPayload,
  enrichOutletFunctions,
} = require("../../../utils/outletUtil");
const { generateUniqueOutletPublicCode } = require("../../../utils/entityCodeUtil");

const outletValidationRules = {
  dealerId: "required|integer",
  name: "required|string",
  manager: "string",
  pinCode: "string|size:6",
  city: "string",
  state: "string",
  address: "string",
  brandId: "required|integer",
  isActive: "boolean",
};

const adminOutletIncludes = buildOutletIncludes({ includeCompany: true });

const findOutletOrError = async (outletId, res, transaction) => {
  const outlet = await Outlet.findByPk(outletId, {
    include: adminOutletIncludes,
    transaction,
  });

  if (!outlet) {
    res.apiError("Outlet not found", 404);
    return null;
  }

  return outlet;
};

/*
@API: GET /admin/outlets?search=&dealerId=&isActive=&limit=&offset=&brandId=
@Desc: Get all outlets
@Access: Private
*/
exports.getOutlets = async (req, res) => {
  try {
    const { search, dealerId, isActive, brandId } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};

    if (dealerId) {
      where.dealerId = dealerId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true" || isActive === "1";
    }

    if (brandId) {
      where.brandId = brandId;
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
      include: adminOutletIncludes,
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const [totalOutlets, totalActiveOutlets, totalInactiveOutlets] = await Promise.all([
      Outlet.count(),
      Outlet.count({ where: { isActive: true } }),
      Outlet.count({ where: { isActive: false } }),
    ]);

    return res.apiSuccess("Outlets fetched successfully", {
      outlets,
      pagination: {
        total,
        limit,
        offset,
      },
      stats: {
        totalOutlets,
        totalActiveOutlets,
        totalInactiveOutlets,
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

    return res.apiSuccess("Outlets fetched successfully", outlets);
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
    const validator = new Validator(req.body, outletValidationRules, {
      "required.dealerId": "Dealer ID is required",
      "required.brandId": "Brand is required",
      "required.name": "Outlet name is required",
    });
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const functionsResult = await validateFunctions(req.body.functions ?? [], res);
    if (!functionsResult.valid) return;
    if (!(await validateBrandId(req.body.brandId, res))) return;

    const dealer = await Dealer.findByPk(req.body.dealerId);
    if (!dealer) {
      return res.apiError("Company not found", 404);
    }

    const outletCode = await generateUniqueOutletPublicCode(Outlet);

    const createdOutlet = await Outlet.create(
      buildOutletPayload(
        req.body,
        req.body.dealerId,
        functionsResult.normalized,
        outletCode,
      ),
    );

    const outlet = await Outlet.findByPk(createdOutlet.id, {
      include: adminOutletIncludes,
    });

    return res.apiSuccess("Outlet created successfully", outlet);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("An outlet with this code already exists", 409);
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

    if (!(await validateBrandId(req.body.brandId, res))) return;

    const existingOutlet = await Outlet.findByPk(req.params.id);
    if (!existingOutlet) {
      return res.apiError("Outlet not found", 404);
    }

    const dealer = await Dealer.findByPk(req.body.dealerId);
    if (!dealer) {
      return res.apiError("Company not found", 404);
    }

    await existingOutlet.update(
      buildOutletPayload(
        req.body,
        req.body.dealerId,
        normalizedFunctions,
        existingOutlet.code,
      ),
    );

    const outlet = await Outlet.findByPk(existingOutlet.id, {
      include: adminOutletIncludes,
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
      await outlet.destroy({ transaction });
    });

    return res.apiSuccess("Outlet deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};


/*
@API: PUT /admin/outlets/:id/active-inactive
@Desc: Activate/deactivate an outlet
@Access: Private
*/
exports.activeInactiveOutlets = async (req, res) => {
  try {
    const outlet = await Outlet.findByPk(req.params.id);
    if (!outlet) {
      return res.apiError("Outlet not found", 404);
    }
    await outlet.update({ isActive: !outlet.isActive });
    return res.apiSuccess(outlet.isActive ? "Outlet activated successfully" : "Outlet deactivated successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

const parseImportBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  return defaultValue;
};

const normalizeImportFunctions = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/*
@API: POST /admin/outlets/import
@Desc: Bulk import outlets from JSON array
@Access: Private
*/
exports.importOutlets = async (req, res) => {
  try {
    const skippedRecords = [];
    const data = req.body || [];
    console.log("Importing outlets:", data, "records");
    if (data.length === 0) {
      return res.apiError("No data provided", 400);
    }

    for (const item of data) {
      if (!item?.name || !item?.companyCode) {
        skippedRecords.push({
          ...item,
          reason: "Missing required fields",
        });
        continue;
      }

      const dealer = await Dealer.findOne({ where: { [Op.or]: [{ dealerCode: item.companyCode }, { dealerId: item.companyCode }] } });

      if (!dealer) {
        skippedRecords.push({
          ...item,
          reason: "Company code not found",
        });
        continue;
      }

      let brandId = item.brandId ?? null;
      if (!brandId && item.brandName) {
        const brand = await Brand.findOne({
          where: { name: item.brandName },
        });
        brandId = brand?.id ?? null;
      }

      if (!brandId) {
        skippedRecords.push({
          ...item,
          reason: "Brand not found",
        });
        continue;
      }

      const existingOutlet = await Outlet.findOne({
        where: {
          dealerId: dealer.id,
          name: item.name,
        },
      });

      if (existingOutlet) {
        skippedRecords.push({
          ...item,
          reason: "Outlet already exists for this company",
        });
        continue;
      }

      const functions = normalizeImportFunctions(item.functions);
      const functionsResult = await validateFunctionsSafe(functions);
      if (!functionsResult.valid) {
        skippedRecords.push({
          ...item,
          reason: functionsResult.reason || "Invalid functions",
        });
        continue;
      }

      const outletCode = await generateUniqueOutletPublicCode(Outlet);

      await Outlet.create(
        buildOutletPayload(
          {
            name: item.name,
            manager: item.manager ?? null,
            pinCode: item.pinCode ?? null,
            city: item.city ?? null,
            state: item.state ?? null,
            address: item.address ?? null,
            brandId,
            isActive: parseImportBoolean(item.isActive, true),
          },
          dealer.id,
          functionsResult.normalized ?? [],
          outletCode,
        ),
      );
    }

    return res.apiSuccess("Outlets imported successfully", skippedRecords);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("An outlet with this code already exists", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};
