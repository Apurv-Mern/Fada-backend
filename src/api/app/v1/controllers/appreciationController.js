const Validator = require("validatorjs");
const { EmployeeAppreciation } = require("../../../../database/models");
const { getEmployeeDealerId } = require("../../../../services/employeeService");
const appreciationValidationRules = {
  appreciationTitle: "required|string",
  issuedBy: "string",
  appreciationDate: "date",
  description: "string",
  quote: "string",  
  attachment: "string",
};

async function findOwnedAppreciation(appreciationId, employeeId) {
  return EmployeeAppreciation.findOne({
    where: { id: appreciationId, employeeId },
  });
}
/*
@API: GET /employee/appreciations?dealerId=4
@Desc: Get employee appreciations
@Access: Private
*/
exports.getAppreciations = async (req, res) => {
  try {

    const whereClause = {
      employeeId: req.auth.id,
    };
    if (req.query?.dealerId) {
      whereClause.dealerId = req.query?.dealerId;
    }
    const appreciations = await EmployeeAppreciation.findAll({
      where: whereClause,
    });
    return res.apiSuccess(
      "Employee appreciations fetched successfully",
      appreciations,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/appreciations/{appreciationId}
@Desc: Get employee appreciation
@Access: Private
*/
exports.getAppreciation = async (req, res) => {
  try {
    const appreciation = await findOwnedAppreciation(
      req.params.appreciationId,
      req.auth.id,
    );
    if (!appreciation) {
      return res.apiError("Employee appreciation not found", 404);
    }
    return res.apiSuccess(
      "Employee appreciation fetched successfully",
      appreciation,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/appreciations
@Desc: Create employee appreciation
@Body: {
  appreciationTitle: string,
  issuedBy: string,
  appreciationDate: date,
  description: string,
  quote: string,
  attachment: string,
}
@Access: Private
*/
exports.createAppreciation = async (req, res) => {
  try {
    const validator = new Validator(req.body, appreciationValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const dealerId = await getEmployeeDealerId(req.auth.id);

    await EmployeeAppreciation.create({
      ...req.body,
      employeeId: req.auth.id,
      dealerId,
    });
    return res.apiSuccess("Employee appreciation created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/appreciations/{appreciationId}
@Desc: Update employee appreciation
@Body: {
  appreciationTitle: string,
  issuedBy: string,
  appreciationDate: date,
  description: string,
  quote: string,
  attachment: string,
}
@Access: Private
*/
exports.updateAppreciation = async (req, res) => {
  try {
    const appreciation = await findOwnedAppreciation(
      req.params.appreciationId,
      req.auth.id,
    );
    if (!appreciation) {
      return res.apiError("Employee appreciation not found", 404);
    }

    const validator = new Validator(req.body, appreciationValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    await appreciation.update(req.body);
    return res.apiSuccess("Employee appreciation updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/appreciations/{appreciationId}
@Desc: Delete employee appreciation
@Access: Private
*/
exports.deleteAppreciation = async (req, res) => {
  try {
    const appreciation = await findOwnedAppreciation(
      req.params.appreciationId,
      req.auth.id,
    );
    if (!appreciation) {
      return res.apiError("Employee appreciation not found", 404);
    }
    await appreciation.destroy();
    return res.apiSuccess("Employee appreciation deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
