const { parseReportFilters } = require("./reportFilterParser");
const { buildAdminScope, buildDealerScope } = require("./reportScope");
const { runReport, runReportForExport } = require("./reportRegistry");
const { getFilterOptions } = require("./filtersService");
const { exportReport } = require("./exportService");

async function getReport(req, res, portal) {
  try {
    const { reportKey } = req.params;
    const filters = parseReportFilters(req.query);
    const scope =
      portal === "admin" ? buildAdminScope(req, filters) : buildDealerScope(req, filters);

    const data = await runReport({
      reportKey,
      scope,
      filters,
      generatedBy: req.auth,
      portal,
    });

    return res.apiSuccess("Report generated successfully", data);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.apiError(error.message, 404);
    }
    return res.apiError("Internal server error", 500, error);
  }
}

async function exportReportHandler(req, res, portal) {
  try {
    const { reportKey } = req.params;
    const filters = parseReportFilters(req.query);
    const scope =
      portal === "admin" ? buildAdminScope(req, filters) : buildDealerScope(req, filters);

    const data = await runReportForExport({
      reportKey,
      scope,
      filters,
      generatedBy: req.auth,
      portal,
    });

    const format = filters.format === "pdf" ? "pdf" : "xlsx";
    const exported = await exportReport(data, format);

    res.setHeader("Content-Type", exported.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${exported.filename}"`);
    return res.send(exported.buffer);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.apiError(error.message, 404);
    }
    if (error.statusCode === 413) {
      return res.apiError(error.message, 413);
    }
    if (error.statusCode === 503) {
      return res.apiError(error.message, 503);
    }
    return res.apiError("Internal server error", 500, error);
  }
}

async function getFilters(req, res, portal) {
  try {
    const { reportKey } = req.query;
    const filters = await getFilterOptions(reportKey || null, portal);
    return res.apiSuccess("Report filters fetched successfully", filters);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
}

module.exports = { getReport, exportReportHandler, getFilters };
