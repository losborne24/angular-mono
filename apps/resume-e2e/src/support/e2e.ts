// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

// "ResizeObserver loop completed with undelivered notifications" is a benign
// browser notification (not a real error): the paper toolbar's ResizeObserver
// reads layout and writes a signal, which nudges layout within the same
// delivery cycle. It surfaces only under slower headless CI, where Cypress
// would otherwise fail every test. Swallow it; rethrow everything else.
Cypress.on('uncaught:exception', (err) => {
  if (/ResizeObserver loop/.test(err.message)) return false;
  return true;
});
