/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    "eslint-config-turbo",
    "plugin:import/recommended",
  ],
  plugins: ["import", "prettier"],
  env: {
    node: true,
    es2021: true, // Or "es6": true, but es2021 is more current
  },
  parserOptions: {
    ecmaVersion: 12, // Equivalent to ES2021, adjust as needed
    sourceType: "module", // Essential for ES module syntax
  },
  ignorePatterns: [
    // Ignore dotfiles
    "node_modules/",
    "dist/",
  ],
  rules: {
    "import/no-unresolved": "error",
  },
};
