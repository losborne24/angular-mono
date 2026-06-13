import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icon } from '@angular-monorepo/shared/util';
import { parseResumeCsv } from '@angular-monorepo/resume/util';
import {
  ExportPdfDirective,
  CopyUrlDirective,
  InlineEditDirective,
  IconButton,
  IconPicker,
} from '@angular-monorepo/shared/ui';
import { ResumeStore } from '../resume-store/resume-store';
import { ExperienceBlock } from '../experience-block/experience-block';

@Component({
  selector: 'app-paper',
  imports: [
    FontAwesomeModule,
    ExportPdfDirective,
    CopyUrlDirective,
    InlineEditDirective,
    IconButton,
    IconPicker,
    ExperienceBlock,
  ],
  providers: [ResumeStore],
  templateUrl: './paper.html',
  styleUrl: './paper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paper {
  readonly icon = Icon;
  readonly store = inject(ResumeStore);

  /** In edit mode, suppress navigation so the click edits the href text. */
  onLinkClick(event: MouseEvent): void {
    if (this.store.editMode()) event.preventDefault();
  }

  /** Drag the aside resizer: map the pointer x onto a width % of the paper. */
  onResizeStart(event: PointerEvent): void {
    event.preventDefault();
    const handle = event.target as HTMLElement;
    const paper = handle.closest('.paper-container') as HTMLElement | null;
    if (!paper) return;

    handle.setPointerCapture(event.pointerId);

    const onMove = (e: PointerEvent): void => {
      const rect = paper.getBoundingClientRect();
      // Aside grows as the pointer moves left, so measure from the right edge.
      const percent = ((rect.right - e.clientX) / rect.width) * 100;
      this.store.setAsideWidth(percent);
    };

    const onUp = (): void => {
      handle.releasePointerCapture(event.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  }

  /** Clear the resume to a blank slate after confirmation. */
  startOver(): void {
    const ok = confirm('Start over with a new, blank resume? This clears all current content.');
    if (ok) this.store.reset();
  }

  /** Serialize current state and trigger a CSV file download. */
  downloadCsv(): void {
    const blob = new Blob([this.store.toCsv()], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'resume.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /** Parse the chosen CSV file and replace the current resume state. */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    this.store.hydrate(parseResumeCsv(text));
    // Reset so selecting the same file again re-triggers change.
    input.value = '';
  }
}
