'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Database, WifiOff } from 'lucide-react';

interface DataErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface DataErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Specialized error boundary for data fetching components
 */
export class DataErrorBoundary extends React.Component<
  DataErrorBoundaryProps,
  DataErrorBoundaryState
> {
  constructor(props: DataErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DataErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('🔍 Data Error Boundary');
    console.error('Data Error:', error);
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
        <DataErrorFallback
          error={this.state.error!}
          title={this.props.fallbackTitle}
          onRetry={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface DataErrorFallbackProps {
  error: Error;
  title?: string;
  onRetry: () => void;
}

function DataErrorFallback({ error, title = 'Error cargando datos', onRetry }: DataErrorFallbackProps) {
  const isNetworkError = error.message.includes('Failed to fetch') || 
                        error.message.includes('Network Error') ||
                        error.name === 'NetworkError';

  const isAPIError = error.message.includes('API') || 
                    error.message.includes('Server') ||
                    error.message.includes('Backend');

  const getErrorIcon = () => {
    if (isNetworkError) return WifiOff;
    if (isAPIError) return Database;
    return AlertTriangle;
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'No se pudo cargar los datos debido a un problema de conexión.';
    }
    if (isAPIError) {
      return 'Error del servidor al cargar los datos.';
    }
    return 'No se pudieron cargar los datos. Por favor, intenta nuevamente.';
  };

  const ErrorIcon = getErrorIcon();

  return (
    <Card className="border-destructive/50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ErrorIcon className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-lg text-destructive">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground">
          {getErrorMessage()}
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-destructive bg-muted p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}