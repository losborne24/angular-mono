import {
  Directive,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

/**
 * Makes the host element's text editable in place on click.
 *
 * The directive OWNS the element's text content — do not also interpolate the
 * bound signal inside the element (e.g. `{{ title() }}`), or Angular's binding
 * will fight the directive's manual DOM writes. Leave the element empty:
 *
 *   <h1 [(appInlineEdit)]="title"></h1>
 *
 * Behaviour: click → editable; Enter or blur commits; Escape reverts.
 */
@Directive({
  selector: '[appInlineEdit]',
  standalone: true,
  exportAs: 'appInlineEdit',
  host: {
    '[attr.contenteditable]': 'editing()',
    '[attr.role]': '"textbox"',
    // Affordance: dashed outline + pointer on hover, solid ring while editing.
    // Outline (not border/padding) avoids layout shift.
    '[style.cursor]': 'editable() ? "text" : null',
    '[style.outline]': 'outlineStyle()',
    '[style.outline-offset.px]': '2',
    '[style.border-radius.px]': '2',
    '[style.transition]': '"outline-color 120ms ease"',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(click)': 'startEdit()',
    '(keydown.enter)': 'onEnter($event)',
    '(keydown.escape)': 'onEscape($event)',
    '(blur)': 'commit()',
  },
})
export class InlineEditDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Two-way bound text value: `[(appInlineEdit)]="signal"`. */
  readonly appInlineEdit = model<string>('');
  /** When true, clicks do not enter edit mode. */
  readonly disabled = input<boolean>(false);

  readonly editStart = output<void>();
  readonly editCommit = output<string>();
  readonly editCancel = output<void>();

  readonly editing = signal<boolean>(false);
  readonly hovered = signal<boolean>(false);
  private original = '';

  /** True when the element can be entered (not disabled). */
  readonly editable = computed(() => !this.disabled());

  /** Outline shown by the hover/edit affordance. */
  readonly outlineStyle = computed(() => {
    if (this.editing()) return '2px solid rgba(59, 130, 246, 0.7)';
    if (this.hovered() && this.editable())
      return '1px dashed rgba(120, 120, 120, 0.6)';
    return 'none';
  });

  constructor() {
    // Directive owns the text. Mirror the bound value into the DOM whenever it
    // changes and we are not actively editing (avoids clobbering live input).
    effect(() => {
      const value = this.appInlineEdit();
      if (!this.editing()) {
        this.el.nativeElement.textContent = value;
      }
    });
  }

  startEdit(): void {
    if (this.disabled() || this.editing()) return;

    this.original = this.el.nativeElement.textContent ?? '';
    this.editing.set(true);
    this.editStart.emit();

    requestAnimationFrame(() => {
      this.el.nativeElement.focus();
      this.placeCaretAtEnd();
    });
  }

  onEnter(event: Event): void {
    event.preventDefault(); // block newline insertion
    this.commit();
    this.el.nativeElement.blur();
  }

  onEscape(event: Event): void {
    if (!this.editing()) return;
    event.preventDefault();
    this.el.nativeElement.textContent = this.original;
    this.editing.set(false);
    this.editCancel.emit();
    this.el.nativeElement.blur();
  }

  commit(): void {
    if (!this.editing()) return;

    const value = (this.el.nativeElement.textContent ?? '').trim();
    this.editing.set(false);

    if (value === this.original.trim()) {
      // No change — restore canonical value, do not emit.
      this.el.nativeElement.textContent = this.appInlineEdit();
      return;
    }

    this.appInlineEdit.set(value);
    this.editCommit.emit(value);
  }

  private placeCaretAtEnd(): void {
    const element = this.el.nativeElement;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
