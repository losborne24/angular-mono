import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButton, InlineEditDirective } from '@angular-monorepo/shared/ui';
import { Icon } from '@angular-monorepo/shared/util';
import { type ExperienceBlock as ExperienceBlockModel, type Position } from '@angular-monorepo/resume/util';
import { ResumeStore } from '../resume-store/resume-store';

@Component({
  selector: 'app-experience-block',
  imports: [FontAwesomeModule, InlineEditDirective, IconButton, CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './experience-block.html',
  styleUrl: './experience-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceBlock {
  readonly icon = Icon;
  readonly store = inject(ResumeStore);
  readonly block = input.required<ExperienceBlockModel>();
  /** Show the remove control. Off outside edit mode. */
  readonly removable = input<boolean>(false);
  readonly remove = output<void>();

  /** Tech stack joined into one editable line (e.g. "Angular | TypeScript"). */
  techStackText(position: Position): string {
    return position.techStack.join(' | ');
  }
}
