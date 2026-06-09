// Tests are organised around user journeys; selectors use `data-cy` hooks.
// See the E2E testing section in the workspace CLAUDE.md for the conventions.

const getName = () => cy.dataCy('resume-name');
const getTitle = () => cy.dataCy('resume-title');

/** Replace a contenteditable field's text and commit it (Enter). */
function rename(hook: string, value: string): void {
  cy.dataCy(hook).clear();
  cy.dataCy(hook).type(`${value}{enter}`);
  cy.dataCy(hook).should('contain.text', value);
}

describe('resume-e2e', () => {
  beforeEach(() => cy.visit('/angular-mono/resume/'));

  // Fast sanity check that the app boots and renders its seed content.
  it('loads the resume with its default content', () => {
    cy.dataCy('paper-container').should('be.visible');
    getName().should('contain.text', 'Leith Osborne');
  });

  it('lets a user edit their resume and export it to CSV', () => {
    // Enter edit mode and confirm content unlocks.
    cy.dataCy('edit-toggle').click();
    cy.dataCy('edit-toggle').should('have.attr', 'aria-pressed', 'true');
    cy.dataCy('paper-scroll').should('have.attr', 'data-editing', 'true');

    // Edit the header fields in place.
    rename('resume-name', 'Ada Lovelace');
    rename('resume-title', 'Founding Engineer');

    // Export and verify both edits round-tripped into the file.
    cy.dataCy('download-csv').click();
    cy.readFile('cypress/downloads/resume.csv', { timeout: 10000 })
      .should('contain', 'header,,name,Ada Lovelace')
      .should('contain', 'header,,title,Founding Engineer');
  });

  it('imports a CSV, edits the imported content, and re-exports it', () => {
    // Upload replaces the whole resume from file.
    getName().should('not.contain.text', 'Jane Doe');
    cy.dataCy('file-input').selectFile('src/fixtures/resume.csv', {
      force: true,
    });
    getName().should('contain.text', 'Jane Doe');
    getTitle().should('contain.text', 'Principal Engineer');

    // Tweak the imported resume, then export the merged result.
    cy.dataCy('edit-toggle').click();
    rename('resume-title', 'Distinguished Engineer');

    cy.dataCy('download-csv').click();
    cy.readFile('cypress/downloads/resume.csv', { timeout: 10000 })
      .should('contain', 'header,,name,Jane Doe')
      .should('contain', 'header,,title,Distinguished Engineer');
  });

  it('starts a blank resume and lets the user fill it in', () => {
    cy.on('window:confirm', () => true);

    cy.dataCy('start-over').click();

    // Blank template loads and edit mode is auto-enabled.
    getName().should('contain.text', 'Your Name');
    cy.dataCy('edit-toggle').should('have.attr', 'aria-pressed', 'true');

    // User fills in the header.
    rename('resume-name', 'Grace Hopper');
    rename('resume-title', 'Rear Admiral');

    getName().should('contain.text', 'Grace Hopper');
    getTitle().should('contain.text', 'Rear Admiral');
  });

  it('keeps the existing resume when Start over is dismissed', () => {
    cy.on('window:confirm', () => false);

    cy.dataCy('start-over').click();
    getName().should('contain.text', 'Leith Osborne');
  });

  it('customises appearance and shares the resume', () => {
    // Switch theme and confirm the root data-theme changes.
    cy.get('[data-theme]')
      .first()
      .invoke('attr', 'data-theme')
      .then((initialTheme) => {
        cy.dataCy('theme-button')
          .children('div')
          .each(($div) => {
            const buttonTheme = $div.attr('data-theme');
            if (buttonTheme && buttonTheme !== initialTheme) {
              cy.wrap($div).parent().click();
              return false; // stop after the first different theme
            }
            return undefined;
          });

        cy.get('[data-theme]')
          .first()
          .invoke('attr', 'data-theme')
          .should('not.equal', initialTheme);
      });

    // Switch font and confirm the selection indicator follows.
    cy.dataCy('font-button').eq(1).click();
    cy.dataCy('font-button').eq(1).should('have.attr', 'data-selected', 'true');

    // Copy the page URL to the clipboard.
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText').resolves();
    });
    cy.dataCy('copy-url').click();
    cy.get('@writeText').should(
      'have.been.calledWith',
      `${Cypress.config('baseUrl')}/angular-mono/resume/`,
    );
    cy.dataCy('copy-url').should('have.attr', 'data-copied', 'true');
  });

  it('exports to PDF without throwing', () => {
    // PDF generation is offscreen + async; assert the click is wired up and
    // does not surface an uncaught error.
    cy.dataCy('export-pdf').should('be.visible').click();
  });
});
