import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  eslintConfigPrettier,
]);
