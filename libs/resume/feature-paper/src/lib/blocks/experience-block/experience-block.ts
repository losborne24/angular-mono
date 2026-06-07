import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InlineEditDirective } from '@angular-monorepo/shared/ui';
import { Icon } from '@angular-monorepo/shared/util';
import {
  emptyContribution,
  emptyPosition,
  type ExperienceBlock as ExperienceBlockModel,
  type Position,
} from '@angular-monorepo/resume/util';

@Component({
  selector: 'app-experience-block',
  imports: [FontAwesomeModule, InlineEditDirective],
  templateUrl: './experience-block.html',
  styleUrl: './experience-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceBlock {
  readonly icon = Icon;
  readonly block = input.required<ExperienceBlockModel>();

  addPosition(): void {
    this.block().data.positions.push(emptyPosition());
  }

  removePosition(index: number): void {
    this.block().data.positions.splice(index, 1);
  }

  addTech(position: Position): void {
    position.techStack.push('Tech');
  }

  removeTech(position: Position, index: number): void {
    position.techStack.splice(index, 1);
  }

  addContribution(position: Position): void {
    position.contributions.push(emptyContribution());
  }

  removeContribution(position: Position, index: number): void {
    position.contributions.splice(index, 1);
  }
}
