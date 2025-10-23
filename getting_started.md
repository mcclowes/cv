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

### Watch / Live Reload

For a local development server with live reload, run:

```bash
npm run start
```

This starts Vite on <http://localhost:5173>. Any changes under `src/` trigger an automatic rebuild and browser refresh.

## Multiple CV Configurations

The project can build several CV variants in one pass. Add configuration files under `src/createCV` and export them in `src/createCV/index.ts`.

Run the build with the names of the CVs you want to generate:

```bash
npm run build -- engineering product design
```

Each name corresponds to an exported configuration. If no extra arguments are provided, the default CV is built.

## Troubleshooting

- Delete `node_modules` and run `npm install` again if dependency issues arise.
- Use `npm run lint` to catch TypeScript or formatting problems before committing.

With these commands you should be ready to customise and publish updated CVs.
