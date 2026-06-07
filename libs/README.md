# libs

Shared libraries, grouped by **domain** then **type**:

```
libs/<domain>/<type>
```

## Types

| type          | purpose                                            | can depend on            |
| ------------- | -------------------------------------------------- | ------------------------ |
| `feature`     | smart UI: routed/lazy pages, wires data + ui       | feature, ui, data-access, util |
| `ui`          | dumb presentational components, no app state       | ui, util                 |
| `data-access` | services, state, HTTP clients, models              | data-access, util        |
| `util`        | pure helpers, types, constants — no Angular state  | util                     |

`shared` is a domain for cross-domain code, e.g. `libs/shared/ui`.

## Examples

```
libs/shared/ui            -> @angular-monorepo/shared/ui
libs/shared/util          -> @angular-monorepo/shared/util
libs/products/data-access -> @angular-monorepo/products/data-access
libs/products/feature     -> @angular-monorepo/products/feature
```

## Generate

```bash
yarn nx g @nx/angular:library --directory=libs/<domain>/<type> \
  --name=<domain>-<type> --tags=scope:<domain>,type:<type>
```

## Rules

- Tag every lib `scope:<domain>` + `type:<type>`.
- Boundaries enforced via `@nx/enforce-module-boundaries` (see root `eslint.config.mjs`).
- Domains import only `shared` + their own scope.
- Type deps follow the table above (feature -> ui/data-access/util, never the reverse).
