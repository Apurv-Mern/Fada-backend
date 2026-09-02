const {
  getScopedDealerIds,
  getDealerDocStats,
  getDealerEmployeeCounts,
  Dealer,
  DealerLocation,
  DealerProfile,
  Op,
} = require("../queryHelpers");
const { getDealerOnboardingStage, getDealerPublicCode } = require("../computedFields");
const { DEALER_ONBOARDING_STAGES } = require("../reportConstants");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  if (dealerIds.length === 0) {
    return {
      summary: { stages: DEALER_ONBOARDING_STAGES.map((s) => ({ stage: s, count: 0 })) },
      rows: [],
      pagination: { total: 0, limit: filters.limit, offset: filters.offset },
    };
  }

  const docStatsMap = await getDealerDocStats(dealerIds);
  const countsMap = await getDealerEmployeeCounts(dealerIds);

  const dealers = await Dealer.findAll({
    where: { id: { [Op.in]: dealerIds } },
    include: [
      { model: DealerLocation, as: "location", required: false },
      { model: DealerProfile, as: "profile", required: false },
    ],
  });

  const allRows = dealers.map((dealer) => {
    const docStats = docStatsMap[dealer.id] || {};
    const empCounts = countsMap[dealer.id] || { totalEmployees: 0 };
    const stage = getDealerOnboardingStage(
      dealer,
      dealer.profile,
      docStats,
      empCounts.totalEmployees,
    );
    return {
      dealerId: dealer.id,
      dealerCode: getDealerPublicCode(dealer),
      dealerName: dealer.name,
      state: dealer.location?.state || null,
      city: dealer.location?.city || null,
      currentStage: stage,
      dealerStatus: dealer.status,
      isActive: dealer.isActive,
      registrationDate: dealer.createdAt,
    };
  });

  let filtered = allRows;
  if (filters.stage) {
    filtered = filtered.filter((r) => r.currentStage === filters.stage);
  }

  const summary = {
    stages: DEALER_ONBOARDING_STAGES.map((stage) => ({
      stage,
      count: filtered.filter((r) => r.currentStage === stage).length,
    })),
    totalDealers: filtered.length,
  };

  const total = filtered.length;
  const rows = filtered.slice(filters.offset, filters.offset + filters.limit);

  return {
    summary,
    rows,
    pagination: { total, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
