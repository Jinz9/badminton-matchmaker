module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleNameMapper: {
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1"
  },
  verbose: true,
  collectCoverageFrom: [
    "src/domain/**/*.ts",
    "!src/domain/**/*.d.ts"
  ]
};
