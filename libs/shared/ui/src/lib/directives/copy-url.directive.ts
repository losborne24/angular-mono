import { Directive, signal } from '@angular/core';

/**
 * Copies the current page URL to the clipboard.
 *
 * Exported as `appCopyUrl` so a template can call {@link copy} and read the
 * {@link copied} signal to reflect copy state in the UI.
 *
 * @example
 * ```html
 * <button appCopyUrl #copyUrl="appCopyUrl" (click)="copyUrl.copy()">
 *   {{ copyUrl.copied() ? 'Copied!' : 'Copy link' }}
 * </button>
 * ```
 */
@Directive({
  selector: '[appCopyUrl]',
  standalone: true,
  exportAs: 'appCopyUrl',
})
export class CopyUrlDirective {
  private readonly COPIED_RESET_DELAY_MS = 1000;

  /** True for {@link COPIED_RESET_DELAY_MS} after a successful copy, else false. */
  copied = signal<boolean>(false);

  /**
   * Writes `window.location.href` to the clipboard and flips {@link copied} to
   * true, resetting it to false after {@link COPIED_RESET_DELAY_MS}. Clipboard
   * failures are caught and logged; {@link copied} stays false.
   */
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
