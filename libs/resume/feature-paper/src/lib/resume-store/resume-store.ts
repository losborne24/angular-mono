import { moveItemInArray } from '@angular/cdk/drag-drop';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { produce } from 'immer';
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
    // --- private draft helpers (immer) ----------------------------------------

    /** Apply an immer recipe to the resume content, producing a new immutable slice. */
    function mutateContent(recipe: (content: ResumeContent) => void): void {
      patchState(store, (state) => ({ content: produce(state.content, recipe) }));
    }

    /** Run a recipe against one block's Experience data, found by id. */
    function updateExperience(id: string, recipe: (data: Experience) => void): void {
      mutateContent((content) => {
        const block = content.blocks.find((b) => b.id === id);
        if (block) recipe(block.data);
      });
    }

    /** Run a recipe against one position within a block. */
    function updatePosition(
      id: string,
      posIndex: number,
      recipe: (p: Experience['positions'][number]) => void,
    ): void {
      updateExperience(id, (data) => {
        const position = data.positions[posIndex];
        if (position) recipe(position);
      });
    }

    /** Run a recipe against one contribution within a position. */
    function updateContribution(
      id: string,
      posIndex: number,
      conIndex: number,
      recipe: (c: Experience['positions'][number]['contributions'][number]) => void,
    ): void {
      updatePosition(id, posIndex, (p) => {
        const contribution = p.contributions[conIndex];
        if (contribution) recipe(contribution);
      });
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
        this.hydrate(parseResumeCsv(text));
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
        mutateContent((content) => {
          content.header.name = name;
        });
      },

      updateHeaderTitle(title: string): void {
        mutateContent((content) => {
          content.header.title = title;
        });
      },

      // --- experience blocks --------------------------------------------------

      addBlock(): void {
        const block: ResumeBlock = { id: newId(), data: emptyExperience() };
        mutateContent((content) => {
          content.blocks.unshift(block);
        });
      },

      removeBlock(id: string): void {
        mutateContent((content) => {
          content.blocks = content.blocks.filter((b) => b.id !== id);
        });
      },

      updateCompanyName(id: string, companyName: string): void {
        updateExperience(id, (data) => {
          data.companyName = companyName;
        });
      },

      // --- positions (by block id + position index) ---------------------------

      addPosition(id: string): void {
        updateExperience(id, (data) => {
          data.positions.push(emptyPosition());
        });
      },

      removePosition(id: string, posIndex: number): void {
        updateExperience(id, (data) => {
          data.positions.splice(posIndex, 1);
        });
      },

      updatePositionTitle(id: string, posIndex: number, position: string): void {
        updatePosition(id, posIndex, (p) => {
          p.position = position;
        });
      },

      updatePositionPeriod(id: string, posIndex: number, period: string): void {
        updatePosition(id, posIndex, (p) => {
          p.period = period;
        });
      },

      /** Split an edited "Angular | TypeScript" line back into the techStack array. */
      setTechStack(id: string, posIndex: number, line: string): void {
        const techStack = line
          .split('|')
          .map((tech) => tech.trim())
          .filter((tech) => tech.length > 0);
        updatePosition(id, posIndex, (p) => {
          p.techStack = techStack;
        });
      },

      // --- contributions (by block id + position index + contribution index) --

      addContribution(id: string, posIndex: number): void {
        updatePosition(id, posIndex, (p) => {
          p.contributions.push(emptyContribution());
        });
      },

      removeContribution(id: string, posIndex: number, conIndex: number): void {
        updatePosition(id, posIndex, (p) => {
          p.contributions.splice(conIndex, 1);
        });
      },

      moveContribution(id: string, posIndex: number, from: number, to: number): void {
        updatePosition(id, posIndex, (p) => {
          moveItemInArray(p.contributions, from, to);
        });
      },

      updateContributionCategory(id: string, posIndex: number, conIndex: number, category: string): void {
        updateContribution(id, posIndex, conIndex, (c) => {
          c.category = category;
        });
      },

      updateContributionText(id: string, posIndex: number, conIndex: number, contribution: string): void {
        updateContribution(id, posIndex, conIndex, (c) => {
          c.contribution = contribution;
        });
      },

      // --- links --------------------------------------------------------------

      addLink(): void {
        mutateContent((content) => {
          content.links.unshift({ icon: Icon.faLink, href: 'https://' });
        });
      },

      removeLink(index: number): void {
        mutateContent((content) => {
          content.links.splice(index, 1);
        });
      },

      setLinkIcon(link: Links, icon: IconDefinition): void {
        const index = store.content().links.indexOf(link);
        if (index < 0) return;
        mutateContent((content) => {
          content.links[index].icon = icon;
        });
      },

      updateLinkHref(index: number, href: string): void {
        mutateContent((content) => {
          content.links[index].href = href;
        });
      },

      // --- contact details ----------------------------------------------------

      updateContactText(index: number, text: string): void {
        mutateContent((content) => {
          content.contactDetails[index].text = text;
        });
      },

      // --- education ----------------------------------------------------------

      addEducation(): void {
        mutateContent((content) => {
          content.education.unshift({ school: 'School', period: 'YEAR - YEAR', detail: 'Details' });
        });
      },

      removeEducation(index: number): void {
        mutateContent((content) => {
          content.education.splice(index, 1);
        });
      },

      updateEducationSchool(index: number, school: string): void {
        mutateContent((content) => {
          content.education[index].school = school;
        });
      },

      updateEducationPeriod(index: number, period: string): void {
        mutateContent((content) => {
          content.education[index].period = period;
        });
      },

      updateEducationDetail(index: number, detail: string): void {
        mutateContent((content) => {
          content.education[index].detail = detail;
        });
      },

      // --- side-panel lists (achievements / certifications) -------------------

      addPanelItem(key: PanelKey): void {
        mutateContent((content) => {
          content[key].unshift('New item');
        });
      },

      removePanelItem(key: PanelKey, index: number): void {
        mutateContent((content) => {
          content[key].splice(index, 1);
        });
      },

      updatePanelItem(key: PanelKey, index: number, value: string): void {
        mutateContent((content) => {
          content[key][index] = value;
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
