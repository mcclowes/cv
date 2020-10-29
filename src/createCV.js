import generatePDF from "./generate/pdf";

const options = {
  debug: true,
  website: false,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const createSoftwareEngineeringCV = async () => {
  const targets = [
    "./src/sections/header.md",
    "./src/sections/introduction.md",
    "./src/sections/experience.md",
    "./src/sections/education.md",
    "./src/sections/aboutme.md",
  ];

  const destination = "./mcclowes_cv.pdf";

  generatePDF( targets, destination, { ...options, website: true }, );
}

const createProductManagementCV = async () => {
  const targets = [
    "./src/sections/header.md",
    "./src/sections/introduction2.md",
    "./src/sections/experience.md",
    "./src/sections/education.md",
    "./src/sections/aboutme.md",
  ];

  const destination = "./mcclowes_cv_product.pdf";

  generatePDF( targets, destination, options, );
}


//createSoftwareEngineeringCV()
createProductManagementCV()