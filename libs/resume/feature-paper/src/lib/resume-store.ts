import { Injectable, signal, type Signal } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Icon } from '@angular-monorepo/shared/util';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  emptyContribution,
  emptyExperience,
  emptyPosition,
  parseResumeCsv,
  serializeResumeCsv,
  type BlockKind,
  type ContactDetail,
  type Education,
  type Experience,
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
 * In-memory draft of the resume, hydrated from a CSV asset on init.
 *
 * Producer/consumer split: state is exposed as read-only {@link Signal}s
 * (the public fields), and every mutation goes through a method that rebuilds
 * the affected slice immutably and calls `.set()`/`.update()` on the private
 * backing signal. Nothing outside the store may write state — important under
 * zoneless change detection, where an in-place mutation would not notify the
 * signal graph. {@link toModel} / {@link toCsv} round-trip the current state
 * back out for download/upload.
 */
@Injectable()
export class ResumeStore {
  private readonly _header = signal<ResumeHeader>({ name: '', title: '' });
  private readonly _sectionLabels = signal<SectionLabels>({
    experience: '',
    links: '',
    education: '',
  });
  private readonly _contactDetails = signal<ContactDetail[]>([]);
  private readonly _links = signal<Links[]>([]);
  private readonly _education = signal<Education[]>([]);
  private readonly _rightPanel = signal<RightPanelSection[]>([]);
  /** Experience companies as left-column blocks. */
  private readonly _blocks = signal<ResumeBlock[]>([]);
  /** When true, inline-edit and add/remove controls are active. */
  private readonly _editMode = signal<boolean>(false);

  // --- read-only public views -------------------------------------------------

  readonly header: Signal<ResumeHeader> = this._header.asReadonly();
  readonly sectionLabels: Signal<SectionLabels> =
    this._sectionLabels.asReadonly();
  readonly contactDetails: Signal<ContactDetail[]> =
    this._contactDetails.asReadonly();
  readonly links: Signal<Links[]> = this._links.asReadonly();
  readonly education: Signal<Education[]> = this._education.asReadonly();
  readonly rightPanel: Signal<RightPanelSection[]> =
    this._rightPanel.asReadonly();
  readonly blocks: Signal<ResumeBlock[]> = this._blocks.asReadonly();
  readonly editMode: Signal<boolean> = this._editMode.asReadonly();

  constructor() {
    void this.load();
  }

  // --- lifecycle --------------------------------------------------------------

  /** Fetch and parse the seed CSV, then hydrate all signals. */
  async load(url = RESUME_CSV_URL): Promise<void> {
    const res = await fetch(url);
    const text = await res.text();
    this.hydrate(parseResumeCsv(text));
  }

  /** Replace all state from a parsed model. */
  hydrate(model: ResumeModel): void {
    this._header.set(model.header);
    this._sectionLabels.set(model.sectionLabels);
    this._contactDetails.set(model.contactDetails);
    this._links.set(model.links);
    this._education.set(model.education);
    this._rightPanel.set(model.rightPanel);
    this._blocks.set(
      model.experience.map((data, i) => ({
        id: `seed-experience-${i}`,
        kind: 'experience' as const,
        data,
      })),
    );
  }

  /** Clear all content to a blank resume and switch on edit mode. */
  reset(): void {
    this.hydrate({
      header: { name: 'Your Name', title: 'Your Title' },
      sectionLabels: this._sectionLabels(),
      // Contacts have no add-control, so seed the standard rows to edit.
      contactDetails: [
        { icon: Icon.faLocationDot, text: 'City, Country' },
        { icon: Icon.faPhone, text: 'Phone number' },
        { icon: Icon.faEnvelope, text: 'email@example.com', href: 'mailto:email@example.com' },
      ],
      links: [],
      education: [],
      experience: [],
      // Keep empty sections so their add-item controls still render.
      rightPanel: [
        { header: 'ACHIEVEMENTS', items: [] },
        { header: 'CERTIFICATIONS', items: [] },
      ],
    });
    this._editMode.set(true);
  }

