const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { sequelize, ScoreStage } = require("../../../database/models");

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const scoreStageValidationRules = {
  name: "required|string",
  minScore: "required|integer|min:0",
  maxScore: "required|integer|min:0",
  colorHex: "required|string",
  icon: "string",
  isActive: "boolean",
};

const validateScoreStageItem = (body, res) => {
  const validator = new Validator(body, scoreStageValidationRules);
  if (validator.fails()) {
    res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    return false;
  }

  const minScore = Number(body.minScore);
  const maxScore = Number(body.maxScore);

  if (minScore > maxScore) {
    res.apiError("minScore cannot be greater than maxScore", 422);
    return false;
  }

  if (!HEX_COLOR_REGEX.test(String(body.colorHex).trim())) {
    res.apiError("colorHex must be a valid hex color (e.g. #B87333)", 422);
    return false;
  }

  return true;
};

const validateScoreStagesArray = (stages, res) => {
  if (!Array.isArray(stages) || !stages.length) {
    res.apiError("Request body must be a non-empty array of score stages", 422);
    return false;
  }

  for (const stage of stages) {
    if (!validateScoreStageItem(stage, res)) return false;
  }

  const names = stages.map((stage) => stage.name.trim().toLowerCase());
  if (names.length !== new Set(names).size) {
    res.apiError("Duplicate stage names are not allowed", 422);
    return false;
  }

  const sorted = [...stages].sort(
    (a, b) => Number(a.minScore) - Number(b.minScore),
  );

  for (let index = 1; index < sorted.length; index += 1) {
    if (Number(sorted[index].minScore) <= Number(sorted[index - 1].maxScore)) {
      res.apiError("Score stage ranges must not overlap", 422);
      return false;
    }
  }

  return true;
};

const buildScoreStagePayload = (body) => ({
  name: body.name.trim(),
  minScore: Number(body.minScore),
  maxScore: Number(body.maxScore),
  colorHex: body.colorHex.trim().toUpperCase(),
  icon: body.icon != null && body.icon !== "" ? String(body.icon).trim() : null,
  isActive: body.isActive ?? true,
});

const findScoreStageOrError = async (id, res) => {
  const scoreStage = await ScoreStage.findByPk(id);
  if (!scoreStage) {
    res.apiError("Score stage not found", 404);
    return null;
  }
  return scoreStage;
};

const findDuplicateName = async (name, excludeId, transaction) => {
  const where = { name: name.trim() };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  return ScoreStage.findOne({ where, transaction });
};

const syncScoreStages = async (stages, transaction) => {
  for (const item of stages) {
    const payload = buildScoreStagePayload(item);
    const stageId = item.id ? Number(item.id) : null;
    const duplicate = await findDuplicateName(payload.name, stageId, transaction);

    if (duplicate) {
      const error = new Error("A score stage with this name already exists");
      error.statusCode = 409;
      throw error;
    }

    if (stageId) {
      const scoreStage = await ScoreStage.findByPk(stageId, { transaction });
      if (scoreStage) {
        await scoreStage.update(payload, { transaction });
        continue;
      }
    }

    await ScoreStage.create(payload, { transaction });
  }

  return ScoreStage.findAll({
    order: [
      ["minScore", "ASC"],
      ["id", "ASC"],
    ],
    transaction,
  });
};

/*
@API: GET /admin/score-stages
@Desc: Get all score stages
@Access: Private
*/
exports.getScoreStages = async (req, res) => {
  try {
      
    const scoreStages = await ScoreStage.findAll({ 
      order: [["minScore", "ASC"], ["id", "ASC"]],
    });

    return res.apiSuccess("Score stages fetched successfully", scoreStages);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/score-stages/:id
@Desc: Get score stage by id
@Access: Private
*/
exports.getScoreStageById = async (req, res) => {
  try {
    const scoreStage = await findScoreStageOrError(req.params.id, res);
    if (!scoreStage) return;

    return res.apiSuccess("Score stage fetched successfully", scoreStage);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/score-stages
@Desc: Bulk update score stages
@Access: Private
*/
exports.bulkUpdateScoreStages = async (req, res) => {
  try {
    if (!validateScoreStagesArray(req.body, res)) return;

    const scoreStages = await sequelize.transaction((transaction) =>
      syncScoreStages(req.body, transaction),
    );

    return res.apiSuccess("Score stages updated successfully", { scoreStages });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.apiError(error.message, 409);
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("A score stage with this name already exists", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/score-stages/:id
@Desc: Update score stage or bulk update when body is an array
@Access: Private
*/
exports.updateScoreStage = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      return exports.bulkUpdateScoreStages(req, res);
    }

    if (!validateScoreStageItem(req.body, res)) return;

    const scoreStage = await findScoreStageOrError(req.params.id, res);
    if (!scoreStage) return;

    const payload = buildScoreStagePayload(req.body);
    const existing = await findDuplicateName(payload.name, scoreStage.id);
    if (existing) {
      return res.apiError("A score stage with this name already exists", 409);
    }

    await scoreStage.update(payload);

    return res.apiSuccess("Score stage updated successfully", scoreStage);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("A score stage with this name already exists", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/score-stages/:id
@Desc: Delete score stage
@Access: Private
*/
exports.deleteScoreStage = async (req, res) => {
  try {
    const scoreStage = await findScoreStageOrError(req.params.id, res);
    if (!scoreStage) return;

    await scoreStage.destroy();

    return res.apiSuccess("Score stage deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/score-stages/icon/:id
@Desc: Update score stage icon
@Access: Private
@Body: {
  icon: "required|image",
}
*/
exports.updateScoreStageIcon = async (req, res) => {
  try {
   
   if(!req.file){
    return res.apiError("File is required", 400);
   }
 
   const scoreStage = await ScoreStage.findByPk(req.params.id);

   const payload = {
    icon: process.env.API_URL + "/uploads/" + req.file.filename,
   };
   await scoreStage.update(payload);
     
    return res.apiSuccess("Score stage icon updated successfully", scoreStage);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
