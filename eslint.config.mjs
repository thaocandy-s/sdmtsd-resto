import type { Linter } from "eslint";

const config: Linter.Config = {
  ignores: ["node_modules/", ".next/", ".turbo/", "dist/"],
};

export default config;
