import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        ignores: ["test/bundle.js"],
    },
    {
        files: ["src/**/*.js", "test/**/*.js"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            globals: {
                ...globals.browser,
                chrome: "readonly",
                browser: "readonly",
                Codeforces: "readonly",
                globalThis: "readonly",
                process: "readonly",
                MathJax: "readonly",
                GM_addStyle: "readonly",
                unsafeWindow: "readonly",
                sidebar: "readonly",
                __dirname: "readonly",
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                pragma: "dom.element",
                version: "16.0",
            },
        },
        rules: {
            "no-var": "warn",
            "prefer-const": "warn",
            "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
            semi: ["warn", "always"],
            quotes: ["warn", "single", { avoidEscape: true }],
            indent: ["warn", 4, { SwitchCase: 1 }],
            "comma-dangle": ["warn", "always-multiline"],
            "eol-last": ["warn", "always"],
            "no-trailing-spaces": "warn",
            "no-multiple-empty-lines": ["warn", { max: 1, maxEOF: 1 }],
            eqeqeq: ["warn", "always", { null: "ignore" }],
            "no-console": "off",
            "no-undef": "error",
            "no-dupe-keys": "error",
            "no-duplicate-case": "error",
            "no-empty": ["warn", { allowEmptyCatch: true }],
            "no-extra-semi": "warn",
            "no-irregular-whitespace": "error",
            "no-unreachable": "warn",
            "no-useless-assignment": "off",
            "valid-typeof": "error",
            "use-isnan": "error",
        },
    },
];
