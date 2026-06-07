import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CONTACT_DETAILS, LINKS, EXPERIENCE, RIGHT_PANEL } from './paper-data';
import type {
  ContactDetail,
  Links,
  Experience,
  RightPanelSection,
} from '@angular-monorepo/resume/util';
import { Icon } from '@angular-monorepo/shared/util';
import {
  ExportPdfDirective,
  CopyUrlDirective,
} from '@angular-monorepo/shared/ui';

@Component({
  selector: 'app-paper',
  imports: [
    CommonModule,
    FontAwesomeModule,
    ExportPdfDirective,
    CopyUrlDirective,
  ],
  templateUrl: './paper.html',
  styleUrl: './paper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paper {
  readonly icon = Icon;
  readonly contactDetails = CONTACT_DETAILS;
  readonly links = LINKS;
  readonly experience = EXPERIENCE;
  readonly rightPanel = RIGHT_PANEL;
}
