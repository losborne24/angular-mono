import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paper } from './paper';

/** Minimal CSV covering each section the template renders. */
const CSV = `type,icon,a,b,c,d,e,f
header,,name,Leith Osborne,,,,
header,,title,Front-End Focused Product Engineer,,,,
label,,experience,EXPERIENCE,,,,
label,,links,LINKS,,,,
label,,education,EDUCATION,,,,
contact,faPhone,+44 7494 391933,,,,,
link,faGithub,https://github.com/losborne24,,,,,
education,,Durham University,OCT 2017 - JUL 2020,BSc Computer Science,,,
experience,,OpenGamma Limited,Software Developer,JAN 2025 - PRESENT,Angular,Full UI Ownership,Owned the UI.
panel,,ACHIEVEMENTS,An award,,,,
`;

describe('Paper', () => {
  let component: Paper;
  let fixture: ComponentFixture<Paper>;

  beforeEach(async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(CSV, { headers: { 'Content-Type': 'text/csv' } }),
    );

    await TestBed.configureTestingModule({
      imports: [Paper],
    }).compileComponents();

    fixture = TestBed.createComponent(Paper);
    component = fixture.componentInstance;
    // Let the store's async load() settle before asserting on rendered data.
    await component.store.load();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render name in header', () => {
      const compiled = fixture.nativeElement;
      const h1 = compiled.querySelector('h1');
      expect(h1?.textContent).toContain('Leith Osborne');
    });

    it('should render contact details', () => {
      const compiled = fixture.nativeElement;
      const address = compiled.querySelector('address');
      expect(address).toBeTruthy();
    });

    it('should render experience blocks', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('app-experience-block')).toBeTruthy();
      expect(compiled.textContent).toContain('OpenGamma Limited');
    });

    it('hides add-block controls outside edit mode', () => {
      const compiled = fixture.nativeElement;
      const addButtons = compiled.querySelectorAll('.add-bar button');
      expect(addButtons.length).toBe(0);
    });

    it('shows add-block controls in edit mode', () => {
      component.store.setEditMode(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const addButtons = compiled.querySelectorAll('.add-bar button');
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it('should render utility buttons', () => {
      const compiled = fixture.nativeElement;
      // Upload is a <label for> wrapping the hidden file input; the rest are buttons.
      const controls = compiled.querySelectorAll('nav.utility-container button, nav.utility-container label');
      expect(controls.length).toBe(6);
    });
  });

  describe('csv import/export', () => {
    afterEach(() => vi.restoreAllMocks());

    it('serializes current state on download', () => {
      const click = vi.fn();
      const create = vi.fn().mockReturnValue('blob:x');
      // jsdom doesn't implement object URLs; stub them on.
      URL.createObjectURL = create;
      URL.revokeObjectURL = vi.fn();
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click,
      } as unknown as HTMLAnchorElement);

      component.downloadCsv();

      expect(create).toHaveBeenCalled();
      expect(click).toHaveBeenCalled();
    });

    it('clears state on confirmed start-over', () => {
      vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
      component.startOver();

      expect(component.store.blocks().length).toBe(0);
      expect(component.store.links().length).toBe(0);
      // Contact rows are seeded (no add-control for them).
      expect(component.store.contactDetails().length).toBe(3);
      expect(component.store.editMode()).toBe(true);
    });

    it('keeps state when start-over is cancelled', () => {
      vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
      const before = component.store.blocks().length;
      component.startOver();

      expect(component.store.blocks().length).toBe(before);
    });

    it('hydrates store from an uploaded file', async () => {
      const csv = 'type,icon,a,b,c,d,e,f\nheader,,name,Uploaded Person,,,,\n';
      const input = { files: [{ text: async () => csv }], value: 'x' };
      await component.onFileSelected({ target: input } as unknown as Event);

      expect(component.store.header().name).toBe('Uploaded Person');
      expect(input.value).toBe('');
    });
  });
});
