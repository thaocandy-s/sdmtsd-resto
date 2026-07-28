/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: ["**/node_modules/", "**/.next/", "**/.turbo/", "**/dist/"],
  },
];

export default config;
