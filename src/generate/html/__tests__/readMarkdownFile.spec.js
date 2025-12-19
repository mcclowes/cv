import readMarkdownFile from "../readMarkdownFile";
import fs from "fs";
import path from "path";
import os from "os";

const MARKDOWN_OPTIONS_DEFAULT = {
  encoding: "utf8",
};

describe("readMarkdownFile", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cv-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const createTempMarkdown = (content) => {
    const filePath = path.join(tempDir, "test.md");
    fs.writeFileSync(filePath, content, "utf8");
    return filePath;
  };

  it("generates correct html", () => {
    expect(
      readMarkdownFile("src/generate/html/__tests__/markdown.md", MARKDOWN_OPTIONS_DEFAULT),
    ).toMatchSnapshot();
  });

  describe("custom div renderer", () => {
    it("processes markdown inside div wrapper", () => {
      const content = `<div class="highlight">
**Bold text** inside div
</div>`;
      const filePath = createTempMarkdown(content);
      const result = readMarkdownFile(filePath, MARKDOWN_OPTIONS_DEFAULT);

      expect(result).toContain('<div class="highlight">');
      expect(result).toContain("<strong>Bold text</strong>");
      expect(result).toContain("</div>");
    });

    it("handles div with nested list markdown", () => {
      const content = `<div class="skills">
- Item 1
- Item 2
- Item 3
</div>`;
      const filePath = createTempMarkdown(content);
      const result = readMarkdownFile(filePath, MARKDOWN_OPTIONS_DEFAULT);

      expect(result).toContain('<div class="skills">');
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>Item 1</li>");
      expect(result).toContain("</div>");
    });

    it("passes through non-div HTML unchanged", () => {
      const content = `<span class="badge">Test</span>`;
      const filePath = createTempMarkdown(content);
      const result = readMarkdownFile(filePath, MARKDOWN_OPTIONS_DEFAULT);

      expect(result).toContain('<span class="badge">Test</span>');
    });

    it("handles div without closing tag as regular HTML", () => {
      const content = `<div class="open">
Some content without closing div`;
      const filePath = createTempMarkdown(content);
      const result = readMarkdownFile(filePath, MARKDOWN_OPTIONS_DEFAULT);

      // Should pass through as-is since it doesn't end with </div>
      expect(result).toContain('<div class="open">');
    });

    it("handles empty div wrapper", () => {
      const content = `<div class="empty"></div>`;
      const filePath = createTempMarkdown(content);
      const result = readMarkdownFile(filePath, MARKDOWN_OPTIONS_DEFAULT);

      expect(result).toContain('<div class="empty">');
      expect(result).toContain("</div>");
    });
  });
});
