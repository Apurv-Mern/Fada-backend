function buildAdminScope(req, filters) {
  return {
    portal: "admin",
    dealerId: filters.dealerId || null,
    state: filters.state || null,
    city: filters.city || null,
  };
}

function buildDealerScope(req, filters) {
  const dealerId = req.currentDealerId;
  if (!dealerId) {
    throw new Error("Dealer context required");
  }

  return {
    portal: "dealer",
    dealerId,
    state: null,
    city: null,
  };
}

module.exports = { buildAdminScope, buildDealerScope };
