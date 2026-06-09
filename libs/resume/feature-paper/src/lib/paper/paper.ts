import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icon } from '@angular-monorepo/shared/util';
import { parseResumeCsv } from '@angular-monorepo/resume/util';
import {
  ExportPdfDirective,
  CopyUrlDirective,
  InlineEditDirective,
  IconPicker,
} from '@angular-monorepo/shared/ui';
import { ResumeStore } from '../resume-store';
import { ExperienceBlock } from '../experience-block/experience-block';

@Component({
  selector: 'app-paper',
  imports: [
    FontAwesomeModule,
    ExportPdfDirective,
    CopyUrlDirective,
    InlineEditDirective,
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

  /** Clear the resume to a blank slate after confirmation. */
  startAnew(): void {
    const ok = confirm(
      'Start a new, blank resume? This clears all current content.',
    );
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
