const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { ScoreRule } = require("../../../database/models");

const SCORE_RULE_CATEGORIES = [
  "Engagement",
  "Growth",
  "Learning",
  "Other",
  "Performance",
  "Recognition",
];

const scoreRuleValidationRules = {
  category: `required|in:${SCORE_RULE_CATEGORIES.join(",")}`,
  points: "required|integer|min:1",
  action: "required|string",
  frequency: "required|string",
  isActive: "boolean",
};

const buildScoreRulePayload = (body) => ({
  category: body.category,
  points: Number(body.points),
  action: body.action.trim(),
  frequency: body.frequency.trim(),
  isActive: body.isActive ?? true,
});

const findScoreRuleOrError = async (id, res) => {
  const scoreRule = await ScoreRule.findByPk(id);
  if (!scoreRule) {
    res.apiError("Score rule not found", 404);
    return null;
  }
  return scoreRule;
};

/*
@API: GET /admin/score-rules
@Desc: Get all score rules
@Access: Private
*/
exports.getScoreRules = async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true" || isActive === "1";
    }

    if (search) {
      where[Op.or] = [
        { action: { [Op.like]: `%${search}%` } },
        { frequency: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: scoreRules, count: total } = await ScoreRule.findAndCountAll({
      where,
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return res.apiSuccess("Score rules fetched successfully", {
      scoreRules,
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
@API: GET /admin/score-rules/:id
@Desc: Get score rule by id
@Access: Private
*/
exports.getScoreRuleById = async (req, res) => {
  try {
    const scoreRule = await findScoreRuleOrError(req.params.id, res);
    if (!scoreRule) return;

    return res.apiSuccess("Score rule fetched successfully", scoreRule);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/score-rules
@Desc: Create score rule
@Access: Private
*/
exports.createScoreRule = async (req, res) => {
  try {
    const validator = new Validator(req.body, scoreRuleValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const scoreRule = await ScoreRule.create(buildScoreRulePayload(req.body));

    return res.apiSuccess("Score rule created successfully", scoreRule);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/score-rules/:id
@Desc: Update score rule
@Access: Private
*/
exports.updateScoreRule = async (req, res) => {
  try {
    const validator = new Validator(req.body, scoreRuleValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const scoreRule = await findScoreRuleOrError(req.params.id, res);
    if (!scoreRule) return;

    await scoreRule.update(buildScoreRulePayload(req.body));

    return res.apiSuccess("Score rule updated successfully", scoreRule);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/score-rules/:id
@Desc: Delete score rule
@Access: Private
*/
exports.deleteScoreRule = async (req, res) => {
  try {
    const scoreRule = await findScoreRuleOrError(req.params.id, res);
    if (!scoreRule) return;

    await scoreRule.destroy();

    return res.apiSuccess("Score rule deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
