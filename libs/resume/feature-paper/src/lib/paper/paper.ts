import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  CONTACT_DETAILS,
  LINKS,
  EXPERIENCE,
  RIGHT_PANEL,
  HEADER,
  SECTION_LABELS,
  EDUCATION,
} from './paper-data';
import { Icon } from '@angular-monorepo/shared/util';
import {
  ExportPdfDirective,
  CopyUrlDirective,
  InlineEditDirective,
} from '@angular-monorepo/shared/ui';

@Component({
  selector: 'app-paper',
  imports: [
    CommonModule,
    FontAwesomeModule,
    ExportPdfDirective,
    CopyUrlDirective,
    InlineEditDirective,
  ],
  templateUrl: './paper.html',
  styleUrl: './paper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paper {
  readonly icon = Icon;

  // All editable content sourced from paper-data. Inline edits mutate these
  // objects in place via [(appInlineEdit)] two-way bindings.
  readonly header = HEADER;
  readonly sectionLabels = SECTION_LABELS;
  readonly education = EDUCATION;
  readonly contactDetails = CONTACT_DETAILS;
  readonly links = LINKS;
  readonly experience = EXPERIENCE;
  readonly rightPanel = RIGHT_PANEL;
}
