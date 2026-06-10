import { ChangeDetectionStrategy, Component, effect, output, signal } from '@angular/core';
import { FONTS, Font } from '@angular-monorepo/shared/util';

@Component({
  selector: 'app-font-picker',
  templateUrl: './font-picker.html',
  styleUrl: './font-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FontPicker {
  readonly fonts: Font[] = FONTS;

  readonly fontChanged = output<Font>();

  readonly selectedFont = signal<Font>('serif');

  constructor() {
    effect(() => this.fontChanged.emit(this.selectedFont()));
  }

  setFont(newFont: Font): void {
    this.selectedFont.set(newFont);
  }
}
