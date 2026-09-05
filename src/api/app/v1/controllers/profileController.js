const Validator = require("validatorjs");
const dayjs = require("dayjs");
const { Op, where } = require("sequelize");
const {
  sequelize,
  Employee,
  EmployeeAddress,
  Document,
  EmployeeDocument,
  EmployeeAssignment,
  EmployeeProfileShare,
  Dealer,
  Outlet,
  OrganizationStructure,
} = require("../../../../database/models");
const {
  getEmploymentKeyRecords,
  groupKeyRecordsByDealerId,
} = require("../../../../services/employeeService");

const resolveEmploymentEndDate = (isCurrentlyWorking, endDate) => {
  if (isCurrentlyWorking && !endDate) return null;
  return endDate || null;
};

const employmentPeriodsOverlap = (periodA, periodB) => {
  const startA = dayjs(periodA.startDate).startOf("day");
  const endA = periodA.endDate ? dayjs(periodA.endDate).endOf("day") : null;
  const startB = dayjs(periodB.startDate).startOf("day");
  const endB = periodB.endDate ? dayjs(periodB.endDate).endOf("day") : null;

  if (endA && startA.isAfter(endA, "day")) return false;
  if (endB && startB.isAfter(endB, "day")) return false;
  if (endA && startB.isAfter(endA, "day")) return false;
  if (endB && startA.isAfter(endB, "day")) return false;

  return true;
};

