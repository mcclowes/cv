# CV Project – Getting Started

This guide walks you through installing dependencies, building the site, and working with multiple CV configurations.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later is recommended)
- npm (bundled with Node.js)

Check your versions:

```bash
node --version
npm --version
```

## Installation

1. Install dependencies.
   ```bash
   npm install
   ```
2. Optionally run the build right away to verify everything compiles.
   ```bash
   npm run build
   ```

## Development Tasks

### Build

Generate the static CV output:

```bash
npm run build
```

### Watch Mode

For automatic rebuilds during development, run:

```bash
npm run watch
```

This watches the `src/` directory and rebuilds the CV when files change.

## Configuration

The project configuration is in `cv.config.js`. You can customize:
- CV content sections (markdown files)
- Stylesheet themes
- Output options (PDF, HTML, debug mode)

## Troubleshooting

- Delete `node_modules` and run `npm install` again if dependency issues arise.
- Use `npm run lint` to catch JavaScript or formatting problems before committing.
- If PDF generation fails, ensure Playwright browsers are installed: `npx playwright install chromium`

With these commands you should be ready to customize and publish updated CVs.
