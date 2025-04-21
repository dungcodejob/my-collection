// @ts-check
const eslint = require("@eslint/js");
const tsEslint = require("typescript-eslint");
const angular = require("angular-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = tsEslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tsEslint.configs.recommended,
      ...tsEslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintPluginPrettierRecommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
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

      // "@angular-eslint/directive-selector": [
      //   "error",
      //   {
      //     type: "attribute",
      //     prefix: "app",
      //     style: "camelCase",
      //   },
      // ],
      "no-console": ["error", { allow: ["warn", "error"] }],

      "rxjs/no-implicit-any-catch": "warn",
      "rxjs/no-nested-subscribe": "warn",
      "rxjs/throw-error": "warn",
      "rxjs/no-unsafe-subject-next": "warn",

      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      // ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
      "@angular-eslint/template/label-has-associated-control": "off",
    },
  }
);
