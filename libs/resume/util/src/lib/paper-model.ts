import { IconDefinition } from '@fortawesome/free-brands-svg-icons';

export interface ContactDetail {
  icon: IconDefinition;
  text: string;
  href?: string;
}

export interface Links {
  icon: IconDefinition;
  href: string;
  link?: string;
}

export interface Contribution {
  category: string;
  contribution: string;
}

export interface Position {
  position: string;
  period: string;
  techStack: string[];
  contributions: Contribution[];
}

export interface Experience {
  companyName: string;
  positions: Position[];
}

export interface RightPanelSection {
  header: string;
  items: string[];
}

export interface ResumeHeader {
  name: string;
  title: string;
}

export interface Education {
  school: string;
  period: string;
  /** Free-text detail (e.g. degree or A-levels). Newlines render as separate lines. */
  detail: string;
}
