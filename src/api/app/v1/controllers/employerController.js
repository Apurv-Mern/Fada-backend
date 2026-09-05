const { Op } = require("sequelize");
const {
  sequelize,
  EmployeeAssignment,
  EmployeeEmployerStatus,
  Dealer,
  Outlet,
  EmployeeLeaveEmployeement,
  Employee,
  OrganizationStructure
} = require("../../../../database/models");
const Validator = require("validatorjs");
const {
  safeNotify,
  notifyDealer,
  notifyEmployee,
  NOTIFICATION_TYPES,
} = require("../../../../services/notificationService");

const EMPLOYER_JOINING_STATUS = {
  SEND_INVITATION: "send_invitation",
  ACCEPT_INVITATION: "accept_invitation",
  REJECT_INVITATION: "reject_invitation",
  SHARE_DETAILS: "share_details",
  EMPLOYER_VERIFICATION: "employer_verification",
  JOINING_CONFIRMED: "joining_confirmed",
};

const EMPLOYER_EXIT_STATUS = {
  INFORM_EMPLOYER: "inform_employer",
  SUBMIT_RESIGNATION: "submit_resignation",
  REJECT_RESIGNATION: "reject_resignation",
  HANDOVER_COMPLETED: "handover_completed",
  CLEARANCE_COMPLETED: "clearance_completed",
  EXIT_COMPLETED: "exit_completed",
};


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
        employeeId: req.auth.id,
      },
      order: [["createdAt", "DESC"]],
    });

    if (existingEmployeeAssignment && existingEmployeeAssignment?.isCurrentlyWorking) {
      await transaction.rollback();
      return res.apiError("Employee already working in this dealership.", 400);
    }

    if (existingEmployeeAssignment && existingEmployeeAssignment?.status === "pending") {
      await transaction.rollback();
      return res.apiError("Invitation has already been sent.", 400);
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
        status: EMPLOYER_JOINING_STATUS.SEND_INVITATION,
        slug: "joining",
        actionUserBy: "employee",
        actionUserId: req.auth.id,
      },
      { transaction },
    );

    if (!req.auth.isJourneyCompleted) {
      await Employee.update({ isJourneyCompleted: true }, { where: { id: req.auth.id }, transaction });
    }

    await transaction.commit();

    await safeNotify(() =>
      notifyDealer(dealerId, {
        title: "Employment request received",
        body: "An employee has requested to join your dealership.",
        type: NOTIFICATION_TYPES.INVITATION,
        sourceType: "EmployeeAssignment",
        sourceId: employeeAssignment.id,
        data: {
          screen: "employment-request",
          employeeAssignmentId: employeeAssignment.id,
        },
      }),
    );

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
    const employeeInvitations = await EmployeeAssignment.findOne({
      where: { employeeId: id, status: { [Op.in]: ["pending", "verified"] }, isCurrentlyWorking: false },
      order: [["createdAt", "ASC"]],
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
        {
          model: OrganizationStructure,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: OrganizationStructure,
          as: "designation",
          attributes: ["id", "name"],
        },
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          attributes: ["id", "status", "slug", "actionUserBy", "actionUserId"],
          where: { slug: "joining" },
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
      where: { employeeId: id, id: req.params.id },
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
        {
          model: OrganizationStructure,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: OrganizationStructure,
          as: "designation",
          attributes: ["id", "name"],
        },
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          attributes: ["id", "status", "slug", "actionUserBy", "actionUserId"],
          where: { slug: "joining" },
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
@API: PATCH /employee/employer-invitations/:id/mark-as-shared-details
@Desc: employee mark as shared details
@Access: Private
*/
exports.markAsSharedDetails = async (req, res) => {
  try {
    const { id } = req.auth;

    await EmployeeEmployerStatus.create({
      employeeAssignmentId: req.params.id,
      status: EMPLOYER_JOINING_STATUS.SHARE_DETAILS,
      slug: "joining",
      actionUserBy: "employee",
      actionUserId: id,
    });

    return res.apiSuccess(`Mark as shared details successfully`);
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
    const id = req.auth.id;

    const { status } = req.params;

    if (status !== "accept" && status !== "reject") {
      await transaction.rollback();
      return res.apiError("Invalid status", 400);
    }

    const assignment = await EmployeeAssignment.findOne({
      where: { employeeId: id, id: req.params.id },
      transaction,
    });

    const employeeInvitation = await EmployeeAssignment.update(
      { status: status === "accept" ? "verified" : "rejected" },
      { where: { employeeId: id, id: req.params.id }, transaction },
    );

    if (!req.auth.isJourneyCompleted) {
      await Employee.update({ isJourneyCompleted: true }, { where: { id }, transaction });
    }

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: req.params.id,
        status: status === "accept" ? EMPLOYER_JOINING_STATUS.ACCEPT_INVITATION : EMPLOYER_JOINING_STATUS.REJECT_INVITATION,
        slug: "joining",
        actionUserBy: "employee",
        actionUserId: id,
      },
      { transaction },
    );

    await transaction.commit();

    if (assignment?.dealerId) {
      await safeNotify(() =>
        notifyDealer(assignment.dealerId, {
          title: `Employment invitation ${status === "accept" ? "accepted" : "rejected"}`,
          body: `An employee has ${status === "accept" ? "accepted" : "rejected"} your employment invitation.`,
          type: NOTIFICATION_TYPES.EMPLOYMENT,
          sourceType: "EmployeeAssignment",
          sourceId: assignment.id,
          data: {
            screen: "employment-request",
            employeeAssignmentId: assignment.id,
            status,
          },
        }),
      );
    }

    return res.apiSuccess(
      `${status === "accept" ? "Accepted" : "Rejected"} employee invitation successfully`,
      employeeInvitation,
    );
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};


/*
@API: POST /employee/employer-leaving
@Desc: Submit employee employer leaving request
@Access: Private
*/
exports.submitEmployerLeavingRequest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.auth.id;
    const { reason } = req.body;

    const validator = new Validator(req.body, {
      reason: "required|string",
    });

    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }




    const employeeAssignment = await EmployeeAssignment.findOne({
      where: { employeeId: id, status: "completed", isCurrentlyWorking: true },
      order: [["createdAt", "DESC"]],
    });

    if (!employeeAssignment) {
      await transaction.rollback();
      return res.apiError("Employee is not currently working in any dealership", 422);
    }

    const checkPendingRequest = await EmployeeLeaveEmployeement.findOne({
      where: {
        dealerId: employeeAssignment.dealerId, employeeId: employeeAssignment.employeeId, status: { [Op.in]: ["pending", "accepted"] }
      }
    });

    if (checkPendingRequest && employeeAssignment) {
      await transaction.rollback();
      return res.apiError("Employer leaving request already sent.", 422);
    }

    const employeeLeavingRequest = await EmployeeLeaveEmployeement.create({
      employeeAssignmentId: employeeAssignment.id,
      dealerId: employeeAssignment.dealerId,
      outletId: employeeAssignment.outletId,
      employeeId: employeeAssignment.employeeId,
      reason: reason,
      status: "pending",
      initiatedBy: "employee",
      initiatedById: id,
    }, { transaction });

    await EmployeeEmployerStatus.create({
      employeeAssignmentId: employeeLeavingRequest.id,
      status: EMPLOYER_EXIT_STATUS.INFORM_EMPLOYER,
      slug: "leaving",
      actionUserBy: "employee",
      actionUserId: id,
    }, { transaction });

    await transaction.commit();

    await safeNotify(() =>
      notifyDealer(employeeAssignment.dealerId, {
        title: "Employee leaving request",
        body: "An employee has submitted a request to leave your dealership.",
        type: NOTIFICATION_TYPES.EMPLOYMENT,
        sourceType: "EmployeeLeaveEmployeement",
        sourceId: employeeLeavingRequest.id,
        data: {
          screen: "employment-leaving",
          leaveRequestId: employeeLeavingRequest.id,
        },
      }),
    );

    return res.apiSuccess("Employee leaving request submitted successfully", employeeLeavingRequest);
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};


