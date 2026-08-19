const {
  sequelize,
  Dealer,
  DealerLocation,
  KeyContact,
  DealerProfile,
} = require("../../../database/models");
const Validator = require("validatorjs");

/*
@API: GET /dealer/profile
@Desc: Get dealer profile
@Access: Private     
*/
exports.getProfile = async (req, res) => {
  try {
    const id = req.currentDealerId;

    const profile = await Dealer.findOne({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "dealerCode",
        "brands",
        "status",
        "isActive",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Outlets
            WHERE Outlets.dealerId = ${id}
          )`),
          "totalOutlets",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM EmployeeAssignments
            WHERE EmployeeAssignments.dealerId = ${id}
            AND EmployeeAssignments.isActive = true
          )`),
          "allEmployees",
        ],
      ],
      where: { id },
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
      ],
    });

    return res.apiSuccess("Profile fetched successfully", profile);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealer/profile
@Desc: Update dealer profile
@Body: {
    typeOfDealership: string,
    yearOfEstablishment: string,
    panNumber: string,
    fadaMembershipId: string,
    fadaMemberSince: date,
    name: string,
    phone: string,
    dealerLocations : {

    }
}
@Access: Private     
*/
exports.updateProfile = async (req, res) => {
  const validator = new Validator(req.body, {
    typeOfDealership: "string",
    yearOfEstablishment: "string",
    panNumber: "required|string",
    fadaMembershipId: "string",
    fadaMemberSince: "date",
    brandsRepresented: "required",
    name: "required|string",
    phone: "required|string",
    address: "required|string",
    city: "required|string",
    pinCode: "required|string",
    state: "required|string",
  });

  if (validator.fails()) {
    return res.apiError(validator.errors.all(), 400);
  }

  try {
    const id = req.currentDealerId;

    const {
      typeOfDealership,
      yearOfEstablishment,
      panNumber,
      fadaMembershipId,
      fadaMemberSince,
      name,
      phone,
      brandsRepresented,
      dealerLocations,
    } = req.body;

    await sequelize.transaction(async (transaction) => {
      // Profile Data
      const profileData = {};

      if (typeOfDealership !== undefined) {
        profileData.typeOfDealership = typeOfDealership;
      }

      if (yearOfEstablishment !== undefined) {
        profileData.yearOfEstablishment = yearOfEstablishment;
      }

      if (panNumber !== undefined) {
        profileData.panNumber = panNumber;
      }

      if (fadaMembershipId !== undefined) {
        profileData.fadaMembershipId = fadaMembershipId || "";
      }

      if (fadaMemberSince !== undefined) {
        profileData.fadaMemberSince = fadaMemberSince !== "" ? fadaMemberSince : null;
      }

      // Dealer Data
      const dealerData = {};

      if (name !== undefined) {
        dealerData.name = name;
      }

      if (phone !== undefined) {
        dealerData.phone = phone;
      }

      if (brandsRepresented !== undefined) {
        dealerData.brands = brandsRepresented;
      }

      // Update/Create Dealer Profile
      if (Object.keys(profileData).length > 0) {
        const profile = await DealerProfile.findOne({ where: { dealerId: id }, transaction });

        if (profile) {
          await profile.update(profileData, { transaction });
        } else {
          await DealerProfile.create({ dealerId: id, ...profileData }, { transaction });
        }
      }

      // Update Dealer
      if (Object.keys(dealerData).length > 0) {
        await Dealer.update(dealerData, {
          where: { id },
          transaction,
        });
      }

      // Update/Create Dealer Location
      if (dealerLocations !== undefined) {
        const dealerLocation = await DealerLocation.findOne({ where: { dealerId: id }, transaction });

        if (dealerLocation) {
          await dealerLocation.update(dealerLocations, { transaction });
        } else {
          await DealerLocation.create({ dealerId: id, ...dealerLocations }, { transaction });
        }
      }
    });

    return res.apiSuccess("Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);

    return res.apiError(
      error.message || "Something went wrong",
      500,
      error
    );
  }
};


/*
@API: GET /dealer/group-dealers
@Desc: Get group dealers
@Access: Private     
*/
exports.getGroupDealers = async (req, res) => {
  try {
    const id = req.currentDealerId;

    const groupDealers = await Dealer.findAll({
      where: { parentDealerId: id, isActive: true },
      attributes: ["id", "name", "dealerCode"]
    });

    return res.apiSuccess("Group dealers fetched successfully", groupDealers);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

