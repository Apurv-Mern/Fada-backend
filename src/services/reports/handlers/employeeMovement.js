const {
  getScopedDealerIds,
  buildAssignmentWhere,
  buildEmployeeSearchWhere,
  filterRowsBySearch,
  EmployeeAssignment,
  Employee,
  EmployeeLeaveEmployeement,
  EmployeeEmployerStatus,
  OrganizationStructure,
  Op,
} = require("../queryHelpers");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  const events = [];

  const employeeSearchWhere = buildEmployeeSearchWhere(filters.search);
  const employeeInclude = {
    model: Employee,
    as: "employee",
    attributes: ["id", "name", "fadaId"],
    ...(employeeSearchWhere ? { where: employeeSearchWhere, required: true } : {}),
  };

  const dateFilter = {};
  if (filters.fromDate) dateFilter[Op.gte] = filters.fromDate;
  if (filters.toDate) dateFilter[Op.lte] = `${filters.toDate} 23:59:59`;
  const hasDateFilter = filters.fromDate || filters.toDate;

  const assignmentWhere = {
    ...buildAssignmentWhere(scope, filters),
    ...(dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : {}),
  };

  if (!filters.eventType || filters.eventType === "new_joiner") {
    const newJoiners = await EmployeeAssignment.findAll({
      where: {
        ...assignmentWhere,
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      include: [
        employeeInclude,
        { model: OrganizationStructure, as: "department", attributes: ["name"], required: false },
        { model: OrganizationStructure, as: "designation", attributes: ["name"], required: false },
      ],
    });
    for (const a of newJoiners) {
      events.push({
        eventType: "new_joiner",
        employeeId: a.employeeId,
        employeeName: a.employee?.name,
        fadaId: a.employee?.fadaId,
        effectiveDate: a.startDate || a.createdAt,
        department: a.department?.name || null,
        designation: a.designation?.name || null,
        dealerId: a.dealerId,
      });
    }
  }

  if (!filters.eventType || filters.eventType === "exit") {
    const exits = await EmployeeLeaveEmployeement.findAll({
      where: {
        ...(dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : {}),
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      include: [
        employeeInclude,
        {
          model: EmployeeAssignment,
          as: "assignment",
          include: [
            { model: OrganizationStructure, as: "department", attributes: ["name"], required: false },
            { model: OrganizationStructure, as: "designation", attributes: ["name"], required: false },
          ],
        },
      ],
    });
    for (const exit of exits) {
      events.push({
        eventType: "exit",
        employeeId: exit.employeeId,
        employeeName: exit.employee?.name,
        fadaId: exit.employee?.fadaId,
        effectiveDate: exit.lastWorkingDate || exit.createdAt,
        department: exit.assignment?.department?.name || null,
        designation: exit.assignment?.designation?.name || null,
        dealerId: exit.dealerId,
        status: exit.status,
      });
    }
  }

  if (!filters.eventType || filters.eventType === "status_change") {
    const statusChanges = await EmployeeEmployerStatus.findAll({
      where: {
        slug: "joining",
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      include: [
        {
          model: EmployeeAssignment,
          as: "assignment",
          required: true,
          where: dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : undefined,
          include: [
            employeeInclude,
            { model: OrganizationStructure, as: "department", attributes: ["name"], required: false },
            { model: OrganizationStructure, as: "designation", attributes: ["name"], required: false },
          ],
        },
      ],
      limit: 500,
    });
    for (const status of statusChanges) {
      events.push({
        eventType: "status_change",
        employeeId: status.assignment?.employeeId,
        employeeName: status.assignment?.employee?.name,
        fadaId: status.assignment?.employee?.fadaId,
        effectiveDate: status.createdAt,
        department: status.assignment?.department?.name || null,
        designation: status.assignment?.designation?.name || null,
        dealerId: status.assignment?.dealerId,
        statusDetail: status.status,
      });
    }
  }

  events.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
  const filteredEvents = filterRowsBySearch(events, filters.search);

  const summary = {
    totalEvents: filteredEvents.length,
    newJoiners: filteredEvents.filter((e) => e.eventType === "new_joiner").length,
    exits: filteredEvents.filter((e) => e.eventType === "exit").length,
    statusChanges: filteredEvents.filter((e) => e.eventType === "status_change").length,
  };

  const total = filteredEvents.length;
  const rows = filteredEvents.slice(filters.offset, filters.offset + filters.limit);

  return {
    summary,
    rows,
    pagination: { total, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
