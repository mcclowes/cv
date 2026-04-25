import { Marked } from "marked";
import fs from "fs";

const markdown = new Marked();

markdown.use({
  renderer: {
    html(html) {
      const trimmed = html.trim();
      if (trimmed.startsWith("<div") && trimmed.endsWith("</div>")) {
        const openTag = html.substring(0, html.indexOf(">") + 1);
        const inner = html.substring(html.indexOf(">") + 1, html.lastIndexOf("</div>"));
        return `${openTag} ${markdown.parse(inner)} </div>`;
      }
      return html;
    },
  },
});

const readRawMarkdown = (target, markdownOptions) => {
  return fs.readFileSync(target, markdownOptions.encoding);
};

const renderMarkdown = (source) => markdown.parse(source);

const readMarkdownFile = (target, markdownOptions) => {
  return renderMarkdown(readRawMarkdown(target, markdownOptions));
};

export { readRawMarkdown, renderMarkdown };
export default readMarkdownFile;
