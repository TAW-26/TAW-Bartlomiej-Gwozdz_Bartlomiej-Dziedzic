/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/__tests__/setup.env.ts"],
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  testTimeout: 10000,
  clearMocks: true,
};
