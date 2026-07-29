const Validator = require("validatorjs");
const { Document, Brand, OrganizationStructure, OutletFunction } = require("../../../database/models");
const { Op } = require("sequelize");



const generateSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveOrganizationParent = async (parentId, currentId = null) => {
  if (parentId === null || parentId === undefined || parentId === "") {
    return { parentId: null, level: 1 };
  }

  if (currentId && Number(parentId) === Number(currentId)) {
    return { error: "Organization structure cannot be its own parent" };
  }

  const parent = await OrganizationStructure.findByPk(parentId);
  if (!parent) {
    return { error: "Parent organization structure not found" };
  }

  return { parentId: parent.id, level: parent.level + 1, parent };
};

/*
@API: GET /admin/masters/documents
@Desc: Get all documents
@Access: Private
*/
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    return res.apiSuccess("Documents fetched successfully", documents);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/documents/:id
@Desc: Get a document by id
@Access: Private
*/
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.apiError("Document not found", 404);
    }
    return res.apiSuccess("Document fetched successfully", document);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/masters/documents
@Desc: Create a document
@Access: Private
*/
exports.createDocument = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      code: "required|string",
      category: "required|string",
      appliesTo: "required|in:employee,dealer",
      isActive: "boolean",
      sortOrder: "integer",
      isMandatory: "boolean",
      isVerificationRequired: "boolean",
      isExpiryApplicable: "boolean",
      notes: "string",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const {
      name,
      code,
      category,
      appliesTo,
      isActive,
      sortOrder,
      isMandatory,
      isVerificationRequired,
      isExpiryApplicable,
      notes,
    } = req.body;

    const existingCode = await Document.findOne({ where: { code } });
    if (existingCode) {
      return res.apiError("A document with this code already exists", 409);
    }

    const document = await Document.create({
      name,
      code,
      category,
      appliesTo,
      isActive: isActive ?? false,
      sortOrder: sortOrder ?? 0,
      isMandatory: isMandatory ?? false,
      isVerificationRequired: isVerificationRequired ?? true,
      isExpiryApplicable: isExpiryApplicable ?? false,
      notes: notes ?? null,
    });

    return res.apiSuccess("Document created successfully", document);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/masters/documents/:id
@Desc: Update a document
@Access: Private
*/
exports.updateDocument = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      code: "required|string",
      category: "required|string",
      appliesTo: "required|in:employee,dealer",
      isActive: "boolean",
      sortOrder: "integer",
      isMandatory: "boolean",
      isVerificationRequired: "boolean",
      isExpiryApplicable: "boolean",
      notes: "string",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.apiError("Document not found", 404);
    }

    const {
      name,
      code,
      category,
      appliesTo,
      isActive,
      sortOrder,
      isMandatory,
      isVerificationRequired,
      isExpiryApplicable,
      notes,
    } = req.body;

    if (code !== document.code) {
      const existingCode = await Document.findOne({ where: { code } });
      if (existingCode) {
        return res.apiError("A document with this code already exists", 409);
      }
    }

    await document.update({
      name,
      code,
      category,
      appliesTo,
      isActive: isActive ?? document.isActive,
      sortOrder: sortOrder ?? document.sortOrder,
      isMandatory: isMandatory ?? document.isMandatory,
      isVerificationRequired:
        isVerificationRequired ?? document.isVerificationRequired,
      isExpiryApplicable: isExpiryApplicable ?? document.isExpiryApplicable,
      notes: notes ?? document.notes,
    });

    return res.apiSuccess("Document updated successfully", document);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/masters/documents/:id
@Desc: Delete a document
@Access: Private
*/
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.apiError("Document not found", 404);
    }

    await document.destroy();
    return res.apiSuccess("Document deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/brands
@Desc: Get all brands
@Access: Private
*/
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      order: [
        ["name", "ASC"],
        ["id", "ASC"],
      ],
    });
    return res.apiSuccess("Brands fetched successfully", brands);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/brands/:id
