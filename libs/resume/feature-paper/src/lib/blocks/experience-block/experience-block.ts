import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InlineEditDirective } from '@angular-monorepo/shared/ui';
import { Icon } from '@angular-monorepo/shared/util';
import {
  emptyContribution,
  emptyPosition,
  type ExperienceBlock as ExperienceBlockModel,
  type Position,
} from '@angular-monorepo/resume/util';
import { ResumeStore } from '../resume-store';

@Component({
  selector: 'app-experience-block',
  imports: [
    FontAwesomeModule,
    InlineEditDirective,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './experience-block.html',
  styleUrl: './experience-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceBlock {
  readonly icon = Icon;
  readonly store = inject(ResumeStore);
  readonly block = input.required<ExperienceBlockModel>();
  /** Show the remove control. Off outside edit mode. */
  readonly removable = input<boolean>(true);
  readonly remove = output<void>();

  addPosition(): void {
    this.block().data.positions.push(emptyPosition());
  }

  removePosition(index: number): void {
    this.block().data.positions.splice(index, 1);
  }

  /** Tech stack joined into one editable line (e.g. "Angular | TypeScript"). */
  techStackText(position: Position): string {
    return position.techStack.join(' | ');
  }

  /** Split the edited line back into the techStack array. */
  setTechStack(position: Position, value: string): void {
    position.techStack = value
      .split('|')
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
  }

  addContribution(position: Position): void {
    position.contributions.push(emptyContribution());
  }

  removeContribution(position: Position, index: number): void {
    position.contributions.splice(index, 1);
  }

  moveContribution(position: Position, event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      position.contributions,
      event.previousIndex,
      event.currentIndex,
    );
  }
}
