const {
  sequelize,
  Dealer,
  DealerLocation,
  KeyContact,
  DealerDocument,
  Document,
  DealerProfile,
} = require("../../../database/models");
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const { validateDealerBrands } = require("../../../utils/outletUtil");
const { generateDealerId } = require("../../../utils/fadaIdUtil");
const {
  generateTempPassword,
  hashPassword,
} = require("../../../utils/passwordUtil");
const { addEmailJob } = require("../../../queues");
const dealerAttributes = {
  exclude: ["password", "otp", "refreshToken"],
};

const locationValidationRules = {
  pinCode: "required|string|size:6",
  city: "required|string",
  state: "required|string",
  country: "required|string",
  gstNumber: "required|string|size:15",
  address: "required|string",
};

const keyContactValidationRules = {
  name: "required|string",
  designation: "required|string",
  phone: "required|string|size:10",
  email: "required|email",
  isActive: "boolean",
};

const findDealerOrError = async (dealerId, res) => {
  const dealer = await Dealer.findByPk(dealerId);
  if (!dealer) {
    res.apiError("Dealer not found", 404);
    return null;
  }
  return dealer;
};

const findDealerLocationByDealerId = async (dealerId) =>
  DealerLocation.findOne({
    where: { dealerId },
  });

const findKeyContactByDealerId = async (dealerId) =>
  KeyContact.findOne({
    where: { dealerId },
  });

