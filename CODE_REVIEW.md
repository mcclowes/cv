# Code Review: CV Generator

> **Reviewer perspective:** Principal engineer, just onboarded, being deliberately critical.
> **Goal:** Call out every weakness I can find, and — more importantly — explain *why* it matters so the team can internalize the patterns, not just the fixes.

This isn't a bad codebase. It's a small, personal tool, and it works. But "it works on my machine and the artefacts look right" is the lowest bar in software, and there's a lot of cumulative sloppiness here that would not survive a serious review cycle. Treat this document as a teaching aid: most findings are small, but each one points to a principle worth absorbing before you're writing production code at scale.

---

## 0. Executive summary

- **One confirmed correctness bug** ships in the committed snapshot: page splits produce malformed HTML (`<p></div>` / `<div class="page"><p>`). It's right there in `html.spec.js.snap`, frozen as the "expected" output.
- **Tests are not hermetic.** Running `npm test` writes `README.md` (and conditionally `index.html`) into the project root. CI and local runs silently clobber your committed website.
- **Multiple HTML/JSON-LD injection vectors** exist in `meta.js` and the download-link template. Low real-world risk for a personal CV, but a tell-tale sign of "template strings used as HTML builder" — a habit worth unlearning now.
- **Global-state side effects on module import** (Playwright env var, `marked.use`) make behavior depend on import order.
- **Build pipeline and dev tooling are over-specified** (Babel on Node 20 just for Jest) and **under-specified** in the places that matter (no link checker, no visual regression, no PDF integrity check).
- **Documentation drifts from reality.** TODO.md claims work is outstanding that is already done; `package.json` `main` field points at a generated HTML file; several devDependencies (`merge-md`, `copyfiles`) are entirely unused.

The rest of this document expands on these with file:line references and the principle behind each critique.

---

## 1. Correctness bugs (fix first)

### 1.1 Page-break splitting corrupts HTML structure

**Where:** `src/generate/html/index.js:12-20`, `src/generate/html/createHtmlPages.js:31-41`, evidence in `src/generate/html/__tests__/__snapshots__/html.spec.js.snap:44`.

The pipeline is:

1. `readMarkdownFile` runs `marked.parse(fullMarkdown)` — produces complete HTML.
2. `createHtmlPages` then splits **the rendered HTML** on `\page` / `<!-- PAGE_BREAK -->` / `---PAGE---`.
3. Each resulting fragment is wrapped in `<div class="page">…</div>`.

`marked` wraps bare text (including your `\page` token) inside `<p>…</p>`. When the token sits on its own line within a run of prose, marked keeps the surrounding paragraph open across the break. Splitting the HTML string afterwards slices *through* tags.

You can see the bug already captured in the committed snapshot (`html.spec.js.snap:44`):

```html
<p></div> <div class="page" id="p2"><p>
```

That's an unclosed `<p>` on page 1 and an orphaned `</p>` with a stray `<p>` reopen on page 2. The PDF renderer happens to tolerate it, but a strict HTML validator (or any consumer using the web version as a data source) will not.

**Why it matters:** you're doing text-level surgery on structured data. The universal fix is to operate at the right layer: split *markdown* on the page-break token first, render each page independently, then concatenate. Or, in `marked` terms, write a block-level tokenizer that recognises page breaks as first-class tokens.

**What junior engineers should take away:** when you find yourself splitting HTML/JSON/SQL with regex or `String.split`, stop. You are almost certainly operating on the wrong representation. Transform into structured form, manipulate there, serialise out.

### 1.2 Tests write to the project root

**Where:** `src/generate/html/__tests__/html.spec.js` calls `generateHtml(...)`. `src/generate/html/index.js:96-116` writes `README.md` unconditionally, plus `index.html`/`debug.html` based on flags.

`generateHtml` has two responsibilities in one function: build the HTML string *and* write files to disk. Tests call it for the return value but pay the write side-effect each time. The `isTest` check at `index.js:34` only suppresses inlined CSS — not the file I/O.

