import createHtmlPages, { normalizePageBreaks, PAGE_BREAK_PATTERNS } from "../createHtmlPages";

describe("createHtmlPages", () => {
  it("wraps content in page div", () => {
    const result = createHtmlPages("Hello world");
    expect(result).toBe('<div class="page" id="p1">Hello world</div>');
  });

  it("splits content on \\page delimiter (legacy format)", () => {
    const result = createHtmlPages("Page 1\\pagePage 2");
    expect(result).toBe(
      '<div class="page" id="p1">Page 1</div> <div class="page" id="p2">Page 2</div>',
    );
  });

  it("splits content on HTML comment format", () => {
    const result = createHtmlPages("Page 1<!-- PAGE_BREAK -->Page 2");
    expect(result).toBe(
      '<div class="page" id="p1">Page 1</div> <div class="page" id="p2">Page 2</div>',
    );
  });

  it("splits content on HTML comment format with extra whitespace", () => {
    const result = createHtmlPages("Page 1<!--  PAGE_BREAK  -->Page 2");
    expect(result).toBe(
      '<div class="page" id="p1">Page 1</div> <div class="page" id="p2">Page 2</div>',
    );
  });

  it("splits content on ---PAGE--- format", () => {
    const result = createHtmlPages("Page 1---PAGE---Page 2");
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

  it("handles mixed page break formats", () => {
    const result = createHtmlPages("A\\pageB<!-- PAGE_BREAK -->C---PAGE---D");
    expect(result).toContain('id="p1"');
    expect(result).toContain('id="p2"');
    expect(result).toContain('id="p3"');
    expect(result).toContain('id="p4"');
    expect(result).toContain(">A<");
    expect(result).toContain(">B<");
    expect(result).toContain(">C<");
    expect(result).toContain(">D<");
  });

  it("handles empty content", () => {
    const result = createHtmlPages("");
    expect(result).toBe('<div class="page" id="p1"></div>');
  });
});

describe("normalizePageBreaks", () => {
  it("normalizes legacy \\page format", () => {
    const result = normalizePageBreaks("A\\pageB");
    expect(result).toBe("A<<<PAGE_BREAK>>>B");
  });

  it("normalizes HTML comment format", () => {
    const result = normalizePageBreaks("A<!-- PAGE_BREAK -->B");
    expect(result).toBe("A<<<PAGE_BREAK>>>B");
  });

  it("normalizes ---PAGE--- format", () => {
    const result = normalizePageBreaks("A---PAGE---B");
    expect(result).toBe("A<<<PAGE_BREAK>>>B");
  });

  it("normalizes multiple formats in same content", () => {
    const result = normalizePageBreaks("A\\pageB<!-- PAGE_BREAK -->C---PAGE---D");
    expect(result).toBe("A<<<PAGE_BREAK>>>B<<<PAGE_BREAK>>>C<<<PAGE_BREAK>>>D");
  });

  it("returns content unchanged if no page breaks", () => {
    const result = normalizePageBreaks("No page breaks here");
    expect(result).toBe("No page breaks here");
  });
});

describe("PAGE_BREAK_PATTERNS", () => {
  it("exports array of patterns", () => {
    expect(Array.isArray(PAGE_BREAK_PATTERNS)).toBe(true);
    expect(PAGE_BREAK_PATTERNS.length).toBeGreaterThan(0);
  });

  it("all patterns are regex", () => {
    PAGE_BREAK_PATTERNS.forEach((pattern) => {
      expect(pattern).toBeInstanceOf(RegExp);
    });
  });
});
