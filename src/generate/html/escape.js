const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
};

const escapeHtmlAttr = (value) => escapeHtml(value);

const escapeJsonForScript = (json) => json.replace(/</g, "\\u003c").replace(/-->/g, "--\\u003e");

export { escapeHtml, escapeHtmlAttr, escapeJsonForScript };
