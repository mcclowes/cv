# TODO: CV Generator Improvements

A roadmap for making this CV generator more effective, beautiful, and reliable.

---

## 🎯 Priority Legend

- 🔴 **High** - Significant impact, should tackle first
- 🟡 **Medium** - Important but not blocking
- 🟢 **Low** - Nice to have, polish items

---

## 📝 Content & Writing Experience

### Make CV Writing Easier

- [x] 🔴 **Add a CV content schema/template** - Create `src/sections/_template.md` with documented structure showing available classes, page breaks, and formatting options
- [ ] 🔴 **Create content validation** - Script to validate markdown files exist, check for broken internal references, and warn about missing sections
- [ ] 🟡 **Add more section templates** - Pre-built templates for common sections (Projects, Publications, Certifications, Languages, Volunteering)
- [x] 🟡 **Simplify page break syntax** - `\page`, `<!-- PAGE_BREAK -->`, and `---PAGE---` all supported
- [ ] 🟡 **Add content linting** - Validate markdown structure (e.g., ensure headers are consistent, dates are formatted correctly)
- [ ] 🟢 **Create a content style guide** - Document best practices for writing compelling CV content

### Better Preview Experience

- [ ] 🔴 **Improve live reload** - Current watch mode could be enhanced with browser-sync or Vite dev server for instant preview
- [ ] 🟡 **Side-by-side markdown editor preview** - Simple web UI to edit markdown and see live HTML preview
- [ ] 🟡 **Add PDF preview in browser** - Embed PDF viewer in debug.html for comparing HTML vs PDF output
- [ ] 🟢 **Hot module replacement for styles** - CSS changes should reflect instantly without full rebuild

---

## 🎨 Themes & Styling

### New Themes

- [ ] 🟡 **Create additional themes:**
  - [ ] `minimal.css` - Ultra-clean, lots of whitespace
  - [ ] `modern.css` - Contemporary design with accent colors
  - [ ] `classic.css` - Traditional resume look
  - [ ] `compact.css` - Dense layout for maximum content
- [ ] 🟡 **Theme preview gallery** - HTML page showing same content in all available themes
- [ ] 🟢 **Custom color scheme support** - Allow config to override CSS variables for quick brand customization

### Styling Improvements

- [ ] 🟡 **Improve print styles** - Better page break handling to avoid orphaned headers
- [ ] 🟡 **Add responsive breakpoints** - Better mobile viewing experience for web version
- [ ] 🟢 **Icon system** - Create consistent SVG icon set for section headers (currently inline SVGs in markdown)
- [ ] 🟢 **Font configuration** - Easy way to swap Google Fonts via config without editing CSS

---

## 🏗️ Codebase Quality

### TypeScript Migration

- [ ] 🟡 **Migrate to TypeScript** - Add type safety for better maintainability
  - [ ] Add `tsconfig.json` with strict settings
  - [ ] Convert `cv.config.js` to typed config with JSDoc or TypeScript
  - [ ] Migrate core modules: `createCV.js`, `generate/html/index.js`, `generate/pdf/index.js`
  - [ ] Add types for config schema

### Testing Improvements

- [ ] 🔴 **Add PDF generation tests** - Verify PDF is generated and has expected page count
- [ ] 🔴 **Add integration test** - Full build pipeline test ensuring all outputs are created
- [ ] 🟡 **Visual regression tests** - Screenshot comparison for HTML output using Playwright
- [x] 🟡 **Add unit tests for:**
  - [x] `createHtmlPages.js` - Page splitting logic
  - [x] `readStylesheets.js` - Style loading
  - [x] Config parsing and validation
- [x] 🟡 **Page-break regression test** - Splitting happens at markdown level, not on rendered HTML
- [x] 🟢 **Test coverage reporting** - Jest coverage thresholds live in `jest.config.cjs`

### Code Quality

- [x] 🟡 **Add ESLint** - Enforce consistent code style alongside Prettier
- [x] 🟡 **HTML-escape config interpolations** - `meta.js`, JSON-LD, and download link sanitized via `src/generate/html/escape.js`
- [ ] 🟡 **Error handling improvements:**
  - [ ] Better error messages when markdown files are missing
  - [ ] Graceful handling of Playwright failures with helpful debugging info
  - [x] Validate config schema on startup (at-most-one primary variation enforced)
- [ ] 🟢 **Add JSDoc comments** - Document public functions for better IDE support
- [ ] 🟢 **Extract constants** - Move magic strings (file paths, CSS class names) to constants file

---

## 🔄 CI/CD Improvements

### Enhanced CI Pipeline

- [ ] 🔴 **Add CI caching** - Cache Playwright browsers between runs (currently installs fresh each time)
- [x] 🔴 **Parallel test execution** - Lint, security and test run as separate CI jobs
- [ ] 🟡 **Add build matrix** - Test on multiple Node.js versions (18, 20, 22)
- [ ] 🟡 **PR preview deployments** - Auto-deploy preview of CV to Vercel/Netlify on PRs
- [ ] 🟡 **PDF size monitoring** - Track PDF file size in CI, alert if it grows unexpectedly
- [ ] 🟢 **Add build timing** - Report how long PDF generation takes

