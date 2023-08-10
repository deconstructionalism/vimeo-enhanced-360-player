/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/src/test-utils/'],
  coveragePathIgnorePatterns: ['/src/test-utils/'],
};