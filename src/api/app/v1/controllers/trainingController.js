const Validator = require("validatorjs");
const { EmployeeTraining } = require("../../../../database/models");

const trainingValidationRules = {
  trainingTitle: "required|string",
  trainingProvider: "string",
  completionDate: "date",
  keyLearnings: "string",
  attachment: "string",
};

async function findOwnedTraining(trainingId, employeeId) {
  return EmployeeTraining.findOne({
    where: { id: trainingId, employeeId },
  });
}

/*
@API: GET /employee/trainings
@Desc: Get employee trainings
@Access: Private
*/
exports.getTrainings = async (req, res) => {
  try {
    const trainings = await EmployeeTraining.findAll({
      where: { employeeId: req.auth.id },
    });
    return res.apiSuccess("Employee trainings fetched successfully", trainings);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/trainings/{trainingId}
@Desc: Get employee training
@Access: Private
*/
exports.getTraining = async (req, res) => {
  try {
    const training = await findOwnedTraining(
      req.params.trainingId,
      req.auth.id,
    );
    if (!training) {
      return res.apiError("Employee training not found", 404);
    }
    return res.apiSuccess("Employee training fetched successfully", training);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/trainings
@Desc: Create employee training
@Body: {
  trainingTitle: string,
  trainingProvider: string,
  completionDate: date,
  keyLearnings: string,
  attachment: string,
}
@Access: Private
*/
exports.createTraining = async (req, res) => {
  try {
    const validator = new Validator(req.body, trainingValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }
    await EmployeeTraining.create({ ...req.body, employeeId: req.auth.id });
    return res.apiSuccess("Employee training created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/trainings/{trainingId}
@Desc: Update employee training
@Body: {
  trainingTitle: string,
  trainingProvider: string,
  completionDate: date,
  keyLearnings: string,
  attachment: string,
}
@Access: Private
*/
exports.updateTraining = async (req, res) => {
  try {
    const training = await findOwnedTraining(
      req.params.trainingId,
      req.auth.id,
    );
    if (!training) {
      return res.apiError("Employee training not found", 404);
    }

    const validator = new Validator(req.body, trainingValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    await training.update(req.body);
    return res.apiSuccess("Employee training updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/trainings/{trainingId}
@Desc: Delete employee training
@Access: Private
*/
exports.deleteTraining = async (req, res) => {
  try {
    const training = await findOwnedTraining(
      req.params.trainingId,
      req.auth.id,
    );
    if (!training) {
      return res.apiError("Employee training not found", 404);
    }
    await training.destroy();
    return res.apiSuccess("Employee training deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
