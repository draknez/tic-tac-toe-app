import React from 'react';

const LogoShowcase = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Propuestas de Logo para BaLog
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Diseños generados para la estructura organizacional y de seguridad.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Propuesta 1 */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">1. Nodos Organizacionales</h2>
            <div className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-8 mb-4">
              <img src="/propuesta_nodos.svg" alt="Propuesta Nodos" className="w-48 h-48" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enfoque en la jerarquía, grupos y la estructura de base de datos escalable.
            </p>
          </div>

          {/* Propuesta 2 */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">2. Escudo de Datos</h2>
            <div className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-8 mb-4">
              <img src="/propuesta_escudo.svg" alt="Propuesta Escudo" className="w-48 h-48" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enfoque en la seguridad (JWT/Bcrypt) y la robustez del Full Stack.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a 
            href="/" 
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            &larr; Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;
