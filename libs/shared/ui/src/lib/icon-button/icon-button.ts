import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Ghost icon button for inline editing chrome (add / remove rows, remove block).
 *
 * Renders an icon and, when {@link text} is set, a visible label beside it
 * (the "Add …" affordances); without `text` it is icon-only and relies on
 * {@link label} for its `aria-label` (the row/block remove controls).
 *
 * The component deliberately ships almost no styling: the contextual class on
 * the host (`add-button`, `row-remove`, `block-remove`, …) is what drives the
 * size, colour and the parent-hover reveal/collapse transitions in the
 * consumer's stylesheet. Emulated encapsulation lets those parent rules target
 * this host element, so the button stays a dumb shell.
 */
@Component({
  selector: 'app-icon-button',
  imports: [FontAwesomeModule],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButton {
  readonly icon = input.required<IconDefinition>();
  /** Visible label rendered beside the icon. Omit for an icon-only button. */
  readonly text = input<string>();
  /** Accessible name. Required for icon-only buttons; falls back to `text`. */
  readonly label = input<string>();

  readonly action = output<void>();

  /** aria-label resolves to the explicit label, else the visible text. */
  ariaLabel(): string | null {
    return this.label() ?? this.text() ?? null;
  }
}
