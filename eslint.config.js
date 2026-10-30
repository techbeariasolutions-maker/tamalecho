import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'test-results', 'playwright-report', 'blob-report']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // ESLint 9 no reconoce como «usado» un componente que solo aparece en JSX;
      // por eso se ignoran los nombres que empiezan con mayúscula.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['src/**/*.{js,jsx}', 'tests/unit/**/*.{js,jsx}', 'tests/setup.js'],
    extends: [jsxA11y.flatConfigs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.config.js', 'scripts/**/*.mjs', 'api/**/*.js', 'server/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Las E2E corren en Node, pero el código dentro de page.evaluate corre en el navegador.
    files: ['tests/e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
]);
