const {
  sequelize,
  EmployeeAssignment,
  EmployeeEmployerStatus,
  Dealer,
  Outlet,
} = require("../../../../database/models");
const { Op } = require("sequelize");
const Validator = require("validatorjs");

/*
@API: POST /employee/employer-invitations
@Desc: Send new employee invitation
@Access: Private
*/
exports.sendNewEmployerInvitation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validator = new Validator(req.body, {
      dealerId: "required|integer",
      outletId: "required|integer",
    });

    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { dealerId, outletId } = req.body;

    const existingEmployeeAssignment = await EmployeeAssignment.findOne({
      where: {
        dealerId,
        //outletId,
        employeeId: req.auth.id,
        isCurrentlyWorking: true,
      },
      order: [["createdAt", "DESC"]],
    });

    if (existingEmployeeAssignment) {
      await transaction.rollback();
      return res.apiError("Employee already working in this dealership.", 400);
    }

    const employeeAssignment = await EmployeeAssignment.create(
      {
        dealerId,
        outletId,
        employeeId: req.auth.id,
        invitationSendBy: "employee",
        status: "pending",
      },
      { transaction },
    );

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: employeeAssignment.id,
        status: "send_invitation",
        slug: "send_invitation",
        actionUserBy: "employee",
        actionUserId: req.auth.id,
      },
      { transaction },
    );

    await transaction.commit();
    return res.apiSuccess("New employer invitation sent successfully", {});
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/employer-invitations
@Desc: Get employee employer invitations
@Access: Private
*/
exports.getEmployerInvitations = async (req, res) => {
  try {
    const { id } = req.auth;
    const employeeInvitations = await EmployeeAssignment.findAll({
      where: { employeeId: id, status: "pending" },
      order: [["createdAt", "DESC"]],
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
      ],
    });
    if (!employeeInvitations) {
      return res.apiError("Employee invitations not found", 404);
    }
    return res.apiSuccess(
      "Employee invitations fetched successfully",
      employeeInvitations,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/employer-invitations/:id
@Desc: Get employee employer invitation by id
@Access: Private
*/
exports.getEmployerInvitationById = async (req, res) => {
  try {
    const { id } = req.auth;
    const employeeInvitation = await EmployeeAssignment.findOne({
      where: { employeeId: id, status: "pending", id: req.params.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          attributes: ["id", "status", "slug", "actionUserBy", "actionUserId"],
        },
      ],
    });
    if (!employeeInvitation) {
      return res.apiError("Employee invitation not found", 404);
    }
    return res.apiSuccess(
      "Employee invitation fetched successfully",
      employeeInvitation,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PATCH /employee/employer-invitations/:id/status/:status | accept | reject
@Desc: Accept or reject employee employer invitation by id
@Access: Private
*/
exports.acceptOrRejectEmployerInvitationById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.auth;

    const { status } = req.params;

    if (status !== "accept" && status !== "reject") {
      await transaction.rollback();
      return res.apiError("Invalid status", 400);
    }
    const employeeInvitation = await EmployeeAssignment.update(
      { status: status === "accept" ? "verified" : "rejected" },
      { where: { employeeId: id, id: req.params.id }, transaction },
    );

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: req.params.id,
        status: status === "accept" ? "accepted" : "rejected",
        slug: status,
        actionUserBy: "employee",
        actionUserId: id,
      },
      { transaction },
    );

    await transaction.commit();
    return res.apiSuccess(
      `${status === "accept" ? "Accepted" : "Rejected"} employee invitation successfully`,
      employeeInvitation,
    );
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};
