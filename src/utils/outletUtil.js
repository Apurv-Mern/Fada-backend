const { Op } = require("sequelize");
const {
  Outlet,
  OutletFunction,
  Brand,
  Dealer,
  EmployeeAssignment,Employee
} = require("../database/models");

const brandIncludes = [
  {
    model: Brand,
    as: "brand",
    attributes: ["id", "name", "slug"],

  },
  {
    model: EmployeeAssignment,
    as: "employeeAssignments",
    attributes: ["id", "employeeId", "outletId"],
    required: false,
    //where : {isCurrentlyWorking: true},
    include : [
      {
        model: Employee,
        as: "employee",
        attributes: ["id", "name", "email"],
      }
    ]
  } 
  
];

const buildOutletIncludes = ({ includeCompany = false } = {}) => {
  const includes = [...brandIncludes];

  if (includeCompany) {
    includes.unshift({
      model: Dealer,
      as: "dealer",
      attributes: ["id", "name", "dealerCode", "dealerId"],
    });
  }

  return includes;
};

const validateFunctions = async (functions, res) => {
  if (functions === undefined) {
    return { valid: true };
  }

  if (!Array.isArray(functions)) {
    res.apiError("functions must be an array", 422);
    return { valid: false };
  }

  if (!functions.length) {
    return { valid: true, normalized: [] };
  }

  const uniqueFunctions = [...new Set(functions.map(String))];

  if (uniqueFunctions.length !== functions.length) {
    res.apiError("Duplicate functions are not allowed", 422);
    return { valid: false };
  }

  const numericIds = uniqueFunctions
    .filter((item) => /^\d+$/.test(item))
    .map(Number);
  const slugs = uniqueFunctions.filter((item) => !/^\d+$/.test(item));

  const whereConditions = [];
  if (numericIds.length) whereConditions.push({ id: numericIds });
  if (slugs.length) whereConditions.push({ slug: slugs });

  const outletFunctions = await OutletFunction.findAll({
    where: { [Op.or]: whereConditions },
  });

  const foundBySlug = new Map(outletFunctions.map((item) => [item.slug, item]));
  const foundById = new Map(
    outletFunctions.map((item) => [String(item.id), item]),
  );

  const invalid = [];
  const inactive = [];
  const normalized = [];

  for (const item of uniqueFunctions) {
    const match = /^\d+$/.test(item) ? foundById.get(item) : foundBySlug.get(item);

    if (!match) {
      invalid.push(item);
      continue;
    }

    if (!match.isActive) {
      inactive.push(item);
      continue;
    }

    normalized.push(match.id);
  }

  if (invalid.length) {
    res.apiError(`Invalid functions: ${invalid.join(", ")}`, 422);
    return { valid: false };
  }

  if (inactive.length) {
    res.apiError(`Inactive outlet functions: ${inactive.join(", ")}`, 422);
    return { valid: false };
  }

  return { valid: true, normalized };
};

const validateFunctionsSafe = async (functions) => {
  if (functions === undefined) {
    return { valid: true, normalized: [] };
  }

  if (!Array.isArray(functions)) {
    return { valid: false, reason: "functions must be an array" };
  }

  if (!functions.length) {
    return { valid: true, normalized: [] };
  }

  const uniqueFunctions = [...new Set(functions.map(String))];

  if (uniqueFunctions.length !== functions.length) {
    return { valid: false, reason: "Duplicate functions are not allowed" };
  }

  const numericIds = uniqueFunctions
    .filter((item) => /^\d+$/.test(item))
    .map(Number);
  const slugs = uniqueFunctions.filter((item) => !/^\d+$/.test(item));

  const whereConditions = [];
  if (numericIds.length) whereConditions.push({ id: numericIds });
  if (slugs.length) whereConditions.push({ slug: slugs });

  const outletFunctions = await OutletFunction.findAll({
    where: { [Op.or]: whereConditions },
  });

  const foundBySlug = new Map(outletFunctions.map((item) => [item.slug, item]));
  const foundById = new Map(
    outletFunctions.map((item) => [String(item.id), item]),
  );

  const invalid = [];
  const inactive = [];
  const normalized = [];

  for (const item of uniqueFunctions) {
    const match = /^\d+$/.test(item) ? foundById.get(item) : foundBySlug.get(item);

    if (!match) {
      invalid.push(item);
      continue;
    }

    if (!match.isActive) {
      inactive.push(item);
      continue;
    }

    normalized.push(match.id);
  }

  if (invalid.length) {
    return { valid: false, reason: `Invalid functions: ${invalid.join(", ")}` };
  }

  if (inactive.length) {
    return { valid: false, reason: `Inactive outlet functions: ${inactive.join(", ")}` };
  }

  return { valid: true, normalized };
};

