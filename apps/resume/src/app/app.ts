import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { Paper } from '@angular-monorepo/resume/feature-paper';
import { FontPicker, ThemePicker } from '@angular-monorepo/shared/ui';
import { Theme, Font } from '@angular-monorepo/shared/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Paper, FontPicker, ThemePicker],
})
export class App {
  /**
   * Viewport width below which the resume scales down. paper (754px) + side controls.
   */
  private readonly BASE_WIDTH = 950;

  selectedTheme = signal<Theme>('corporate');
  selectedFont = signal<string>('serif');
  /**
   * Scale applied to the resume container so it shrinks to fit narrow
   * viewports. Capped at 1 (never enlarged); below the base width it scales
   * down proportionally. Recomputed on window resize.
   */
  scaleFactor = signal<number>(this.computeScale());

  @HostListener('window:resize')
  onResize() {
    this.scaleFactor.set(this.computeScale());
  }

  onFontChanged(font: Font): void {
    this.selectedFont.set(font);
  }
  onThemeChanged(theme: Theme): void {
    this.selectedTheme.set(theme);
  }

  private computeScale(): number {
    return Math.min(1, window.innerWidth / this.BASE_WIDTH);
  }
}
