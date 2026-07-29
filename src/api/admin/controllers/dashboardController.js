const {
    sequelize,
    Dealer,
    Outlet,
    Employee,
  } = require("../../../database/models");
const dayjs = require("dayjs");
const { Op } = require("sequelize");

/*
@API: GET /admin/dashboard/stats
@Desc: Get dashboard stats
@Access: Private     
*/

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      outletCount,
      outletActiveCount,
      outletInactiveCount,
      employeeCount,
      employeeActiveCount,
      employeeInactiveCount,
      employeePendingCount,
      dealerCount,
      dealerActiveCount,
      dealerInactiveCount,
      dealerPendingCount,
      recentDealers,
    ] = await Promise.all([
      Outlet.count(),
      Outlet.count({ where: { isActive: true } }),
      Outlet.count({ where: { isActive: false } }),
      Employee.count(),
      Employee.count({ where: { isActive: true } }),
      Employee.count({ where: { isActive: false } }),
      Employee.count({ where: { status: "pending" } }),
      Dealer.count(),
      Dealer.count({ where: { isActive: true } }),
      Dealer.count({ where: { isActive: false } }),
      Dealer.count({ where: { status: "pending" } }),
      Dealer.findAll({
        attributes: ["id", "name", "dealerCode","status", "isActive"],
        where: {
          createdAt: {
            [Op.gte]: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
          },
        },
        limit: 5,
      }),
    ]);

    const dashboardStats = {
      dealer: {
        total: dealerCount,
        active: dealerActiveCount,
        inactive: dealerInactiveCount,
        pending: dealerPendingCount,
      },
      outlet: {
        total: outletCount,
        active: outletActiveCount,
        inactive: outletInactiveCount,
      },
      employee: {
        total: employeeCount,
        active: employeeActiveCount,
        inactive: employeeInactiveCount,
        pending: employeePendingCount,
      },

      recentDealers: recentDealers,
    };
    return res.apiSuccess(
      "Dashboard stats fetched successfully",
      dashboardStats,
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
