import ngEslint from "@angular-eslint/eslint-plugin";
import ngTemplate from "@angular-eslint/eslint-plugin-template";
import ngParser from "@angular-eslint/template-parser";
import nx from "@nx/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
    ignores: ["**/dist"],
  },

  {
    ignores: [".angular/**", ".nx/**", "coverage/**", "dist/**"],
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
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
    ignores: [".angular/**", ".nx/**", "coverage/**", "dist/**"],
    files: ["**/*.ts"],
    // processor: ngEslint.processInlineTemplates,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.base.json",
      },
    },
    plugins: {
      "@angular-eslint": ngEslint,
    },
    rules: {
      ...tseslint.configs.stylistic.rules,
      ...tseslint.configs.recommended.rules,
      ...ngEslint.configs.recommended.rules,
      // ...esImport.configs.errors.rules,
      // Angular
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: ["attribute", "element"], prefix: "app", style: "kebab-case" },
      ],

      "@angular-eslint/no-empty-lifecycle-method": "warn",
      "@angular-eslint/prefer-on-push-component-change-detection": "warn",
      "@angular-eslint/prefer-output-readonly": "warn",
      "@angular-eslint/prefer-signals": "warn",
      "@angular-eslint/prefer-standalone": "warn",
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
      "@angular-eslint/no-input-rename": "off",
      // TS best practices
      "@typescript-eslint/explicit-function-return-type": ["error"],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "no-public" },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/dot-notation": ["error"],
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/array-type": ["warn"],
      "@typescript-eslint/consistent-type-assertions": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],

      // JS
      eqeqeq: "error",
      curly: "error",
      "max-len": ["warn", { code: 120, comments: 160 }],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
    },
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint/template": ngTemplate,
    },
    languageOptions: {
      parser: ngParser,
    },
    rules: {
      ...ngTemplate.configs.recommended.rules,
      ...ngTemplate.configs.accessibility.rules,
      ...eslintConfigPrettier.rules,
      // Angular template best practices
      "@angular-eslint/template/attributes-order": [
        "error",
        {
          alphabetical: true,
          order: [
            "STRUCTURAL_DIRECTIVE", // deprecated, use @if and @for instead
            "TEMPLATE_REFERENCE", // e.g. <input #inputRef>
            "ATTRIBUTE_BINDING", // e.g. <input required>, id="3"
            "INPUT_BINDING", // e.g. [id]="3", [attr.colspan]="colspan",
            "TWO_WAY_BINDING", // e.g. [(id)]="id",
            "OUTPUT_BINDING", // e.g. (idChange)="handleChange()",
          ],
        },
      ],
      "@angular-eslint/template/button-has-type": "warn",
      "@angular-eslint/template/cyclomatic-complexity": ["warn", { maxComplexity: 10 }],
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/prefer-control-flow": "error",
      "@angular-eslint/template/prefer-ngsrc": "warn",
      "@angular-eslint/template/prefer-self-closing-tags": "warn",
      "@angular-eslint/template/use-track-by-function": "warn",
    },
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.cts",
      "**/*.mts",
      "**/*.js",
      "**/*.jsx",
      "**/*.cjs",
      "**/*.mjs",
    ],
    plugins: {
      prettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      "prettier/prettier": "error",
    },
  },
];