  /** Snapshot the current state as a flat model (experience from blocks). */
  toModel(): ResumeModel {
    return {
      header: this._header(),
      sectionLabels: this._sectionLabels(),
      contactDetails: this._contactDetails(),
      links: this._links(),
      education: this._education(),
      experience: this._blocks().map((b) => b.data),
      rightPanel: this._rightPanel(),
    };
  }

  /** Serialize the current state to CSV text. */
  toCsv(): string {
    return serializeResumeCsv(this.toModel());
  }

  // --- edit mode --------------------------------------------------------------

  toggleEditMode(): void {
    this._editMode.update((on) => !on);
  }

  setEditMode(on: boolean): void {
    this._editMode.set(on);
  }

  // --- header -----------------------------------------------------------------

  updateHeaderName(name: string): void {
    this._header.update((h) => ({ ...h, name }));
  }

  updateHeaderTitle(title: string): void {
    this._header.update((h) => ({ ...h, title }));
  }

  // --- experience blocks ------------------------------------------------------

  addBlock(kind: BlockKind): void {
    if (kind !== 'experience') return;
    const block: ResumeBlock = {
      id: this.newId(),
      kind: 'experience',
      data: emptyExperience(),
    };
    this._blocks.update((blocks) => [block, ...blocks]);
  }

  removeBlock(id: string): void {
    this._blocks.update((blocks) => blocks.filter((b) => b.id !== id));
  }

  updateCompanyName(id: string, companyName: string): void {
    this.updateExperience(id, (data) => ({ ...data, companyName }));
  }

  // --- positions (by block id + position index) -------------------------------

  addPosition(id: string): void {
    this.updateExperience(id, (data) => ({
      ...data,
      positions: [...data.positions, emptyPosition()],
    }));
  }

  removePosition(id: string, posIndex: number): void {
    this.updateExperience(id, (data) => ({
      ...data,
      positions: data.positions.filter((_, i) => i !== posIndex),
    }));
  }

  updatePositionTitle(id: string, posIndex: number, position: string): void {
    this.updatePosition(id, posIndex, (p) => ({ ...p, position }));
  }

  updatePositionPeriod(id: string, posIndex: number, period: string): void {
    this.updatePosition(id, posIndex, (p) => ({ ...p, period }));
  }

  /** Split an edited "Angular | TypeScript" line back into the techStack array. */
  setTechStack(id: string, posIndex: number, line: string): void {
    const techStack = line
      .split('|')
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
    this.updatePosition(id, posIndex, (p) => ({ ...p, techStack }));
  }

  // --- contributions (by block id + position index + contribution index) ------

  addContribution(id: string, posIndex: number): void {
    this.updatePosition(id, posIndex, (p) => ({
      ...p,
      contributions: [...p.contributions, emptyContribution()],
    }));
  }

  removeContribution(id: string, posIndex: number, conIndex: number): void {
    this.updatePosition(id, posIndex, (p) => ({
      ...p,
      contributions: p.contributions.filter((_, i) => i !== conIndex),
    }));
  }

  moveContribution(
    id: string,
    posIndex: number,
    from: number,
    to: number,
  ): void {
    this.updatePosition(id, posIndex, (p) => {
      // moveItemInArray mutates in place — apply it to a copy.
      const contributions = [...p.contributions];
      moveItemInArray(contributions, from, to);
      return { ...p, contributions };
    });
  }

  updateContributionCategory(
    id: string,
    posIndex: number,
    conIndex: number,
    category: string,
  ): void {
    this.updateContribution(id, posIndex, conIndex, (c) => ({
      ...c,
      category,
    }));
  }

  updateContributionText(
    id: string,
    posIndex: number,
    conIndex: number,
    contribution: string,
  ): void {
    this.updateContribution(id, posIndex, conIndex, (c) => ({
      ...c,
      contribution,
    }));
  }

  // --- links ------------------------------------------------------------------

