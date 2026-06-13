import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import angularConfig from '../../eslint.angular.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...angularConfig,
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
  {
    // tailwind.config.js is loaded by postcss via node require, which ignores
    // tsconfig path aliases — it must use a relative import into the lib.
    files: ['**/tailwind.config.js'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
