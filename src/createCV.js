import { config } from "../cv.config";
import generatePDF from "./generate/pdf";

const DEFAULT_CV = "product";

const createCV = (variation) => {
  const { defaults, meta, cvs } = config;
  const { content, overrides } = cvs[variation || Object.keys(cvs)[0]];

  const options = {
    meta,
    ...defaults,
    ...overrides,
  };

  const destination = !!options.primary
    ? `./mcclowes_cv.pdf`
    : `./mcclowes_cv_${variation}.pdf`;

  generatePDF(content, destination, options);
};

const inputs = process.argv.slice(2);

if (inputs.length > 0) {
  inputs.forEach((cv) => createCV(cv));
} else {
  createCV();
}
