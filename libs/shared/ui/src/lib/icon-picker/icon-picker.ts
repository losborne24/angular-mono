import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { LINK_ICONS } from '@angular-monorepo/shared/util';

/**
 * Click-to-open popover grid for choosing an icon. Shows the current icon as a
 * trigger button; selecting from the grid emits `iconChanged` and closes.
 * Editing chrome is hidden in the PDF clone via `:host-context(.printable)`.
 */
@Component({
  selector: 'app-icon-picker',
  imports: [FontAwesomeModule],
  templateUrl: './icon-picker.html',
  styleUrl: './icon-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPicker {
  readonly icons: IconDefinition[] = LINK_ICONS;

  readonly icon = input.required<IconDefinition>();

  readonly iconChanged = output<IconDefinition>();

  readonly open = signal(false);

  toggle(): void {
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
