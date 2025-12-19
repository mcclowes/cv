import { marked } from "marked";
import lodash from "lodash";
import fs from "fs";

const renderer = {
  // Processes the markdown within an HTML block if it's just a class-wrapper
  html(html) {
    if (
      lodash.startsWith(lodash.trim(html), "<div") &&
      lodash.endsWith(lodash.trim(html), "</div>")
    ) {
      const openTag = html.substring(0, html.indexOf(">") + 1);

      html = html.substring(html.indexOf(">") + 1);
      html = html.substring(0, html.lastIndexOf("</div>"));

      return `${openTag} ${marked.parse(html)} </div>`;
    }

    return html;
  },
};

const readMarkdownFile = (target, markdownOptions) => {
  console.log("Markdown options:", markdownOptions);

  const fileContent = fs.readFileSync(target, markdownOptions.encoding);

  marked.use({ renderer });
  return marked.parse(fileContent);
};

export default readMarkdownFile;
