import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    // Ignore vendor-generated Pagefind assets in the docs public folder.
    ignores: ["public/_pagefind/**"],
  },
];
