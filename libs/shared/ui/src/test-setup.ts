import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// Zoneless test environment — mirrors the resume app's runtime change detection
// (provideZonelessChangeDetection). No zone.js, so specs must drive change
// detection explicitly: prefer `await fixture.whenStable()` over detectChanges().
setupTestBed({ zoneless: true });
