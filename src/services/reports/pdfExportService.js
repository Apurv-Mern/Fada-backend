const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const { prepareReportPdfViewModel } = require("./reportPdfFormatter");

const TEMPLATE_PATH = path.join(__dirname, "../../views/reports/report-pdf.ejs");

const SYSTEM_CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/snap/bin/chromium",
].filter(Boolean);

let browserPromise = null;

function resolveExecutablePath() {
  for (const candidate of SYSTEM_CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  try {
    const bundledPath = puppeteer.executablePath();
    if (bundledPath && fs.existsSync(bundledPath)) {
      return bundledPath;
    }
  } catch {
    // puppeteer has no bundled browser; fall through
  }

  return null;
}

function getLaunchOptions() {
  const executablePath = resolveExecutablePath();
  const options = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  };

  if (executablePath) {
    options.executablePath = executablePath;
  }

  return options;
}

async function getBrowser() {
  if (!browserPromise) {
    const launchOptions = getLaunchOptions();

    if (!launchOptions.executablePath) {
      const error = new Error(
        "Chrome/Chromium not found for PDF export. Install Chrome or run: npx puppeteer browsers install chrome",
      );
      error.statusCode = 503;
      throw error;
    }

    browserPromise = puppeteer.launch(launchOptions).catch((error) => {
      browserPromise = null;
      throw error;
    });
  }

  return browserPromise;
}

async function renderReportHtml(reportData) {
  const viewModel = prepareReportPdfViewModel(reportData);
  return ejs.renderFile(TEMPLATE_PATH, viewModel, { async: true });
}

async function buildPdf(reportData) {
  const html = await renderReportHtml(reportData);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "18mm",
        right: "14mm",
        bottom: "20mm",
        left: "14mm",
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width:100%;font-size:8px;color:#64748b;padding:0 14mm;display:flex;justify-content:space-between;">
          <span>FADA ID Reports</span>
          <span>${reportData.meta?.reportName || "Report"}</span>
        </div>`,
      footerTemplate: `
        <div style="width:100%;font-size:8px;color:#64748b;padding:0 14mm;display:flex;justify-content:space-between;">
          <span>Confidential — For internal use only</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

module.exports = { buildPdf, renderReportHtml, resolveExecutablePath };
