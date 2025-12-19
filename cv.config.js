const defaults = {
  debug: true,
  website: false,
  primary: false,
  printOptions: {
    displayHeaderFooter: false,
  },
  downloadLink: "https://github.com/mcclowes/cv/raw/main/mcclowes_cv.pdf",
};

const meta = {
  name: "Max Clayton Clowes",
  description: "Product Director with diverse software engineering and design background, and experience as a founder of a client-facing business. Have been delivering websites and apps for 10+ years. Duke of York Young Entrepreneur Award winner 2017.",
  preview: {
    image: "https://cv.mcclowes.com/assets/preview.png",
    text: "Max Clayton Clowes CV",
  },
  url: "https://cv.mcclowes.com/",
  twitterUser: "@mcclowes",
  // Structured data fields for JSON-LD
  email: "contact@mcclowes.com",
  jobTitle: "Product Director",
  employer: "Codat",
}

const cvs = {
  product: {
    content: [
      "./src/sections/header/main.md",
      "./src/sections/introduction/main.md",
      "./src/sections/experience/experience.md",
      "./src/sections/education.md",
      "./src/sections/awards.md",
      "./src/sections/aboutme.md",
    ],
    overrides: {
      website: true,
      primary: true,
      style: [
        "cv",
        "newspaper",
      ],
    },
  },
};

export const config = {
  defaults,
  meta,
  cvs,
}