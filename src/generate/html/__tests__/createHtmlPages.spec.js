import createHtmlPages from "../createHtmlPages";

describe("createHtmlPages", () => {
  it("wraps content in page div", () => {
    const result = createHtmlPages("Hello world");
    expect(result).toBe('<div class="page" id="p1">Hello world</div>');
  });

  it("splits content on \\page delimiter", () => {
    const result = createHtmlPages("Page 1\\pagePage 2");
    expect(result).toBe(
      '<div class="page" id="p1">Page 1</div> <div class="page" id="p2">Page 2</div>',
    );
  });

  it("handles multiple page breaks", () => {
    const result = createHtmlPages("A\\pageB\\pageC");
    expect(result).toContain('id="p1"');
    expect(result).toContain('id="p2"');
    expect(result).toContain('id="p3"');
  });

  it("handles empty content", () => {
    const result = createHtmlPages("");
    expect(result).toBe('<div class="page" id="p1"></div>');
  });
});
