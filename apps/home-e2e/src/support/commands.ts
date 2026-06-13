/// <reference types="cypress" />

// Generic commands (e.g. `cy.dataCy`) live in the shared e2e lib so every
// `*-e2e` app shares one definition. Add app-specific commands below.
import '@angular-monorepo/shared/e2e';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      login(email: string, password: string): void;
    }
  }
}

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});
