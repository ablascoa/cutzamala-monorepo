'use client';

export default function Footer() {
  return (
    <footer className="border-t bg-white text-gray-900 border-gray-200 dark:bg-gray-950 dark:text-gray-50 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 Dashboard Sistema Cutzamala
            </p>
            <p className="text-xs text-muted-foreground">
              Datos oficiales de CONAGUA - Organismo de Cuenca Aguas del Valle de México
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="text-xs text-muted-foreground">
              Desarrollado con Next.js y Tailwind CSS
            </p>
            <a 
              href="https://www.gob.mx/conagua" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Visitar CONAGUA →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}