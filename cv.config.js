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
  description: "Product Manager with diverse software engineering and design background, and experience as a founder of a client-facing business. Have been delivering websites and apps for 10+ years. Duke of York Young Entrepreneur Award winner 2017.",
  preview: {
    image: "https://cv.mcclowes.com/assets/preview.png",
    text: "Max Clayton Clowes CV",
  },
  url: "https://cv.mcclowes.com/",
  twitterUser: "@mcclowes",
}

const cvs = {
  product: {
    content: [
      "./src/sections/header/productnew.md",
      "./src/sections/introduction/productnew.md",
      "./src/sections/experience.md",
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