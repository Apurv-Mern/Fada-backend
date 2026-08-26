const Validator = require("validatorjs");
const { EmployeeSkill } = require("../../../../database/models");
const { getEmployeeDealerId } = require("../../../../services/employeeService");

const skillValidationRules = {
  skillName: "required|string",
  skillCategory: "required|string",
  proficiencyLevel: "required|string",
  learningSource: "string",
  description: "string",
  skillDate: "date",
};

async function findOwnedSkill(skillId, employeeId) {
  return EmployeeSkill.findOne({
    where: { id: skillId, employeeId },
  });
}

/*
@API: GET /employee/skills?dealerId=4
@Desc: Get employee skills
@Access: Private
*/
exports.getSkills = async (req, res) => {
  try {
    const whereClause = {
      employeeId: req.auth.id,
    };
    if (req.query?.dealerId) {
      whereClause.dealerId = req.query?.dealerId;
    }
    const skills = await EmployeeSkill.findAll({
      where: whereClause,
    });
    return res.apiSuccess("Employee skills fetched successfully", skills);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/skills/{skillId}
@Desc: Get employee skill
@Access: Private
*/
exports.getSkill = async (req, res) => {
  try {
    const skill = await findOwnedSkill(req.params.skillId, req.auth.id);
    if (!skill) {
      return res.apiError("Employee skill not found", 404);
    }
    return res.apiSuccess("Employee skill fetched successfully", skill);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/skills
@Desc: Create employee skill
@Body: {
  skillName: string,
  skillCategory: string,
  proficiencyLevel: string,
  learningSource: string,
  skillDate: date,
  description: string,
}
@Access: Private
*/
exports.createSkill = async (req, res) => {
  try {
    const validator = new Validator(req.body, skillValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }
    const dealerId = await getEmployeeDealerId(req.auth.id);
    await EmployeeSkill.create({ ...req.body, employeeId: req.auth.id, dealerId });
    return res.apiSuccess("Employee skill created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/skills/{skillId}
@Desc: Update employee skill
@Body: {
  skillName: string,
  skillCategory: string,
  proficiencyLevel: string,
  learningSource: string,
  skillDate: date,
  description: string,
}
@Access: Private
*/
exports.updateSkill = async (req, res) => {
  try {
    const skill = await findOwnedSkill(req.params.skillId, req.auth.id);
    if (!skill) {
      return res.apiError("Employee skill not found", 404);
    }

    const validator = new Validator(req.body, skillValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    await skill.update(req.body);
    return res.apiSuccess("Employee skill updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/skills/{skillId}
@Desc: Delete employee skill
@Access: Private
*/
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await findOwnedSkill(req.params.skillId, req.auth.id);
    if (!skill) {
      return res.apiError("Employee skill not found", 404);
    }
    await skill.destroy();
    return res.apiSuccess("Employee skill deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
