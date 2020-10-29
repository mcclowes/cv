import generatePDF from "./generate/pdf";

const options = {
  debug: true,
  website: false,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const variations = {
  engineering: [
    "./src/sections/header.md",
    "./src/sections/introduction/engineering.md",
    "./src/sections/experience.md",
    "./src/sections/education.md",
    "./src/sections/aboutme.md",
  ],
  product: [
    "./src/sections/header.md",
    "./src/sections/introduction/product.md",
    "./src/sections/experience.md",
    "./src/sections/education.md",
    "./src/sections/aboutme.md",
  ],
}

const createCV = (variation) => {
  if(variation === 'engineering') {
    const destination = "./mcclowes_cv.pdf";

    generatePDF(
      variations[variation], 
      destination, 
      { ...options, website: true }
    );

    return null;
  }
  
  const destination = "./mcclowes_cv_product.pdf";

  generatePDF(
    variations[variation], 
    destination, 
    options
  );
}

const createProductManagementCV = async () => {

  const destination = "./mcclowes_cv_product.pdf";

  generatePDF( targets, destination, options, );
}


createCV('engineering');