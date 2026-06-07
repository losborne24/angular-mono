import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontPicker } from './font-picker';

describe('FontPicker', () => {
  let component: FontPicker;
  let fixture: ComponentFixture<FontPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(FontPicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