### New CI Checks

- [ ] 🔴 **Enforce tests pass before merge** - Add branch protection rules
- [ ] 🟡 **Lighthouse CI** - Audit web version for performance, accessibility, SEO
- [ ] 🟡 **Link checker** - Verify all URLs in CV content are valid
- [x] 🟡 **Add ESLint to CI** - Lint job runs in `ci.yml`
- [x] 🟢 **Dependency audit** - `npm audit --audit-level=critical` runs in `ci.yml`
- [ ] 🟢 **Bundle size tracking** - Monitor node_modules size over time

### Deployment & Release

- [ ] 🟡 **Automated releases** - GitHub Actions workflow to create releases with PDF attached
- [ ] 🟡 **Auto-deploy web version** - Deploy index.html to GitHub Pages or Vercel on main push
- [ ] 🟢 **Changelog generation** - Auto-generate changelog from conventional commits
- [ ] 🟢 **Version bumping** - Automated version bump on release

---

## 🛠️ Developer Experience

### Setup & Onboarding

- [ ] 🔴 **Add dev container config** - `.devcontainer/` for consistent dev environment with Playwright pre-installed
- [ ] 🟡 **Improve getting_started.md:**
  - [ ] Add troubleshooting section for common Playwright issues
  - [ ] Document all npm scripts with examples
  - [ ] Add architecture diagram
- [ ] 🟡 **Add Makefile or task runner** - Common commands like `make build`, `make test`, `make preview`
- [ ] 🟢 **Add VS Code workspace settings** - Recommended extensions, formatting config

### CLI Improvements

- [ ] 🟡 **Better CLI interface:**
  - [ ] `npm run build -- --theme minimal` - Build with specific theme
  - [ ] `npm run build -- --output ./dist/` - Custom output directory
  - [ ] `npm run build -- --all` - Build all CV variations
  - [ ] `npm run build -- --watch` - Watch mode flag
- [ ] 🟡 **Add build summary** - After build, show: files generated, PDF page count, file sizes
- [ ] 🟢 **Progress indicator** - Show build progress for PDF generation (can be slow)

---

## 📦 Features & Enhancements

### New Output Formats

- [ ] 🟡 **Word document export** - Generate .docx using pandoc or similar
- [ ] 🟡 **JSON resume export** - Output in JSON Resume standard format for interoperability
- [ ] 🟢 **Plain text version** - ASCII-friendly version for email/text applications

### Content Features

- [ ] 🟡 **Multi-language support** - Structure for maintaining CV in multiple languages
- [ ] 🟡 **Date formatting options** - Configure date format (US vs UK, full vs abbreviated)
- [ ] 🟢 **QR code generation** - Auto-generate QR code linking to web version
- [ ] 🟢 **Analytics tracking** - Optional analytics for web version to track views

### Configuration Enhancements

- [ ] 🟡 **Environment-based config** - Load different configs for dev/prod
- [ ] 🟡 **Config inheritance** - CV variations can extend base config instead of duplicating
- [ ] 🟢 **Config validation with JSON schema** - IDE autocomplete for cv.config.js

---

## 🐛 Known Issues to Fix

- [ ] 🟡 **Nested markdown processing** - Currently only works for `<div>` wrappers; extend to other HTML elements
- [x] 🟡 **Remove legacy devDependencies** - `fs` and `path` listed but are Node.js built-ins
- [x] 🟡 **Remove unused deps** - `lodash`, `merge-md`, `copyfiles` removed
- [x] 🟡 **Fix page-break corruption** - Page splits now happen at markdown level, preventing malformed `<p></div>` output
- [x] 🟡 **Hermetic tests** - `renderHtmlBundle` is pure; tests no longer write files into the project root
- [ ] 🟢 **Pre-commit hook enforcement** - Make CV rebuild mandatory, not just a reminder

---

## 📊 Metrics & Quality Gates

### Targets to Set

- [ ] Test coverage: **80%+**
- [ ] Lighthouse performance: **90+**
- [ ] Lighthouse accessibility: **100**
- [ ] Build time: **< 10 seconds**
- [ ] PDF size: **< 500KB**

---

## 🚀 Quick Wins (Start Here!)

If you're looking to contribute, these are high-impact, low-effort improvements:

1. **Add Playwright browser caching to CI** - Speeds up CI significantly
2. **Add ESLint** - One-time setup, ongoing benefits
3. **Create section template** - Helps new users understand the format
4. **Add integration test** - Catch build failures automatically
5. **Parallel CI jobs** - Faster feedback on PRs

---

## Contributing

Pick an item, create a branch, and submit a PR! For larger items, open an issue first to discuss the approach.
