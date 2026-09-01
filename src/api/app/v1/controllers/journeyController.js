const Validator = require("validatorjs");
const { Employee, EmployeeJourney } = require("../../../../database/models");
const { getEmployeeDealerId } = require("../../../../services/employeeService");

const journeyValidationRules = {
  title: "required|string",
  subtitle: "string",
  journeyDate: "date",
};

function normalizeAttachments(attachments) {
  if (attachments === undefined || attachments === null) {
    return [];
  }
  if (!Array.isArray(attachments)) {
    return { error: "Attachments must be an array" };
  }
  const invalid = attachments.some((item) => typeof item !== "string");
  if (invalid) {
    return { error: "Each attachment must be a string URL or path" };
  }
  return { value: attachments };
}

function buildPayload(body) {
  const normalized = normalizeAttachments(body.attachments);
  if (normalized.error) {
    return normalized;
  }
  return {
    value: {
      title: body.title,
      subtitle: body.subtitle,
      journeyDate: body.journeyDate,
      attachments: normalized.value,
    },
  };
}

async function findOwnedJourney(journeyId, employeeId) {
  return EmployeeJourney.findOne({
    where: { id: journeyId, employeeId },
  });
}

/*
@API: GET /employee/journeys?dealerId=4
@Desc: Get employee journeys
@Access: Private
*/
exports.getJourneys = async (req, res) => {
  try {
    const whereClause = {
      employeeId: req.auth.id,
    };
    if (req.query?.dealerId) {
      whereClause.dealerId = req.query.dealerId;
    }
    const journeys = await EmployeeJourney.findAll({
      where: whereClause,
    });
    return res.apiSuccess("Employee journeys fetched successfully", journeys);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/journeys/:journeyId
@Desc: Get employee journey
@Access: Private
*/
exports.getJourney = async (req, res) => {
  try {
    const journey = await findOwnedJourney(req.params.journeyId, req.auth.id);
    if (!journey) {
      return res.apiError("Employee journey not found", 404);
    }
    return res.apiSuccess("Employee journey fetched successfully", journey);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/journeys
@Desc: Create employee journey
@Body: {
  title: string,
  subtitle: string,
  journeyDate: date,
  attachments: string[],
}
@Access: Private
*/
exports.createJourney = async (req, res) => {
  try {
    const validator = new Validator(req.body, journeyValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const payload = buildPayload(req.body);
    if (payload.error) {
      return res.apiError(payload.error, 422);
    }

    const dealerId = await getEmployeeDealerId(req.auth.id);

    await EmployeeJourney.create({
      ...payload.value,
      employeeId: req.auth.id,
      dealerId,
    });

    if (!req.auth.isJourneyCompleted) {
      await Employee.update({ isJourneyCompleted: true }, { where: { id: req.auth.id } });
    }

    return res.apiSuccess("Employee journey created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/journeys/{journeyId}
@Desc: Update employee journey
@Body: {
  title: string,
  subtitle: string,
  journeyDate: date,
  attachments: string[],
}
@Access: Private
*/
exports.updateJourney = async (req, res) => {
  try {
    const journey = await findOwnedJourney(req.params.journeyId, req.auth.id);
    if (!journey) {
      return res.apiError("Employee journey not found", 404);
    }

    const validator = new Validator(req.body, journeyValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const payload = buildPayload(req.body);
    if (payload.error) {
      return res.apiError(payload.error, 422);
    }

    await journey.update(payload.value);
    return res.apiSuccess("Employee journey updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/journeys/{journeyId}
@Desc: Delete employee journey
@Access: Private
*/
exports.deleteJourney = async (req, res) => {
  try {
    const journey = await findOwnedJourney(req.params.journeyId, req.auth.id);
    if (!journey) {
      return res.apiError("Employee journey not found", 404);
    }
    await journey.destroy();
    return res.apiSuccess("Employee journey deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
