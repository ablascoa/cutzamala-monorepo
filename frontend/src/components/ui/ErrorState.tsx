'use client';

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Error cargando los datos",
  className = "" 
}: ErrorStateProps) {
  // Determine error type and appropriate icon/message
  const isNetworkError = error.message.toLowerCase().includes('network') || 
                        error.message.toLowerCase().includes('fetch');
  
  const Icon = isNetworkError ? WifiOff : AlertTriangle;
  const iconColor = isNetworkError ? "text-orange-500" : "text-red-500";

  return (
    <div className={`flex justify-center items-center h-96 ${className}`}>
      <div className="text-center max-w-md mx-auto">
        <Icon className={`w-12 h-12 mx-auto mb-4 ${iconColor}`} />
        
        <h3 className="text-lg font-medium text-foreground mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          {isNetworkError 
            ? "No se pudo conectar al servidor. Verifica tu conexión a internet."
            : error.message || "Ha ocurrido un error inesperado."
          }
        </p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outlined"
            className="flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </Button>
        )}
        
        {isNetworkError && (
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Sugerencias:</p>
            <ul className="mt-1 space-y-1">
              <li>• Verifica tu conexión a internet</li>
              <li>• Intenta recargar la página</li>
              <li>• El servidor puede estar temporalmente inaccesible</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact error state for smaller components
 */
export function CompactErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
      <p className="text-sm text-muted-foreground mb-3">
        Error: {error.message}
      </p>
      {onRetry && (
        <Button
          size="sm"
          variant="outlined"
          onClick={onRetry}
          className="flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reintentar</span>
        </Button>
      )}
    </div>
  );
}

/**
 * Toast-style notification for non-critical errors
 */
export function ErrorToast({ 
  message, 
  onDismiss 
}: { 
  message: string; 
  onDismiss: () => void; 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-destructive text-destructive-foreground rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm opacity-90 mt-1">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-destructive-foreground/70 hover:text-destructive-foreground transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}