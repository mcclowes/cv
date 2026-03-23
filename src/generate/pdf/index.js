import { existsSync, readdirSync } from "fs";
import { join } from "path";
import generateHtml from "../html/index.js";

/**
 * Attempt to find a Chromium executable in the Playwright browser cache.
 * This handles version mismatches between the installed Playwright package
 * and the locally cached browser builds.
 */
const findChromiumExecutable = () => {
  const cacheDir =
    process.env.PLAYWRIGHT_BROWSERS_PATH === "0"
      ? join(process.cwd(), "node_modules", "playwright-core", ".local-browsers")
      : process.env.PLAYWRIGHT_BROWSERS_PATH ||
        join(process.env.HOME || "/root", ".cache", "ms-playwright");

  if (!existsSync(cacheDir)) {
    return null;
  }

  try {
    const entries = readdirSync(cacheDir);
    // Look for chromium directories (e.g. chromium-1194)
    const chromiumDir = entries.find(
      (e) => e.startsWith("chromium-") && !e.includes("headless_shell"),
    );
    if (chromiumDir) {
      const executable = join(cacheDir, chromiumDir, "chrome-linux", "chrome");
      if (existsSync(executable)) {
        return executable;
      }
    }
  } catch {
    // Ignore errors reading directory
  }

  return null;
};

const DEFAULT_PDF_OPTIONS = {
  format: "A4",
  margin: {
    top: "0cm",
    right: "0cm",
    bottom: "0cm",
    left: "0cm",
  },
  printBackground: true,
  displayHeaderFooter: false,
};

const buildPdfMetadata = (meta) => {
  if (!meta) {
    return {};
  }

  const metadata = {};

  if (meta.name) {
    metadata.title = `${meta.name} CV`;
    metadata.author = meta.name;
  }

  if (meta.description) {
    metadata.subject = meta.description;
  }

  return metadata;
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
  } catch (firstError) {
    const message = String(firstError?.message || "");
    if (message.includes("Executable doesn't exist")) {
      // Try to find a compatible Chromium in the cache (handles version mismatches)
      const executablePath = findChromiumExecutable();
      if (executablePath) {
        console.log(`Using Chromium at: ${executablePath}`);
        try {
          browser = await chromium.launch({ executablePath });
        } catch {
          // Fall through to error message below
        }
      }

      if (!browser) {
        console.error(
          [
            "Playwright browser is not installed.",
            "Run to install Chromium:",
            "  npx playwright install chromium",
          ].join("\n"),
        );
        throw firstError;
      }
    } else {
      throw firstError;
    }
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "screen" });

    const pdfMetadata = buildPdfMetadata(options?.meta);
    const pdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...pdfMetadata,
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
