module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    './{routes,utils}/*.js'
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  verbose: true
};
