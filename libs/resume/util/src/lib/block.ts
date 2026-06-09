import type { Contribution, Experience, Position } from './paper-model';

export type BlockKind = 'experience';

interface BlockBase {
  id: string;
  kind: BlockKind;
}

export interface ExperienceBlock extends BlockBase {
  kind: 'experience';
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
  techStack: [],
  contributions: [emptyContribution()],
});

/** Blank payload for a newly added experience block. */
export const emptyExperience = (): Experience => ({
  companyName: 'New Company',
  positions: [emptyPosition()],
});