Every `npm test` run:

- Overwrites `README.md` with the test-fixture content from `src/generate/html/__tests__/markdown.md`.
- In the `for website` case, overwrites `index.html` with a stripped-CSS test version.

This is how people "just noticed the site looks broken after CI." It's also how a reviewer wastes 20 minutes asking "why did this unrelated PR touch README?"

**Principle:** keep pure computation (string → string) separated from I/O. Let the caller decide whether to persist. A function that simultaneously returns a value and writes files is almost always the wrong abstraction.

**Quick fix:** extract `buildHtmlBundle(content, options) → { pdf, web, debug, readme }` that returns strings only, then have `createCV` write them. Tests then assert over the returned strings, no disk involvement.

### 1.3 `marked.use({ renderer })` mutates global state inside a "read" function

**Where:** `src/generate/html/readMarkdownFile.js:29`.

`readMarkdownFile` is named like a pure read, but `marked.use(...)` registers a renderer on the **module-level singleton** — every call re-registers it, and any other module using `marked` in the same process inherits the override.

Symptoms today are benign because only this module uses `marked`. Symptoms tomorrow: tests run in parallel (Jest workers), someone adds another markdown consumer, or you import this module from elsewhere and suddenly markdown elsewhere renders differently.

**Principle:** if a function mutates shared state, make the name and contract reflect that (`configureMarked()` once at startup, or use a local `marked` instance via `new Marked()`). Tests for side-effectful functions must reset state in `beforeEach`/`afterEach`; no test here does.

### 1.4 `process.env.PLAYWRIGHT_BROWSERS_PATH = "0"` on import

**Where:** `src/generate/pdf/index.js:4-6`.

Setting an env var at module top-level means the mere act of `import`-ing this module for a type check, a unit test, or a refactoring tool changes your process environment. If an operator has deliberately set `PLAYWRIGHT_BROWSERS_PATH` for cross-project caching, your guard (`if (!process.env.PLAYWRIGHT_BROWSERS_PATH)`) protects them — but you still can't reason about when this ran relative to Playwright's own initialization if *another* module imports Playwright first.

**Principle:** initialization belongs in an explicit `init()` or in `main()`, not in module evaluation. Side effects at import time are the root cause of many "works locally, fails in CI" bugs.

### 1.5 `primary` flag can silently overwrite outputs

**Where:** `src/createCV.js:58`.

```js
const destination = options.primary ? `./mcclowes_cv.pdf` : `./mcclowes_cv_${variationKey}.pdf`;
```

If two CV variations both set `primary: true`, the second one overwrites the first without warning. The config today has one variation, so this is latent — but the whole point of the `cvs` map is to support many, and this flag is a foot-gun waiting for its second user.

**Principle:** invariants that "should only happen once" must be enforced, not trusted. Validate at config-load time that at most one variation is primary, and reject otherwise. Fail loud, fail early.

### 1.6 `getPlaywright` fallback can silently mask real failures

**Where:** `src/generate/pdf/index.js:39-74`.

The `try/catch` around `import("playwright-core")` and `import("playwright")` only distinguishes `ERR_MODULE_NOT_FOUND` / `MODULE_NOT_FOUND`. Any *other* import error — e.g. a bad peer dep, a syntax error in a subdependency, a symlink issue — rethrows correctly, which is fine. But a subtler failure mode: if `playwright-core` is installed but `chromium` is `undefined` (version mismatch), the code silently falls through to `playwright`. That's graceful-degradation-as-anti-pattern: the user never learns their `playwright-core` install is broken.

**Principle:** fallbacks should be *additive*, not *substitutive* without signal. At minimum, `console.warn` when the primary path is present-but-unusable.

---

## 2. Security / injection

