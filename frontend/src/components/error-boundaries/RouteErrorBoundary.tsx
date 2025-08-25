'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Home, RefreshCw, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * Route-level error boundary that provides more comprehensive error handling
 * including navigation options and error reporting
 */
export class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RouteErrorBoundaryState> {
    const errorId = `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group(`🚨 Route Error Boundary - ${this.state.errorId}`);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Info:', errorInfo);
    console.groupEnd();

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to error reporting service
      // errorReportingService.captureException(error, {
      //   extra: { ...errorInfo, errorId: this.state.errorId },
      //   tags: { boundary: 'route' }
      // });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorFallback 
          error={this.state.error!} 
          errorId={this.state.errorId}
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

interface RouteErrorFallbackProps {
  error: Error;
  errorId: string;
  resetError: () => void;
}

function RouteErrorFallback({ error, errorId, resetError }: RouteErrorFallbackProps) {
  const router = useRouter();
  const isNetworkError = error.message.includes('Failed to fetch') || 
                        error.message.includes('Network Error') ||
                        error.name === 'NetworkError';

  const isAPIError = error.message.includes('API') || 
                    error.message.includes('fetch') ||
                    error.message.includes('Backend') ||
                    error.message.includes('Server');

  const handleGoHome = () => {
    router.push('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  const getErrorIcon = () => {
    if (isNetworkError) return WifiOff;
    return AlertTriangle;
  };

  const getErrorTitle = () => {
    if (isNetworkError) return 'Problema de Conexión';
    if (isAPIError) return 'Error del Servidor';
    return 'Error Inesperado';
  };

  const getErrorDescription = () => {
    if (isNetworkError) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.';
    }
    if (isAPIError) {
      return 'El servidor está experimentando problemas. Por favor, intenta nuevamente en unos momentos.';
    }
    return 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página o contacta al soporte técnico.';
  };

  const ErrorIcon = getErrorIcon();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ErrorIcon className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">
            {getErrorTitle()}
          </CardTitle>
          <CardDescription className="text-base">
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Details for Development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="rounded-lg bg-muted p-4 text-sm">
              <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">
                Detalles del Error (Desarrollo)
              </summary>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="font-medium">Error ID:</span> 
                  <code className="ml-1 text-xs bg-background px-1 py-0.5 rounded">
                    {errorId}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Mensaje:</span>
                  <pre className="mt-1 text-xs text-destructive whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </div>
                {error.stack && (
                  <div>
                    <span className="font-medium">Stack Trace:</span>
                    <pre className="mt-1 text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={resetError} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleReload} 
                variant="outlined"
                className="w-full"
              >
                Recargar Página
              </Button>
              
              <Button 
                onClick={handleGoHome} 
                variant="outlined"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </div>
          </div>

          {/* Additional Help */}
          {!isNetworkError && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Si el problema persiste, por favor contacta al equipo de soporte.</p>
              {process.env.NODE_ENV === 'production' && (
                <p className="mt-1">
                  Código de error: <code className="text-xs">{errorId}</code>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}