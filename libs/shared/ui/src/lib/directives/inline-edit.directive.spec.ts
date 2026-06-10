import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild, signal } from '@angular/core';
import { InlineEditDirective } from './inline-edit.directive';
import { vi } from 'vitest';

@Component({
  template: `<!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
    <h1
      [(appInlineEdit)]="text"
      [disabled]="disabled()"
      #editor="appInlineEdit"
      (editStart)="started = started + 1"
      (editCommit)="committed = $event"
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
}

describe('InlineEditDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let host: TestComponent;
  let el: HTMLElement;
  let directive: InlineEditDirective;

  beforeEach(async () => {
    // jsdom lacks requestAnimationFrame timing guarantees — run synchronously.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
    directive = host.editor;
    el = fixture.nativeElement.querySelector('h1');
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should render the bound value and not be editing by default', () => {
    expect(directive.editing()).toBe(false);
    expect(el.textContent).toBe('Hello');
  });

  it('should mirror later value changes into the element', () => {
    host.text.set('Updated');
    fixture.detectChanges();
    expect(el.textContent).toBe('Updated');
  });

  describe('startEdit()', () => {
    it('should enter edit mode, emit editStart and focus the element', () => {
      const focusSpy = vi.spyOn(el, 'focus');
      el.click();

      expect(directive.editing()).toBe(true);
      expect(host.started).toBe(1);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should do nothing when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

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
  });
});
