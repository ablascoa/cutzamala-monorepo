'use client';

import React from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  height?: number;
  onRetry?: () => void;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Specialized error boundary for chart components that maintains chart dimensions
 */
export class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('📊 Chart Error Boundary');
    console.error('Chart Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ChartErrorFallback
          error={this.state.error!}
          height={this.props.height}
          onRetry={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface ChartErrorFallbackProps {
  error: Error;
  height?: number;
  onRetry: () => void;
}

function ChartErrorFallback({ error, height = 400, onRetry }: ChartErrorFallbackProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center border border-destructive/20 rounded-lg bg-destructive/5"
      style={{ height }}
    >
      <div className="text-center space-y-4 p-6 max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <BarChart3 className="h-6 w-6 text-destructive" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-destructive mb-1">
            Error en el Gráfico
          </h3>
          <p className="text-sm text-muted-foreground">
            No se pudo renderizar el gráfico. Intenta recargar los datos.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-background/50 p-3 rounded border">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Detalles del Error
            </summary>
            <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap overflow-auto max-h-24">
              {error.message}
            </pre>
          </details>
        )}

        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar Gráfico
        </Button>
      </div>
    </div>
  );
}