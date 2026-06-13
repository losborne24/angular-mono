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
  type Experience,
  type Links,
  type ResumeBlock,
  type ResumeModel,
} from '@angular-monorepo/resume/util';

/** The two fixed side-panel lists. */
export type PanelKey = 'achievements' | 'certifications';

/** URL of the seed CSV shipped as a static asset. */
const RESUME_CSV_URL = '/resume.csv';

/**
 * Editable resume content: a {@link ResumeModel} whose flat `experience` array
 * is swapped for id'd {@link ResumeBlock}s, so the template can `track` blocks
 * and mutate them by id. `contentFromModel` / `toModel` convert between the two.
 */
interface ResumeContent extends Omit<ResumeModel, 'experience'> {
  /** Experience companies as left-column blocks. */
  blocks: ResumeBlock[];
}

/** Store state: the resume content plus UI-only flags. */
interface ResumeState {
  content: ResumeContent;
  /** When true, inline-edit and add/remove controls are active. */
  editMode: boolean;
}

const initialState: ResumeState = {
  content: {
    header: { name: '', title: '' },
    contactDetails: [],
    links: [],
    education: [],
    achievements: [],
    certifications: [],
    blocks: [],
  },
  editMode: false,
};

/** Map a parsed model into editable content (experience -> id'd blocks). */
function contentFromModel(model: ResumeModel): ResumeContent {
  return {
    header: model.header,
    contactDetails: model.contactDetails,
    links: model.links,
    education: model.education,
    achievements: model.achievements,
    certifications: model.certifications,
    blocks: model.experience.map((data, i) => ({
      id: `seed-experience-${i}`,
      data,
    })),
  };
}

/**
 * In-memory draft of the resume, hydrated from a CSV asset on init.
 *
 * Built on `@ngrx/signals`: {@link withState} exposes `content` and `editMode`
 * as read-only signals, and every mutation goes through `patchState`, which
 * replaces the affected slice immutably. Nothing outside the store writes state
 * — important under zoneless change detection, where an in-place mutation would
 * not notify the signal graph. `toModel` / `toCsv` round-trip the current
 * content back out for download/upload.
 */
export const ResumeStore = signalStore(
  withState<ResumeState>(initialState),
  withMethods((store) => {
    // --- private immutable-rebuild helpers ------------------------------------

    /** Immutably patch one or more fields of the resume content. */
    function patchContent(partial: Partial<ResumeContent>): void {
      patchState(store, { content: { ...store.content(), ...partial } });
    }

    /** Immutably replace one block's Experience data, found by id. */
    function updateExperience(id: string, recipe: (data: Experience) => Experience): void {
      patchContent({
        blocks: store.content().blocks.map((b) => (b.id === id ? { ...b, data: recipe(b.data) } : b)),
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
        patchState(store, { content: contentFromModel(parseResumeCsv(text)), editMode: false });
      },

      /** Replace all content from a parsed model. */
      hydrate(model: ResumeModel): void {
        patchState(store, { content: contentFromModel(model), editMode: false });
      },

      /** Clear all content to a blank resume and switch on edit mode. */
      reset(): void {
        patchState(store, {
          content: contentFromModel({
            header: { name: 'Your Name', title: 'Your Title' },
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
            achievements: [],
            certifications: [],
          }),
          editMode: true,
        });
      },

      /** Snapshot the current content as a flat model (experience from blocks). */
      toModel(): ResumeModel {
        const { blocks, ...rest } = store.content();
        return { ...rest, experience: blocks.map((b) => b.data) };
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
        patchContent({ header: { ...store.content().header, name } });
      },

      updateHeaderTitle(title: string): void {
        patchContent({ header: { ...store.content().header, title } });
      },

      // --- experience blocks --------------------------------------------------

      addBlock(): void {
        const block: ResumeBlock = { id: newId(), data: emptyExperience() };
        patchContent({ blocks: [block, ...store.content().blocks] });
      },

      removeBlock(id: string): void {
        patchContent({ blocks: store.content().blocks.filter((b) => b.id !== id) });
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
        patchContent({ links: [{ icon: Icon.faLink, href: 'https://' }, ...store.content().links] });
      },

      removeLink(index: number): void {
        patchContent({ links: store.content().links.filter((_, i) => i !== index) });
      },

      setLinkIcon(link: Links, icon: IconDefinition): void {
        patchContent({ links: store.content().links.map((l) => (l === link ? { ...l, icon } : l)) });
      },

      updateLinkHref(index: number, href: string): void {
        patchContent({ links: store.content().links.map((l, i) => (i === index ? { ...l, href } : l)) });
      },

      // --- contact details ----------------------------------------------------

      updateContactText(index: number, text: string): void {
        patchContent({
          contactDetails: store.content().contactDetails.map((d, i) => (i === index ? { ...d, text } : d)),
        });
      },

      // --- education ----------------------------------------------------------

      addEducation(): void {
        patchContent({
          education: [{ school: 'School', period: 'YEAR - YEAR', detail: 'Details' }, ...store.content().education],
        });
      },

      removeEducation(index: number): void {
        patchContent({ education: store.content().education.filter((_, i) => i !== index) });
      },

      updateEducationSchool(index: number, school: string): void {
        patchContent({
          education: store.content().education.map((e, i) => (i === index ? { ...e, school } : e)),
        });
      },

      updateEducationPeriod(index: number, period: string): void {
        patchContent({
          education: store.content().education.map((e, i) => (i === index ? { ...e, period } : e)),
        });
      },

      updateEducationDetail(index: number, detail: string): void {
        patchContent({
          education: store.content().education.map((e, i) => (i === index ? { ...e, detail } : e)),
        });
      },

      // --- side-panel lists (achievements / certifications) -------------------

      addPanelItem(key: PanelKey): void {
        patchContent({ [key]: ['New item', ...store.content()[key]] });
      },

      removePanelItem(key: PanelKey, index: number): void {
        patchContent({ [key]: store.content()[key].filter((_, i) => i !== index) });
      },

      updatePanelItem(key: PanelKey, index: number, value: string): void {
        patchContent({ [key]: store.content()[key].map((item, i) => (i === index ? value : item)) });
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
