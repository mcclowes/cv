/**
 * Page break delimiters supported by the CV generator.
 * Multiple formats are supported for flexibility:
 * - \page (legacy format)
 * - <!-- PAGE_BREAK --> (HTML comment format)
 * - ---PAGE--- (markdown-friendly format)
 */
const PAGE_BREAK_PATTERNS = [/\\page/g, /<!--\s*PAGE_BREAK\s*-->/g, /---PAGE---/g];

/**
 * Normalizes all page break formats to a single delimiter for splitting
 * @param {string} markdown - The markdown content
 * @returns {string} Content with normalized page breaks
 */
const normalizePageBreaks = (markdown) => {
  const NORMALIZED_DELIMITER = "<<<PAGE_BREAK>>>";

  let normalized = markdown;
  for (const pattern of PAGE_BREAK_PATTERNS) {
    normalized = normalized.replace(pattern, NORMALIZED_DELIMITER);
  }

  return normalized;
};

/**
 * Splits markdown content into pages and wraps each in a page div
 * @param {string} markdown - The markdown/HTML content to split into pages
 * @returns {string} HTML with page divs
 */
const createHtmlPages = (markdown) => {
  const NORMALIZED_DELIMITER = "<<<PAGE_BREAK>>>";
  const normalized = normalizePageBreaks(markdown);

  return normalized
    .split(NORMALIZED_DELIMITER)
    .map((page, pageCount) => {
      return `<div class="page" id="p${pageCount + 1}">${page}</div>`;
    })
    .join(" ");
};

export default createHtmlPages;
export { normalizePageBreaks, PAGE_BREAK_PATTERNS };
