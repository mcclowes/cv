import generateHtml from "../index";
import fs from "fs";

const CONFIG = {
  name: "Joe Bloggs",
  description: "Enter a summary of you here.",
  preview: {
    image: "https://cv.joebloggs.com/preview.png",
    text: "Joe Bloggs CV",
  },
  url: "https://cv.joebloggs.com/",
  twitterUsername: "@joebloggs",
};

const OPTIONS_DEFAULT = {
  debug: false,
  website: false,
  primary: false,
  printOptions: {
    displayHeaderFooter: false,
  },
  meta: CONFIG,
};

describe("generateHtml", () => {
  it("default", () => {
    expect(generateHtml("src/generate/html/__tests__/markdown.md")).toMatchSnapshot();
  });

  it("with standard options", () => {
    expect(
      generateHtml("src/generate/html/__tests__/markdown.md", OPTIONS_DEFAULT),
    ).toMatchSnapshot();
  });

  it("for website", () => {
    expect(
      generateHtml("src/generate/html/__tests__/markdown.md", {
        ...OPTIONS_DEFAULT,
        website: true,
      }),
    ).toMatchSnapshot();
  });

  it("with array", () => {
    expect(
      generateHtml(
        ["src/generate/html/__tests__/markdown.md", "src/generate/html/__tests__/markdown.md"],
        OPTIONS_DEFAULT,
      ),
    ).toMatchSnapshot();
  });

  it("for debug mode", () => {
    const result = generateHtml("src/generate/html/__tests__/markdown.md", {
      ...OPTIONS_DEFAULT,
      debug: true,
    });

    // Verify debug.html was created
    expect(fs.existsSync("debug.html")).toBe(true);

    // The result should be the PDF version
    expect(result).toContain('class="pdf"');
  });

  it("includes download link when provided", () => {
    const result = generateHtml("src/generate/html/__tests__/markdown.md", {
      ...OPTIONS_DEFAULT,
      downloadLink: "https://example.com/cv.pdf",
    });

    expect(result).toContain('href="https://example.com/cv.pdf"');
    expect(result).toContain("Download CV");
  });

  it("uses customStyles when provided", () => {
    const result = generateHtml("src/generate/html/__tests__/markdown.md", {
      ...OPTIONS_DEFAULT,
      customStyles: "cv",
    });

    expect(result).toBeDefined();
  });
});
