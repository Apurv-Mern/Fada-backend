const {
  sequelize,
  EmployeeAssignment,
  EmployeeEmployerStatus,
  Employee,
} = require("../../../database/models");
const Validator = require("validatorjs");

const { newEmployerSteps } = require("../../../services/employeeService");

const EMPLOYER_JOINING_STATUS = {
  SEND_INVITATION: "send_invitation",
  ACCEPT_INVITATION: "accept_invitation",
  SHARE_DETAILS: "share_details",
  EMPLOYER_VERIFICATION: "employer_verification",
  JOINING_CONFIRMED: "joining_confirmed",
};

const EMPLOYER_EXIT_STATUS = {
  SEND_INVITATION: "send_invitation",
  ACCEPT_INVITATION: "accept_invitation",
  SHARE_DETAILS: "share_details",
  EMPLOYER_VERIFICATION: "employer_verification",
  JOINING_CONFIRMED: "joining_confirmed",
};

/*
@API: GET /dealer/employer-invitations
@Desc: Get dealer employer invitations
@Access: Private
*/
exports.getEmployerInvitations = async (req, res) => {
  try {
    const { id } = req.auth;

    const employerInvitations = await EmployeeAssignment.findAll({
      where: { dealerId: id, status: "pending" },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    return res.apiSuccess(
      "Employer invitations fetched successfully",
      employerInvitations,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /dealer/employer-invitations/:id
@Desc: Get dealer employer invitation by id
@Access: Private
*/
exports.getEmployerInvitationById = async (req, res) => {
  try {
    const { id } = req.auth;
    const employerInvitation = await EmployeeAssignment.findOne({
      where: { dealerId: id, id: req.params.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          attributes: ["id", "status", "slug", "actionUserBy", "actionUserId"],
        },
      ],
    });
    if (!employerInvitation) {
      return res.apiError("Employer invitation not found", 404);
    }
    return res.apiSuccess(
      "Employer invitation fetched successfully",
      employerInvitation,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PATCH /dealer/employer-invitations/:id/status/:status | accept | reject
@Desc: Accept or reject dealer employer invitation by id
@Access: Private
*/
exports.acceptOrRejectEmployerInvitationById = async (req, res) => {
  try {
    const { id } = req.auth;
    const { status } = req.params;
    if (status !== "accept" && status !== "reject") {
      return res.apiError("Invalid status", 400);
    }
    const employerInvitation = await EmployeeAssignment.update(
      { status: status === "accept" ? "verified" : "rejected" },
      { where: { dealerId: id, id: req.params.id } },
    );

    await EmployeeEmployerStatus.create({
      employeeAssignmentId: req.params.id,
      status: status === "accept" ? "accepted" : "rejected",
      slug: status,
      actionUserBy: "dealer",
      actionUserId: id,
    });

    return res.apiSuccess(
      `Employer invitation ${status}ed successfully`,
      employerInvitation,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/employer-invitations/send
@Desc: Send new invitation to employee
@Access: Private
*/
exports.sendNewEmployerInvitation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.auth.id;
    const { employeeId } = req.body;

    const validator = new Validator(req.body, {
      employeeId: "required|integer",
    });
    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const existingEmployeeAssignment = await EmployeeAssignment.findOne({
      where: { dealerId: id, employeeId: employeeId },
      order: [["createdAt", "DESC"]],
    });

    if (
      existingEmployeeAssignment &&
      existingEmployeeAssignment.isCurrentlyWorking === true
    ) {
      await transaction.rollback();
      return res.apiError("Employee already working in this dealership.", 400);
    }

    if (
      existingEmployeeAssignment &&
      existingEmployeeAssignment.status === "pending"
    ) {
      await transaction.rollback();
      return res.apiError("Employee already invited to this dealership.", 400);
    }

    const employerInvitation = await EmployeeAssignment.create(
      {
        dealerId: id,
        employeeId: employeeId,
        status: "pending",
        invitationSendBy: "dealer",
        invitationSendById: id,
      },
      { transaction },
    );

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: employerInvitation.id,
        status: "send_invitation",
        slug: "send_invitation",
        actionUserBy: "dealer",
        actionUserId: id,
      },
      { transaction },
    );
    await transaction.commit();
    return res.apiSuccess(
      "Employer invitation sent successfully",
      employerInvitation,
    );
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /dealer/employer-invitations/:id/status/:status
@Desc: Update employer invitation status by id
@Access: Private
*/
exports.updateEmployerInvitationStatusById = async (req, res) => {
  try {
    const dealerId = req.auth.id;

    const { status, id } = req.params;

    if (!Object.values(EMPLOYER_JOINING_STATUS).includes(status)) {
      return res.apiError("Invalid status", 400);
    }

    const employerInvitation = await EmployeeAssignment.findOne({
      where: { dealerId, id },
      order: [["createdAt", "DESC"]],
    });
    if (!employerInvitation) {
      return res.apiError("Employer invitation not found", 404);
    }

    const employeeEmployerStatus = await EmployeeEmployerStatus.findOne({
      where: { employeeAssignmentId: employerInvitation.id, status: status },
      order: [["createdAt", "DESC"]],
    });

    if (employeeEmployerStatus) {
      return res.apiError("Employer invitation status already updated", 400);
    }

    await EmployeeEmployerStatus.create({
      employeeAssignmentId: req.params.id,
      status: status,
      slug: status,
      actionUserBy: "dealer",
      actionUserId: id,
    });
    return res.apiSuccess(
      "Employer invitation status updated successfully",
      employerInvitation,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /dealer/employer-invitations/steps
@Desc: Get employer invitation steps
@Access: Private
*/
exports.getEmployerInvitationSteps = async (req, res) => {
  try {
    const { id } = req.auth;
    const steps = newEmployerSteps();
    return res.apiSuccess(
      "Employer invitation steps fetched successfully",
      steps,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
