const {
  sequelize,
  EmployeeAssignment,
  EmployeeEmployerStatus,
  Employee,
  EmployeeLeaveEmployeement,
  Dealer,
  Outlet,
  OrganizationStructure
} = require("../../../database/models");
const Validator = require("validatorjs");

const {
  newEmployerSteps,
  employerLeavingSteps,
} = require("../../../services/employeeService");

const EMPLOYER_JOINING_STATUS = {
  SEND_INVITATION: "send_invitation",
  ACCEPT_INVITATION: "accept_invitation",
  REJECT_INVITATION: "reject_invitation",
  SHARE_DETAILS: "share_details",
  EMPLOYER_VERIFICATION: "employer_verification",
  JOINING_CONFIRMED: "joining_confirmed",
  TRANSFER: "transfered",
};

const EMPLOYER_EXIT_STATUS = {
  INFORM_EMPLOYER: "inform_employer",
  SUBMIT_RESIGNATION: "submit_resignation",
  ACCEPT_RESIGNATION: "accept_resignation",
  REJECT_RESIGNATION: "reject_resignation",
  HANDOVER_COMPLETED: "handover_completed",
  CLEARANCE_COMPLETED: "clearance_completed",
  EXIT_COMPLETED: "exit_completed",
};

const DEALER_EXIT_WORKFLOW_STATUSES = [
  EMPLOYER_EXIT_STATUS.HANDOVER_COMPLETED,
  EMPLOYER_EXIT_STATUS.CLEARANCE_COMPLETED,
  EMPLOYER_EXIT_STATUS.EXIT_COMPLETED,
  EMPLOYER_EXIT_STATUS.SUBMIT_RESIGNATION,
];

const leaveStatusIncludes = [
  {
    model: Employee,
    as: "employee",
    attributes: ["id", "name", "email", "phone"],
  },
  {
    model: Dealer,
    as: "dealership",
    attributes: ["id", "name", "dealerCode"],
  },
  {
    model: Outlet,
    as: "branch",
    attributes: ["id", "name"],
  },
  {
    model: EmployeeEmployerStatus,
    as: "statuses",
    attributes: [
      "id",
      "status",
      "slug",
      "actionUserBy",
      "actionUserId",
      "createdAt",
    ],
    required: false,
  },
];

