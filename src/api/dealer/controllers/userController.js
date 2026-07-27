const {
  sequelize,
  Dealer,
  DealerLocation,
  KeyContact,
  DealerProfile,
} = require("../../../database/models");
const Validator = require("validatorjs")








/*
@API: GET /dealer/profile
@Desc: Get dealer profile
@Access: Private     
*/
exports.getProfile = async (req, res) => {
  try {
    const id = req.auth.id;

    const profile = await Dealer.findOne({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "dealerCode",
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
    phone: string
}
@Access: Private     
*/
exports.updateProfile = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.auth.id;

    const validator = new Validator(req.body, {
      typeOfDealership: "required|string",
      yearOfEstablishment: "required|string",
      panNumber: "required|string",
      fadaMembershipId: "required|string",
      fadaMemberSince: "required|date",
      name: "required|string",
      phone: "required|string",
    });

    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(validator.errors.all(), 400);
    }

    let profileData = {}, dealerData = {};

    if (req.body.typeOfDealership) {
      profileData.typeOfDealership = req.body.typeOfDealership;
    }
    if (req.body.yearOfEstablishment) {
      profileData.yearOfEstablishment = req.body.yearOfEstablishment;
    }
    if (req.body.panNumber) {
      profileData.panNumber = req.body.panNumber;
    }
    if (req.body.fadaMembershipId) {
      profileData.fadaMembershipId = req.body.fadaMembershipId;
    }
    if (req.body.fadaMemberSince) {
      profileData.fadaMemberSince = req.body.fadaMemberSince;
    }
    if (req.body.name) {
      dealerData.name = req.body.name;
    }
    if (req.body.phone) {
      dealerData.phone = req.body.phone;
    }


    if (Object.keys(profileData).length > 0) {
      const profile = await DealerProfile.findOne({ where: { dealerId: id }, transaction });
      if (!profile) {
        await DealerProfile.create({ dealerId: id, ...profileData }, { transaction });
      } else {
        await DealerProfile.update(profileData, { where: { dealerId: id }, transaction });
      }
    }
    if (Object.keys(dealerData).length > 0) {
      await Dealer.update(dealerData, { where: { id }, transaction });
    }

    await transaction.commit();
    return res.apiSuccess("Profile updated successfully");
  } catch (error) {
    await transaction.rollback();
    return res.apiError(error.message, 500, error);
  }
};
