import type {
  ContactDetail,
  Education,
  Experience,
  Links,
  ResumeHeader,
  RightPanelSection,
  SectionLabels,
} from './paper-model';

/**
 * Aggregate of every piece of resume content. Single source of truth that the
 * CSV layer parses into and serialises from, and that the store hydrates its
 * signals with.
 */
export interface ResumeModel {
  header: ResumeHeader;
  sectionLabels: SectionLabels;
  contactDetails: ContactDetail[];
  links: Links[];
  education: Education[];
  experience: Experience[];
  rightPanel: RightPanelSection[];
}
