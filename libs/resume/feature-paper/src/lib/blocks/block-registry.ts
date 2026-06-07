import { Type } from '@angular/core';
import type { BlockKind } from '@angular-monorepo/resume/util';
import { ExperienceBlock } from './experience-block/experience-block';

/** Maps a block kind to the component that renders it. */
export const BLOCK_REGISTRY: Record<BlockKind, Type<unknown>> = {
  experience: ExperienceBlock,
};
