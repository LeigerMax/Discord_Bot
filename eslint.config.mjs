import js from "@eslint/js";
import globals from "globals";

export default [
  // Configuration de base pour tous les fichiers JS
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",  // console.log autorisé pour un bot
    },
  },
  // Configuration spécifique pour les fichiers de test
  {
    files: ["**/*.test.js", "**/__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,  // Ajoute les globals Jest (describe, test, expect, etc.)
      },
    },
  },
];
