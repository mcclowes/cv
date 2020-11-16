import createHtmlPages from "../createHtmlPages";
import markdown from "./markdown.md";

const MARKDOWN_AS_HTML = `<div class="page" id="p1"><h1 id="hello-world">Hello World</h1>
<p>This is some <em>markdown</em>.</p>
<p><strong>FOR REAL!</strong></p>
</div>`

describe("createHtmlPages", () => {
  it("generates correct html", () => {
    expect(createHtmlPages(markdown)).toBe(MARKDOWN_AS_HTML);
  });
});
