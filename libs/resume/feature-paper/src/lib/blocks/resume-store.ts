import { Injectable, signal } from '@angular/core';
import {
  emptyExperience,
  type BlockKind,
  type ResumeBlock,
  type ResumeHeader,
} from '@angular-monorepo/resume/util';
import { HEADER, SEED_BLOCKS } from '../paper/paper-data';

/**
 * In-memory draft of the resume's left-column content. Header is mandatory and
 * never removable; blocks can be added and removed. No persistence —
 * refresh resets to the seed.
 */
@Injectable()
export class ResumeStore {
  readonly header = signal<ResumeHeader>(HEADER);
  readonly blocks = signal<ResumeBlock[]>(SEED_BLOCKS);

  /** When true, inline-edit and add/remove controls are active. */
  readonly editMode = signal<boolean>(false);

  toggleEditMode(): void {
    this.editMode.update((on) => !on);
  }

  addBlock(kind: BlockKind): void {
    if (kind !== 'experience') return;
    const block: ResumeBlock = {
      id: this.newId(),
      kind: 'experience',
      data: emptyExperience(),
    };
    this.blocks.update((blocks) => [...blocks, block]);
  }

  removeBlock(id: string): void {
    this.blocks.update((blocks) => blocks.filter((b) => b.id !== id));
  }

  private newId(): string {
    return crypto.randomUUID();
  }
}
