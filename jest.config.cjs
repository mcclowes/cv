module.exports = {
  transform: {
    "^.+\\.js?$": "babel-jest",
    "^.+\\.md?$": "markdown-loader-jest",
  },
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/__tests__/**",
    "!src/**/*.spec.js",
    "!src/**/*.test.js",
    // Exclude files that require complex mocking (Playwright, process.argv)
    // These would need Jest 28+ ESM mocking or module refactoring
    "!src/createCV.js",
    "!src/generate/pdf/index.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Per-file thresholds for tested modules
    "src/generate/html/*.js": {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/*.spec.js", "**/*.test.js"],
  verbose: true,
};
