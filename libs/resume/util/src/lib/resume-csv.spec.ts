import { Icon } from '@angular-monorepo/shared/util';
import { parseResumeCsv, serializeResumeCsv } from './resume-csv';
import type { ResumeModel } from './resume-model';

const MODEL: ResumeModel = {
  header: { name: 'Leith Osborne', title: 'Front-End Focused Product Engineer' },
  contactDetails: [
    { icon: Icon.faLocationDot, text: 'London, UK' },
    { icon: Icon.faEnvelope, text: 'a@b.com', href: 'mailto:a@b.com' },
  ],
  links: [{ icon: Icon.faGithub, href: 'https://github.com/x' }],
  education: [
    { school: 'Durham', period: '2017 - 2020', detail: 'BSc, First Class' },
    { school: 'Ashcombe', period: '2010 - 2017', detail: 'Maths A*\nCS A' },
  ],
  experience: [
    {
      companyName: 'OpenGamma Limited',
      positions: [
        {
          position: 'Software Developer',
          period: 'JAN 2025 - PRESENT',
          techStack: ['Angular', 'TypeScript'],
          contributions: [
            { category: 'Full UI', contribution: 'Owned the UI, "scaled" it.' },
            { category: 'BI', contribution: 'Dashboards.' },
          ],
        },
      ],
    },
  ],
  rightPanel: [
    { header: 'ACHIEVEMENTS', items: ['Award A', 'Award B'] },
    { header: 'CERTIFICATIONS', items: ['AWS'] },
  ],
};

describe('resume-csv', () => {
  it('round-trips a model through serialize -> parse', () => {
    const parsed = parseResumeCsv(serializeResumeCsv(MODEL));
    expect(parsed).toEqual(MODEL);
  });

  it('preserves commas, quotes and em-dashes in fields', () => {
    const parsed = parseResumeCsv(serializeResumeCsv(MODEL));
    expect(parsed.contactDetails[0].text).toBe('London, UK');
    expect(parsed.experience[0].positions[0].contributions[0].contribution).toBe('Owned the UI, "scaled" it.');
  });

  it('maps icon names back to definitions', () => {
    const parsed = parseResumeCsv(serializeResumeCsv(MODEL));
    expect(parsed.links[0].icon).toBe(Icon.faGithub);
    expect(parsed.contactDetails[0].icon).toBe(Icon.faLocationDot);
  });

  it('preserves newlines in education detail', () => {
    const parsed = parseResumeCsv(serializeResumeCsv(MODEL));
    expect(parsed.education[0].detail).toBe('BSc, First Class');
    expect(parsed.education[1].detail).toBe('Maths A*\nCS A');
  });
});
