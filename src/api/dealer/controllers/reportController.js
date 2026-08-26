const {
  getReport,
  exportReportHandler,
  getFilters,
} = require("../../../services/reports/reportControllerHelpers");

exports.getReportFilters = (req, res) => getFilters(req, res, "dealer");
exports.getReport = (req, res) => getReport(req, res, "dealer");
exports.exportReport = (req, res) => exportReportHandler(req, res, "dealer");
