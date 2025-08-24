'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  format?: 'png' | 'jpeg' | 'pdf';
  quality?: number;
  width?: number;
  height?: number;
}

/**
 * Export a DOM element as an image or PDF
 */
export async function exportElement(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'cutzamala-export',
    format = 'png',
    quality = 0.95,
    width,
    height
  } = options;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: false,
      width: width || element.offsetWidth,
      height: height || element.offsetHeight
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
    } else {
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, quality);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export content. Please try again.');
  }
}

/**
 * Export chart data as CSV
 */
export function exportToCSV(data: unknown[], filename: string = 'cutzamala-data'): void {
  if (!data || data.length === 0) {
    throw new Error('No data available for export');
  }

  try {
    // Convert data to CSV format
    const firstRow = data[0] as Record<string, unknown>;
    const headers = Object.keys(firstRow);
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        const typedRow = row as Record<string, unknown>;
        return headers.map(header => {
          const value = typedRow[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('Failed to export CSV. Please try again.');
  }
}

/**
 * Export multiple charts as a combined PDF report
 */
export async function exportReport(
  elements: { element: HTMLElement; title: string }[],
  reportTitle: string = 'Reporte del Sistema Cutzamala'
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title page
    pdf.setFontSize(24);
    pdf.text(reportTitle, 105, 50, { align: 'center' });
    
    pdf.setFontSize(12);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Generado el ${currentDate}`, 105, 70, { align: 'center' });

    for (let i = 0; i < elements.length; i++) {
      const { element, title } = elements[i];
      
      pdf.addPage();
      
      // Add section title
      pdf.setFontSize(16);
      pdf.text(title, 105, 20, { align: 'center' });

      // Capture element as image
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180; // Fit within A4 margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Center the image
      const x = (210 - imgWidth) / 2; // A4 width is 210mm
      const y = 30;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    }

    pdf.save(`${reportTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Report export failed:', error);
    throw new Error('Failed to generate report. Please try again.');
  }
}