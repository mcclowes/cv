import readMarkdownFile from "../readMarkdownFile";
// import markdown from "./markdown.md";

const MARKDOWN_OPTIONS_DEFAULT = {
  encoding: "utf8",
};

const MARKDOWN_AS_HTML = `<h1 id="hello-world">Hello World</h1>
<p>This is some <em>markdown</em>.</p>
<p><strong>FOR REAL!</strong></p>
`

describe("readMarkdownFile", () => {
  it("generates correct html", () => {
    expect(
      readMarkdownFile(
        "src/generate/html/__tests__/markdown.md", 
        MARKDOWN_OPTIONS_DEFAULT
      )
    ).toBe(
      MARKDOWN_AS_HTML
    );
  });
});
