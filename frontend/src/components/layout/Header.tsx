'use client';

import { Droplets } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
  return (
    <header className="border-b bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Sistema Cutzamala</h1>
                <p className="text-sm text-muted-foreground">
                  Monitoreo de Almacenamiento de Agua
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Fuente: CONAGUA
              </p>
              <p className="text-xs text-muted-foreground">
                Actualizado: {new Date().toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}