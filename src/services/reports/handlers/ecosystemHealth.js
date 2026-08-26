const {
  getScopedDealerIds,
  getDealerEmployeeCounts,
  Dealer,
  Employee,
  EmployeeAssignment,
  Op,
} = require("../queryHelpers");
const { getAdoptionPercentage } = require("../computedFields");
const { LOW_ADOPTION_THRESHOLD } = require("../reportConstants");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  const counts = await getDealerEmployeeCounts(dealerIds);

  const dealers = dealerIds.length
    ? await Dealer.findAll({ where: { id: { [Op.in]: dealerIds } } })
    : await Dealer.findAll();

  let lowAdoptionDealers = 0;
  let dealersWithNoEmployees = 0;
  let pendingActivation = 0;

  for (const dealer of dealers) {
    const c = counts[dealer.id] || { totalEmployees: 0, fadaIdsCreated: 0 };
    if (c.totalEmployees === 0) dealersWithNoEmployees += 1;
    if (!dealer.isActive && dealer.status !== "rejected") pendingActivation += 1;
    const adoption = getAdoptionPercentage(c.fadaIdsCreated, c.totalEmployees);
    if (c.totalEmployees > 0 && adoption < LOW_ADOPTION_THRESHOLD) lowAdoptionDealers += 1;
  }

  const assignmentWhere = dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : {};
  const assignments = await EmployeeAssignment.findAll({
    where: assignmentWhere,
    include: [{ model: Employee, as: "employee", required: true }],
  });

  const employees = assignments.map((a) => a.employee);
  const totalEmployees = employees.length;
  const fadaIdsCreated = employees.filter((e) => e.fadaId).length;
  const verified = employees.filter((e) => e.isVerified).length;
  const active = employees.filter((e) => e.isActive && e.isVerified).length;
  const pending = employees.filter((e) => e.status === "pending").length;
  const incomplete = employees.filter(
    (e) => !e.isProfileCompleted || !e.isKycCompleted || !e.isJourneyCompleted,
  ).length;

  const activeDealers = dealers.filter((d) => d.isActive).length;
  const inactiveDealers = dealers.filter((d) => !d.isActive).length;

  return {
    summary: {
      dealerHealth: {
        totalDealers: dealers.length,
        activeDealers,
        inactiveDealers,
        dealersWithNoEmployees,
        lowAdoptionDealers,
        pendingActivation,
      },
      workforceHealth: {
        totalEmployees,
        fadaIdsCreated,
        verified,
        active,
        pending,
        incomplete,
      },
      ratios: {
        dealerActivationPercentage: getAdoptionPercentage(activeDealers, dealers.length),
        fadaIdCoveragePercentage: getAdoptionPercentage(fadaIdsCreated, totalEmployees),
        verificationPercentage: getAdoptionPercentage(verified, totalEmployees),
        activeFadaIdPercentage: getAdoptionPercentage(active, fadaIdsCreated),
      },
    },
    rows: [],
    pagination: { total: 0, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