const validateBrandId = async (brandId, res) => {
  if (brandId === undefined || brandId === null) return true;

  const brand = await Brand.findByPk(brandId);
  if (!brand) {
    res.apiError("Brand not found", 404);
    return false;
  }

  return true;
};

const validateDealerBrands = async (brands, res) => {
  if (!Array.isArray(brands)) {
    res.apiError("brands must be an array", 422);
    return { valid: false };
  }

  if (!brands.length) {
    return { valid: true, normalized: [] };
  }

  const brandIds = [...new Set(brands.map(Number))];
  if (brandIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    res.apiError("Each brand must be a valid integer id", 422);
    return { valid: false };
  }

  if (brandIds.length !== brands.length) {
    res.apiError("Duplicate brands are not allowed", 422);
    return { valid: false };
  }

  const existingBrands = await Brand.findAll({ where: { id: brandIds } });
  if (existingBrands.length !== brandIds.length) {
    res.apiError("One or more brands not found", 404);
    return { valid: false };
  }

  return { valid: true, normalized: brandIds };
};

const normalizeOutletCode = (code) => {
  if (code === undefined || code === null) return null;

  const trimmed = String(code).trim();
  return trimmed || null;
};

const validateOutletCode = async ({
  code,
  dealerId,
  excludeOutletId,
  res,
}) => {
  const normalizedCode = normalizeOutletCode(code);
  if (!normalizedCode) return { valid: true, code: null };

  const where = {
    dealerId,
    code: normalizedCode,
    ...(excludeOutletId ? { id: { [Op.ne]: excludeOutletId } } : {}),
  };

  const existing = await Outlet.findOne({ where });
  if (existing) {
    res.apiError("An outlet with this code already exists", 409);
    return { valid: false };
  }

  return { valid: true, code: normalizedCode };
};

const buildOutletPayload = (body, dealerId, normalizedFunctions, code) => {
  const payload = {
    dealerId,
    name: body.name,
    code,
    manager: body.manager ?? null,
    pinCode: body.pinCode ?? null,
    city: body.city ?? null,
    state: body.state ?? null,
    address: body.address ?? null,
    isActive: body.isActive ?? true,
  };

  if (body.brandId !== undefined) {
    payload.brandId = body.brandId ?? null;
  }

  if (normalizedFunctions !== undefined) {
    payload.functions = normalizedFunctions;
  } else if (body.functions !== undefined) {
    payload.functions = body.functions;
  }

  return payload;
};

const enrichOutletFunctions = async (outlet) => {
  if (!outlet?.functions?.length) {
    outlet.functions = [];
    return outlet;
  }

  const numericIds = outlet.functions
    .filter((item) => /^\d+$/.test(String(item)))
    .map(Number);
  const slugs = outlet.functions
    .filter((item) => !/^\d+$/.test(String(item)))
    .map(String);

  const orConditions = [];
  if (numericIds.length) orConditions.push({ id: numericIds });
  if (slugs.length) orConditions.push({ slug: slugs });

  if (!orConditions.length) {
    outlet.functions = [];
    return outlet;
  }

  outlet.functions = await OutletFunction.findAll({
    attributes: ["id", "name", "slug"],
    where: { [Op.or]: orConditions },
  });

  return outlet;
};

module.exports = {
  brandIncludes,
  buildOutletIncludes,
  validateFunctions,
  validateFunctionsSafe,
  validateBrandId,
  validateDealerBrands,
  validateOutletCode,
  buildOutletPayload,
  enrichOutletFunctions,
};
