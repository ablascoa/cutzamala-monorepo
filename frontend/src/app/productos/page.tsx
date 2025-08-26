import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Otros Productos - Ayari Tech",
  description: "Productos y soluciones desarrolladas por Ayari Tech",
};

export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-50 mb-4">
              Productos de Ayari Tech
            </h1>
            <p className="text-xl text-surface-600 dark:text-surface-400">
              Soluciones innovadoras para el análisis de datos y gestión de recursos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
                AquaMetrics Pro
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Sistema avanzado de análisis y predicción para gestión hídrica con inteligencia artificial.
              </p>
              <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1 mb-4">
                <li>• Predicciones de consumo</li>
                <li>• Detección de anomalías</li>
                <li>• Reportes automatizados</li>
              </ul>
              <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Próximamente →
              </button>
            </div>

            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
                EcoMonitor Suite
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Plataforma integral para monitoreo ambiental y sostenibilidad empresarial.
              </p>
              <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1 mb-4">
                <li>• Medición de huella de carbono</li>
                <li>• Indicadores ESG</li>
                <li>• Certificaciones ambientales</li>
              </ul>
              <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                En desarrollo →
              </button>
            </div>

            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-primary-500">
              <div className="absolute -mt-8 -ml-2">
                <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
                  ACTUAL
                </span>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
                Dashboard Cutzamala
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Sistema de visualización en tiempo real del Sistema Cutzamala.
              </p>
              <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1 mb-4">
                <li>• Datos en tiempo real</li>
                <li>• Análisis histórico</li>
                <li>• Exportación de datos</li>
              </ul>
              <Link href="/" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Ver Dashboard →
              </Link>
            </div>

            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
                DataFlow Analytics
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Herramienta de ETL y análisis de datos para grandes volúmenes de información.
              </p>
              <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1 mb-4">
                <li>• Procesamiento en tiempo real</li>
                <li>• Integración con múltiples fuentes</li>
                <li>• Visualizaciones interactivas</li>
              </ul>
              <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Más información →
              </button>
            </div>

            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
                ComplianceTracker
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Sistema de gestión y seguimiento de cumplimiento normativo ambiental.
              </p>
              <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1 mb-4">
                <li>• Alertas automáticas</li>
                <li>• Gestión de documentación</li>
                <li>• Auditorías simplificadas</li>
              </ul>
              <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Solicitar demo →
              </button>
            </div>

            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
                AlertaPro
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Sistema inteligente de alertas tempranas para gestión de recursos críticos.
              </p>
              <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1 mb-4">
                <li>• Notificaciones en tiempo real</li>
                <li>• Integración con sistemas SCADA</li>
                <li>• Machine Learning predictivo</li>
              </ul>
              <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Contactar ventas →
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">
                ¿Necesitas una solución personalizada?
              </h2>
              <p className="text-primary-100 mb-6">
                En Ayari Tech desarrollamos soluciones a medida para tus necesidades específicas 
                de análisis de datos, monitoreo y gestión de recursos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                  Solicitar Consultoría
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Ver Casos de Éxito
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-surface-600 dark:text-surface-400">
              © 2024 Ayari Tech. Todos los derechos reservados.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Contacto
              </a>
              <a href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                LinkedIn
              </a>
              <a href="#" className="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}