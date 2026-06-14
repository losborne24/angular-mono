import { IconDefinition } from '@fortawesome/free-brands-svg-icons';

export interface ContactDetail {
  icon: IconDefinition;
  text: string;
  /** Optional link target (e.g. `mailto:`, `tel:`). When set, the text is wrapped in an `<a>`; otherwise rendered as plain text. */
  href?: string;
}

export interface Links {
  icon: IconDefinition;
  /** Used as both the link target and the display text. */
  href: string;
}

export interface Contribution {
  /** Free-text label rendered as a bold prefix (e.g. "BI Integration"). */
  category: string;
  contribution: string;
}

export interface Position {
  position: string;
  /** Free-text date range, e.g. "JAN 2025 - PRESENT". Not parsed — rendered as-is. */
  period: string;
  techStack: string[];
  contributions: Contribution[];
}

export interface Experience {
  companyName: string;
  positions: Position[];
}

export interface ResumeHeader {
  name: string;
  title: string;
}

export interface Education {
  school: string;
  /** Free-text date range, e.g. "SEP 2010 - AUG 2017". Not parsed — rendered as-is. */
  period: string;
  /** Free-text detail (e.g. degree or A-levels). Newlines render as separate lines. */
  detail: string;
}
