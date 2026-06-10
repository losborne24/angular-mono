import { DAISYUI_THEMES } from '../../libs/shared/util/src/lib/constants/daisyui-constants';
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cambria', 'serif'],
        mono: ['Menlo', 'monospace'],
        sans: ['Helvetica', 'sans-serif'],
      },
    },
  },
  // Safelist classes used dynamically in Angular templates.
  // Prevents Tailwind from purging these classes during build
  // since they are constructed dynamically (e.g., 'font-mono', 'font-sans').
  safelist: ['font-sans', 'font-serif', 'font-mono'],
  plugins: [require('daisyui'), require('tailwind-scrollbar')],
  daisyui: {
    themes: DAISYUI_THEMES,
  },
};
