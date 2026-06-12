import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild, signal } from '@angular/core';
import { InlineEditDirective } from './inline-edit.directive';
import { vi } from 'vitest';

@Component({
  // One-way binding only — the directive owns the element text and emits
  // editCommit; the host writes the new value back into its own signal.
  template: `<!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
    <h1
      [appInlineEdit]="text()"
      [disabled]="disabled()"
      #editor="appInlineEdit"
      (editStart)="started = started + 1"
      (editCommit)="onCommit($event)"
      (editCancel)="cancelled = cancelled + 1"
    ></h1>`,
  standalone: true,
  imports: [InlineEditDirective],
})
class TestComponent {
  @ViewChild('editor', { static: false }) editor!: InlineEditDirective;
  readonly text = signal<string>('Hello');
  readonly disabled = signal<boolean>(false);
  started = 0;
  committed: string | null = null;
  cancelled = 0;

  onCommit(value: string): void {
    this.committed = value;
    this.text.set(value);
  }
}

describe('InlineEditDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let host: TestComponent;
  let el: HTMLElement;
  let directive: InlineEditDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    host = fixture.componentInstance;
    // Zoneless: whenStable() flushes change detection AND the afterRenderEffect
    // that mirrors the bound value into the element's textContent.
    await fixture.whenStable();
    directive = host.editor;
    el = fixture.nativeElement.querySelector('h1');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should render the bound value and not be editing by default', () => {
    expect(directive.editing()).toBe(false);
    expect(el.textContent).toBe('Hello');
  });

  it('should expose editable=true when not disabled', () => {
    expect(directive.editable()).toBe(true);
  });

  it('should mirror later value changes into the element', async () => {
    host.text.set('Updated');
    await fixture.whenStable();
    expect(el.textContent).toBe('Updated');
  });

  describe('startEdit()', () => {
    it('should enter edit mode, emit editStart and focus the element', () => {
      // startEdit() defers focus to requestAnimationFrame — run it synchronously
      // so the focus call lands within the test. (Stubbing rAF globally breaks
      // Angular's zoneless change-detection scheduler, which also uses rAF.)
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
      const focusSpy = vi.spyOn(el, 'focus');
      el.click();

      expect(directive.editing()).toBe(true);
      expect(host.started).toBe(1);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should do nothing when disabled', async () => {
      host.disabled.set(true);
      await fixture.whenStable();

      el.click();

      expect(directive.editing()).toBe(false);
      expect(host.started).toBe(0);
    });

    it('should not re-enter edit mode while already editing', () => {
      el.click();
      el.click();
      expect(host.started).toBe(1);
    });
  });

  describe('commit()', () => {
    it('should commit a new value on Enter and exit edit mode', () => {
      el.click();
      el.textContent = 'World';
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(host.committed).toBe('World');
      expect(host.text()).toBe('World');
      expect(directive.editing()).toBe(false);
    });

    it('should commit on blur', () => {
      el.click();
      el.textContent = 'Blurred';
      el.dispatchEvent(new Event('blur'));

      expect(host.committed).toBe('Blurred');
      expect(host.text()).toBe('Blurred');
    });

    it('should trim whitespace before committing', () => {
      el.click();
      el.textContent = '  Trimmed  ';
      el.dispatchEvent(new Event('blur'));

      expect(host.committed).toBe('Trimmed');
    });

    it('should not emit editCommit when value is unchanged', () => {
      el.click();
      el.dispatchEvent(new Event('blur'));

      expect(host.committed).toBeNull();
      expect(directive.editing()).toBe(false);
    });

    it('should discard and emit editCancel when committed value is empty', () => {
      el.click();
      el.textContent = '   ';
      el.dispatchEvent(new Event('blur'));

      expect(host.committed).toBeNull();
      expect(host.cancelled).toBe(1);
      expect(host.text()).toBe('Hello');
      expect(el.textContent).toBe('Hello');
    });
  });

  describe('onEscape()', () => {
    it('should revert text and emit editCancel without committing', () => {
      el.click();
      el.textContent = 'Discarded';
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(el.textContent).toBe('Hello');
      expect(host.cancelled).toBe(1);
      expect(host.committed).toBeNull();
      expect(host.text()).toBe('Hello');
      expect(directive.editing()).toBe(false);
    });

    it('should do nothing when not editing', () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(host.cancelled).toBe(0);
      expect(directive.editing()).toBe(false);
    });
  });
});
