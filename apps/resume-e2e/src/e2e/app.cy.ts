import { getGreeting } from '../support/app.po';

describe('resume-e2e', () => {
  beforeEach(() => cy.visit('/angular-mono/resume/'));

  describe('Page Load and Content Display', () => {
    it('should display the main title', () => {
      getGreeting().should('contain.text', 'Leith Osborne');
    });

    it('should display the job title', () => {
      cy.contains('Full-Stack / UI Engineer').should('be.visible');
    });

    it('should display the resume paper container', () => {
      cy.get('.paper-container').should('be.visible');
    });
  });

  describe('Theme Picker', () => {
    it('should display theme picker buttons', () => {
      cy.get('app-theme-picker button.circle-button').should(
        'have.length.at.least',
        1,
      );
    });

    it('should have a default theme selected', () => {
      cy.get('app-theme-picker button.circle-button.ring-2').should(
        'have.length',
        1,
      );
    });

    it('should change theme when clicking a different theme button', () => {
      // Get the root element's current theme
      cy.get('[data-theme]')
        .first()
        .invoke('attr', 'data-theme')
        .then((initialTheme) => {
          // Find a button whose child div has a DIFFERENT data-theme value
          cy.get('app-theme-picker button.circle-button > div').each(($div) => {
            const buttonTheme = $div.attr('data-theme');
            if (buttonTheme && buttonTheme !== initialTheme) {
              // Click the parent button
              cy.wrap($div).parent().click();
              // Stop after first click
              return false;
            }
            return undefined;
          });

          // Verify the root element's theme has changed
          cy.get('[data-theme]')
            .first()
            .invoke('attr', 'data-theme')
            .should('not.equal', initialTheme);
        });
    });

    it('should show visual indicator on selected theme', () => {
      cy.get('app-theme-picker button.circle-button.ring-2').should(
        'have.length',
        1,
      );
    });
  });

  describe('Font Picker', () => {
    it('should display font picker buttons', () => {
      cy.get('app-font-picker button.circle-button').should(
        'have.length.at.least',
        1,
      );
    });

    it('should change font when clicking a font button', () => {
      cy.get('app-font-picker button.circle-button').eq(1).click();
      cy.get('app-font-picker button.circle-button')
        .eq(1)
        .should('have.class', 'ring-2');
    });
  });

  describe('Utility Buttons', () => {
    it('should display export PDF button', () => {
      cy.get('.utility-container button[data-tip*="Export"]').should(
        'be.visible',
      );
    });

    it('should display copy URL button', () => {
      cy.get('.utility-container button[data-tip*="Copy"]').should(
        'be.visible',
      );
    });
  });
});
