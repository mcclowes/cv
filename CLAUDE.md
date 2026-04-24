# CLAUDE.md

This document provides guidance for AI assistants working with this codebase.

## Project Overview

This is a **CV/Resume generator** that converts Markdown content into styled HTML and PDF outputs. The project generates Max Clayton Clowes' CV from Markdown source files using custom CSS styling and Playwright for PDF generation.

**Repository**: https://github.com/mcclowes/CV
**Website**: https://cv.mcclowes.com/

## Tech Stack

- **Runtime**: Node.js 20 (see `.nvmrc`)
- **Module System**: ES Modules (`"type": "module"` in package.json)
- **Build Tool**: Babel with `@babel/preset-env`
- **Testing**: Jest with snapshot testing
- **PDF Generation**: Playwright (Chromium)
- **Markdown Processing**: `marked` library
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier
- **Spell Checking**: cspell (configured for en-US)
- **Git Hooks**: Husky + lint-staged

## Project Structure

```
cv/
├── src/
│   ├── createCV.js              # Main entry point
│   ├── __tests__/               # Top-level Jest tests (createCV.spec.js)
│   ├── generate/
│   │   ├── html/                # HTML generation logic
│   │   │   ├── index.js         # Main HTML generator
│   │   │   ├── readMarkdownFile.js
│   │   │   ├── readStylesheets.js
│   │   │   ├── createHtmlPages.js
│   │   │   ├── meta.js          # SEO/meta tag generation
│   │   │   └── __tests__/       # Jest tests with snapshots
│   │   └── pdf/
│   │       ├── index.js         # PDF generation using Playwright
│   │       ├── README.md        # PDF module notes
│   │       └── __tests__/       # Jest tests
│   ├── sections/                # CV content in Markdown
│   │   ├── _template.md         # Section template / schema reference
│   │   ├── header/              # main.md, main-markdown.md
│   │   ├── introduction/        # main.md, main-markdown.md
│   │   ├── experience/          # experience.md, experience-full.md, problems.md
│   │   ├── education.md
│   │   ├── awards.md
│   │   ├── skills/              # product.md, productnew.md
│   │   └── aboutme.md
│   └── styles/                  # CSS stylesheets
│       ├── cv.css
│       └── newspaper.css
├── assets/                      # Static assets (preview image, etc.)
├── cv.config.js                 # CV configuration (content, meta, options)
├── jest.config.cjs              # Jest config incl. coverage thresholds
├── eslint.config.js             # ESLint 9 flat config
├── cspell.config.json           # Spellcheck config + custom words
├── getting_started.md           # Setup / build quickstart guide
├── TODO.md                      # Project roadmap
├── index.html                   # Generated website output
├── debug.html                   # Generated debug view
├── mcclowes_cv.pdf              # Generated PDF output
└── README.md                    # Generated from CV content
```

## Key Commands

```bash
# Install dependencies
npm install

# Install Playwright browsers (required for PDF generation)
npx playwright install chromium

# Build the CV (generates PDF, HTML, README)
npm run build

# Watch mode - rebuilds on changes to src/
npm run watch

# Run tests
npm test
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage

# Linting and formatting
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
npm run format         # Format all src/ with Prettier
npm run format:staged  # Prettier on staged files only (via pretty-quick)
npm run spellcheck     # Check markdown spelling

# Validation (lint + test)
npm run validate
```

## Development Workflow

### Building the CV

1. Edit Markdown files in `src/sections/`
2. Adjust styling in `src/styles/`
3. Configure output in `cv.config.js`
4. Run `npm run build`

The build process:
1. Reads Markdown files specified in `cv.config.js`
2. Converts Markdown to HTML using `marked`
3. Applies CSS styles
4. Generates three outputs:
   - `index.html` - Web version (if `website: true`)
   - `debug.html` - Debug view (if `debug: true`)
   - `mcclowes_cv.pdf` - PDF version

### Configuration (`cv.config.js`)

The config file defines:
- `defaults`: Default options (debug, website, primary flags)
- `meta`: SEO metadata (name, description, preview image, URL)
- `cvs`: CV variants with content arrays and style overrides

### Git Hooks

Pre-commit hooks run automatically via Husky:
- ESLint with auto-fix on `.js` files
- Prettier formatting
- cspell on `.md` files

## Code Conventions

### JavaScript

- ES Modules syntax (`import`/`export`)
- Arrow functions preferred
- Unused variables prefixed with `_` (e.g., `_options`)
- Always use `===` (strict equality)
- Always use curly braces for conditionals
- Use `const` over `let` when possible

### Testing

- Tests located in `__tests__/` directories
- Use `.spec.js` suffix
- Snapshot testing for HTML output
- Test files have access to Jest globals (`describe`, `it`, `expect`, etc.)

### Markdown Content

- American English spelling (en-US)
- Custom words added to `cspell.config.json`
- HTML can be embedded in Markdown for custom styling

## CI/CD Pipeline

Two GitHub Actions workflows live in `.github/workflows/`:

- **`ci.yml`** — runs on push/PR to `main`:
  1. **Lint**: ESLint + spellcheck
  2. **Security**: `npm audit --audit-level=critical`
  3. **Test**: Jest with coverage (thresholds enforced); uploads coverage artifact
  4. **Build**: Generate CV artifacts and verify `mcclowes_cv.pdf` + `index.html` exist (needs lint + test green); uploads the CV as a build artifact
- **`spellcheck.yml`** — runs on PRs that touch `.md` files (and via `workflow_dispatch`): installs cspell, checks changed Markdown files, and posts results as a PR comment.

Both workflows use concurrency groups keyed on workflow + ref to cancel in-progress runs on new pushes.

Coverage thresholds (from `jest.config.cjs`):
- Branches: 50%
- Functions: 60%
- Lines: 60%
- Statements: 60%

## Common Tasks for AI Assistants

### Adding New Content Sections

1. Create new `.md` file in `src/sections/`
2. Add file path to `cv.config.js` in the `content` array
3. Style with existing CSS or add to `src/styles/`

### Modifying Styles

- Edit `src/styles/cv.css` or `src/styles/newspaper.css`
- The `debug.html` file helps preview changes without regenerating PDF
- Styles support print-specific media queries for PDF output

### Updating Tests

- Run `npm test -- -u` to update snapshots after intentional changes
- Add new test cases to existing `.spec.js` files
- Mock external dependencies where needed

### Adding Custom Words to Spellcheck

Edit `cspell.config.json` and add words to the `"words"` array.

## Important Notes

- The `README.md` is **auto-generated** from CV content - don't edit directly
- `index.html` and `debug.html` are also generated outputs
- The PDF file (`mcclowes_cv.pdf`) is committed to the repo for easy download
- Playwright requires Chromium browser to be installed for PDF generation
