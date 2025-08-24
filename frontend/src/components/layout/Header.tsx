'use client';

import { useState } from 'react';
import { Droplets, Settings } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { SettingsModal } from '@/components/ui/SettingsModal';

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="border-b bg-background border-border">
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
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                title="Configuración"
              >
                <Settings className="w-5 h-5" />
              </button>
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

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}