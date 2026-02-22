import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
    eslintPluginPrettierRecommended,
    eslint.configs.recommended,
    ...tseslint.configs.recommended, // Add TypeScript support
    pluginReact.configs.flat.recommended,
    {
        files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'], // Add .ts and .tsx files
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                process: 'readonly',
            },
        },
    },
    {
        ignores: ['utils', 'middleware.js', 'icons', '.next', 'public'],
    },
    {
        rules: {
            'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 0,
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                    singleQuote: true,
                    trailingComma: 'all',
                    semi: false,
                    printWidth: 100,
                    tabWidth: 4,
                },
            ],
        },
    },
    {
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    prettier,
]