  addLink(): void {
    this._links.update((links) => [
      { icon: Icon.faLink, href: 'https://' },
      ...links,
    ]);
  }

  removeLink(index: number): void {
    this._links.update((links) => links.filter((_, i) => i !== index));
  }

  setLinkIcon(link: Links, icon: IconDefinition): void {
    this._links.update((links) =>
      links.map((l) => (l === link ? { ...l, icon } : l)),
    );
  }

  updateLinkHref(index: number, href: string): void {
    this._links.update((links) =>
      links.map((l, i) => (i === index ? { ...l, href } : l)),
    );
  }

  // --- contact details --------------------------------------------------------

  updateContactText(index: number, text: string): void {
    this._contactDetails.update((details) =>
      details.map((d, i) => (i === index ? { ...d, text } : d)),
    );
  }

  // --- education --------------------------------------------------------------

  addEducation(): void {
    this._education.update((education) => [
      { school: 'School', period: 'YEAR - YEAR', detail: 'Details' },
      ...education,
    ]);
  }

  removeEducation(index: number): void {
    this._education.update((education) =>
      education.filter((_, i) => i !== index),
    );
  }

  updateEducationSchool(index: number, school: string): void {
    this._education.update((education) =>
      education.map((e, i) => (i === index ? { ...e, school } : e)),
    );
  }

  updateEducationPeriod(index: number, period: string): void {
    this._education.update((education) =>
      education.map((e, i) => (i === index ? { ...e, period } : e)),
    );
  }

  updateEducationDetail(index: number, detail: string): void {
    this._education.update((education) =>
      education.map((e, i) => (i === index ? { ...e, detail } : e)),
    );
  }

  updateEducationItem(
    eduIndex: number,
    itemIndex: number,
    value: string,
  ): void {
    this._education.update((education) =>
      education.map((e, i) =>
        i !== eduIndex
          ? e
          : {
              ...e,
              items: (e.items ?? []).map((item, j) =>
                j === itemIndex ? value : item,
              ),
            },
      ),
    );
  }

  // --- right-panel sections ---------------------------------------------------

  addPanelItem(header: string): void {
    this._rightPanel.update((sections) =>
      sections.map((s) =>
        s.header === header ? { ...s, items: ['New item', ...s.items] } : s,
      ),
    );
  }

  removePanelItem(header: string, index: number): void {
    this._rightPanel.update((sections) =>
      sections.map((s) =>
        s.header === header
          ? { ...s, items: s.items.filter((_, i) => i !== index) }
          : s,
      ),
    );
  }

  updatePanelItem(header: string, index: number, value: string): void {
    this._rightPanel.update((sections) =>
      sections.map((s) =>
        s.header === header
          ? { ...s, items: s.items.map((item, i) => (i === index ? value : item)) }
          : s,
      ),
    );
  }

  // --- private immutable-rebuild helpers --------------------------------------

  /** Immutably replace one block's Experience data, found by id. */
  private updateExperience(
    id: string,
    recipe: (data: Experience) => Experience,
  ): void {
    this._blocks.update((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, data: recipe(b.data) } : b)),
    );
  }

  /** Immutably replace one position within a block. */
  private updatePosition(
    id: string,
    posIndex: number,
    recipe: (p: Experience['positions'][number]) => Experience['positions'][number],
  ): void {
    this.updateExperience(id, (data) => ({
      ...data,
      positions: data.positions.map((p, i) => (i === posIndex ? recipe(p) : p)),
    }));
  }

  /** Immutably replace one contribution within a position. */
  private updateContribution(
    id: string,
    posIndex: number,
    conIndex: number,
    recipe: (
      c: Experience['positions'][number]['contributions'][number],
    ) => Experience['positions'][number]['contributions'][number],
  ): void {
    this.updatePosition(id, posIndex, (p) => ({
      ...p,
      contributions: p.contributions.map((c, i) =>
        i === conIndex ? recipe(c) : c,
      ),
    }));
  }

  private newId(): string {
    return crypto.randomUUID();
  }
}
