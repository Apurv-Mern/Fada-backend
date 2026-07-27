const {
  Dealer,
  DealerLocation,
  KeyContact,
  DealerDocument,
  Document,
  DealerProfile,
} = require("../../../database/models");
const { Op } = require("sequelize");
const Validator = require("validatorjs");

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
@API: GET /admin/dealers?search=searchTerm&limit=limit&offset=offset
@Desc: Get all dealers
@Access: Private     
*/
exports.getDealers = async (req, res) => {
  try {
    const { search } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = search
      ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { dealerCode: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      }
      : {};

    const { rows: dealers, count: total } = await Dealer.findAndCountAll({
      attributes: dealerAttributes,
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
@API: GET /admin/dealers/:id
@Desc: Get a dealer by id
@Access: Private     
*/
exports.getDealerById = async (req, res) => {
  try {
    const dealer = await Dealer.findByPk(req.params.id, {
      attributes: dealerAttributes,
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
      attributes: ["id", "name", "category", "notes", "isMandatory", "isVerificationRequired", "createdAt", "updatedAt"],
      include: [
        {
          model: DealerDocument,
          as: "dealerDocuments",
          required: false,
          where: { dealerId: req.params.id },
          attributes: ["id", "documentUrl", "isVerified", "status", "dealerId", "documentId", "createdAt", "updatedAt"],
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
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      email: "required|email",
      phone: "required|string",
      dealerCode: "required|string",
    });
    if (validator.fails()) {
      return res.apiError(validator.errors.all(), 400);
    }

    const dealer = await Dealer.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dealerCode: req.body.dealerCode,
    });
    return res.apiSuccess("Dealer created successfully", dealer);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/dealers/:id
@Desc: Update a dealer
@Access: Private     
*/
exports.updateDealer = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      email: "required|email",
      phone: "required|string",
      dealerCode: "required|string",
    });
    if (validator.fails()) {
      return res.apiError(validator.errors.all(), 400);
    }
    const dealer = await Dealer.update(
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        dealerCode: req.body.dealerCode,
      },
      {
        where: { id: req.params.id },
      },
    );
    return res.apiSuccess("Dealer updated successfully", dealer);
  } catch (error) {
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
      where: { dealerId: dealer.id },
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
