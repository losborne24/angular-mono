import { Directive, ElementRef, inject, input } from '@angular/core';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image-more';

/**
 * Exports the host element to a downloadable PDF.
 *
 * Renders the host element to a PNG via an offscreen, upscaled clone and writes
 * the result into a single-page jsPDF document. Apply it to the element you want
 * captured and call {@link ExportPdfDirective.export} (e.g. via a template
 * reference using `exportAs: 'appExportPdf'`).
 *
 * @example
 * ```html
 * <div appExportPdf #pdf="appExportPdf" filename="resume.pdf" [scale]="2">…</div>
 * <button (click)="pdf.export()">Download</button>
 * ```
 */
@Directive({
  selector: '[appExportPdf]',
  standalone: true,
  exportAs: 'appExportPdf',
})
export class ExportPdfDirective {
  private elementRef = inject(ElementRef<HTMLElement>);

  /** Filename used when saving the generated PDF. Defaults to `document.pdf`. */
  filename = input<string>('document.pdf');
  /** Upscale factor applied to the clone before capture; higher = sharper output. Defaults to `3`. */
  scale = input<number>(3);

  /**
   * Captures the host element and triggers a PDF download.
   *
   * Clones the host offscreen, then generates and saves the PDF during the next
   * idle callback. No-op if the host element is unavailable.
   */
  export(): void {
    if (!this.elementRef) return;

    const original = this.elementRef.nativeElement;
    const clonedNode = this.createOffscreenClone(original);

    this.elementRef.nativeElement.appendChild(clonedNode);

    requestIdleCallback(() => {
      this.generatePdfFromNode(original, clonedNode);
    });
  }

  private createOffscreenClone(original: HTMLElement): HTMLElement {
    const clone = original.cloneNode(true) as HTMLElement;
    clone.classList.add('printable');

    Object.assign(clone.style, {
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      zIndex: '-1',
      transform: `scale(${this.scale()})`,
      transformOrigin: 'top left',
    });

    const cleanupSvgStyles = (node: HTMLElement): void => {
      const svgElements = node.querySelectorAll('svg.svg-inline--fa, svg.fa-icon');
      svgElements.forEach((svg) => {
        if (svg instanceof SVGElement) {
          svg.style.border = 'none';
        }
      });
    };

    cleanupSvgStyles(clone);

    return clone;
  }

  private async generatePdfFromNode(original: HTMLElement, clone: HTMLElement): Promise<void> {
    try {
      const dataUrl = await this.nodeToImage(original, clone);
      await this.createAndSavePdf(dataUrl);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.removeClone(clone);
    }
  }

  private async nodeToImage(original: HTMLElement, clone: HTMLElement): Promise<string> {
    const width = original.offsetWidth;
    const height = original.offsetHeight;
    const scale = this.scale();

    return domtoimage.toPng(clone, {
      width: width * scale,
      height: height * scale,
      bgcolor: '#ffffff',
      style: {
        width: `${width * scale}px`,
        height: `${height * scale}px`,
      },
    });
  }

  private async createAndSavePdf(dataUrl: string): Promise<void> {
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(this.filename());
  }

  private removeClone(clone: HTMLElement): void {
    if (this.elementRef?.nativeElement.contains(clone)) {
      this.elementRef.nativeElement.removeChild(clone);
    }
  }
}
