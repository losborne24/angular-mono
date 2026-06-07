import { getGreeting } from '../support/app.po';

describe('home-e2e', () => {
  beforeEach(() => cy.visit('/angular-mono/'));

  describe('Page Load and Welcome Content', () => {
    it('should display welcome message', () => {
      getGreeting().contains(/Welcome home/);
    });
  });
});
