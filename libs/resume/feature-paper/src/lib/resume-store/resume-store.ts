import { moveItemInArray } from '@angular/cdk/drag-drop';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
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

/** Shape of the in-memory draft held by the store. */
interface ResumeState {
  header: ResumeHeader;
  sectionLabels: SectionLabels;
  contactDetails: ContactDetail[];
  links: Links[];
  education: Education[];
  rightPanel: RightPanelSection[];
  /** Experience companies as left-column blocks. */
  blocks: ResumeBlock[];
  /** When true, inline-edit and add/remove controls are active. */
  editMode: boolean;
}

const initialState: ResumeState = {
  header: { name: '', title: '' },
  sectionLabels: { experience: '', links: '', education: '' },
  contactDetails: [],
  links: [],
  education: [],
  rightPanel: [],
  blocks: [],
  editMode: false,
};

/** Map a parsed model into store state (experience -> id'd blocks). */
function stateFromModel(model: ResumeModel): ResumeState {
  return {
    header: model.header,
    sectionLabels: model.sectionLabels,
    contactDetails: model.contactDetails,
    links: model.links,
    education: model.education,
    rightPanel: model.rightPanel,
    blocks: model.experience.map((data, i) => ({
      id: `seed-experience-${i}`,
      kind: 'experience' as const,
      data,
    })),
    editMode: false,
  };
}

/**
 * In-memory draft of the resume, hydrated from a CSV asset on init.
 *
 * Built on `@ngrx/signals`: {@link withState} exposes every state slice as a
 * read-only signal (`store.header()`, `store.blocks()`, …) and every mutation
 * goes through `patchState`, which replaces the affected slice immutably.
 * Nothing outside the store writes state — important under zoneless change
 * detection, where an in-place mutation would not notify the signal graph.
 * `toModel` / `toCsv` round-trip the current state back out for download/upload.
 */
/** Add-control presentation per right-panel header. */
interface PanelAddControl {
  icon: IconDefinition;
  text: string;
}

/** Header -> add-button icon + label. Extend here when a new panel header lands. */
const PANEL_ADD_CONTROLS: Record<string, PanelAddControl> = {
  CERTIFICATIONS: { icon: Icon.faCertificate, text: 'Add certification' },
  ACHIEVEMENTS: { icon: Icon.faTrophy, text: 'Add achievement' },
};
const DEFAULT_PANEL_ADD_CONTROL: PanelAddControl = { icon: Icon.faPlus, text: 'Add item' };

