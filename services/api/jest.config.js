export default {
  testEnvironment: "node",
  setupFilesAfterEnv: [
    "<rootDir>/../../packages/db/src/db-test-setup.js",
    "<rootDir>/../../packages/db/src/db-teardown.js",
    "./src/__test__/utils/server-teardown.js",
  ],
  transform: {},
};
