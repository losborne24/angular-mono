import { ChangeDetectionStrategy, Component, effect, output, signal } from '@angular/core';
import { DAISYUI_THEMES, Theme } from '@angular-monorepo/shared/util';

@Component({
  selector: 'app-theme-picker',
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePicker {
  readonly themes: Theme[] = DAISYUI_THEMES;

  readonly themeChanged = output<Theme>();

  readonly selectedTheme = signal<Theme>('corporate');

  constructor() {
    effect(() => this.themeChanged.emit(this.selectedTheme()));
  }

  setTheme(newTheme: Theme): void {
    this.selectedTheme.set(newTheme);
  }
}
