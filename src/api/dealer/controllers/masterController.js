const {
  Dealer,
  DealerLocation,
  KeyContact,
  DealerDocument,
  Document,
  DealerProfile,
  OrganizationStructure,
  OutletFunction,
  Brand,
} = require("../../../database/models");

/*
@API: GET /dealer/masters/brands
@Desc: Get brands data
@Access: Private
*/
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      where: { isActive: true, flag: "brand" },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return res.apiSuccess("Brands fetched successfully", brands);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealer/masters/segments
@Desc: Get segments data
@Access: Private
*/
exports.getSegments = async (req, res) => {
  try {
    const segments = await Brand.findAll({
      where: { isActive: true, flag: "Segment" },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return res.apiSuccess("Segments fetched successfully", segments);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealer/masters/Vehicle-Class
@Desc: Get vehicle class data
@Access: Private
*/
exports.getVehicleClass = async (req, res) => {
    try {
      const vehicleClass = await Brand.findAll({
        where: { isActive: true, flag: "Vehicle-Class" },
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      });
      return res.apiSuccess("Vehicle class fetched successfully", vehicleClass);
    } catch (error) {
      return res.apiError(error.message, 500, error);
    }
  };

/*
@API: GET /dealer/masters/business-functions
@Desc: Get business functions data
@Access: Private
*/
exports.getBusinessFunctions = async (req, res) => {
  try {
    const businessFunctions = await OrganizationStructure.findAll({
      where: { flag: "business_function" },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return res.apiSuccess(
      "Business functions fetched successfully",
      businessFunctions,
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealer/masters/departments?parentId=
@Desc: Get departments data
@Access: Private
*/
exports.getDepartments = async (req, res) => {
  try {
    const { parentId } = req.query;
    let whereClause = { flag: "department" };
    if (parentId) {
      whereClause.parentId = parentId;
    }
    const departments = await OrganizationStructure.findAll({
      where: whereClause,
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return res.apiSuccess("Departments fetched successfully", departments);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealer/masters/designations?parentId=
@Desc: Get designations data by parentId
@Access: Private
*/
exports.getDesignations = async (req, res) => {
  try {
    const { parentId } = req.query;
    let whereClause = { flag: "role" };
    if (parentId) {
      whereClause.parentId = parentId;
    }
    const designations = await OrganizationStructure.findAll({
      where: whereClause,
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return res.apiSuccess("Designations fetched successfully", designations);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealer/masters/business-functions
@Desc: Get outlet functions data
@Access: Private
*/
exports.getOutletFunctions = async (req, res) => {
  try {
    const outletFunctions = await OutletFunction.findAll({
      where: { isActive: true },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return res.apiSuccess(
      "Outlet functions fetched successfully",
      outletFunctions,
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};


/*
@API: GET /dealer/masters/document-types?appliesTo=dealer | employee | both
@Desc: Get document types data
@Access: Private
*/
exports.getDocumentTypes = async (req, res) => {
  try {
    const { appliesTo } = req.query;
    let whereClause = { isActive: true };
    if (appliesTo) {
      whereClause.appliesTo = appliesTo;
    }
    const documentTypes = await Document.findAll({
      where: whereClause, 
      order: [["name", "ASC"]],
    });
    return res.apiSuccess("Document types fetched successfully", documentTypes);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