/*
@API: GET /employee/profile
@Desc: Get employee profile
@Access: Private
*/
exports.getProfile = async (req, res) => {
  try {
    const id = req.auth.id;

    const employee = await Employee.findByPk(id, {
      attributes: [
        "id",
        "name",
        "fadaId",
        "bloodGroup",
        "email",
        "phone",
        "dob",
        "gender",
        "isPhoneVerified",
        "isEmailVerified",
        "status",
        "qualification",
        "score",
        "isActive",
        "isVerified",
        "isProfilePrivate",
        "isRegistrationCompleted",
        "isProfileCompleted",
        "isKycCompleted",
        "isJourneyCompleted",
        "profilePicture",
        [
          sequelize.literal(`
          (SELECT COUNT(*) FROM EmployeeProfileShares WHERE EmployeeProfileShares.employeeId = Employee.id)
        `),
          "profileSharesCount",
        ],
      ],
      include: [
        {
          model: EmployeeAssignment,
          as: "assignment",
          attributes: [
            "id",
            "dealerId",
            "outletId",
            "departmentId",
            "designationId",
            "employeementType",
            "city",
            "startDate",
            "endDate",
            "isCurrentlyWorking",
            "highlights",
          ],
          required: false,
          where: { isCurrentlyWorking: true },
          include: [
            {
              model: Dealer,
              as: "dealership",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: Outlet,
              as: "branch",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: OrganizationStructure,
              as: "department",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: OrganizationStructure,
              as: "designation",
              attributes: ["id", "name"],
              required: false,
            },
          ],
        },
      ],
    });

    return res.apiSuccess("Employee profile fetched successfully", employee);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/personal-details
@Desc: Get employee personal details
@Access: Private
*/
exports.getPersonalDetails = async (req, res) => {
  try {
    const id = req.auth.id;

    const employee = await Employee.findByPk(id, {
      attributes: [
        "id",
        "name",
        "fadaId",
        "bloodGroup",
        "email",
        "phone",
        "qualification",
        "dob",
        "gender",
        "isPhoneVerified",
        "isEmailVerified",
        "profilePicture",
      ],
      include: [
        {
          model: EmployeeAddress,
          as: "addresses",
          attributes: [
            "id",
            "addressLine1",
            "addressLine2",
            "city",
            "state",
            "country",
            "pincode",
            "isActive",
          ],
          required: false,
        },
      ],
    });

    return res.apiSuccess("Personal details fetched successfully", {
      employee,
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/personal-details
@Desc: Update employee personal details
@Body: {
  name: string,
  bloodGroup: string,
  dob: date,
  gender: string, 
  "address.addressLine1": string,
  "address.addressLine2": string,
  "address.city": string,
  "address.state": string,
  "address.country": string,
  "address.pincode": string,
  "qualification" : "B.Tech"
}
@Access: Private
*/
exports.updatePersonalDetails = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.auth.id;



    const validator = new Validator(req.body, {
      name: "required|string",
      bloodGroup: "required|in:A+,A-,B+,B-,AB+,AB-,O+,O-",
      dob: "required|date",
      gender: "required|in:male,female,other",
      "address.addressLine1": "required|string",
      "address.addressLine2": "string",
      "address.city": "required|string",
      "address.state": "required|string",
      "address.country": "string",
      "address.pincode": "required|string",
      qualification: "required|string",
    });

    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, bloodGroup, dob, gender, address, qualification } = req.body;

    const employee = await Employee.update(
      { name, bloodGroup, dob, gender, qualification, isProfileCompleted: true },
      { where: { id }, transaction },
    );

    if (address) {
      await EmployeeAddress.update(address, {
        where: { employeeId: id },
        transaction,
      });
    }

    await transaction.commit();

    return res.apiSuccess("Personal details updated successfully", {
      employee,
    });
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/documents
@Desc: Get employee documents
@Access: Private
*/
exports.getDocuments = async (req, res) => {
  try {
    const id = req.auth.id;

    const documents = await Document.findAll({
      attributes: [
        "id",
        "name",
        "code",
        "category",
        "isMandatory",
        "isVerificationRequired",
        "notes",
      ],
      where: { appliesTo: { [Op.in]: ["employee", "both"] }, isActive: true },
      include: [
        {
          model: EmployeeDocument,
          as: "employeeDocuments",
          attributes: [
            "id",
            "documentId",
            "frontImage",
            "backImage",
            "isVerified",
            "status",
          ],
          where: { employeeId: id },
          required: false,
        },
      ],
    });

    return res.apiSuccess("Employee documents fetched successfully", documents);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/documents
@Desc: Upload employee documents
@Body: {
  documentId: number,
  frontImage: string,
  backImage: string,
}
@Access: Private
*/
exports.uploadDocuments = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.auth.id;
    const { documentId, frontImage, backImage } = req.body;

    const document = await Document.findByPk(documentId, { transaction });

    if (!document) {
      await transaction.rollback();
      return res.apiError("Document not found", 404);
    }

    const validator = new Validator(req.body, {
      documentId: "required|numeric",
      frontImage: "required|string",
      backImage: "required|string",
    });

    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    await EmployeeDocument.destroy({
      where: { employeeId: id, documentId },
      transaction,
    });

    await EmployeeDocument.create(
      {
        employeeId: id,
        documentId,
        frontImage,
        backImage,
        status: "pending",
      },
      { transaction },
    );

    await transaction.commit();

    return res.apiSuccess("Employee document uploaded successfully");
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/documents/{documentId}
@Desc: Delete employee document
@Access: Private
*/
exports.deleteDocument = async (req, res) => {
  try {
    const id = req.auth.id;
    const documentId = req.params.documentId;

    const employeeDocument = await EmployeeDocument.findOne({
      where: { employeeId: id, documentId },
    });

    if (!employeeDocument) {
      return res.apiError("Employee document not found", 404);
    }

    await EmployeeDocument.destroy({
      where: { employeeId: id, documentId },
    });

    return res.apiSuccess("Employee document deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/employeements
@Desc: Create employee employeement
@Body: {
  dealerId: number,
  outletId: number,
  departmentId: Number,
  designationId: Number,
  city: string,
  employeementType: string,
  isCurrentlyWorking: Boolean,
  startDate: Date,
  endDate: Date,
  highlights: String,
}
@Access: Private
*/
exports.createEmployeement = async (req, res) => {
  try {
    const id = req.auth.id;

    const validator = new Validator(req.body, {
      dealerId: "required|numeric",
      outletId: "required|numeric",
      departmentId: "required|numeric",
      designationId: "required|numeric",
      city: "required|string",
      employeementType: "required|string",
      isCurrentlyWorking: "required|boolean",
      startDate: "required|date",
      endDate: "date",
      highlights: "required|string",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const {
      dealerId,
      outletId,
      departmentId,
      designationId,
      city,
      employeementType,
      isCurrentlyWorking,
      startDate,
      endDate,
      highlights,
    } = req.body;

    if (endDate && dayjs(endDate).isBefore(dayjs(startDate), "day")) {
      return res.apiError("End date cannot be before start date.", 422);
    }

    if (!req.auth.isJourneyCompleted) {
      const checkJourney = await EmployeeAssignment.count({
        where: { employeeId: id },
      });

      await Employee.update({ isJourneyCompleted: checkJourney > 0 ? true : false }, { where: { id } });
    }

    const existingEmployeements = await EmployeeAssignment.findAll({
      where: { employeeId: id },
      attributes: ["id", "startDate", "endDate", "isCurrentlyWorking"],
      include: [
        {
          model: Dealer,
          as: "dealership",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    const newPeriod = {
      startDate,
      endDate: resolveEmploymentEndDate(isCurrentlyWorking, endDate),
    };

    for (const existing of existingEmployeements) {
      if (!existing.startDate) continue;

      const existingPeriod = {
        startDate: existing.startDate,
        endDate: resolveEmploymentEndDate(
          existing.isCurrentlyWorking,
          existing.endDate,
        ),
      };

      if (!employmentPeriodsOverlap(newPeriod, existingPeriod)) continue;

      const companyName = existing.dealership?.name || "another company";

      if (existing.isCurrentlyWorking) {
        return res.apiError(
          `You are currently employed at ${companyName}. Employment periods cannot overlap. If adding a past employment, the end date must be before your current employment start date (${dayjs(existing.startDate).format("MMM YYYY")}).`,
          422,
        );
      }

      return res.apiError(
        `This employment period overlaps with an existing record at ${companyName}. Please choose dates that do not overlap with your employment history.`,
        422,
      );
    }

    await EmployeeAssignment.create({
      employeeId: id,
      dealerId,
      outletId,
      departmentId,
      designationId,
      city,
      employeementType,
      isCurrentlyWorking,
      startDate,
      endDate,
      highlights,
    });

    return res.apiSuccess("Employee employeement created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/employeements
@Desc: Get employee employeements
@Access: Private
*/
exports.getEmployeements = async (req, res) => {
  try {
    const id = req.auth.id;

    const [employeements, keyRecords] = await Promise.all([
      EmployeeAssignment.findAll({
        attributes: [
          "id",
          "dealerId",
          "employeementType",
          "city",
          "startDate",
          "endDate",
          "isCurrentlyWorking",
          "highlights",
        ],
        where: { employeeId: id, status: { [Op.in]: ["completed", "verified"] } },
        include: [
          {
            model: Dealer,
            as: "dealership",
            attributes: ["id", "name"],
          },
          {
            model: Outlet,
            as: "branch",
            attributes: ["id", "name"],
          },
          {
            model: OrganizationStructure,
            as: "department",
            attributes: ["id", "name"],
          },
          {
            model: OrganizationStructure,
            as: "designation",
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["startDate", "ASC"],
        ],
      }),
      getEmploymentKeyRecords(id, 2),
    ]);

    const keyRecordsByDealerId = groupKeyRecordsByDealerId(keyRecords);

    const data = employeements.map((employeement) => {
      const record = employeement.toJSON();
      record.keyRecords = keyRecordsByDealerId[record.dealerId] || [];
      return record;
    });

    return res.apiSuccess(
      "Employee employeements fetched successfully",
      data,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/profile/privacy
@Desc: Get profile privacy setting
@Access: Private
*/
exports.getProfilePrivacy = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.auth.id, {
      attributes: ["id", "isProfilePrivate"],
    });

    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    return res.apiSuccess("Profile privacy fetched successfully", {
      isProfilePrivate: employee.isProfilePrivate,
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/profile/privacy
@Desc: Set profile public or private
@Body: { isProfilePrivate: boolean }
@Access: Private
*/
exports.updateProfilePrivacy = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      isProfilePrivate: "required|boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { isProfilePrivate } = req.body;

    await Employee.update({ isProfilePrivate }, { where: { id: req.auth.id } });

    return res.apiSuccess("Profile privacy updated successfully", {
      isProfilePrivate,
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/profile/shares
@Desc: List organisations with profile access
@Access: Private
*/
exports.getProfileShares = async (req, res) => {
  try {
    const shares = await Employee.findByPk(req.auth.id, {
      attributes: ["id", "isProfilePrivate"],
      include: [
        {
          model: EmployeeProfileShare,
          as: "profileShares",
          attributes: ["id", "dealerId", "isActive", "createdAt"],
          paranoid: false,
          include: [
            {
              model: Dealer,
              as: "dealership",
              attributes: ["id", "name", "dealerCode"],
            },
          ],
        },
      ],
    });

    return res.apiSuccess("Profile shares fetched successfully", shares);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/profile/shares
@Desc: Share profile access with an organisation (dealer)
@Body: { dealerId: number }
@Access: Private
*/
exports.shareProfile = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      dealerId: "required|numeric",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { dealerId } = req.body;
    const employeeId = req.auth.id;

    const dealer = await Dealer.findOne({
      where: { id: dealerId, isActive: true, status: "approved" },
      attributes: ["id", "name"],
    });

    if (!dealer) {
      return res.apiError("Organisation not found", 404);
    }

    let share = await EmployeeProfileShare.findOne({
      where: { employeeId, dealerId },
    });

    if (share) {
      await share.update({ isActive: true });
    } else {
      await EmployeeProfileShare.create({
        employeeId,
        dealerId,
        isActive: true,
      });
    }

    return res.apiSuccess("Profile access shared successfully");
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("Profile already shared with this organisation", 409);
    }
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/profile/shares/{shareId}
@Desc: Revoke profile access for an organisation
@Access: Private
*/
exports.revokeProfileShare = async (req, res) => {
  try {
    const share = await EmployeeProfileShare.findOne({
      where: { id: req.params.shareId, employeeId: req.auth.id },
    });

    if (!share) {
      return res.apiError("Profile share not found", 404);
    }

    await share.update({ isActive: false });

    return res.apiSuccess("Profile access revoked successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};


/*
@API: GET /employee/address
@Desc: Get employee address
@Access: Private
*/
exports.getAddress = async (req, res) => {
  try {
    const id = req.auth.id;
    const address = await EmployeeAddress.findOne({
      where: { employeeId: id },
    });

    if (!address) {
      return res.apiError("Address not found", 404);
    }

    return res.apiSuccess("Address fetched successfully", address);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/address
@Desc: Update employee address
@Body: {
  address: string,
}
@Access: Private
*/
exports.updateAddress = async (req, res) => {
  try {

    const validator = new Validator(req.body, {
      addressLine1: "required|string",
      addressLine2: "string",
      city: "required|string",
      state: "required|string",
      country: "string",
      pincode: "required|string",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const id = req.auth.id;
    const address = req.body;

    const exitsAddress = await EmployeeAddress.findOne({ where: { employeeId: id } });
    if (exitsAddress) {
      await exitsAddress.update(address);
    } else {
      await EmployeeAddress.create({ employeeId: id, isActive: true, ...address });
    }


    return res.apiSuccess("Address updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};



/*
@API: PUT /employee/profile-picture
@Desc: Update employee profile picture
@Body: {
  profilePicture: file (image),
}
@Access: Private
*/
exports.updateProfilePicture = async (req, res) => {
  try {
    const id = req.auth.id;
    if (!req.file) {
      return res.apiError("Profile picture is required", 400);
    }
    const profilePicture = req.file.filename;

    await Employee.update({ profilePicture: process.env.API_URL + "/uploads/" + profilePicture }, { where: { id } });

    return res.apiSuccess("Profile picture updated successfully", {
      profilePicture: process.env.API_URL + "/uploads/" + profilePicture,
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API : GET /employee/professional-details
@Desc: Get employee address
@Access: Private
*/
exports.getProfessionalDetails = async (req, res) => {
  try {

    const id = req.auth.id;

    const currentEmployeement = await EmployeeAssignment.findOne({
      where: { employeeId: id, /* isCurrentlyWorking: true */ },
      order: [["id", "DESC"]],
      include: [
        {
          model: Dealer,
          as: "dealership",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Outlet,
          as: "branch",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: OrganizationStructure,
          as: "department",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: OrganizationStructure,
          as: "designation",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    return res.apiSuccess("Employee professional details.", currentEmployeement);

  } catch (error) {
    return res.apiError("Internal server error.", 500)
  }
}


