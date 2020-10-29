import generatePDF from "./generate/pdf";

const options = {
  debug: true,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const targets = [
  "./src/sections/header.md",
  "./src/sections/introduction.md",
  "./src/sections/experience.md",
  "./src/sections/education.md",
  "./src/sections/aboutme.md",
];

const destination = "./mcclowes_cv.pdf";

generatePDF( targets, destination, options, );
