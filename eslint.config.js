"use strict";

const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

const regrasRecomendadas = {
  ...js.configs.recommended.rules,
  "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
};

module.exports = [
  {
    ignores: ["assets/**", "propostas-ilustracoes/**", ".webp-convert-*/**", ".taste-skill/**"],
  },
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
    rules: regrasRecomendadas,
  },
  {
    files: ["tests/**/*.cjs", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: regrasRecomendadas,
  },
  prettier,
];
