import fs from "fs";

import readStylesheets from "./readStylesheets";
import readMarkdownFile from "./readMarkdownFile";
import createHtmlPages from "./createHtmlPages";
import meta from "./meta";

const MARKDOWN_OPTIONS_DEFAULT = {
  encoding: "utf8",
};

const handleTargetPages = (content, markdownOptions) => {
  if (Array.isArray(content)) {
    return createHtmlPages(
      content.map((path) => readMarkdownFile(path, markdownOptions)).join(" "),
    );
  }

  return createHtmlPages(readMarkdownFile(content, markdownOptions));
};

const createHtmlFile = (html, fileName = "index.html") => {
  console.log(`Saving ${fileName}...`);

  fs.writeFile(fileName, html, function (err) {
    if (err) console.log(err);
  });
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

  return `
		<html class="${mode}">
			<head>
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
            options.downloadLink
              ? `<a class="download-link" href="${options.downloadLink}" target="_blank">
                <svg x="0px" y="0px" width="36.375px" height="36.376px" viewBox="0 0 36.375 36.376" style="enable-background:new 0 0 36.375 36.376;" xml:space="preserve">
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

const generateHtml = (content, options = {}) => {
  console.log("Generating HTML...");

  const styleOptions = options.customStyles || options.style || "cv";
  const markdownOptions = options.markdownOptions || MARKDOWN_OPTIONS_DEFAULT;

  const html = handleTargetPages(content, markdownOptions);
  const css = readStylesheets(styleOptions).join("");

  createHtmlFile(html, "README.md");

  if (options.debug) {
    createHtmlFile(buildHtml(css, html, options, "debug pdf"), "debug.html");
  }

  if (options.website) {
    createHtmlFile(buildHtml(css, html, options, "web"), "index.html");
  }

  return buildHtml(css, html, options, "pdf");
};

export default generateHtml;