/*
@API: GET /employee/employer-leaving
@Desc: Get employee employer leaving requests
@Access: Private
*/
exports.getEmployerLeavingRequests = async (req, res) => {
  try {
    const { id } = req.auth;
    const employeeLeavingRequests = await EmployeeLeaveEmployeement.findAll({
      where: { employeeId: id },
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
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          where: { slug: "leaving" },
        },
      ],
    });
    return res.apiSuccess("Employee leaving requests fetched successfully", employeeLeavingRequests);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};


/*
@API: GET /employee/employer-leaving/:id
@Desc: Get employee employer leaving request by id
@Access: Private
*/
exports.getEmployerLeavingRequestById = async (req, res) => {
  try {
    const id = req.auth.id;
    const employeeLeavingRequest = await EmployeeLeaveEmployeement.findOne({
      where: { employeeId: id, id: req.params.id },
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
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          attributes: ["id", "status", "slug", "actionUserBy", "actionUserId"],
          where: { slug: "leaving" },
          required: false,
        },
      ],
    });
    if (!employeeLeavingRequest) {
      return res.apiError("Employee leaving request not found", 404);
    }
    return res.apiSuccess("Employee leaving request fetched successfully", employeeLeavingRequest);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};


/*
@API: PATCH /employee/employer-leaving/:id/status/:status | reject | submit_resignation
@Desc: Reject leaving request or advance to submit_resignation
@Access: Private
*/
exports.updateEmployerLeavingRequestStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.auth;
    const { status } = req.params;

    if (status !== "reject" && status !== "submit_resignation") {
      await transaction.rollback();
      return res.apiError("Invalid status", 400);
    }

    const employeeLeavingRequest = await EmployeeLeaveEmployeement.findOne({
      where: { employeeId: id, id: req.params.id },
    });

    if (!employeeLeavingRequest) {
      await transaction.rollback();
      return res.apiError("Employee leaving request not found", 404);
    }

    if (status === "reject") {
      await employeeLeavingRequest.update({ status: "rejected" }, { transaction });
      await EmployeeEmployerStatus.create(
        {
          employeeAssignmentId: employeeLeavingRequest.id,
          status: EMPLOYER_EXIT_STATUS.REJECT_RESIGNATION,
          slug: "leaving",
          actionUserBy: "employee",
          actionUserId: id,
        },
        { transaction },
      );
      await transaction.commit();
      return res.apiSuccess(
        "Rejected employee leaving request successfully",
        employeeLeavingRequest,
      );
    }

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: employeeLeavingRequest.id,
        status: EMPLOYER_EXIT_STATUS.SUBMIT_RESIGNATION,
        slug: "leaving",
        actionUserBy: "employee",
        actionUserId: id,
      },
      { transaction },
    );

    await transaction.commit();
    return res.apiSuccess("Resignation request submitted successfully");
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};
