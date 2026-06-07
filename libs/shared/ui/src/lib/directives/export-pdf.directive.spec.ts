import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { ExportPdfDirective } from './export-pdf.directive';
import { vi } from 'vitest';

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getImageProperties: vi.fn().mockReturnValue({
        width: 800,
        height: 600,
      }),
      internal: {
        pageSize: {
          getWidth: vi.fn().mockReturnValue(210),
        },
      },
      addImage: vi.fn(),
      save: vi.fn(),
    })),
  };
});

// Mock dom-to-image-more
vi.mock('dom-to-image-more', () => ({
  default: {
    toPng: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
  },
}));

@Component({
  template: '<div appExportPdf #exporter="appExportPdf">Test Content</div>',
  standalone: true,
  imports: [ExportPdfDirective],
})
class TestComponent {
  @ViewChild('exporter', { static: false }) exporter!: ExportPdfDirective;
}

describe('ExportPdfDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: ExportPdfDirective;
  let element: HTMLElement;

  beforeEach(async () => {
    // Mock requestIdleCallback
    global.requestIdleCallback = vi.fn((callback) => {
      setTimeout(callback, 0);
      return 0;
    }) as unknown as typeof requestIdleCallback;

    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    directive = fixture.componentInstance.exporter;
    element = fixture.nativeElement.querySelector('[appExportPdf]');
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should have default filename', () => {
    expect(directive.filename()).toBe('document.pdf');
  });

  it('should have default scale', () => {
    expect(directive.scale()).toBe(3);
  });

  describe('export()', () => {
    it('should apply scale transform to clone', () => {
      directive.export();

      const clonedNode = element.lastChild as HTMLElement;
      expect(clonedNode.style.transform).toBe('scale(3)');
      expect(clonedNode.style.transformOrigin).toBe('top left');
    });

    it('should call pdf.addImage and pdf.save with correct parameters', async () => {
      const jsPDF = (await import('jspdf')).default;
      const mockAddImage = vi.fn();
      const mockSave = vi.fn();
      const mockGetImageProperties = vi.fn().mockReturnValue({
        width: 800,
        height: 600,
      });
      const mockGetWidth = vi.fn().mockReturnValue(210);

      (jsPDF as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getImageProperties: mockGetImageProperties,
        internal: {
          pageSize: {
            getWidth: mockGetWidth,
          },
        },
        addImage: mockAddImage,
        save: mockSave,
      }));

      vi.useFakeTimers();
      directive.export();
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      expect(mockAddImage).toHaveBeenCalledWith(
        'data:image/png;base64,mock',
        'PNG',
        0,
        0,
        210,
        157.5
      );
      expect(mockSave).toHaveBeenCalledWith('document.pdf');
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const domtoimage = await import('dom-to-image-more');
      vi.spyOn(domtoimage.default, 'toPng').mockRejectedValueOnce(
        new Error('Image conversion failed')
      );

      vi.useFakeTimers();
      directive.export();
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating PDF:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should clean up SVG styles in clone', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('svg-inline--fa');
      (svg as SVGElement & { style: CSSStyleDeclaration }).style.border =
        '1px solid red';
      element.appendChild(svg);

      directive.export();

      const clonedNode = element.lastChild as HTMLElement;
      const clonedSvg = clonedNode.querySelector(
        'svg.svg-inline--fa'
      ) as SVGElement & { style: CSSStyleDeclaration };
      expect(clonedSvg).toBeTruthy();
      expect(clonedSvg.style.border).toBe('');
    });
  });
});
