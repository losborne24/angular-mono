import { Directive, signal } from '@angular/core';

@Directive({
  selector: '[appCopyUrl]',
  standalone: true,
  exportAs: 'appCopyUrl',
})
export class CopyUrlDirective {
  private readonly COPIED_RESET_DELAY_MS = 1000;

  copied = signal<boolean>(false);

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copied.set(true);

      setTimeout(() => {
        this.copied.set(false);
      }, this.COPIED_RESET_DELAY_MS);
    } catch (error) {
      console.error('Failed to copy URL to clipboard:', error);
    }
  }
}
