const Validator = require("validatorjs");
const { EmployeePromotion } = require("../../../../database/models");
const { getEmployeeDealerId } = require("../../../../services/employeeService");

const promotionValidationRules = {
  roleTitle: "required|string",
  issuedBy: "string",
  promotionDate: "date",
  description: "string",
  attachment: "string",
};

async function findOwnedPromotion(promotionId, employeeId) {
  return EmployeePromotion.findOne({
    where: { id: promotionId, employeeId },
  });
}

/*
@API: GET /employee/promotions?dealerId=4
@Desc: Get employee promotions
@Access: Private
*/
exports.getPromotions = async (req, res) => {
  try {
    const whereClause = {
      employeeId: req.auth.id,
    };
    if (req.query?.dealerId) {
      whereClause.dealerId = req.query?.dealerId;
    }
    const promotions = await EmployeePromotion.findAll({
      where: whereClause,
    });
    return res.apiSuccess(
      "Employee promotions fetched successfully",
      promotions,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/promotions/{promotionId}
@Desc: Get employee promotion
@Access: Private
*/
exports.getPromotion = async (req, res) => {
  try {
    const promotion = await findOwnedPromotion(
      req.params.promotionId,
      req.auth.id,
    );
    if (!promotion) {
      return res.apiError("Employee promotion not found", 404);
    }
    return res.apiSuccess("Employee promotion fetched successfully", promotion);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/promotions
@Desc: Create employee promotion
@Body: {
  roleTitle: string,
  issuedBy: string,
  promotionDate: date,
  description: string,
  attachment: string,
}
@Access: Private
*/
exports.createPromotion = async (req, res) => {
  try {
    const validator = new Validator(req.body, promotionValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }
    const dealerId = await getEmployeeDealerId(req.auth.id);
    await EmployeePromotion.create({
      ...req.body,
      employeeId: req.auth.id,
      dealerId,
    });
    return res.apiSuccess("Employee promotion created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/promotions/{promotionId}
@Desc: Update employee promotion
@Body: {
  roleTitle: string,
  issuedBy: string,
  promotionDate: date,
  description: string,
  attachment: string,
}
@Access: Private
*/
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await findOwnedPromotion(
      req.params.promotionId,
      req.auth.id,
    );
    if (!promotion) {
      return res.apiError("Employee promotion not found", 404);
    }

    const validator = new Validator(req.body, promotionValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    await promotion.update(req.body);
    return res.apiSuccess("Employee promotion updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/promotions/{promotionId}
@Desc: Delete employee promotion
@Access: Private
*/
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await findOwnedPromotion(
      req.params.promotionId,
      req.auth.id,
    );
    if (!promotion) {
      return res.apiError("Employee promotion not found", 404);
    }
    await promotion.destroy();
    return res.apiSuccess("Employee promotion deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
