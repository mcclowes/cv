import generatePDF from "./generate/pdf";

const options = {
  debug: true,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const target = "./src/cv.md";

const destination = "./mcclowes_cv.pdf";

generatePDF( target, destination, options, );
