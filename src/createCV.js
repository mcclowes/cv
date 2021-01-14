import generatePDF from "./generate/pdf";

const defaultOptions = {
  debug: false,
  website: false,
  primary: false,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const variations = {
  engineering: {
    files: [
      "./src/sections/header.md",
      "./src/sections/introduction/engineering.md",
      "./src/sections/experience/engineering.md",
      "./src/sections/education.md",
      "./src/sections/aboutme.md",
    ],
    options: {
      ...defaultOptions,
      website: true,
      primary: true,
      debug: true,
    },
  },
  product: {
    files: [
      "./src/sections/header.md",
      "./src/sections/introduction/product.md",
      "./src/sections/experience/product.md",
      "./src/sections/education.md",
      "./src/sections/aboutme.md",
    ],
  },
};

const createCV = (variation) => {
  const { files, options = defaultOptions } = variations[variation];

  const destination = options.primary
    ? `./mcclowes_cv.pdf`
    : `./mcclowes_cv_${variation}.pdf`;

  generatePDF(files, destination, options);
};

const cvs = process.argv.slice(2);

if (cvs.length > 0) {
  cvs.forEach((cv) => createCV(cv));
} else {
  createCV("product");
}
