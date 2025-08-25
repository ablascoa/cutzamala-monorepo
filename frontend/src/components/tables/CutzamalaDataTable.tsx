'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { formatNumber, formatDate } from '@/lib/utils';
import { RESERVOIR_NAMES } from '@cutzamala/shared';
import type { CutzamalaReading } from '@cutzamala/shared';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Filter, 
  Search,
  Eye,
  EyeOff,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface CutzamalaDataTableProps {
  data: CutzamalaReading[];
  onExport?: (format: 'csv' | 'json') => void;
  showTrends?: boolean;
  compactView?: boolean;
  height?: number;
}

interface TableData extends CutzamalaReading {
  valle_bravo_trend?: number;
  villa_victoria_trend?: number;
  el_bosque_trend?: number;
  system_trend?: number;
}

export function CutzamalaDataTable({
  data,
  onExport,
  showTrends = true,
  compactView = false,
  height = 600,
}: CutzamalaDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Enhance data with trends if requested
  const enhancedData = useMemo((): TableData[] => {
    if (!showTrends) return data;

    return data.map((row, index) => {
      if (index === 0) return { ...row };

      const prevRow = data[index - 1];
      return {
        ...row,
        valle_bravo_trend: row.reservoirs.valle_bravo.percentage - prevRow.reservoirs.valle_bravo.percentage,
        villa_victoria_trend: row.reservoirs.villa_victoria.percentage - prevRow.reservoirs.villa_victoria.percentage,
        el_bosque_trend: row.reservoirs.el_bosque.percentage - prevRow.reservoirs.el_bosque.percentage,
        system_trend: row.system_totals.total_percentage - prevRow.system_totals.total_percentage,
      };
    });
  }, [data, showTrends]);

  // Trend indicator component
  const TrendIndicator = ({ value, className = '' }: { value?: number; className?: string }) => {
    if (!value || Math.abs(value) < 0.1) {
      return <Minus className={`w-4 h-4 text-gray-400 ${className}`} />;
    }
    
    if (value > 0) {
      return (
        <div className={`flex items-center space-x-1 text-green-600 ${className}`}>
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">+{formatNumber(value)}%</span>
        </div>
      );
    }
    
    return (
      <div className={`flex items-center space-x-1 text-red-600 ${className}`}>
        <TrendingDown className="w-4 h-4" />
        <span className="text-xs">{formatNumber(value)}%</span>
      </div>
    );
  };

  // Status indicator based on percentage
  const StatusBadge = ({ percentage }: { percentage: number }) => {
    let bgColor = 'bg-blue-100 text-blue-800';
    let status = 'Óptimo';
    
    if (percentage < 25) {
      bgColor = 'bg-red-100 text-red-800';
      status = 'Crítico';
    } else if (percentage < 50) {
      bgColor = 'bg-yellow-100 text-yellow-800';
      status = 'Bajo';
    } else if (percentage < 75) {
      bgColor = 'bg-green-100 text-green-800';
      status = 'Normal';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  // Column definitions
  const columns = useMemo<ColumnDef<TableData>[]>(() => [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Fecha</span>
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="w-4 h-4" />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatDate(row.original.date)}
        </div>
      ),
    },
    {
      id: 'valle_bravo',
      header: 'Valle de Bravo',
      columns: [
        {
          accessorKey: 'reservoirs.valle_bravo.percentage',
          header: '% Capacidad',
          cell: ({ row }) => (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-600">
                {formatNumber(row.original.reservoirs.valle_bravo.percentage)}%
              </span>
              {!compactView && (
                <StatusBadge percentage={row.original.reservoirs.valle_bravo.percentage} />
              )}
            </div>
          ),
        },
        {
          accessorKey: 'reservoirs.valle_bravo.storage_mm3',
          header: 'Almacenamiento (Mm³)',
          cell: ({ row }) => (
            <span className="text-sm">
              {formatNumber(row.original.reservoirs.valle_bravo.storage_mm3)}
            </span>
          ),
        },
        {
          accessorKey: 'reservoirs.valle_bravo.rainfall',
          header: 'Lluvia (mm)',
          cell: ({ row }) => (
            <span className="text-sm">
              {formatNumber(row.original.reservoirs.valle_bravo.rainfall)}
            </span>
          ),
        },
        ...(showTrends ? [{
          accessorKey: 'valle_bravo_trend',
          header: 'Tendencia',
          cell: ({ row }: { row: { original: TableData } }) => (
            <TrendIndicator value={row.original.valle_bravo_trend} />
          ),
        }] : []),
      ],
    },
    {
      id: 'villa_victoria',
      header: 'Villa Victoria',
      columns: [
        {
          accessorKey: 'reservoirs.villa_victoria.percentage',
          header: '% Capacidad',
          cell: ({ row }) => (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-red-600">
                {formatNumber(row.original.reservoirs.villa_victoria.percentage)}%
              </span>
              {!compactView && (
                <StatusBadge percentage={row.original.reservoirs.villa_victoria.percentage} />
              )}
            </div>
          ),
        },
        {
          accessorKey: 'reservoirs.villa_victoria.storage_mm3',
          header: 'Almacenamiento (Mm³)',
          cell: ({ row }) => (
            <span className="text-sm">
              {formatNumber(row.original.reservoirs.villa_victoria.storage_mm3)}
            </span>
          ),
        },
        {
          accessorKey: 'reservoirs.villa_victoria.rainfall',
          header: 'Lluvia (mm)',
          cell: ({ row }) => (
            <span className="text-sm">
              {formatNumber(row.original.reservoirs.villa_victoria.rainfall)}
            </span>
          ),
        },
        ...(showTrends ? [{
          accessorKey: 'villa_victoria_trend',
          header: 'Tendencia',
          cell: ({ row }: { row: { original: TableData } }) => (
            <TrendIndicator value={row.original.villa_victoria_trend} />
          ),
        }] : []),
      ],
    },
    {
      id: 'el_bosque',
      header: 'El Bosque',
      columns: [
        {
          accessorKey: 'reservoirs.el_bosque.percentage',
          header: '% Capacidad',
          cell: ({ row }) => (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-green-600">
                {formatNumber(row.original.reservoirs.el_bosque.percentage)}%
              </span>
              {!compactView && (
                <StatusBadge percentage={row.original.reservoirs.el_bosque.percentage} />
              )}
            </div>
          ),
        },
        {
          accessorKey: 'reservoirs.el_bosque.storage_mm3',
          header: 'Almacenamiento (Mm³)',
          cell: ({ row }) => (
            <span className="text-sm">
              {formatNumber(row.original.reservoirs.el_bosque.storage_mm3)}
            </span>
          ),
        },
        {
          accessorKey: 'reservoirs.el_bosque.rainfall',
          header: 'Lluvia (mm)',
          cell: ({ row }) => (
            <span className="text-sm">
              {formatNumber(row.original.reservoirs.el_bosque.rainfall)}
            </span>
          ),
        },
        ...(showTrends ? [{
          accessorKey: 'el_bosque_trend',
          header: 'Tendencia',
          cell: ({ row }: { row: { original: TableData } }) => (
            <TrendIndicator value={row.original.el_bosque_trend} />
          ),
        }] : []),
      ],
    },
    {
      id: 'system_totals',
      header: 'Sistema Total',
      columns: [
        {
          accessorKey: 'system_totals.total_percentage',
          header: '% Total',
          cell: ({ row }) => (
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple-600">
                {formatNumber(row.original.system_totals.total_percentage)}%
              </span>
              {!compactView && (
                <StatusBadge percentage={row.original.system_totals.total_percentage} />
              )}
            </div>
          ),
        },
        {
          accessorKey: 'system_totals.total_mm3',
          header: 'Total (Mm³)',
          cell: ({ row }) => (
            <span className="text-sm font-semibold">
              {formatNumber(row.original.system_totals.total_mm3)}
            </span>
          ),
        },
        ...(showTrends ? [{
          accessorKey: 'system_trend',
          header: 'Tendencia',
          cell: ({ row }: { row: { original: TableData } }) => (
            <TrendIndicator value={row.original.system_trend} />
          ),
        }] : []),
      ],
    },
  ], [showTrends, compactView]);

  const table = useReactTable({
    data: enhancedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: compactView ? 20 : 10,
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Table controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Global search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar en toda la tabla..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Column visibility toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              <span>Columnas</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showColumnMenu && (
              <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="p-2 space-y-1">
                  {table.getAllLeafColumns().map((column) => (
                    <label key={column.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={(e) => column.toggleVisibility(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="text-sm text-gray-500">
            {table.getFilteredRowModel().rows.length} registros
          </span>
        </div>

        {/* Export buttons */}
        <div className="flex items-center space-x-2">
          {onExport && (
            <>
              <button
                onClick={() => onExport('csv')}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => onExport('json')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-md overflow-hidden" style={{ height }}>
        <div className="overflow-auto h-full">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id}
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-900"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {[10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            registros por página
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          
          <span className="text-sm text-gray-500">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}