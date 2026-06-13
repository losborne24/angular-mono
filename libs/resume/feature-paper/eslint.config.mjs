import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';
import angularConfig from '../../../eslint.angular.config.mjs';

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
];