@Desc: Get a brand by id
@Access: Private
*/
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.apiError("Brand not found", 404);
    }
    return res.apiSuccess("Brand fetched successfully", brand);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/brands/flag/:flag?search=searchTerm
@Desc: Get all brands by flag
@Access: Private
*/
exports.getBrandsByFlag = async (req, res) => {
  try {
    const { search } = req.query;
    const brands = await Brand.findAll({
      attributes: ["id", "name"],
      where: { flag: req.params.flag, ...(search ? { name: { [Op.like]: `%${search}%` } } : {}) },
      order: [
        ["name", "ASC"], 
      ],
    });
    return res.apiSuccess("Brands fetched successfully", brands);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/masters/brands
@Desc: Create a brand
@Access: Private
*/
exports.createBrand = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      slug: "string",
      flag: "string",
      country: "string",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, slug, flag, country, isActive } = req.body;
    const brandSlug = slug ? generateSlug(slug) : generateSlug(name);

    if (!brandSlug) {
      return res.apiError("Unable to generate a valid slug", 422);
    }

    const existingSlug = await Brand.findOne({ where: { slug: brandSlug } });
    if (existingSlug) {
      return res.apiError("A brand with this slug already exists", 409);
    }

    const brand = await Brand.create({
      name,
      slug: brandSlug,
      flag: flag ?? null,
      country: country ?? null,
      isActive: isActive ?? true,
    });

    return res.apiSuccess("Brand created successfully", brand);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/masters/brands/:id
@Desc: Update a brand
@Access: Private
*/
exports.updateBrand = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      slug: "string",
      flag: "string",
      country: "string",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.apiError("Brand not found", 404);
    }

    const { name, slug, flag, country, isActive } = req.body;
    const brandSlug = slug ? generateSlug(slug) : generateSlug(name);

    if (!brandSlug) {
      return res.apiError("Unable to generate a valid slug", 422);
    }

    if (brandSlug !== brand.slug) {
      const existingSlug = await Brand.findOne({ where: { slug: brandSlug } });
      if (existingSlug) {
        return res.apiError("A brand with this slug already exists", 409);
      }
    }

    await brand.update({
      name,
      slug: brandSlug,
      flag: flag ?? brand.flag,
      country: country ?? brand.country,
      isActive: isActive ?? brand.isActive,
    });

    return res.apiSuccess("Brand updated successfully", brand);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/masters/brands/:id