export const ResumeStore = signalStore(
  withState<ResumeState>(initialState),
  withMethods((store) => {
    // --- private immutable-rebuild helpers ------------------------------------

    /** Immutably replace one block's Experience data, found by id. */
    function updateExperience(id: string, recipe: (data: Experience) => Experience): void {
      patchState(store, {
        blocks: store.blocks().map((b) => (b.id === id ? { ...b, data: recipe(b.data) } : b)),
      });
    }

    /** Immutably replace one position within a block. */
    function updatePosition(
      id: string,
      posIndex: number,
      recipe: (p: Experience['positions'][number]) => Experience['positions'][number],
    ): void {
      updateExperience(id, (data) => ({
        ...data,
        positions: data.positions.map((p, i) => (i === posIndex ? recipe(p) : p)),
      }));
    }

    /** Immutably replace one contribution within a position. */
    function updateContribution(
      id: string,
      posIndex: number,
      conIndex: number,
      recipe: (
        c: Experience['positions'][number]['contributions'][number],
      ) => Experience['positions'][number]['contributions'][number],
    ): void {
      updatePosition(id, posIndex, (p) => ({
        ...p,
        contributions: p.contributions.map((c, i) => (i === conIndex ? recipe(c) : c)),
      }));
    }

    function newId(): string {
      return crypto.randomUUID();
    }

    return {
      // --- lifecycle ----------------------------------------------------------

      /** Fetch and parse the seed CSV, then hydrate all state. */
      async load(url = RESUME_CSV_URL): Promise<void> {
        const res = await fetch(url);
        const text = await res.text();
        patchState(store, stateFromModel(parseResumeCsv(text)));
      },

      /** Replace all state from a parsed model. */
      hydrate(model: ResumeModel): void {
        patchState(store, stateFromModel(model));
      },

      /** Clear all content to a blank resume and switch on edit mode. */
      reset(): void {
        patchState(store, {
          ...stateFromModel({
            header: { name: 'Your Name', title: 'Your Title' },
            sectionLabels: store.sectionLabels(),
            // Contacts have no add-control, so seed the standard rows to edit.
            contactDetails: [
              { icon: Icon.faLocationDot, text: 'City, Country' },
              { icon: Icon.faPhone, text: 'Phone number' },
              {
                icon: Icon.faEnvelope,
                text: 'email@example.com',
                href: 'mailto:email@example.com',
              },
            ],
            links: [],
            education: [],
            experience: [],
            // Keep empty sections so their add-item controls still render.
            rightPanel: [
              { header: 'ACHIEVEMENTS', items: [] },
              { header: 'CERTIFICATIONS', items: [] },
            ],
          }),
          editMode: true,
        });
      },

      /** Snapshot the current state as a flat model (experience from blocks). */
      toModel(): ResumeModel {
        return {
          header: store.header(),
          sectionLabels: store.sectionLabels(),
          contactDetails: store.contactDetails(),
          links: store.links(),
          education: store.education(),
          experience: store.blocks().map((b) => b.data),
          rightPanel: store.rightPanel(),
        };
      },

      /** Serialize the current state to CSV text. */
      toCsv(): string {
        return serializeResumeCsv(this.toModel());
      },

      // --- edit mode ----------------------------------------------------------

      toggleEditMode(): void {
        patchState(store, { editMode: !store.editMode() });
      },

      setEditMode(on: boolean): void {
        patchState(store, { editMode: on });
      },

      // --- header -------------------------------------------------------------

      updateHeaderName(name: string): void {
        patchState(store, { header: { ...store.header(), name } });
      },

      updateHeaderTitle(title: string): void {
        patchState(store, { header: { ...store.header(), title } });
      },

      // --- experience blocks --------------------------------------------------

      addBlock(kind: BlockKind): void {
        if (kind !== 'experience') return;
        const block: ResumeBlock = {
          id: newId(),
          kind: 'experience',
          data: emptyExperience(),
        };
        patchState(store, { blocks: [block, ...store.blocks()] });
      },

      removeBlock(id: string): void {
        patchState(store, {
          blocks: store.blocks().filter((b) => b.id !== id),
        });
      },

      updateCompanyName(id: string, companyName: string): void {
        updateExperience(id, (data) => ({ ...data, companyName }));
      },

      // --- positions (by block id + position index) ---------------------------

      addPosition(id: string): void {
        updateExperience(id, (data) => ({
          ...data,
          positions: [...data.positions, emptyPosition()],
        }));
      },

      removePosition(id: string, posIndex: number): void {
        updateExperience(id, (data) => ({
          ...data,
          positions: data.positions.filter((_, i) => i !== posIndex),
        }));
      },

      updatePositionTitle(id: string, posIndex: number, position: string): void {
        updatePosition(id, posIndex, (p) => ({ ...p, position }));
      },

      updatePositionPeriod(id: string, posIndex: number, period: string): void {
        updatePosition(id, posIndex, (p) => ({ ...p, period }));
      },

      /** Split an edited "Angular | TypeScript" line back into the techStack array. */
      setTechStack(id: string, posIndex: number, line: string): void {
        const techStack = line
          .split('|')
          .map((tech) => tech.trim())
          .filter((tech) => tech.length > 0);
        updatePosition(id, posIndex, (p) => ({ ...p, techStack }));
      },

      // --- contributions (by block id + position index + contribution index) --

      addContribution(id: string, posIndex: number): void {
        updatePosition(id, posIndex, (p) => ({
          ...p,
          contributions: [...p.contributions, emptyContribution()],
        }));
      },

      removeContribution(id: string, posIndex: number, conIndex: number): void {
        updatePosition(id, posIndex, (p) => ({
          ...p,
          contributions: p.contributions.filter((_, i) => i !== conIndex),
        }));
      },

      moveContribution(id: string, posIndex: number, from: number, to: number): void {
        updatePosition(id, posIndex, (p) => {
          // moveItemInArray mutates in place — apply it to a copy.
          const contributions = [...p.contributions];
          moveItemInArray(contributions, from, to);
          return { ...p, contributions };
        });
      },

      updateContributionCategory(id: string, posIndex: number, conIndex: number, category: string): void {
        updateContribution(id, posIndex, conIndex, (c) => ({ ...c, category }));
      },

      updateContributionText(id: string, posIndex: number, conIndex: number, contribution: string): void {
        updateContribution(id, posIndex, conIndex, (c) => ({
          ...c,
          contribution,
        }));
      },

      // --- links --------------------------------------------------------------

      addLink(): void {
        patchState(store, {
          links: [{ icon: Icon.faLink, href: 'https://' }, ...store.links()],
        });
      },

      removeLink(index: number): void {
        patchState(store, {
          links: store.links().filter((_, i) => i !== index),
        });
      },

      setLinkIcon(link: Links, icon: IconDefinition): void {
        patchState(store, {
          links: store.links().map((l) => (l === link ? { ...l, icon } : l)),
        });
      },

      updateLinkHref(index: number, href: string): void {
        patchState(store, {
          links: store.links().map((l, i) => (i === index ? { ...l, href } : l)),
        });
      },

      // --- contact details ----------------------------------------------------

      updateContactText(index: number, text: string): void {
        patchState(store, {
          contactDetails: store.contactDetails().map((d, i) => (i === index ? { ...d, text } : d)),
        });
      },

      // --- education ----------------------------------------------------------

      addEducation(): void {
        patchState(store, {
          education: [{ school: 'School', period: 'YEAR - YEAR', detail: 'Details' }, ...store.education()],
        });
      },

      removeEducation(index: number): void {
        patchState(store, {
          education: store.education().filter((_, i) => i !== index),
        });
      },

      updateEducationSchool(index: number, school: string): void {
        patchState(store, {
          education: store.education().map((e, i) => (i === index ? { ...e, school } : e)),
        });
      },

      updateEducationPeriod(index: number, period: string): void {
        patchState(store, {
          education: store.education().map((e, i) => (i === index ? { ...e, period } : e)),
        });
      },

      updateEducationDetail(index: number, detail: string): void {
        patchState(store, {
          education: store.education().map((e, i) => (i === index ? { ...e, detail } : e)),
        });
      },

      // --- right-panel sections -----------------------------------------------

      /** Add-button icon + label for a header. Extend PANEL_ADD_CONTROLS for new headers. */
      panelAddControl(header: string): PanelAddControl {
        return PANEL_ADD_CONTROLS[header] ?? DEFAULT_PANEL_ADD_CONTROL;
      },

      addPanelItem(header: string): void {
        patchState(store, {
          rightPanel: store
            .rightPanel()
            .map((s) => (s.header === header ? { ...s, items: ['New item', ...s.items] } : s)),
        });
      },

      removePanelItem(header: string, index: number): void {
        patchState(store, {
          rightPanel: store
            .rightPanel()
            .map((s) => (s.header === header ? { ...s, items: s.items.filter((_, i) => i !== index) } : s)),
        });
      },

      updatePanelItem(header: string, index: number, value: string): void {
        patchState(store, {
          rightPanel: store.rightPanel().map((s) =>
            s.header === header
              ? {
                  ...s,
                  items: s.items.map((item, i) => (i === index ? value : item)),
                }
              : s,
          ),
        });
      },
    };
  }),
  withHooks({
    onInit(store) {
      void store.load();
    },
  }),
);

/** Instance type of the {@link ResumeStore} for injection/typing. */
export type ResumeStore = InstanceType<typeof ResumeStore>;
