import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExperienceBlock } from './experience-block';
import type { ExperienceBlock as ExperienceBlockModel } from '@angular-monorepo/resume/util';
import { ResumeStore } from '../resume-store/resume-store';

const BLOCK: ExperienceBlockModel = {
  id: 'x',
  kind: 'experience',
  data: {
    companyName: 'Acme Corp',
    positions: [
      {
        position: 'Engineer',
        period: '2020 - 2021',
        techStack: ['TypeScript'],
        contributions: [{ category: 'Build', contribution: 'Shipped things' }],
      },
    ],
  },
};

describe('ExperienceBlock', () => {
  let fixture: ComponentFixture<ExperienceBlock>;

  beforeEach(async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('type,icon,a,b,c,d,e,f\n'));

    await TestBed.configureTestingModule({
      imports: [ExperienceBlock],
      providers: [ResumeStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperienceBlock);
    fixture.componentRef.setInput('block', BLOCK);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the company name and position', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Corp');
    expect(text).toContain('Engineer');
  });

  it('joins the tech stack into one line', () => {
    const position = { techStack: ['Angular', 'TypeScript'] } as never;
    expect(fixture.componentInstance.techStackText(position)).toBe('Angular | TypeScript');
  });
});
