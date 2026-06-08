import { Injectable, signal } from '@angular/core';
import { Icon } from '@angular-monorepo/shared/util';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  emptyExperience,
  parseResumeCsv,
  serializeResumeCsv,
  type BlockKind,
  type ContactDetail,
  type Education,
  type Links,
  type ResumeBlock,
  type ResumeHeader,
  type ResumeModel,
  type RightPanelSection,
  type SectionLabels,
} from '@angular-monorepo/resume/util';

/** URL of the seed CSV shipped as a static asset. */
const RESUME_CSV_URL = '/resume.csv';

/**
 * In-memory draft of the resume, hydrated from a CSV asset on init. Every
 * section is a signal so add/remove and edits drive change detection. No
 * persistence — refresh re-fetches the seed CSV. {@link toModel} /
 * {@link toCsv} round-trip the current state back out for download/upload.
 */
@Injectable()
export class ResumeStore {
  readonly header = signal<ResumeHeader>({ name: '', title: '' });
  readonly sectionLabels = signal<SectionLabels>({
    experience: '',
    links: '',
    education: '',
  });
  readonly contactDetails = signal<ContactDetail[]>([]);
  readonly links = signal<Links[]>([]);
  readonly education = signal<Education[]>([]);
  readonly rightPanel = signal<RightPanelSection[]>([]);
  /** Experience companies as left-column blocks. */
  readonly blocks = signal<ResumeBlock[]>([]);

  /** When true, inline-edit and add/remove controls are active. */
  readonly editMode = signal<boolean>(false);

  constructor() {
    void this.load();
  }

  /** Fetch and parse the seed CSV, then hydrate all signals. */
  async load(url = RESUME_CSV_URL): Promise<void> {
    const res = await fetch(url);
    const text = await res.text();
    this.hydrate(parseResumeCsv(text));
  }

  /** Replace all state from a parsed model. */
  hydrate(model: ResumeModel): void {
    this.header.set(model.header);
    this.sectionLabels.set(model.sectionLabels);
    this.contactDetails.set(model.contactDetails);
    this.links.set(model.links);
    this.education.set(model.education);
    this.rightPanel.set(model.rightPanel);
    this.blocks.set(
      model.experience.map((data, i) => ({
        id: `seed-experience-${i}`,
        kind: 'experience' as const,
        data,
      })),
    );
  }

  /** Snapshot the current state as a flat model (experience from blocks). */
  toModel(): ResumeModel {
    return {
      header: this.header(),
      sectionLabels: this.sectionLabels(),
      contactDetails: this.contactDetails(),
      links: this.links(),
      education: this.education(),
      experience: this.blocks().map((b) => b.data),
      rightPanel: this.rightPanel(),
    };
  }

  /** Serialize the current state to CSV text. */
  toCsv(): string {
    return serializeResumeCsv(this.toModel());
  }

  toggleEditMode(): void {
    this.editMode.update((on) => !on);
  }

  // --- experience blocks ------------------------------------------------------

  addBlock(kind: BlockKind): void {
    if (kind !== 'experience') return;
    const block: ResumeBlock = {
      id: this.newId(),
      kind: 'experience',
      data: emptyExperience(),
    };
    this.blocks.update((blocks) => [block, ...blocks]);
  }

  removeBlock(id: string): void {
    this.blocks.update((blocks) => blocks.filter((b) => b.id !== id));
  }

  // --- links ------------------------------------------------------------------

  addLink(): void {
    this.links.update((links) => [
      { icon: Icon.faLink, href: 'https://' },
      ...links,
    ]);
  }

  removeLink(index: number): void {
    this.links.update((links) => links.filter((_, i) => i !== index));
  }

  setLinkIcon(link: Links, icon: IconDefinition): void {
    this.links.update((links) =>
      links.map((l) => (l === link ? { ...l, icon } : l)),
    );
  }

  // --- education --------------------------------------------------------------

  addEducation(): void {
    this.education.update((education) => [
      { school: 'School', period: 'YEAR - YEAR', detail: 'Details' },
      ...education,
    ]);
  }

  removeEducation(index: number): void {
    this.education.update((education) => education.filter((_, i) => i !== index));
  }

  // --- right-panel sections ---------------------------------------------------

  addPanelItem(header: string): void {
    this.rightPanel.update((sections) =>
      sections.map((s) =>
        s.header === header ? { ...s, items: ['New item', ...s.items] } : s,
      ),
    );
  }

  removePanelItem(header: string, index: number): void {
    this.rightPanel.update((sections) =>
      sections.map((s) =>
        s.header === header
          ? { ...s, items: s.items.filter((_, i) => i !== index) }
          : s,
      ),
    );
  }

  private newId(): string {
    return crypto.randomUUID();
  }
}