All three are low practical risk for a one-person CV — you control the inputs — but the code *shape* is what a junior engineer internalizes. Writing sloppy interpolations here normalises them everywhere.

### 2.1 Unescaped interpolation into HTML

**Where:** `src/generate/html/meta.js:44-66`, `src/generate/html/index.js:67` (download link).

```js
<meta property="og:title" content="The CV of ${name}">
<a class="download-link" href="${options.downloadLink}" ...>
```

Any `"` or `<` in `name`, `description`, `preview.image`, `twitterUser`, `url`, or `downloadLink` breaks the markup. `preview.image` is a URL that might contain `&`/`"` if anyone ever uses query parameters.

**Principle:** there's no excuse in 2026 for hand-concatenating HTML. Use an HTML-safe template engine (`lit-html`-style tagged templates, `nunjucks`, even a tiny `escape(str)` helper for attribute values). Every time you write `${x}` inside HTML, ask: "is `x` proven to be HTML-safe?" If not, escape.

### 2.2 JSON-LD `</script>` breakout

**Where:** `src/generate/html/meta.js:27`.

```js
return `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
```

`JSON.stringify` does not escape the forward slash in `</script>`. A description containing `</script><script>alert(1)</script>` exits the JSON-LD block. Standard mitigation:

```js
JSON.stringify(structuredData).replace(/</g, "\\u003c");
```

Or use a library. This is a canonical XSS vector you'll see in every OWASP checklist — internalise it now.

### 2.3 Trusted-markdown assumption

**Where:** `src/generate/html/readMarkdownFile.js`.

The renderer happily allows raw HTML through. Fine because you author the content — but the `renderer.html` override also calls `marked.parse` **on the inner content of every `<div>`** (`readMarkdownFile.js:17`). That's *recursive* markdown-inside-HTML. Any runaway content (a long line accidentally starting with `<div`) triggers a re-parse that could, in theory, loop on pathological input.

**Principle:** be explicit about where untrusted input could enter. For a personal CV there is none — document that assumption at the top of the file so a future contributor doesn't pipe web-form input in naïvely.

---

## 3. Architecture & design

### 3.1 `generateHtml` conflates pure rendering with I/O and with routing

Functions should do one thing. This one:

- Reads stylesheets (I/O).
- Reads markdown files (I/O).
- Converts markdown to HTML (pure).
- Wraps in a page template (pure).
- Writes `README.md` (I/O).
- Optionally writes `debug.html` (I/O, branch on `options.debug`).
- Optionally writes `index.html` (I/O, branch on `options.website`).
- Returns a PDF-mode HTML string for the PDF generator (pure).

That's five responsibilities and three different control flow shapes in one 20-line function. No surprise that `createCV.js`'s unit test can't touch this path without ceremony.

**Target shape:**

```
readContent(paths, opts)      → { raw: string[] }        // I/O boundary
renderMarkdown(raw)           → { html: string }         // pure
composeDocument({html, css, meta, mode}) → string        // pure
persist({pdf, web, debug, readme}, paths) → void         // I/O boundary
```

Each of those is trivially testable without mocks.

### 3.2 Working directory is an implicit input

`./src/styles/cv.css`, `./mcclowes_cv.pdf`, `./README.md`, `./index.html`, `./debug.html` — all relative paths. Run `node src/createCV.js` from any directory other than the repo root and you get a hard failure. This is fragile and untested.

**Fix:** resolve paths relative to the project root using `fileURLToPath(import.meta.url)` + `path.resolve`. Better yet, make the output directory a config field so `dist/` is possible.

### 3.3 Options shape is a loose bag

`options` is a merged object of `defaults`, `overrides`, and `meta`-containing structure. There's no schema, no type, no validator. Misspelling `websiite: true` is a silent no-op. `customStyles || style || "cv"` at `index.js:99` hints that old-vs-new key names co-exist — classic undocumented deprecation.

**Principle:** config at the edges should be parsed to a typed internal shape at one explicit boundary. Then the rest of the code uses the typed shape. Zod / Valibot / JSON Schema / TypeScript interfaces — pick one and use it.

### 3.4 `buildHtml` builds a template literal of ~40 lines with tabs, spaces, and embedded SVG

`src/generate/html/index.js:48-85`. This is the kind of code where a typo ships unnoticed. Move templates to dedicated `.html` files (or at least tagged template helpers that escape automatically). You already have the inline-SVG for the download button — it's 10 lines of a template literal where one missing quote breaks the page. Extract to a constant at minimum.

### 3.5 `createReadme` ignores its argument

```js
const createReadme = (content, _options = {}) => { ... }
```

The `_options` is dead weight. The function is also coupled to the *current* set of GitHub Actions badges by hard-coding them. When you migrate away from `mcclowes/cv` (different repo, rename, etc.) the generated README points to the wrong badges.

### 3.6 Side-effectful READMEs are bad practice

Generating `README.md` from CV content means:

- Running `npm run build` always produces an unstaged git change.
- Contributors have noisy diffs on every PR.
- Your repo's README, which is *metadata about the project*, is instead your actual CV content. GitHub visitors landing on the repo think this is a personal site, not a tool.

**Recommendation:** keep README as a hand-written project description ("This is the tool that generates my CV. See cv.mcclowes.com."). If you want the CV content served as markdown, generate `CV.md` and leave README for project documentation.

### 3.7 Committed build artifacts

`index.html`, `debug.html`, `mcclowes_cv.pdf`, `README.md` are all generated, and all committed. Every rebuild creates spurious diff noise and merge conflicts. Either:

- Don't commit generated files — serve them via GitHub Pages CI, or commit only the PDF as a deliberate "downloadable release" asset and keep a lock file so git cares about it cleanly.
- Or move them to a `dist/` directory that's gitignored, and deploy from CI.

---

## 4. Testing

### 4.1 Snapshot tests carry a 400-line HTML string

`html.spec.js.snap` is 402 lines. Any meaningful change requires `-u`, and no human actually reads the diff. Snapshot tests for huge artifacts are effectively "freeze the bug". The malformed HTML in §1.1 is a perfect illustration — it's in the snapshot, therefore it's "expected".

**Fixes layered by effort:**
- **Cheap:** assert on structural properties (`expect(html).toContain('<h1>')`, `expect(countOf('<div class="page"')).toBe(2)`).
- **Medium:** parse output with `jsdom` / `cheerio` and assert on the DOM. Resistant to whitespace changes, catches real structural regressions.
- **Right:** visual regression on the rendered PDF/HTML using Playwright's screenshot diffing. The only thing that ultimately matters is whether the page *looks* right.

### 4.2 Tests don't cover the parts that break

Tests check page-splitting on toy strings (`"Page 1\\pagePage 2"`), meta tag generation on a static fixture, and config validation. They do *not* test:

- What happens when a page break falls inside a paragraph. (The real bug from §1.1.)
- What happens when a markdown file referenced in config is missing. (Error bubble test only at `readStylesheets`, not at `readMarkdownFile`.)
- What happens when the PDF output path is in a non-existent directory.
- What happens when Playwright launches but page.pdf exceeds some resource limit.
- What happens with non-ASCII content (mm/cm measurements, emoji, RTL text).
- What happens to the HTML when `options.meta` is missing vs. partial (e.g. `meta.preview` missing but `meta.name` present — `meta.js:56` would throw on `preview.image`).

### 4.3 Unhermetic tests (see §1.2)

### 4.4 Mocks that mirror the production shape too closely

`pdf.spec.js` mocks both `playwright-core` and `playwright` with identical chromium shapes. That verifies your code *calls Playwright*, not that *Playwright behaves as you expect*. These mocks can diverge from the real package and tests will keep passing while the real code breaks.

**Principle:** test what you don't own by writing a thin adapter you *do* own, then test the adapter against the real library behind an integration flag. Mocks are for isolating the boundary, not for simulating it.

### 4.5 No integration test for `npm run build`

The CI workflow runs `npm run build` and then does `test -f mcclowes_cv.pdf`. That's a smoke test, not an integration test. It doesn't verify:

- Page count (you want 2 pages; a broken build could produce 1 or 17).
- PDF metadata (is `buildPdfMetadata` actually being used? Where's the test?).
- Rendered content (did the "Experience" section make it in? Fonts loaded?).

Running `pdf-parse` / `pdftotext` on the output and asserting substring presence is five lines and would catch regressions that snapshot tests never will.

### 4.6 Coverage thresholds are a lagging indicator

50/60/60/60 looks reasonable. But the uncovered 40% is exactly `createCV.main()` and `generatePdf` error paths — the bits most likely to fail. Coverage thresholds enforce *that* tests exist, not *that the right tests* exist. Don't use the number as a quality proxy.

---

## 5. Edge cases not handled

1. **Page break inside a paragraph.** See §1.1.
2. **Empty markdown file.** `readMarkdownFile` passes `""` to `marked.parse` — you'll get an empty page wrapper. Fine, but untested.
3. **Markdown file with BOM or non-UTF-8 encoding.** `encoding: "utf8"` is hard-coded. A file with a BOM renders an invisible `﻿` as content.
4. **Very long single line** (e.g. a paste mistake of a URL over 2000 chars). CSS `word-break` isn't set; this would blow out the column layout in `newspaper.css`.
5. **Special characters in `meta.name`.** §2.1.
6. **Missing `meta.preview` while `meta.name` is present.** `meta.js:56-57` → crash on `preview.image`.
7. **`cvs` variation with `content` path that doesn't exist.** `fs.readFileSync` throws a stack trace rather than "Hey, check your cv.config.js — `./src/sections/missing.md` doesn't exist".
8. **Unknown style name.** `STYLESHEETS[option] || option` at `readStylesheets.js:21` silently falls back to treating the string as a filesystem path. Typo "cvv" → `ENOENT: no such file or directory, open 'cvv'`. Confusing.
9. **Style array with duplicates.** `["cv", "cv"]` reads the file twice and concatenates the CSS. Harmless, but emblematic of "we never thought about it".
10. **Two variations both `primary: true`.** See §1.5.
11. **Running `npm run build -- foo bar`** where `foo` and `bar` are both non-existent variations. Loop exits on first failure with `process.exit(1)`, so `bar` is never attempted and errors are not aggregated.
12. **Playwright browser install path writable but slow disk** (network FS, Docker bind mount): `networkidle` timeout is not configured; default 30s may not be enough when Google Fonts CDN is slow.
13. **Fonts fail to load** (offline CI, CDN outage): PDF renders with fallback fonts, silently. No check that intended fonts actually rendered.
14. **Monetary or unicode characters in content** (e.g. `£`, `→`): do they survive marked → HTML → PDF? Untested.
15. **Dark-mode preference on website.** `cv.css` has `prefers-color-scheme: dark` overrides, but the `.pdf` scope overrides `background: white !important` — how does that interact with the dark-mode variables? No visual check.
16. **`process.argv.slice(2)` accepts any string.** No validation that the arg is a known variation before proceeding. Error surfaces late inside `validateConfig`.
17. **Two `primary`-flagged builds writing `mcclowes_cv.pdf` in parallel.** Sequential CLI loop avoids this, but nothing in the code enforces it.
18. **`downloadLink` is hardcoded to a GitHub raw URL.** If the repo is renamed or made private, the download link breaks silently on the website with no test coverage.

---

## 6. Dev tooling, CI, dependencies

### 6.1 Babel is carrying its weight for nothing

Node 20 natively handles every feature used in this repo. Babel is present because Jest's current stable line still doesn't run native ESM cleanly. So you pay:

- `@babel/cli`, `@babel/core`, `@babel/node`, `@babel/preset-env`, `babel-jest` in devDependencies.
- `babel-node src/createCV.js` at runtime, which boots Babel's transformation pipeline before your code.
- A `.babelrc` that pins `@babel/preset-env` with no `targets`, meaning Babel transpiles to ES5 for a runtime that speaks ES2022.

**Options:**
- Switch to `vitest` — native ESM, no Babel, faster.
- Or run Node native ESM and use Jest's experimental VM-modules flag.
- At minimum, drop `babel-node` in favor of `node ./src/createCV.js`. The repo runs fine without it.

### 6.2 Unused dependencies

- `merge-md` — not imported anywhere.
- `copyfiles` — not imported, no script references it.
- `lodash` (full) for two uses: `startsWith` + `trim` + `endsWith`. Every one has a native replacement:
  - `lodash.startsWith(str, "<div")` → `str.startsWith("<div")`
  - `lodash.trim(str)` → `str.trim()`
  - `lodash.endsWith(str, "</div>")` → `str.endsWith("</div>")`
  Remove lodash entirely. You're carrying ~70KB of transitive install for three calls that are built into every JavaScript engine since 2015.

### 6.3 `package.json` is wrong or misleading in several places

- `"main": "index.html"` — the `main` field means "the entry point of this package for other packages to require". Pointing it at generated HTML is nonsensical. Either remove the field or point to `src/createCV.js`.
- `"description"` — duplicates the CV introduction verbatim. Should describe the *tool*, not the author.
- `"keywords": ["cv", "pdf"]` — fine but sparse.
- `"version": "3.0.0"` — is this tool actually at v3? Is it versioned at all, or is this leftover from a template? No changelog, no releases on GitHub.
- `"homepage": "https://github.com/mcclowes/CV#readme"` — repo uses capital `CV` in one place (package.json) and lowercase `cv` elsewhere (`downloadLink` in `cv.config.js` uses `cv`). GitHub is case-insensitive for redirects but the inconsistency will confuse tooling and humans.

### 6.4 `.babelrc` vs `babel.config.json`

`.babelrc` is project-local; for monorepos or nested test directories it can fail to apply. For a single-package project it's OK. Mentioned for completeness.

### 6.5 Dependabot config is cargo-culted

`.github/dependabot.yml` ignores `marked@1.2.8` while `package.json` uses `marked@^9.0.3`. The ignore is useless now but still noise. Same for the Babel pins. Clean this up or it will confuse a contributor into thinking these pins are intentional.

### 6.6 `cspell.config.json` has duplicates

`Codat`, `fintech`, `Codogo`, `Akkroo`, `mcclowes`, `fintechs` all appear twice in `words`. No functional impact; a symptom of "append, never review".

### 6.7 Husky `pre-commit` runs `lint-staged`, which runs `eslint --fix` + Prettier + cspell. Good. But:

- No test run pre-push (husky `pre-push` doesn't exist). Broken tests make it to CI before being caught.
- No build check. CV can be broken on main and you won't know until the next conscious rebuild.

### 6.8 CI

`.github/workflows/ci.yml`:

- **No Playwright browser cache.** `npx playwright install chromium --with-deps` on every run. ~30-60s wasted per job. Cache with `actions/cache` keyed on Playwright version.
- **No dependency cache reuse across jobs.** `actions/setup-node@v4` with `cache: "npm"` helps but each job runs `npm ci` fresh. Consider a single "install once, artifact node_modules" job.
- **`npm audit --audit-level=critical`** only gates on critical. One `high`-severity auth bypass in a transitive dep passes silently.
- **No link checker** for the markdown content or the generated HTML.
- **No artifact sanity check beyond file existence.** See §4.5.
- **No deployment step.** The website at `cv.mcclowes.com` is implicitly deployed somewhere; the repo gives no hint how. If that deploy is manual, it's a bus-factor-of-one dependency.

### 6.9 The watch script reloads on every file change

`chokidar './src/**/*' -c 'npm run build' --initial` kicks off a full Playwright PDF generation for every saved file — including markdown, CSS, *and* test files. Playwright startup alone is ~2-3s. Dev loop is slow. Consider debouncing, or splitting into "HTML-only watch" for style iteration.

---

## 7. Documentation drift

### 7.1 TODO.md is stale

Of the items in TODO.md, **at least eight are already done**:

- "Add ESLint" — done (`eslint.config.js` + ESLint 9).
- "Jest coverage and threshold" — done (`jest.config.cjs`).
- "Simplify page break syntax" — done (`PAGE_BREAK_PATTERNS` supports all three).
- "Unit tests for createHtmlPages.js" — done.
- "Unit tests for readStylesheets.js" — done.
- "Config parsing and validation" — done (`validateConfig`).
- "Add ESLint to CI" — done (`ci.yml`).
- "Dependency audit in CI" — done (`ci.yml` security job).
- "Parallel test execution" — partially done (lint/security/test run in parallel jobs).

Either mark these done or rewrite the file. A TODO that lies about state is worse than no TODO — it erodes trust.

### 7.2 `getting_started.md` says `npx playwright install chromium` but the real command that works is the env-var-prefixed one from `pdf/index.js:91`

New contributors following `getting_started.md` will try the canonical command, it will install to the shared Playwright cache, and then `createCV.js` (which overrides `PLAYWRIGHT_BROWSERS_PATH=0`) won't find the browser. This is exactly the kind of "the docs are subtly wrong" friction that wastes hours.

### 7.3 `src/generate/pdf/README.md` claims `playwright-core` is a devDependency

It isn't — `playwright` (full package) is. The runtime code prefers `playwright-core`, but it's not installed. The `getPlaywright` fallback catches the import error and falls through to `playwright`. It all works, but the docs, the code preference, and the actual dependency are three different stories.

### 7.4 CLAUDE.md mentions `npm run format:staged` and Prettier auto-format

Accurate — but CLAUDE.md is ~200 lines of text for a ~300-line codebase. That ratio inverts: the AI-assistant README is bigger than the modules it describes. Consider trimming to a pointer: "Read `src/createCV.js` first, then `src/generate/`. Tests mirror source layout."

---

## 8. Style / code smells

None of these matter individually. They matter because they accumulate.

- **`h2` with `display: flex` set twice** (`cv.css:113` and `:116`). Prettier doesn't catch duplicate properties; Stylelint would.
- **`-webkit-column-*` / `-moz-column-*` prefixes in `newspaper.css`** — unnecessary for any Chromium/Gecko released after ~2018. You're rendering in a modern Chromium you control (Playwright). Drop them.
- **`@page { margin: 0 }`** at `cv.css:214` but Playwright is explicitly invoked with `margin: { top: "0cm", ... }`. Which wins? Whichever runs later. Belt-and-braces is fine; *unintentional* belt-and-braces is confusion.
- **`text-rendering: optimizeLegibility`** applied to both `html`/`body` and `.page` (`cv.css:76, 235`). Redundant.
- **`console.log("Markdown options:", markdownOptions)`** in `readMarkdownFile.js:25` — spammy. Strip or put behind a `DEBUG` flag.
- **`console.log("Creating PDF with options:", pdfOptions)`** in `pdf/index.js:111` logs the full options including the output path. Fine today; a different deployment might consider `path` sensitive.
- **Doc-comments use JSDoc syntax** in `createCV.js` but not in `pdf/index.js` or `html/index.js`. Pick one style or, since the stated preference is TypeScript, plan the migration.
- **Inconsistent quoting in templates** — the large HTML string in `index.js:48-85` mixes tabs and spaces for indentation. This survives Prettier because it's inside a template literal. Extract to a separate HTML file and stop caring.
- **`\page` as a custom control character** requires cspell/escape/regex-safe treatment in every new parser. The fact that you already introduced *three* page-break syntaxes is the tell — you know it's fragile. Commit to one new syntax (`<!-- PAGE_BREAK -->`), mark the other two `@deprecated`, and plan their removal.
- **ISO dates would be more sortable** in the markdown content (e.g. `_2021-03 - 2021-11_`). Today the markdown is human-date prose. Fine for a CV, but content machine-readability is a nice-to-have for the JSON-LD you already emit.

---

## 9. What I'd actually do first (prioritised)

Treat this as the sequence I'd push through in a sprint, in order of "highest value per effort":

1. **Separate computation from I/O in `generateHtml`.** Fixes §1.2 (tests writing to disk), §3.1 (SRP violation), and makes everything else easier to test.
2. **Fix the page-break pipeline.** Split on markdown *before* rendering. Adds a failing test for the `<p></div>` case, watch it go green. Fixes §1.1.
3. **Escape HTML interpolation in `meta.js` and `buildHtml`.** Three one-line helpers. Fixes §2.1, §2.2.
4. **Stop committing build artifacts.** Move to `dist/`, gitignore, serve from CI. Removes entire categories of merge conflicts and diff noise.
5. **Replace snapshot tests with DOM assertions.** Use `cheerio`. Changes take 30-60 min. Pays back on every future CSS / template change.
6. **Remove unused deps** (`merge-md`, `copyfiles`, `lodash`) and the Babel toolchain (migrate to native ESM + Vitest).
7. **Validate `cv.config.js` with a schema at load time.** Pick `zod`. Catches typos, bad paths, duplicate `primary`.
8. **Reconcile TODO.md with reality.** 15 minutes. High trust gain.
9. **Clean up `package.json`** (`main`, `description`, `dependabot.yml` ignores).
10. **Add CI: Playwright cache, `pdftotext` content check, link checker.**

Everything else is polish.

---

## 10. Lessons for junior engineers, extracted

Each of these is a pattern worth remembering independently of this codebase:

1. **"Works in prod" is not "works."** Your snapshot test froze malformed HTML as correct. The browser forgave it. The next consumer won't.
2. **Separate pure from effectful code.** The moment you can't run a function in a test without mocking the filesystem, the function is doing too much.
3. **Global mutation at import time is a bug.** If your module does something just by being `require`d, reconsider.
4. **Operate on structured data, not serialised strings.** Splitting HTML with regex, JSON with `substring`, SQL with `replace` — all bugs waiting to surface.
5. **Escape at the boundary, not in the middle.** Every `${x}` inside HTML is a promise that `x` is HTML-safe. Back that promise up with an escape function or a template engine.
6. **Snapshot tests are memoisation, not verification.** They catch *changes*, not *mistakes*. Prefer assertions over properties.
7. **Tests must be hermetic.** If `npm test` changes files in your repo, the tests are wrong, not the reviewer who didn't notice.
8. **Silent fallbacks are debugging hell.** If behavior degrades, log it.
9. **Documentation lies by default.** If your TODO says "add ESLint" and ESLint is already added, a reader now distrusts everything else. Treat docs like code: reviewed, tested (via CI lint rules), updated in the same PR as behavior.
10. **Dependency hygiene.** Every devDependency you carry is a vulnerability and an install-time cost. Before adding a lib: is there a native equivalent? Before keeping a lib: grep for usage.
11. **Committed generated files are a smell.** They create merge conflicts, noisy diffs, and a coupling between "did you rebuild?" and "did you mean to push this?"
12. **Invariants must be enforced, not hoped for.** "Nobody will set two CVs as primary" is a test, a lint rule, or a validation — not a comment.

---

*End of review. None of the findings above represent existential problems for a personal CV tool. Most are free lessons at very low cost. Treat the code as a training ground and this document as a practice problem set.*
