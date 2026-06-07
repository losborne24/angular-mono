import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { CopyUrlDirective } from './copy-url.directive';
import { vi } from 'vitest';

@Component({
  template: '<button appCopyUrl #copier="appCopyUrl">Copy</button>',
  standalone: true,
  imports: [CopyUrlDirective],
})
class TestComponent {
  @ViewChild('copier', { static: false }) copier!: CopyUrlDirective;
}

describe('CopyUrlDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: CopyUrlDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    directive = fixture.componentInstance.copier;
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize with copied as false', () => {
    expect(directive.copied()).toBe(false);
  });

  describe('copy()', () => {
    it('should copy current URL to clipboard', async () => {
      const clipboardSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: clipboardSpy },
        writable: true,
        configurable: true,
      });

      await directive.copy();

      expect(clipboardSpy).toHaveBeenCalledWith(window.location.href);
    });

    it('should set copied to true after successful copy', async () => {
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      await directive.copy();

      expect(directive.copied()).toBe(true);
    });

    it('should reset copied to false after delay', async () => {
      vi.useFakeTimers();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      await directive.copy();
      expect(directive.copied()).toBe(true);

      vi.advanceTimersByTime(1000);
      expect(directive.copied()).toBe(false);

      vi.useRealTimers();
    });

    it('should handle clipboard errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => null);

      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
        new Error('Clipboard error')
      );

      await directive.copy();

      expect(directive.copied()).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy URL to clipboard:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
