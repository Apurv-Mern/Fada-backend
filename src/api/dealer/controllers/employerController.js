const { sequelize, EmployeeAssignment, EmployeeEmployerStatus, Employee } = require("../../../database/models");
const Validator = require("validatorjs");

const EMPLOYER_STATUS = [
  {
    id: 1,
    status: "send_invitation",
    title: "Invitation Received",
    description: "You have an invitation from ",
  },
  {
    id: 2,
    status: "accept_invitation",
    title: "Accept Invitation",
    description: "Review and accept the invitation",
  },
  {
    id: 3,
    status: "share_details",
    title: "Share Details",
    description: "Share required documents and Information with hr over email and confirm same here",
  },
  {
    id: 4,
    status: "employer_verification",
    title: "Employer Verification",
    description: "Employer verifies your details",
  },
  {
    id: 5,
    status: "joining_confirmed",
    title: "Joining Confirmed",
    description: "Your new association is activated",
  }
]



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
