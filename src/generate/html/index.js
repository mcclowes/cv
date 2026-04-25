import fs from "fs";

import readStylesheets from "./readStylesheets.js";
import { readRawMarkdown, renderMarkdown } from "./readMarkdownFile.js";
import { splitPages, wrapPagesInDivs } from "./createHtmlPages.js";
import meta from "./meta.js";
import { escapeHtmlAttr } from "./escape.js";

const MARKDOWN_OPTIONS_DEFAULT = {
  encoding: "utf8",
};

const handleTargetPages = (content, markdownOptions) => {
  const sources = Array.isArray(content) ? content : [content];
  const rawMarkdown = sources.map((path) => readRawMarkdown(path, markdownOptions)).join("\n\n");
  const markdownPages = splitPages(rawMarkdown);
  const htmlPages = markdownPages.map(renderMarkdown);
  return wrapPagesInDivs(htmlPages);
};

const writeHtmlFile = (html, fileName) => {
  console.log(`Saving ${fileName}...`);

  try {
    fs.writeFileSync(fileName, html, "utf8");
  } catch (err) {
    console.error(`Error writing file: ${fileName}`, err.message);
    throw err;
  }
};

const buildHtml = (css, html, options, mode = "web") => {
  const isTest = process.env.NODE_ENV === "test";

  const inlineFonts =
    mode === "web"
      ? `
            /* colors and fonts */
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700');
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@300;400;500;600;700;800;900&display=swap');
            `
      : "";

  const inlineCss = isTest ? "" : css;
  const downloadHref = options.downloadLink ? escapeHtmlAttr(options.downloadLink) : null;

  return `
		<!DOCTYPE html>
		<html lang="en-GB" class="${mode}">
			<head>
				<meta charset="utf-8">
        ${meta(options.meta)}

				<style>
          ${inlineFonts}
					${inlineCss}
				</style>
			</head>

			<body class="document">
				<div class="pages">
					${html}

          ${
            downloadHref
              ? `<a class="download-link" href="${downloadHref}" target="_blank" aria-label="Download CV as PDF" rel="noopener">
                <svg x="0px" y="0px" width="36.375px" height="36.376px" viewBox="0 0 36.375 36.376" style="enable-background:new 0 0 36.375 36.376;" xml:space="preserve" aria-hidden="true" focusable="false">
                  <g>
                    <path d="M33.938,25.626v8.25c0,1.383-1.119,2.5-2.5,2.5h-26.5c-1.381,0-2.5-1.117-2.5-2.5v-8.25c0-1.381,1.119-2.5,2.5-2.5
                      s2.5,1.119,2.5,2.5v5.75h21.5v-5.75c0-1.381,1.119-2.5,2.5-2.5S33.938,24.245,33.938,25.626z M16.42,27.768
                      c0.488,0.488,1.129,0.732,1.768,0.732c0.643,0,1.279-0.244,1.77-0.732l7.5-7.498c0.978-0.975,0.978-2.558,0-3.535
                      c-0.977-0.977-2.561-0.977-3.535,0l-3.231,3.232V2.5c0-1.381-1.119-2.5-2.5-2.5s-2.5,1.119-2.5,2.5v17.467l-3.232-3.232
                      c-0.977-0.977-2.561-0.977-3.535,0c-0.977,0.978-0.977,2.56,0,3.535L16.42,27.768z"/>
                  </g>
                </svg>
                Download CV
              </a>`
              : ""
          }
				</div>
			</body>
		</html>
	`;
};

const createReadme = (content) => {
  return `
[![Spellcheck Markdown Files](https://github.com/mcclowes/cv/actions/workflows/spellcheck.yml/badge.svg)](https://github.com/mcclowes/cv/actions/workflows/spellcheck.yml)
[![CI](https://github.com/mcclowes/cv/actions/workflows/ci.yml/badge.svg)](https://github.com/mcclowes/cv/actions/workflows/ci.yml)

${content}
`;
};

const renderHtmlBundle = (content, options = {}) => {
  console.log("Generating HTML...");

  const styleOptions = options.customStyles || options.style || "cv";
  const markdownOptions = options.markdownOptions || MARKDOWN_OPTIONS_DEFAULT;

  const html = handleTargetPages(content, markdownOptions);
  const css = readStylesheets(styleOptions).join("");

  return {
    pdf: buildHtml(css, html, options, "pdf"),
    website: options.website ? buildHtml(css, html, options, "web") : null,
    debug: options.debug ? buildHtml(css, html, options, "debug pdf") : null,
    readme: createReadme(html),
  };
};

export { writeHtmlFile };
export default renderHtmlBundle;
