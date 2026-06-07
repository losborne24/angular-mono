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
  IconPicker,
} from '@angular-monorepo/shared/ui';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { Links } from '@angular-monorepo/resume/util';
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
    IconPicker,
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

  addLink(): void {
    this.links.push({ icon: Icon.faLink, href: 'https://' });
  }

  removeLink(index: number): void {
    this.links.splice(index, 1);
  }

  /** In edit mode, suppress navigation so the click edits the href text. */
  onLinkClick(event: MouseEvent): void {
    if (this.store.editMode()) event.preventDefault();
  }

  setLinkIcon(link: Links, icon: IconDefinition): void {
    link.icon = icon;
  }
}
