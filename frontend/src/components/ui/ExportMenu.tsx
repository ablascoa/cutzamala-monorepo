'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Download, FileText, Image, FileDown, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { exportElement, exportToCSV, exportReport, ExportOptions } from '@/utils/export';

interface ExportMenuProps {
  chartRef?: React.RefObject<HTMLDivElement | null>;
  data?: unknown[];
  filename?: string;
  className?: string;
  reportElements?: { element: HTMLElement; title: string }[];
}

export function ExportMenu({
  chartRef,
  data,
  filename = 'cutzamala-export',
  className = '',
  reportElements
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const { showSuccess, showError } = useNotifications();

  const handleExport = async (format: 'png' | 'jpeg' | 'pdf' | 'csv' | 'report') => {
    try {
      setExporting(format);

      if (format === 'csv') {
        if (!data || data.length === 0) {
          throw new Error('No data available for CSV export');
        }
        exportToCSV(data, filename);
      } else if (format === 'report') {
        if (!reportElements || reportElements.length === 0) {
          throw new Error('No report elements available');
        }
        await exportReport(reportElements, `Reporte ${filename}`);
      } else {
        if (!chartRef?.current) {
          throw new Error('Chart reference not available');
        }
        await exportElement(chartRef.current, { 
          filename, 
          format: format as ExportOptions['format']
        });
      }

      setIsOpen(false);
      
      // Show success notification
      const formatNames = {
        png: 'imagen PNG',
        jpeg: 'imagen JPEG', 
        pdf: 'documento PDF',
        csv: 'archivo CSV',
        report: 'reporte completo'
      };
      showSuccess(`${formatNames[format]} exportado exitosamente`);
      
    } catch (error) {
      console.error('Export error:', error);
      showError(error instanceof Error ? error.message : 'Error durante la exportación');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      key: 'png',
      label: 'PNG Image',
      icon: Image,
      description: 'Exportar como imagen PNG',
      disabled: !chartRef?.current
    },
    {
      key: 'jpeg',
      label: 'JPEG Image',
      icon: Image,
      description: 'Exportar como imagen JPEG',
      disabled: !chartRef?.current
    },
    {
      key: 'pdf',
      label: 'PDF Document',
      icon: FileText,
      description: 'Exportar como documento PDF',
      disabled: !chartRef?.current
    },
    {
      key: 'csv',
      label: 'CSV Data',
      icon: FileDown,
      description: 'Exportar datos como CSV',
      disabled: !data || data.length === 0
    }
  ];

  if (reportElements && reportElements.length > 0) {
    exportOptions.push({
      key: 'report',
      label: 'Full Report',
      icon: FileText,
      description: 'Generar reporte completo en PDF',
      disabled: false
    });
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outlined"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        disabled={!!exporting}
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{exporting ? 'Exportando...' : 'Exportar'}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-sm font-medium text-foreground mb-2 px-2">
                Opciones de Exportación
              </div>
              
              {exportOptions.map((option) => {
                const Icon = option.icon;
                const isDisabled = option.disabled || exporting === option.key;
                
                return (
                  <button
                    key={option.key}
                    onClick={() => !isDisabled && handleExport(option.key as 'png' | 'jpeg' | 'pdf' | 'csv' | 'report')}
                    disabled={isDisabled}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md text-sm transition-colors ${
                      isDisabled
                        ? 'text-muted-foreground cursor-not-allowed'
                        : 'text-foreground hover:bg-muted cursor-pointer'
                    }`}
                  >
                    {exporting === option.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-border p-2">
              <div className="text-xs text-muted-foreground px-2">
                Los archivos se descargarán automáticamente
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}