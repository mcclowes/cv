import generateHtml from "../html";

// Ensure Playwright uses a project-local browsers cache (node_modules/.cache/ms-playwright)
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
}

const DEFAULT_PDF_OPTIONS = {
  format: "A4",
  margin: {
    top: "0cm",
    right: "0cm",
    bottom: "0cm",
    left: "0cm",
  },
  printBackground: true,
};

const getPlaywright = async () => {
  // Try playwright-core first (lighter dependency)
  try {
    const playwrightCore = await import("playwright-core");
    if (playwrightCore?.chromium) {
      return playwrightCore.chromium;
    }
  } catch (error) {
    const code = error?.code;
    if (code !== "ERR_MODULE_NOT_FOUND" && code !== "MODULE_NOT_FOUND") {
      throw error;
    }
  }

  // Fallback to full playwright (bundles browsers)
  try {
    const playwright = await import("playwright");
    if (playwright?.chromium) {
      return playwright.chromium;
    }
  } catch (error) {
    const code = error?.code;
    if (code !== "ERR_MODULE_NOT_FOUND" && code !== "MODULE_NOT_FOUND") {
      throw error;
    }
  }

  const missingDependencyMessage = [
    "A Playwright package is required to generate PDFs.",
    "Install one of:",
    "  - npm install --save-dev playwright      # includes browsers",
    "  - npm install --save-dev playwright-core # bring your own browser",
  ].join("\n");

  throw new Error(missingDependencyMessage);
};

const generatePdf = async (content, destination = "./output.pdf", options) => {
  console.log("Starting PDF generation...");
  const html = await generateHtml(content, options);

  const chromium = await getPlaywright();
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("Executable doesn't exist")) {
      console.error([
        "Playwright browser is not installed.",
        "Run to install Chromium locally:",
        "  npm_config_cache=$(pwd)/.npm-cache PLAYWRIGHT_BROWSERS_PATH=0 npx --yes playwright install chromium",
      ].join("\n"));
    }
    throw error;
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "screen" });

    const pdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...(options?.pdfOptions || {}),
      path: destination,
    };

    console.log("Creating PDF with options:", pdfOptions);
    await page.pdf(pdfOptions);
    console.log(`${destination} generated`);
  } catch (error) {
    console.error("Failed to generate PDF", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default generatePdf;
