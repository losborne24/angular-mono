import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icon } from '@angular-monorepo/shared/util';

/**
 * Reusable shell around a resume block. Projects block content and reveals a
 * remove control on hover. Controls are hidden in the PDF clone
 * (see `.printable .block-controls` in paper.scss).
 */
@Component({
  selector: 'app-block-frame',
  imports: [FontAwesomeModule],
  templateUrl: './block-frame.html',
  styleUrl: './block-frame.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockFrame {
  readonly icon = Icon;

  /** Show the remove control. Off outside edit mode. */
  readonly removable = input<boolean>(true);

  readonly remove = output<void>();
}