@Desc: Delete a brand
@Access: Private
*/
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.apiError("Brand not found", 404);
    }

    await brand.destroy();
    return res.apiSuccess("Brand deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/organization-structures
@Desc: Get all organization structures
@Access: Private
*/
exports.getOrganizationStructures = async (req, res) => {
  try {
    const organizationStructures = await OrganizationStructure.findAll({
      include: [
        {
          model: OrganizationStructure,
          as: "parent",
          attributes: ["id", "name", "slug", "level", "flag"],
        },
      ],
      order: [
        ["level", "ASC"],
        ["name", "ASC"],
        ["id", "ASC"],
      ],
    });
    return res.apiSuccess(
      "Organization structures fetched successfully",
      organizationStructures
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/organization-structures/:id
@Desc: Get an organization structure by id
@Access: Private
*/
exports.getOrganizationStructureById = async (req, res) => {
  try {
    const organizationStructure = await OrganizationStructure.findByPk(
      req.params.id,
      {
        include: [
          {
            model: OrganizationStructure,
            as: "parent",
            attributes: ["id", "name", "slug", "level", "flag"],
          },
          {
            model: OrganizationStructure,
            as: "children",
            attributes: ["id", "name", "slug", "level", "flag", "parentId"],
          },
        ],
      }
    );

    if (!organizationStructure) {
      return res.apiError("Organization structure not found", 404);
    }

    return res.apiSuccess(
      "Organization structure fetched successfully",
      organizationStructure
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/organization-structures/flag/:flag
@Desc: Get all organization structures by flag
@Access: Private
*/
exports.getOrganizationStructureByFlag = async (req, res) => {
  try {
    const organizationStructure = await OrganizationStructure.findAll(
      {
        where: { flag: req.params.flag },
        include: [
          {
            model: OrganizationStructure,
            as: "parent",
            attributes: ["id", "name", "slug", "level", "flag"],
            required: false,
          },
        ],
        order: [ 
          ["name", "ASC"], 
        ],
      }
    );

    return res.apiSuccess(
      "Organization structures fetched successfully",
      organizationStructure
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/organization-structures/parent/:parentId/flag/:flag
@Desc: Get all organization structures by parent id and flag
@Access: Private
*/
exports.getOrganizationStructureByParentAndFlag = async (req, res) => {
  try {
    const organizationStructure = await OrganizationStructure.findAll(
      {
        where: { parentId: req.params.parentId, flag: req.params.flag },
        attributes: ["id", "name", "slug", "level", "flag"],
        order: [ 
          ["name", "ASC"], 
        ],
      }
    );

    return res.apiSuccess(
      "Organization structures fetched successfully",
      organizationStructure
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};




/*
@API: POST /admin/masters/organization-structures
@Desc: Create an organization structure
@Access: Private
*/
exports.createOrganizationStructure = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      parentId: "integer",
      name: "required|string",
      slug: "string",
      level: "integer",
      flag: "required|in:business_function,department,role",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { parentId, name, slug, level, flag } = req.body;
    const parentResult = await resolveOrganizationParent(parentId ?? null);

    if (parentResult.error) {
      return res.apiError(parentResult.error, 422);
    }

    const organizationSlug = slug ? generateSlug(slug) : generateSlug(name);
    if (!organizationSlug) {
      return res.apiError("Unable to generate a valid slug", 422);
    }

    const existingSlug = await OrganizationStructure.findOne({
      where: { slug: organizationSlug, flag: flag },
    });
    if (existingSlug) {
      return res.apiError(
        "An organization structure with this slug already exists",
        409
      );
    }

    const organizationStructure = await OrganizationStructure.create({
      parentId: parentResult.parentId,
      name,
      slug: organizationSlug,
      level: level ?? parentResult.level,
      flag,
    });

    return res.apiSuccess(
      "Organization structure created successfully",
      organizationStructure
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/masters/organization-structures/:id
@Desc: Update an organization structure
@Access: Private
*/
exports.updateOrganizationStructure = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      parentId: "integer",
      name: "required|string",
      slug: "string",
      level: "integer",
      flag: "required|in:business_function,department,role",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const organizationStructure = await OrganizationStructure.findByPk(
      req.params.id
    );
    if (!organizationStructure) {
      return res.apiError("Organization structure not found", 404);
    }

    const { parentId, name, slug, level, flag } = req.body;
    const parentResult = await resolveOrganizationParent(
      parentId ?? null,
      organizationStructure.id
    );

    if (parentResult.error) {
      return res.apiError(parentResult.error, 422);
    }

    const organizationSlug = slug ? generateSlug(slug) : generateSlug(name);
    if (!organizationSlug) {
      return res.apiError("Unable to generate a valid slug", 422);
    }

    if (organizationSlug !== organizationStructure.slug) {
      const existingSlug = await OrganizationStructure.findOne({
        where: { slug: organizationSlug, flag: flag },
         
      });
      if (existingSlug) {
        return res.apiError(
          "An organization structure with this slug already exists",
          409
        );
      }
    }

    await organizationStructure.update({
      parentId: parentResult.parentId,
      name,
      slug: organizationSlug,
      level: level ?? parentResult.level,
      flag,
    });

    return res.apiSuccess(
      "Organization structure updated successfully",
      organizationStructure
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/masters/organization-structures/:id
@Desc: Delete an organization structure
@Access: Private
*/
exports.deleteOrganizationStructure = async (req, res) => {
  try {
    const organizationStructure = await OrganizationStructure.findByPk(
      req.params.id
    );
    if (!organizationStructure) {
      return res.apiError("Organization structure not found", 404);
    }

    const childCount = await OrganizationStructure.count({
      where: { parentId: organizationStructure.id },
    });

    if (childCount > 0) {
      return res.apiError(
        "Cannot delete organization structure with child nodes",
        400
      );
    }

    await organizationStructure.destroy();
    return res.apiSuccess("Organization structure deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/masters/outlet-functions?search=searchTerm&limit=limit&page=page
@Desc: Get all outlet functions
@Access: Private
*/
exports.getOutletFunctions = async (req, res) => {
  try {
    const { search,limit,page } = req.query;
    const offset = (page - 1) * limit;
    const outletFunctions = await OutletFunction.findAll({
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
      where: { ...(search ? { name: { [Op.like]: `%${search}%` } } : {}) },
      order: [
        ["name", "ASC"],
        ["id", "ASC"],
      ],
    });
    return res.apiSuccess("Outlet functions fetched successfully", {
      outletFunctions,
      total: outletFunctions.length,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};




/*
@API: GET /admin/masters/outlet-functions/:id
@Desc: Get an outlet function by id
@Access: Private
*/
exports.getOutletFunctionById = async (req, res) => {
  try {
    const outletFunction = await OutletFunction.findByPk(req.params.id);
    if (!outletFunction) {
      return res.apiError("Outlet function not found", 404);
    }
    return res.apiSuccess("Outlet function fetched successfully", outletFunction);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/masters/outlet-functions
@Desc: Create an outlet function
@Access: Private
*/
exports.createOutletFunction = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      slug: "string",
      description: "string",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, slug, description, isActive } = req.body;
    const outletFunctionSlug = slug ? generateSlug(slug) : generateSlug(name);

    if (!outletFunctionSlug) {
      return res.apiError("Unable to generate a valid slug", 422);
    }

    const existingSlug = await OutletFunction.findOne({
      where: { slug: outletFunctionSlug },
    });
    if (existingSlug) {
      return res.apiError("An outlet function with this slug already exists", 409);
    }

    const outletFunction = await OutletFunction.create({
      name,
      slug: outletFunctionSlug,
      description: description ?? null,
      isActive: isActive ?? true,
    });

    return res.apiSuccess("Outlet function created successfully", outletFunction);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/masters/outlet-functions/:id
@Desc: Update an outlet function
@Access: Private
*/
exports.updateOutletFunction = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      slug: "string",
      description: "string",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const outletFunction = await OutletFunction.findByPk(req.params.id);
    if (!outletFunction) {
      return res.apiError("Outlet function not found", 404);
    }

    const { name, slug, description, isActive } = req.body;
    const outletFunctionSlug = slug ? generateSlug(slug) : generateSlug(name);

    if (!outletFunctionSlug) {
      return res.apiError("Unable to generate a valid slug", 422);
    }

    if (outletFunctionSlug !== outletFunction.slug) {
      const existingSlug = await OutletFunction.findOne({
        where: { slug: outletFunctionSlug },
      });
      if (existingSlug) {
        return res.apiError("An outlet function with this slug already exists", 409);
      }
    }

    await outletFunction.update({
      name,
      slug: outletFunctionSlug,
      description: description ?? outletFunction.description,
      isActive: isActive ?? outletFunction.isActive,
    });

    return res.apiSuccess("Outlet function updated successfully", outletFunction);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/masters/outlet-functions/:id
@Desc: Delete an outlet function
@Access: Private
*/
exports.deleteOutletFunction = async (req, res) => {
  try {
    const outletFunction = await OutletFunction.findByPk(req.params.id);
    if (!outletFunction) {
      return res.apiError("Outlet function not found", 404);
    }

    await outletFunction.destroy();
    return res.apiSuccess("Outlet function deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};




/*
@API: GET /admin/masters/dealers
@Desc: Get all dealers
@Access: Private
*/
exports.getDealers = async (req, res) => {
  try {
    const dealers = await Dealer.findAll({
      attributes: ["id", "name", "dealerCode"],
      where: {isActive: true,status: "approved"}
    });
    return res.apiSuccess("Dealers fetched successfully", dealers);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};


