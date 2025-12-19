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
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 50,
      lines: 40,
      statements: 40,
    },
  },
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/*.spec.js", "**/*.test.js"],
  verbose: true,
};
