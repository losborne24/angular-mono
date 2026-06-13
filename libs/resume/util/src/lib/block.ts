import type { Contribution, Experience, Position } from './paper-model';

export interface ExperienceBlock {
  id: string;
  data: Experience; // one company
}

export type ResumeBlock = ExperienceBlock;

/** Blank contribution row. */
export const emptyContribution = (): Contribution => ({
  category: 'Category',
  contribution: 'Description',
});

/** Blank position with one starter contribution. */
export const emptyPosition = (): Position => ({
  position: 'Role',
  period: 'YEAR - YEAR',
  techStack: ['Tech'],
  contributions: [emptyContribution()],
});

/** Blank payload for a newly added experience block. */
export const emptyExperience = (): Experience => ({
  companyName: 'New Company',
  positions: [emptyPosition()],
});