/*
@API: GET /dealer/employer-invitations
@Desc: Get dealer employer invitations
@Access: Private
*/
exports.getEmployerInvitations = async (req, res) => {
  try {
    const id = req.currentDealerId;

    const employerInvitations = await EmployeeAssignment.findAll({
      where: { dealerId: id, },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "fadaId", "name", "email", "phone"],
        },
        {
          model: Dealer,
          as: "dealership",
          attributes: ["id", "name", "dealerCode"],
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
          required: false,
        },
        {
          model: OrganizationStructure,
          as: "designation",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          where: { slug: "joining" },
          required: false,
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
    const id = req.currentDealerId;
    const employerInvitation = await EmployeeAssignment.findOne({
      where: { dealerId: id, id: req.params.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "fadaId", "email", "phone"],
        },
        {
          model: Dealer,
          as: "dealership",
          attributes: ["id", "name", "dealerCode"],
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
          where: { slug: "joining" },
          required: false,
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
  const transaction = await sequelize.transaction();

  try {
    const dealerId = req.currentDealerId;
    const { status, id } = req.params;

    if (!["accept", "reject"].includes(status)) {
      await transaction.rollback();

      return res.apiError("Invalid status", 400);
    }

    // Find invitation first
    const employerInvitation = await EmployeeAssignment.findOne({
      where: {
        dealerId,
        id,
      },
      transaction,
    });

    if (!employerInvitation) {
      await transaction.rollback();

      return res.apiError("Employer invitation not found", 404);
    }

    // Update invitation status
    await employerInvitation.update(
      {
        status: status === "accept" ? "verified" : "rejected",
      },
      {
        transaction,
      },
    );

    // Create status history
    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: employerInvitation.id,
        status:
          status === "accept"
            ? EMPLOYER_JOINING_STATUS.ACCEPT_INVITATION
            : EMPLOYER_JOINING_STATUS.REJECT_INVITATION,
        slug: "joining",
        actionUserBy: "dealer",
        actionUserId: dealerId,
      },
      {
        transaction,
      },
    );

    // Update employee journey status
    await Employee.update(
      {
        isJourneyCompleted: true,
      },
      {
        where: {
          id: employerInvitation.employeeId,
        },
        transaction,
      },
    );

    await transaction.commit();

    return res.apiSuccess(
      `Employer invitation ${status}ed successfully`,
      employerInvitation,
    );
  } catch (error) {
    await transaction.rollback();

    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/employer-invitations/send
@Desc: Send new invitation to employee
@Body: { employeeId: number, outletId: number, departmentId: number, designationId: number }
@Access: Private
*/
exports.sendNewEmployerInvitation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.currentDealerId;
    const { employeeId, outletId, departmentId, designationId } = req.body;

    const validator = new Validator(req.body, {
      employeeId: "required|integer",
      outletId: "required|integer",
      departmentId: "required|integer",
      designationId: "required|integer",
    });
    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const checkPendingRequest = await EmployeeAssignment.findOne({
      where: { employeeId: employeeId, dealerId: id, status: "pending" }
    });

    if (checkPendingRequest) {
      await transaction.rollback();
      return res.apiError("Invitation has already been sent.", 400);
    }

    const existingEmployeeAssignment = await EmployeeAssignment.findOne({
      where: { isCurrentlyWorking: true, employeeId: employeeId },
      order: [["createdAt", "DESC"]],
    });

    if (existingEmployeeAssignment && existingEmployeeAssignment.isCurrentlyWorking === true) {
      await transaction.rollback();
      return res.apiError("Employee already working in any other company.", 400);
    }



    const employerInvitation = await EmployeeAssignment.create(
      {
        dealerId: id,
        employeeId: employeeId,
        outletId: outletId,
        departmentId: departmentId,
        designationId: designationId,
        status: "pending",
        invitationSendBy: "dealer",
        invitationSendById: id,
        highlights: `Invited to ${outletId}`,
        employeementType: "full-time",
        isCurrentlyWorking: false,
        startDate: new Date(),
      },
      { transaction },
    );

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: employerInvitation.id,
        status: EMPLOYER_JOINING_STATUS.SEND_INVITATION,
        slug: "joining",
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
@Body: { joiningDate: date }
@Access: Private
*/
exports.updateEmployerInvitationStatusById = async (req, res) => {
  try {
    const dealerId = req.currentDealerId;

    const { status, id } = req.params;

    const validator = new Validator(req.body, {
      joiningDate: "date",
    });
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const joiningDate = (req?.body && req?.body?.joiningDate) ? req?.body?.joiningDate : null;

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

    if (joiningDate) {
      await Employee.update({
        joinedDate: joiningDate,
      }, { where: { id: employerInvitation.employeeId } });

      await employerInvitation.update({
        startDate: joiningDate,
        isCurrentlyWorking: true,
        status: "completed"
      });
    }

    await EmployeeEmployerStatus.create({
      employeeAssignmentId: req.params.id,
      status: status,
      slug: "joining",
      actionUserBy: "dealer",
      actionUserId: dealerId,
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
    const steps = newEmployerSteps();
    return res.apiSuccess(
      "Employer invitation steps fetched successfully",
      steps,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /dealers/employer-leaving
@Desc: Get dealer employer leaving requests
@Access: Private
*/
exports.getEmployerLeavingRequests = async (req, res) => {
  try {
    const dealerId = req.currentDealerId;
    const employerLeavingRequests = await EmployeeLeaveEmployeement.findAll({
      where: { dealerId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "fadaId", "name", "email", "phone"],
        },
        {
          model: Dealer,
          as: "dealership",
          attributes: ["id", "name", "dealerCode"],
        },
        {
          model: Outlet,
          as: "branch",
          attributes: ["id", "name"],
        },
        {
          model: EmployeeAssignment,
          as: "assignment",
          include: [
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
          ],
        },
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          where: { slug: "leaving" },
        },
      ],
    });
    return res.apiSuccess(
      "Employer leaving requests fetched successfully",
      employerLeavingRequests,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /dealers/employer-leaving/steps
@Desc: Get employer leaving workflow steps
@Access: Private
*/
exports.getEmployerLeavingSteps = async (req, res) => {
  try {
    const steps = employerLeavingSteps();
    return res.apiSuccess("Employer leaving steps fetched successfully", steps);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /dealers/employer-leaving/:id
@Desc: Get dealer employer leaving request by id
@Access: Private
*/
exports.getEmployerLeavingRequestById = async (req, res) => {
  try {
    const dealerId = req.currentDealerId;
    const employerLeavingRequest = await EmployeeLeaveEmployeement.findOne({
      where: { dealerId, id: req.params.id },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "fadaId", "name", "email", "phone"],
        },
        {
          model: Dealer,
          as: "dealership",
          attributes: ["id", "name", "dealerCode"],
        },
        {
          model: Outlet,
          as: "branch",
          attributes: ["id", "name"],
        },
        {
          model: EmployeeAssignment,
          as: "assignment",
          include: [
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
          ],
        },
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          where: { slug: "leaving" },
        },
      ],
    });
    if (!employerLeavingRequest) {
      return res.apiError("Employer leaving request not found", 404);
    }
    return res.apiSuccess(
      "Employer leaving request fetched successfully",
      employerLeavingRequest,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PATCH /dealers/employer-leaving/:id/status/:status | accept | reject
@Desc: Accept or reject employer leaving / resignation request
@Access: Private
*/
exports.acceptOrRejectEmployerLeavingRequestById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const dealerId = req.currentDealerId;
    const { status } = req.params;

    if (status !== "accept" && status !== "reject") {
      await transaction.rollback();
      return res.apiError("Invalid status", 400);
    }

    const leaveRequest = await EmployeeLeaveEmployeement.findOne({
      where: { dealerId, id: req.params.id },
      transaction,
    });
    if (!leaveRequest) {
      await transaction.rollback();
      return res.apiError("Employer leaving request not found", 404);
    }

    if (leaveRequest.status !== "pending") {
      await transaction.rollback();
      return res.apiError("Leaving request is already processed", 400);
    }

    const workflowStatus =
      status === "accept"
        ? EMPLOYER_EXIT_STATUS.ACCEPT_RESIGNATION
        : EMPLOYER_EXIT_STATUS.REJECT_RESIGNATION;

    const existingStatus = await EmployeeEmployerStatus.findOne({
      where: {
        employeeAssignmentId: leaveRequest.id,
        status: workflowStatus,
        slug: "leaving",
      },
      transaction,
    });
    if (existingStatus) {
      await transaction.rollback();
      return res.apiError("Leave request status already updated", 400);
    }

    await leaveRequest.update(
      { status: status === "accept" ? "accepted" : "rejected" },
      { transaction },
    );

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: leaveRequest.id,
        status: workflowStatus,
        slug: "leaving",
        actionUserBy: "dealer",
        actionUserId: dealerId,
      },
      { transaction },
    );

    await transaction.commit();
    return res.apiSuccess(
      `Employer leaving request ${status}ed successfully`,
      leaveRequest,
    );
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /dealers/employer-leaving/:id/status/:status
@Desc: Advance employer leaving workflow status
@Access: Private
*/
exports.updateEmployerLeavingRequestStatusById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const dealerId = req.currentDealerId;
    const { status, id } = req.params;

    if (!DEALER_EXIT_WORKFLOW_STATUSES.includes(status)) {
      await transaction.rollback();
      return res.apiError("Invalid status", 400);
    }

    const leaveRequest = await EmployeeLeaveEmployeement.findOne({
      where: { dealerId, id },
      transaction,
    });
    if (!leaveRequest) {
      await transaction.rollback();
      return res.apiError("Employer leaving request not found", 404);
    }

    if (leaveRequest.status === "rejected") {
      await transaction.rollback();
      return res.apiError("Cannot update a rejected leaving request", 400);
    }

    if (leaveRequest.status === "completed") {
      await transaction.rollback();
      return res.apiError("Leaving request is already completed", 400);
    }

    if (leaveRequest.status !== "accepted") {
      await transaction.rollback();
      return res.apiError(
        "Resignation must be accepted before advancing exit workflow",
        400,
      );
    }

    const existingStatus = await EmployeeEmployerStatus.findOne({
      where: {
        employeeAssignmentId: leaveRequest.id,
        status,
        slug: "leaving",
      },
      transaction,
    });
    if (existingStatus) {
      await transaction.rollback();
      return res.apiError("Leave request status already updated", 400);
    }

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: leaveRequest.id,
        status,
        slug: "leaving",
        actionUserBy: "dealer",
        actionUserId: dealerId,
      },
      { transaction },
    );

    if (status === EMPLOYER_EXIT_STATUS.EXIT_COMPLETED) {
      await leaveRequest.update({ status: "completed" }, { transaction });

      await EmployeeAssignment.update(
        {
          isCurrentlyWorking: false,
          isActive: false,
          endDate: leaveRequest.lastWorkingDate || new Date(),
          status: "completed",
        },
        {
          where: { id: leaveRequest.employeeAssignmentId, dealerId },
          transaction,
        },
      );
    }

    await transaction.commit();
    return res.apiSuccess(
      "Employer leaving request status updated successfully",
      leaveRequest,
    );
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealers/employeement-transfer
@Desc: employee transfer in other outlet
@Body: { employeeId: number, outletId: number, designationId: number }
@Example: {
  "employeeId": 1,
  "outletId": 1,
  "departmentId": 1,
  "designationId": 1
}
@Access: Private
*/
exports.sendEmployeementTransferRequest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const dealerId = req.currentDealerId;
    const { employeeId, outletId, departmentId, designationId } = req.body;

    const validator = new Validator(req.body, {
      employeeId: "required|integer",
      outletId: "required|integer",
      departmentId: "required|integer",
      designationId: "required|integer",
    });

    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const existingEmployeeAssignment = await EmployeeAssignment.findOne({
      where: { dealerId, employeeId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Outlet,
          as: "branch",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!existingEmployeeAssignment) {
      await transaction.rollback();
      return res.apiError("Employee not found", 404);
    }

    const newOutlet = await Outlet.findOne({
      where: { dealerId, id: outletId },
      transaction,
    });
    if (!newOutlet) {
      await transaction.rollback();
      return res.apiError("Outlet not found", 404);
    }

    await EmployeeAssignment.update(
      { isCurrentlyWorking: false, isActive: false, endDate: new Date(), },
      { where: { dealerId, employeeId }, transaction },
    );


    const employeementTransferRequest = await EmployeeAssignment.create(
      {
        dealerId: dealerId,
        employeeId: employeeId,
        outletId: outletId,
        departmentId: departmentId,
        designationId: designationId,
        status: "completed",
        employeementType: "full-time",
        isCurrentlyWorking: true,
        startDate: new Date(),
        invitationSendBy: "dealer",
        invitationSendById: dealerId,
        highlights: `Transferred from ${existingEmployeeAssignment.branch.name} to ${newOutlet.name}`,
      },
      { transaction },
    );

    await EmployeeEmployerStatus.create(
      {
        employeeAssignmentId: employeementTransferRequest.id,
        status: EMPLOYER_JOINING_STATUS.TRANSFER,
        slug: "joining",
        actionUserBy: "dealer",
        actionUserId: dealerId,
      },
      { transaction },
    );

    await transaction.commit();
    return res.apiSuccess(
      "Employeement transfer request sent successfully",
      employeementTransferRequest,
    );
  } catch (error) {
    await transaction.rollback();
    return res.apiError("Internal server error", 500, error);
  }
};
