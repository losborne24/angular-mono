import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from './icon-button';

describe('IconButton', () => {
  let fixture: ComponentFixture<IconButton>;
  let component: IconButton;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButton],
    }).compileComponents();

    fixture = TestBed.createComponent(IconButton);
    component = fixture.componentInstance;
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('renders a visible label when text is set', () => {
    fixture.componentRef.setInput('icon', faPlus);
    fixture.componentRef.setInput('text', 'Add link');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span')?.textContent).toContain('Add link');
    // text doubles as the accessible name when no explicit label is given.
    expect(button().getAttribute('aria-label')).toBe('Add link');
  });

  it('is icon-only and uses label as the accessible name', () => {
    fixture.componentRef.setInput('icon', faXmark);
    fixture.componentRef.setInput('label', 'Remove link');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span')).toBeNull();
    expect(button().getAttribute('aria-label')).toBe('Remove link');
  });

  it('prefers an explicit label over text for aria-label', () => {
    fixture.componentRef.setInput('icon', faPlus);
    fixture.componentRef.setInput('text', 'Add');
    fixture.componentRef.setInput('label', 'Add a contribution');
    fixture.detectChanges();

    expect(button().getAttribute('aria-label')).toBe('Add a contribution');
  });

  it('emits action on click', () => {
    fixture.componentRef.setInput('icon', faXmark);
    fixture.detectChanges();

    let fired = false;
    component.action.subscribe(() => (fired = true));
    button().click();

    expect(fired).toBe(true);
  });
});
