import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  CONTACT_DETAILS,
  RIGHT_PANEL,
  EDUCATION,
  SECTION_LABELS,
  LINKS,
} from './paper-data';
import { Icon } from '@angular-monorepo/shared/util';
import {
  ExportPdfDirective,
  CopyUrlDirective,
  InlineEditDirective,
} from '@angular-monorepo/shared/ui';
import { ResumeStore } from '../blocks/resume-store';
import { BlockFrame } from '../blocks/block-frame/block-frame';
import { BLOCK_REGISTRY } from '../blocks/block-registry';

@Component({
  selector: 'app-paper',
  imports: [
    CommonModule,
    NgComponentOutlet,
    FontAwesomeModule,
    ExportPdfDirective,
    CopyUrlDirective,
    InlineEditDirective,
    BlockFrame,
  ],
  providers: [ResumeStore],
  templateUrl: './paper.html',
  styleUrl: './paper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paper {
  readonly icon = Icon;
  readonly registry = BLOCK_REGISTRY;
  readonly store = inject(ResumeStore);

  // Aside content (left as-is): sourced from paper-data, edited in place.
  readonly sectionLabels = SECTION_LABELS;
  readonly education = EDUCATION;
  readonly contactDetails = CONTACT_DETAILS;
  readonly rightPanel = RIGHT_PANEL;
  readonly links = LINKS;
}
