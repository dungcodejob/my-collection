const nx = require("@nx/eslint-plugin");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],

  {
    ignores: ["**/dist"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?js$"],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "property",
          modifiers: ["private"],
          format: ["camelCase"],
          leadingUnderscore: "require",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "class",
          format: ["PascalCase"],
        },
        // {
        //   selector: "variable",
        //   format: ["camelCase"],
        //   modifiers: ["const"],
        //   leadingUnderscore: "forbid",
        //   trailingUnderscore: "forbid",
        // },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    // Override or add rules here
    languageOptions: {
      parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
        project: ["./tsconfig.base.json"],
        tsconfigRootDir: __dirname, // or import.meta.dirname for ESM
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-floating-promises": "error",
      // "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/unbound-method": "error",

      "@typescript-eslint/member-ordering": "error",
      "@typescript-eslint/no-empty-function": "error",

      // "@angular-eslint/no-empty-lifecycle-method": "error",
    },
  },
  {
    files: ["**/*.json"],

    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"] },
      ],
    },
    languageOptions: { parser: require("jsonc-eslint-parser") },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs}"],
        },
      ],
    },
    languageOptions: {
      parser: require("jsonc-eslint-parser"),
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
];