/*
@API: GET /admin/dealers/stats
@Desc: Get the stats of dealers
@Access: Private     
*/
exports.getDealerStats = async (req, res) => {
  try {
    const [
      totalDealers,
      totalTemporaryDealers,
      totalApprovedDealers,
      totalRejectedDealers,
      totalPendingDealers,
      totalActiveDealers,
      totalInactiveDealers,
    ] = await Promise.all([
      Dealer.count(),
      Dealer.count({ where: { status: "temporary" } }),
      Dealer.count({ where: { status: "approved" } }),
      Dealer.count({ where: { status: "rejected" } }),
      Dealer.count({ where: { status: "pending" } }),
      Dealer.count({ where: { isActive: true } }),
      Dealer.count({ where: { isActive: false } }),
    ]);

    return res.apiSuccess("Dealer stats fetched successfully", {
      totalDealers: totalDealers,
      totalTemporaryDealers: totalTemporaryDealers,
      totalApprovedDealers: totalApprovedDealers,
      totalRejectedDealers: totalRejectedDealers,
      totalPendingDealers: totalPendingDealers,
      totalActiveDealers: totalActiveDealers,
      totalInactiveDealers: totalInactiveDealers,
    });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/dealers?search=searchTerm&limit=limit&offset=offset&status=status&isActive=
@Desc: Get all dealers
@Access: Private     
*/
exports.getDealers = async (req, res) => {
  try {
    const { search, status, isActive, parentDealerId } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = search
      ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { dealerCode: { [Op.like]: `%${search}%` } },
          { dealerId: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      }
      : {};

    if (status) {
      where.status = status;
    }

    if (isActive) {
      where.isActive = Boolean(isActive === "true");
    }

    if (parentDealerId) {
      where.parentDealerId = parentDealerId;
    }

    const { rows: dealers, count: total } = await Dealer.findAndCountAll({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "dealerCode",
        "dealerId",
        "brands",
        "isGroupHoldingEntity",
        "parentDealerId",
        "status",
        "isActive",
        "isEmailVerified",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Outlets
            WHERE Outlets.dealerId = Dealer.id
          )`),
          "outletCount",
        ],
        [
          sequelize.literal(`(
            SELECT GROUP_CONCAT(DISTINCT name)
            FROM Brands
            WHERE JSON_CONTAINS(Dealer.brands, CAST(Brands.id AS JSON))
          )`),
          "brandsName",
        ],
      ],
      include: [
        {
          model: DealerLocation,
          as: "location",
          required: false,
        },
      ],
      where,
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.apiSuccess("Dealers fetched successfully", {
      dealers,
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
@API: GET /admin/dealers/group-holding
@Desc: Get all dealers group by holding
@Access: Private     
*/
exports.getDealersGroupByHolding = async (req, res) => {
  try {
    const dealers = await Dealer.findAll({
      attributes: ["id", "name", "dealerCode", "brands"],
      where: { isGroupHoldingEntity: true },
    });

    return res.apiSuccess(
      "Group holding dealers fetched successfully",
      dealers,
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/dealers/:id
@Desc: Get a dealer by id
@Access: Private     
*/
exports.getDealerById = async (req, res) => {
  try {
    const dealer = await Dealer.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "dealerCode",
        "dealerId",
        "brands",
        "isGroupHoldingEntity",
        "parentDealerId",
        "status",
        "isActive",
        "isEmailVerified",
        "createdAt",
        "updatedAt",
        [
          sequelize.literal(`(
            SELECT GROUP_CONCAT(DISTINCT name)
            FROM Brands
            WHERE JSON_CONTAINS(Dealer.brands, CAST(Brands.id AS JSON))
          )`),
          "brandsName",
        ],
      ],
      include: [
        {
          model: DealerProfile,
          as: "profile",
          required: false,
        },
        {
          model: DealerLocation,
          as: "location",
          required: false,
        },
        {
          model: KeyContact,
          as: "keyContacts",
          required: false,
        },

        /* {
          model: Document,
          as: "documents",
          required: false,
          where: { isActive: true, appliesTo: { [Op.in]: ["dealer", "both"] } },
          attributes: [
            "id",
            "name",
            "category",
            "notes",
            "isMandatory",
            "isVerificationRequired",
            "createdAt",
            "updatedAt",
          ],
          include: [
            {
              model: DealerDocument,
              attributes: [
                "id",
                "documentUrl",
                "isVerified",
                "status",
                "dealerId",
                "documentId",
                "createdAt",
                "updatedAt",
              ],
              as: "dealerDocuments",
              required: false,
              where: { dealerId: req.params.id },
            },
          ],
        }, */
      ],
    });

    if (!dealer) {
      return res.apiError("Dealer not found", 404);
    }

    dealer.dataValues.documents = await Document.findAll({
      where: { isActive: true, appliesTo: { [Op.in]: ["dealer", "both"] } },
      attributes: [
        "id",
        "name",
        "category",
        "notes",
        "isMandatory",
        "isVerificationRequired",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: DealerDocument,
          as: "dealerDocuments",
          required: false,
          where: { dealerId: req.params.id },
          attributes: [
            "id",
            "documentUrl",
            "isVerified",
            "status",
            "dealerId",
            "documentId",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    return res.apiSuccess("Dealer fetched successfully", dealer);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/dealers
@Desc: Create a dealer
@Access: Private     
*/
exports.createDealer = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      email: "required|email",
      phone: "required|string",
      dealerCode: "string",
      brands: "required|array",
      isGroupHoldingEntity: "boolean",
      parentCompanyId: "integer",
      "location.address": "required|string",
      "location.city": "required|string",
      "location.state": "required|string",
      "location.country": "required|string",
      "location.pinCode": "required|string",
      "location.gstNumber": "required|string|size:15",
    });
    if (validator.fails()) {
      await transaction.rollback();
      const error = Object.values(validator.errors.all()).flat()[0];
      return res.apiError(error.replace("location.", ""), 422);
    }

    const brandsResult = await validateDealerBrands(req.body.brands, res);
    if (!brandsResult.valid) {
      await transaction.rollback();
      return res.apiError(brandsResult.errors, 400);
    }

    const existingDealerByEmail = await Dealer.findOne(
      {
        where: { email: req.body.email },
      },
      { transaction },
    );
    if (existingDealerByEmail) {
      await transaction.rollback();
      return res.apiError("Dealer with this email already exists", 400);
    }

    const existingDealerByPhone = await Dealer.findOne(
      {
        where: { phone: req.body.phone },
      },
      { transaction },
    );
    if (existingDealerByPhone) {
      await transaction.rollback();
      return res.apiError("Dealer with this phone number already exists", 400);
    }

    if (req.body.dealerCode) {
      const existingDealerByDealerCode = await Dealer.findOne(
        {
          where: { dealerCode: req.body.dealerCode },
        },
        { transaction },
      );
      if (existingDealerByDealerCode) {
        await transaction.rollback();
        return res.apiError("Dealer with this dealer code already exists", 400);
      }
    }

    const dealer = await Dealer.create(
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        dealerCode: req.body.dealerCode || null,
        dealerId: await generateDealerId(Dealer, { transaction }),
        isGroupHoldingEntity: req.body.isGroupHoldingEntity ?? false,
        parentDealerId: req.body.parentCompanyId ?? null,
        brands: brandsResult.normalized,
      },
      { transaction },
    );

    await DealerLocation.create(
      {
        dealerId: dealer.id,
        address: req.body.location.address,
        city: req.body.location.city,
        state: req.body.location.state,
        country: req.body.location.country,
        pinCode: req.body.location.pinCode,
        gstNumber: req.body.location.gstNumber,
      },
      { transaction },
    );
    await transaction.commit();
    return res.apiSuccess("Dealer created successfully", dealer);
  } catch (error) {
    await transaction.rollback();
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/dealers/:id
@Desc: Update a dealer
@Access: Private     
*/
exports.updateDealer = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      email: "required|email",
      phone: "required|string",
      dealerCode: "string",
      brands: "required|array",
      isGroupHoldingEntity: "boolean",
      parentCompanyId: "integer",
      "location.address": "required|string",
      "location.city": "required|string",
      "location.state": "required|string",
      "location.country": "required|string",
      "location.pinCode": "required|string",
      "location.gstNumber": "required|string|size:15",
    });
    if (validator.fails()) {
      await transaction.rollback();
      const error = Object.values(validator.errors.all()).flat()[0];
      return res.apiError(error.replace("location.", ""), 422);
    }

    const brandsResult = await validateDealerBrands(req.body.brands, res);
    if (!brandsResult.valid) {
      await transaction.rollback();
      return res.apiError(brandsResult.errors, 400);
    }

    const existingDealerByEmail = await Dealer.findOne(
      {
        where: { email: req.body.email, id: { [Op.ne]: req.params.id } },
      },
      { transaction },
    );
    if (existingDealerByEmail) {
      await transaction.rollback();
      return res.apiError("Dealer with this email already exists", 400);
    }

    const existingDealerByPhone = await Dealer.findOne(
      {
        where: { phone: req.body.phone, id: { [Op.ne]: req.params.id } },
      },
      { transaction },
    );
    if (existingDealerByPhone) {
      await transaction.rollback();
      return res.apiError("Dealer with this phone number already exists", 400);
    }

    if (req.body.dealerCode) {
      const existingDealerByDealerCode = await Dealer.findOne(
        {
          where: {
            dealerCode: req.body.dealerCode,
            id: { [Op.ne]: req.params.id },
          },
        },
        { transaction },
      );
      if (existingDealerByDealerCode) {
        await transaction.rollback();
        return res.apiError("Dealer with this dealer code already exists", 400);
      }
    }

    const dealer = await Dealer.update(
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        ...(req.body.dealerCode !== undefined
          ? { dealerCode: req.body.dealerCode || null }
          : {}),
        isGroupHoldingEntity: req.body.isGroupHoldingEntity ?? false,
        parentDealerId: req.body.parentCompanyId ?? null,
        brands: brandsResult.normalized,
      },
      {
        where: { id: req.params.id },
        transaction,
      },
    );

    const dealerLocation = await DealerLocation.findOne({
      where: { dealerId: req.params.id },
      transaction,
    });

    const location = {
      address: req.body.location.address,
      city: req.body.location.city,
      state: req.body.location.state,
      country: req.body.location.country,
      pinCode: req.body.location.pinCode,
      gstNumber: req.body.location.gstNumber,
    };
    if (dealerLocation) {
      await dealerLocation.update(location, {
        where: { dealerId: req.params.id },
        transaction,
      });
    } else {
      await DealerLocation.create(
        { ...location, dealerId: req.params.id },
        { transaction },
      );
    }

    await transaction.commit();
    return res.apiSuccess("Dealer updated successfully", dealer);
  } catch (error) {
    await transaction.rollback();
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/dealers/:id
@Desc: Delete a dealer
@Access: Private     
*/
exports.deleteDealer = async (req, res) => {
  try {
    await Dealer.destroy({
      where: { id: req.params.id },
    });
    return res.apiSuccess("Dealer deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/dealers/:id/status
@Desc: Update a dealer status
@Access: Private     
*/
exports.updateDealerStatus = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      status: "required|string",
    });
    if (validator.fails()) {
      return res.apiError(validator.errors.all(), 400);
    }
    const dealer = await Dealer.update(
      {
        status: req.body.status,
      },
      {
        where: { id: req.params.id },
      },
    );
    return res.apiSuccess("Dealer status updated successfully", dealer);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/dealers/:dealerId/location
@Desc: Create or update dealer location (one per dealer)
@Access: Private
*/
exports.saveDealerLocation = async (req, res) => {
  try {
    const dealer = await findDealerOrError(req.params.dealerId, res);
    if (!dealer) return;

    const validator = new Validator(req.body, locationValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { pinCode, city, state, country, gstNumber, address } = req.body;
    const existingLocation = await findDealerLocationByDealerId(dealer.id);

    if (existingLocation) {
      if (gstNumber !== existingLocation.gstNumber) {
        const existingGst = await DealerLocation.findOne({
          where: { gstNumber },
        });
        if (existingGst) {
          return res.apiError(
            "A location with this GST number already exists",
            409,
          );
        }
      }

      await existingLocation.update({
        pinCode,
        city,
        state,
        country,
        gstNumber,
        address,
      });

      return res.apiSuccess(
        "Dealer location updated successfully",
        existingLocation,
      );
    }

    const existingGst = await DealerLocation.findOne({ where: { gstNumber } });
    if (existingGst) {
      return res.apiError(
        "A location with this GST number already exists",
        409,
      );
    }

    const location = await DealerLocation.create({
      dealerId: dealer.id,
      pinCode,
      city,
      state,
      country,
      gstNumber,
      address,
    });

    return res.apiSuccess("Dealer location added successfully", location);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/dealers/:dealerId/key-contact
@Desc: Get dealer key contacts
@Access: Private
*/
exports.getKeyContact = async (req, res) => {
  try {
    const keyContacts = await KeyContact.findAll({
      where: { dealerId: req.params.dealerId },
    });

    return res.apiSuccess("Key contacts fetched successfully", keyContacts);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/dealers/:dealerId/key-contact
@Desc: Create or update dealer key contact (one per dealer)
@Access: Private
*/
exports.addKeyContact = async (req, res) => {
  try {
    const dealer = await findDealerOrError(req.params.dealerId, res);
    if (!dealer) return;

    const validator = new Validator(req.body, keyContactValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, designation, phone, email, isActive } = req.body;

    const keyContact = await KeyContact.create({
      dealerId: dealer.id,
      name,
      designation,
      phone,
      email,
      isActive: isActive ?? true,
    });

    return res.apiSuccess("Key contact added successfully", keyContact);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/dealers/:dealerId/key-contact/:keyContactId
@Desc: Update dealer key contact
@Access: Private
*/
exports.updateKeyContact = async (req, res) => {
  try {
    const validator = new Validator(req.body, keyContactValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, designation, phone, email, isActive } = req.body;
    const keyContact = await KeyContact.findByPk(req.params.keyContactId);
    if (!keyContact) return res.apiError("Key contact not found", 404);

    await keyContact.update({
      name,
      designation,
      phone,
      email,
      isActive: isActive ?? keyContact.isActive,
    });

    return res.apiSuccess("Key contact updated successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/dealers/:dealerId/key-contact/:keyContactId
@Desc: Delete dealer key contact
@Access: Private
*/
exports.deleteKeyContact = async (req, res) => {
  try {
    const keyContact = await KeyContact.findByPk(req.params.keyContactId);
    if (!keyContact) return res.apiError("Key contact not found", 404);

    await keyContact.destroy();
    return res.apiSuccess("Key contact deleted successfully", keyContact);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/dealers/:dealerId/business-documents
@Desc: Get all business documents
@Access: Private
*/
exports.getDealerBusinessDocuments = async (req, res) => {
  try {
    const businessDocuments = await Document.findAll({
      where: { isActive: true, appliesTo: { [Op.in]: ["dealer", "both"] } },
      attributes: [
        "id",
        "name",
        "category",
        "notes",
        "isMandatory",
        "isVerificationRequired",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: DealerDocument,
          as: "dealerDocuments",
          where: { dealerId: req.params.dealerId },
          required: false,
          attributes: [
            "id",
            "documentUrl",
            "isVerified",
            "status",
            "dealerId",
            "documentId",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });
    return res.apiSuccess(
      "Business documents fetched successfully",
      businessDocuments,
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/dealers/:dealerId/business-documents/:dealerDocumentId/verify
@Body: { status: "pending" | "approved" | "rejected" }
@Desc: Verify dealer business document
@Access: Private
*/
exports.verifyDealerBusinessDocument = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      status: "required|string|in:pending,approved,rejected",
    });
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { status } = req.body;

    const dealerDocument = await DealerDocument.findByPk(
      req.params.dealerDocumentId,
    );
    if (!dealerDocument) return res.apiError("Dealer document not found", 404);
    await dealerDocument.update({
      isVerified: status === "approved" ? true : false,
      status,
    });
    return res.apiSuccess(`Dealer document ${status} successfully`);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/dealers/import
  @Desc: Import dealers from a CSV file
  @Access: Private
*/
exports.importDealers = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const existingDealerRecords = [];
    const data = req.body || [];

    if (data.length === 0) {
      await transaction.rollback();
      return res.apiError("No data provided", 400);
    }

    for (const item of data) {
      const existingDealer = await Dealer.findOne({
        where: {
          [Op.or]: [{ phone: item.phone }, { email: item.email }],
        },
        transaction,
      });

      if (existingDealer) {
        if (existingDealer.email === item.email) {
          item.reason = "Email already exists";
        } else if (existingDealer.phone === item.phone) {
          item.reason = "Phone number already exists";
        }

        existingDealerRecords.push(item);
        continue;
      }

      const parentDealer = item?.parentCompanyCode
        ? await Dealer.findOne({
          where: { dealerId: item.parentCompanyCode },
          transaction,
        })
        : null;

      const tempPassword = generateTempPassword();

      await Dealer.create(
        {
          name: item.name,
          email: item.email,
          phone: item.phone,
          password: await hashPassword(tempPassword),
          dealerCode: item.code || null,
          dealerId: await generateDealerId(Dealer),
          isGroupHoldingEntity: item.isGroupHoldingCompany,
          parentDealerId: parentDealer?.id || null,
          status: "approved",
          isActive: true,
          isEmailVerified: true,
        },
        { transaction },
      );

      await addEmailJob({
        to: item.email,
        subject: "Dealer Temporary Password",
        templateName: "temp-password.ejs",
        data: {
          name: item.name,
          password: tempPassword,
        },
      });
    }

    await transaction.commit();

    return res.apiSuccess(
      "Dealers imported successfully",
      existingDealerRecords,
    );
  } catch (error) {
    await transaction.rollback();

    return res.apiError(error.message, 500, error);
  }
};

