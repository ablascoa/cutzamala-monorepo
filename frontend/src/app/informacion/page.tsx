import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Información - Sistema Cutzamala",
  description: "Información sobre el Sistema Cutzamala y el monitoreo de agua",
};

export default function InformacionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-50 mb-8">
            Información del Sistema Cutzamala
          </h1>
          
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
              ¿Qué es el Sistema Cutzamala?
            </h2>
            <p className="text-surface-700 dark:text-surface-300 mb-4 leading-relaxed">
              El Sistema Cutzamala es una de las fuentes de abastecimiento de agua potable más importantes 
              para el Valle de México. Consiste en un complejo sistema hidráulico que transporta agua desde 
              siete presas ubicadas en los estados de México y Michoacán.
            </p>
            <p className="text-surface-700 dark:text-surface-300 leading-relaxed">
              El sistema suministra aproximadamente el 24% del agua que consume la Zona Metropolitana del 
              Valle de México, beneficiando a más de 5 millones de habitantes.
            </p>
          </div>

          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
              Presas Monitoreadas
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">
                  Valle de Bravo
                </h3>
                <p className="text-surface-600 dark:text-surface-400 text-sm">
                  Capacidad: 394.39 hm³
                </p>
                <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">
                  La presa más grande del sistema
                </p>
              </div>
              <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                  Villa Victoria
                </h3>
                <p className="text-surface-600 dark:text-surface-400 text-sm">
                  Capacidad: 185.12 hm³
                </p>
                <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">
                  Segunda presa en importancia
                </p>
              </div>
              <div className="bg-tertiary-50 dark:bg-tertiary-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-tertiary-700 dark:text-tertiary-300 mb-2">
                  El Bosque
                </h3>
                <p className="text-surface-600 dark:text-surface-400 text-sm">
                  Capacidad: 202.40 hm³
                </p>
                <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">
                  Complementa el sistema
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
              Importancia del Monitoreo
            </h2>
            <p className="text-surface-700 dark:text-surface-300 mb-4 leading-relaxed">
              El monitoreo constante de los niveles de almacenamiento es crucial para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-surface-700 dark:text-surface-300">
              <li>Garantizar el suministro continuo de agua a la población</li>
              <li>Planificar estrategias de distribución eficientes</li>
              <li>Identificar tendencias y patrones estacionales</li>
              <li>Tomar decisiones informadas sobre el manejo del recurso hídrico</li>
              <li>Prevenir situaciones de escasez mediante alertas tempranas</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
              Fuentes de Datos
            </h2>
            <p className="text-surface-700 dark:text-surface-300 mb-4 leading-relaxed">
              Los datos presentados en este dashboard provienen de reportes oficiales de la Comisión 
              Nacional del Agua (CONAGUA), actualizados diariamente con información sobre:
            </p>
            <ul className="list-disc list-inside space-y-2 text-surface-700 dark:text-surface-300">
              <li>Volúmenes de almacenamiento actual</li>
              <li>Porcentajes de llenado</li>
              <li>Variaciones diarias y tendencias históricas</li>
              <li>Comparativas entre periodos</li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> Los datos se actualizan automáticamente con base en los reportes 
                públicos de CONAGUA disponibles en formato PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}