import fs from "fs";
import * as pdf from "html-pdf-chrome";

import generateHtml from "../html";

// const HEIGHT = 282;
// const WIDTH = 216;

// const elementDimensions = {
//   page: {
//     height: HEIGHT,
//     width: WIDTH,
//     padding: 5,
//   },
//   card: {
//     height: 82,
//     width: 59,
//     margin: 2,
//     border: 1,
//   },
// };

const DEFAULT_PDF_OPTIONS = {
  //port: 9222,
  printOptions: {
    displayHeaderFooter: false,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    printBackground: true,
  },
  chromeFlags: ["--disable-web-security"],
};

const generatePdf = async (content, destination = "./output.pdf", options) => {
  console.log("Starting PDF generation...");
  const html = await generateHtml(content, options);

  const printOptions = options?.pdfOptions || DEFAULT_PDF_OPTIONS;
  console.log("Print options: ", printOptions);

  console.log("Creating PDF...");
  return pdf
    .create(html, printOptions)
    .then((newPdf) => newPdf.toFile(destination))
    .then((_) => console.log(`${destination} generated`))
    .catch((err) => {
      console.log(err);
    });
};

export default generatePdf;
