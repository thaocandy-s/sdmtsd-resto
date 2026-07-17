/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve("./base"),
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
};
