const {
  getScopedDealerIds,
  getDealerEmployeeCounts,
  Dealer,
  DealerLocation,
  DealerProfile,
  Op,
  getDealerBrands,
} = require("../queryHelpers");
const { getDealerPublicCode } = require("../computedFields");
const employeeMaster = require("./employeeMaster");

async function run({ scope, filters }) {
  if (filters.dealerId && filters.drillDown) {
    return employeeMaster.run({ scope: { ...scope, dealerId: filters.dealerId }, filters });
  }

  const dealerIds = await getScopedDealerIds(scope, filters);
  if (dealerIds.length === 0) {
    return {
      summary: { totalDealers: 0 },
      rows: [],
      pagination: { total: 0, limit: filters.limit, offset: filters.offset },
    };
  }

  const counts = await getDealerEmployeeCounts(dealerIds);
  
  const dealers = await Dealer.findAll({
    where: { id: { [Op.in]: dealerIds } },
    include: [
      { model: DealerLocation, as: "location", required: false },
      { model: DealerProfile, as: "profile", required: false },
    ],
    order: [["createdAt", "DESC"]],
  });

  const allRows = await Promise.all(
    dealers.map(async (dealer) => {
      const c = counts[dealer.id] || {
        totalEmployees: 0,
        fadaIdsCreated: 0,
        verifiedEmployees: 0,
        activeEmployees: 0,
        lastActivityAt: null,
      };
      const brands = Array.isArray(dealer.brands) ? dealer.brands : [];
      const dealerBrands =
        brands.length > 0 ? await getDealerBrands(brands) : "";
      return {
        dealerId: dealer.id,
        dealerCode: getDealerPublicCode(dealer),
        dealerName: dealer.name,
        dealerType: dealer.profile?.typeOfDealership || null,
        oemBrand: dealerBrands,
        state: dealer.location?.state || null,
        city: dealer.location?.city || null,
        address: dealer.location?.address || null,
        registrationDate: dealer.createdAt,
        dealerStatus: dealer.status,
        isActive: dealer.isActive,
        totalEmployees: c.totalEmployees,
        fadaIdsCreated: c.fadaIdsCreated,
        verifiedEmployees: c.verifiedEmployees,
        activeEmployees: c.activeEmployees,
        lastActivityAt: c.lastActivityAt || dealer.updatedAt,
      };
    }),
  );

  const total = allRows.length;
  const rows = allRows.slice(filters.offset, filters.offset + filters.limit);

  return {
    summary: {
      totalDealers: total,
      activeDealers: allRows.filter((r) => r.isActive).length,
      totalEmployees: allRows.reduce((s, r) => s + r.totalEmployees, 0),
      totalFadaIds: allRows.reduce((s, r) => s + r.fadaIdsCreated, 0),
    },
    rows,
    pagination: { total, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
