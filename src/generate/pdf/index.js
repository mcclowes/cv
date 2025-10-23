import generateHtml from "../html";

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
  try {
    const playwright = await import("playwright-core");
    if (playwright?.chromium) {
      return playwright.chromium;
    }
  } catch (error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }

  const missingDependencyMessage = [
    "The `playwright-core` package is required to generate PDFs.",
    "Install it with `npm install --save-dev playwright-core` and try again.",
  ].join(" ");

  throw new Error(missingDependencyMessage);
};

const generatePdf = async (content, destination = "./output.pdf", options) => {
  console.log("Starting PDF generation...");
  const html = await generateHtml(content, options);

  const chromium = await getPlaywright();
  const browser = await chromium.launch();

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
    await browser.close();
  }
};

export default generatePdf;
