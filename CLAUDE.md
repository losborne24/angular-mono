# angular-mono

Workspace-level conventions. See the parent `../CLAUDE.md` for Nx tooling rules.

## E2E testing (Cypress)

These conventions apply to every `*-e2e` app in `apps/`.

### Test around user journeys, not individual widgets

E2e tests exercise whole workflows that cross several features (edit → export,
import → edit → re-export, start-blank → fill in). Per-feature behaviour — theme
and font selection state, edit-mode toggling, CSV parsing — belongs in
component/unit specs, which are faster and isolate the failure. Reserve e2e for
the integration regressions only a full workflow can catch.

### Selectors

Prefer dedicated `data-cy` hooks via a `cy.dataCy(...)` custom command, plus
semantic attributes (`aria-pressed`, `data-selected`, `data-editing`). Avoid
selecting on styling classes (Tailwind/daisyUI) or UI copy, so a CSS refactor or
wording change does not break tests. Add `data-cy` to the template alongside the
existing classes — never replace them.

### Running

- Headless (terminal results): `yarn nx e2e <app>-e2e`
- GUI window: `yarn cypress open --project apps/<app>-e2e --e2e --browser chrome`
  (the `--project` flag is required, else Cypress looks for config at the repo
  root and hangs on "initializing config").
