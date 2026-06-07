import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paper } from './paper';

describe('Paper', () => {
  let component: Paper;
  let fixture: ComponentFixture<Paper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paper],
    }).compileComponents();

    fixture = TestBed.createComponent(Paper);
    component = fixture.componentInstance;
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

    it('should render add-block controls', () => {
      const compiled = fixture.nativeElement;
      const addButtons = compiled.querySelectorAll('.add-bar button');
      expect(addButtons.length).toBe(1);
    });

    it('should render utility buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('nav.utility-container button');
      expect(buttons.length).toBe(2);
    });
  });
});
