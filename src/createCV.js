import generatePDF from "./generate/pdf";

const options = {
  debug: true,
  website: false,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const primaryCV = 'engineering';

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
  console.log(`Creating ${variation} CV`)
  if(variation === primaryCV) {
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

const cvs = process.argv.slice(2)

if(cvs.length>0) {
  cvs.forEach(cv => createCV(cv))
} else {
  createCV(primaryCV);
}