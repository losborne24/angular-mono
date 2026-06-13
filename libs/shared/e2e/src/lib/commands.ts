/// <reference types="cypress" />

// Generic Cypress custom commands shared across every `*-e2e` app. Importing
// this module registers the commands and augments the `Chainable` interface.
// App-specific commands (page objects, auth helpers) stay in each app's own
// `support/commands.ts`.

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Select an element by its `data-cy` hook: `cy.dataCy('paper-container')`. */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Select by the dedicated `data-cy` test hook — decouples specs from styling
// classes and UI copy.
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy="${value}"]`);
});
