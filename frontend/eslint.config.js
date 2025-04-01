import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  { ignores: ["dist", "node_modules", "eslint.config.js"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "react-x": reactX,
      "react-dom": reactDom,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Allow @ts-ignore comments
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-ignore": false,
          "ts-nocheck": "allow-with-description",
          "ts-expect-error": "allow-with-description",
          minimumDescriptionLength: 3,
        },
      ],
    },
  }
);
