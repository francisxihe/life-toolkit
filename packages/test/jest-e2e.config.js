module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@life-toolkit/vo/(.*)$': '<rootDir>/../../packages/vo/$1',
    '^@life-toolkit/vo$': '<rootDir>/../../packages/vo',
    '^@life-toolkit/api/(.*)$': '<rootDir>/../../packages/api/$1',
  },
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest-e2e.setup.ts'],
};
