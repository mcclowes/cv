import { config } from "../cv.config";
import generatePDF from "./generate/pdf";

/**
 * Validates the CV configuration
 * @param {Object} cvConfig - The CV configuration object
 * @param {string|undefined} variation - The requested CV variation
 * @throws {Error} If configuration is invalid
 */
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

/**
 * Creates a CV from the specified variation
 * @param {string|undefined} variation - The CV variation to generate
 * @returns {Promise<string>} The path to the generated PDF
 */
const createCV = async (variation) => {
  const { defaults, meta, cvs, variationKey } = validateConfig(config, variation);
  const { content, overrides } = cvs[variationKey];

  const options = {
    meta,
    ...defaults,
    ...overrides,
  };

  const destination = options.primary ? `./mcclowes_cv.pdf` : `./mcclowes_cv_${variationKey}.pdf`;

  await generatePDF(content, destination, options);

  return destination;
};

/**
 * Main entry point - processes command line arguments
 */
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

// Run main function only when executed directly (not imported for testing)
// NODE_ENV is set to 'test' by Jest automatically
if (process.env.NODE_ENV !== "test") {
  main();
}

// Export for testing
export { createCV, validateConfig, main };
