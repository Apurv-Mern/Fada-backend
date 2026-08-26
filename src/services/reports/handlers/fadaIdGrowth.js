const dayjs = require("dayjs");
const { Op } = require("sequelize");
const {
  getScopedDealerIds,
  Employee,
  EmployeeAssignment,
  Dealer,
  DealerLocation,
  OrganizationStructure,
} = require("../queryHelpers");
const { getAdoptionPercentage } = require("../computedFields");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  const employeeWhere = {};
  if (filters.fromDate || filters.toDate) {
    employeeWhere.createdAt = {};
    if (filters.fromDate) employeeWhere.createdAt[Op.gte] = filters.fromDate;
    if (filters.toDate) employeeWhere.createdAt[Op.lte] = `${filters.toDate} 23:59:59`;
  }

  const assignmentInclude = dealerIds.length
    ? {
        model: EmployeeAssignment,
        as: "assignment",
        required: true,
        where: { dealerId: { [Op.in]: dealerIds } },
        include: [
          { model: OrganizationStructure, as: "department", attributes: ["id", "name"], required: false },
          { model: OrganizationStructure, as: "designation", attributes: ["id", "name"], required: false },
          {
            model: Dealer,
            as: "dealership",
            attributes: ["id", "name", "dealerCode"],
            required: false,
            include: [{ model: DealerLocation, as: "location", attributes: ["state", "city"], required: false }],
          },
        ],
      }
    : {
        model: EmployeeAssignment,
        as: "assignment",
        required: false,
        include: [
          { model: OrganizationStructure, as: "department", attributes: ["id", "name"], required: false },
          {
            model: Dealer,
            as: "dealership",
            attributes: ["id", "name"],
            include: [{ model: DealerLocation, as: "location", attributes: ["state", "city"], required: false }],
          },
        ],
      };

  const employees = await Employee.findAll({
    where: employeeWhere,
    include: [assignmentInclude],
  });

  const totalEmployees = employees.length;
  const fadaIdsCreated = employees.filter((e) => e.fadaId).length;
  const verifiedFadaIds = employees.filter((e) => e.isVerified && e.fadaId).length;
  const activeFadaIds = employees.filter((e) => e.isActive && e.isVerified && e.fadaId).length;

  const granularity = filters.granularity || "monthly";
  const trendMap = {};
  for (const employee of employees) {
    if (!employee.fadaId) continue;
    const key =
      granularity === "daily"
        ? dayjs(employee.createdAt).format("YYYY-MM-DD")
        : granularity === "weekly"
          ? dayjs(employee.createdAt).startOf("week").format("YYYY-MM-DD")
          : dayjs(employee.createdAt).format("YYYY-MM");
    trendMap[key] = (trendMap[key] || 0) + 1;
  }

  const trend = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({ period, count }));

  const prevPeriodStart = filters.fromDate
    ? dayjs(filters.fromDate).subtract(dayjs(filters.toDate || undefined).diff(dayjs(filters.fromDate), "day") + 1, "day")
    : dayjs().subtract(2, "month");
  const prevCount = employees.filter((e) =>
    e.fadaId && dayjs(e.createdAt).isBefore(dayjs(filters.fromDate || dayjs().subtract(1, "month"))),
  ).length;
  const growthPercentage =
    prevCount > 0
      ? Math.round(((fadaIdsCreated - prevCount) / prevCount) * 10000) / 100
      : fadaIdsCreated > 0
        ? 100
        : 0;

  const byState = {};
  const byCity = {};
  const byDealer = {};
  for (const employee of employees) {
    const loc = employee.assignment?.dealership?.location;
    if (loc?.state) byState[loc.state] = (byState[loc.state] || 0) + 1;
    if (loc?.city) byCity[loc.city] = (byCity[loc.city] || 0) + 1;
    const dealerName = employee.assignment?.dealership?.name;
    if (dealerName) byDealer[dealerName] = (byDealer[dealerName] || 0) + 1;
  }

  const dealerCount = dealerIds.length || (await Dealer.count());

  return {
    summary: {
      totalDealers: dealerCount,
      totalEmployees,
      totalFadaIds: fadaIdsCreated,
      newRegistrations: employees.filter((e) => e.isRegistrationCompleted).length,
      verifiedFadaIds,
      activeFadaIds,
      adoptionPercentage: getAdoptionPercentage(fadaIdsCreated, totalEmployees),
      growthPercentage,
    },
    rows: trend,
    breakdowns: {
      byState: Object.entries(byState).map(([state, count]) => ({ state, count })),
      byCity: Object.entries(byCity).map(([city, count]) => ({ city, count })),
      byDealer: Object.entries(byDealer).map(([dealer, count]) => ({ dealer, count })),
    },
    pagination: { total: trend.length, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
