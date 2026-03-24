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
  description: "Product leader, maker, and team-builder. Over a decade of building software, founding startups, and helping people do their best work. I care about craft, creativity, and leaving things better than I found them.",
  preview: {
    image: "https://cv.mcclowes.com/assets/preview.png",
    text: "Max Clayton Clowes CV",
  },
  url: "https://cv.mcclowes.com/",
  twitterUser: "@mcclowes",
  // Structured data fields for JSON-LD
  email: "contact@mcclowes.com",
  jobTitle: "Fractional Product Manager",
  employer: "NHS / Weavr",
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