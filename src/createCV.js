import { config } from "../cv.config.js";
import generatePdfFromHtml from "./generate/pdf/index.js";
import renderHtmlBundle, { writeHtmlFile } from "./generate/html/index.js";

const validateConfig = (cvConfig, variation) => {
  if (!cvConfig) {
    throw new Error("Configuration is missing. Ensure cv.config.js exports a valid config object.");
  }

  const { defaults, meta, cvs } = cvConfig;

  if (!cvs || typeof cvs !== "object" || Object.keys(cvs).length === 0) {
    throw new Error(
      "No CV variations defined in cv.config.js. Add at least one CV to the 'cvs' object.",
    );
  }

  const primaryVariations = Object.entries(cvs).filter(
    ([, entry]) => entry?.overrides?.primary === true,
  );
  if (primaryVariations.length > 1) {
    const names = primaryVariations.map(([key]) => key).join(", ");
    throw new Error(
      `Multiple CV variations marked primary (${names}). At most one variation may set primary: true.`,
    );
  }

  const variationKey = variation || Object.keys(cvs)[0];

  if (!cvs[variationKey]) {
    const availableVariations = Object.keys(cvs).join(", ");
    throw new Error(
      `CV variation "${variationKey}" not found. Available variations: ${availableVariations}`,
    );
  }

  const { content } = cvs[variationKey];

  if (!content || !Array.isArray(content) || content.length === 0) {
    throw new Error(
      `CV variation "${variationKey}" has no content defined. Add markdown file paths to the 'content' array.`,
    );
  }

  return { defaults, meta, cvs, variationKey };
};

const persistBundle = (bundle, { writeReadme = true } = {}) => {
  if (bundle.website) {
    writeHtmlFile(bundle.website, "index.html");
  }
  if (bundle.debug) {
    writeHtmlFile(bundle.debug, "debug.html");
  }
  if (writeReadme && bundle.readme) {
    writeHtmlFile(bundle.readme, "README.md");
  }
};

const createCV = async (variation) => {
  const { defaults, meta, cvs, variationKey } = validateConfig(config, variation);
  const { content, overrides } = cvs[variationKey];

  const options = {
    meta,
    ...defaults,
    ...overrides,
  };

  const destination = options.primary ? `./mcclowes_cv.pdf` : `./mcclowes_cv_${variationKey}.pdf`;

  const bundle = renderHtmlBundle(content, options);

  persistBundle(bundle, { writeReadme: Boolean(options.primary) });

  await generatePdfFromHtml(bundle.pdf, destination, {
    meta: options.meta,
    pdfOptions: options.pdfOptions,
  });

  return destination;
};

const main = async () => {
  const inputs = process.argv.slice(2);

  try {
    if (inputs.length > 0) {
      for (const cv of inputs) {
        await createCV(cv);
      }
    } else {
      await createCV();
    }
    console.log("CV generation completed successfully.");
  } catch (error) {
    console.error("CV generation failed:", error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  main();
}

export { createCV, validateConfig, persistBundle, main };
