import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BlockFrame } from './block-frame';

@Component({
  template: `<app-block-frame
    (remove)="removed = removed + 1"
  ></app-block-frame>`,
  standalone: true,
  imports: [BlockFrame],
})
class TestComponent {
  removed = 0;
}

describe('BlockFrame', () => {
  let fixture: ComponentFixture<TestComponent>;
  let host: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits remove on the × button', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(host.removed).toBe(1);
  });
});
