import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { LINK_ICONS } from '@angular-monorepo/shared/util';

/**
 * Click-to-open popover grid for choosing an icon. Shows the current icon as a
 * trigger button; selecting from the grid emits `iconChanged` and closes.
 *
 * The grid renders in a CDK overlay so it is never clipped by an ancestor's
 * `overflow: hidden` and auto-flips above/below the trigger to stay on screen.
 * The overlay attaches to the document body — outside the app's `[data-theme]`
 * root — so we mirror the nearest theme onto the panel to keep daisyUI vars
 * (e.g. `--b1`) resolving. Editing chrome is hidden in the PDF clone via
 * `:host-context(.printable)`.
 */
@Component({
  selector: 'app-icon-picker',
  imports: [OverlayModule, FontAwesomeModule],
  templateUrl: './icon-picker.html',
  styleUrl: './icon-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPicker {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly icons: IconDefinition[] = LINK_ICONS;

  readonly icon = input.required<IconDefinition>();

  readonly iconChanged = output<IconDefinition>();

  readonly open = signal(false);
  /** daisyUI theme mirrored onto the overlay panel so its vars resolve. */
  readonly theme = signal<string | null>(null);

  /** Prefer opening below the trigger; flip above when there is no room. */
  readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  toggle(): void {
    if (!this.open()) {
      const themed = this.host.nativeElement.closest('[data-theme]');
      this.theme.set(themed?.getAttribute('data-theme') ?? null);
    }
    this.open.update((v) => !v);
  }

  select(icon: IconDefinition): void {
    this.iconChanged.emit(icon);
    this.open.set(false);
  }

  close(): void {
    this.open.set(false);
  }
}
