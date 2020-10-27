import generatePDF from "./generate/pdf";

const options = {
  debug: true,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const target = "./README.md";

const destination = "./mcclowes_cv.pdf";

generatePDF( target, destination, options, );
