import renderHtmlBundle from "../index";

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

const FIXTURE = "src/generate/html/__tests__/markdown.md";

describe("renderHtmlBundle", () => {
  it("always returns a pdf string", () => {
    const bundle = renderHtmlBundle(FIXTURE);
    expect(typeof bundle.pdf).toBe("string");
    expect(bundle.pdf).toContain('class="pdf"');
  });

  it("always returns a readme string", () => {
    const bundle = renderHtmlBundle(FIXTURE);
    expect(typeof bundle.readme).toBe("string");
    expect(bundle.readme).toContain("badge.svg");
  });

  it("omits website and debug when their options are false", () => {
    const bundle = renderHtmlBundle(FIXTURE, OPTIONS_DEFAULT);
    expect(bundle.website).toBeNull();
    expect(bundle.debug).toBeNull();
  });

  it("includes website output when website: true", () => {
    const bundle = renderHtmlBundle(FIXTURE, { ...OPTIONS_DEFAULT, website: true });
    expect(bundle.website).toContain('class="web"');
  });

  it("includes debug output when debug: true", () => {
    const bundle = renderHtmlBundle(FIXTURE, { ...OPTIONS_DEFAULT, debug: true });
    expect(bundle.debug).toContain('class="debug pdf"');
  });

  it("wraps every page in a numbered page div", () => {
    const bundle = renderHtmlBundle(FIXTURE, OPTIONS_DEFAULT);
    expect(bundle.pdf).toContain('id="p1"');
  });

  it("accepts an array of files and produces one combined document", () => {
    const bundle = renderHtmlBundle([FIXTURE, FIXTURE], OPTIONS_DEFAULT);
    expect(bundle.pdf).toContain('id="p1"');
  });

  it("does not inline CSS in test mode (NODE_ENV=test)", () => {
    const bundle = renderHtmlBundle(FIXTURE, OPTIONS_DEFAULT);
    expect(bundle.pdf).not.toContain("--color-green");
  });

  it("escapes the download link href", () => {
    const bundle = renderHtmlBundle(FIXTURE, {
      ...OPTIONS_DEFAULT,
      website: true,
      downloadLink: 'https://example.com/"><script>alert(1)</script>',
    });
    expect(bundle.website).not.toContain("<script>alert(1)</script>");
    expect(bundle.website).toContain("&quot;");
  });
});
