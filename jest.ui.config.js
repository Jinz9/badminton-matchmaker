module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/test/components"],
  testMatch: ["**/*.test.tsx"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^expo-modules-core$": "<rootDir>/node_modules/expo/node_modules/expo-modules-core",
    "^expo-modules-core/(.*)$": "<rootDir>/node_modules/expo/node_modules/expo-modules-core/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
  },
};
