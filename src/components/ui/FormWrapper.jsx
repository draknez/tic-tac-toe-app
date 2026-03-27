import React from 'react';
import { cn } from "../../utils/cn";

/**
 * FormWrapper
 * Envoltorio especializado para formularios o secciones de configuración.
 * Mantiene un ancho máximo óptimo para lectura y inputs.
 */
export const FormWrapper = ({ 
  children, 
  title, 
  subtitle, 
  className, 
  footer,
  onSubmit,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "w-full max-w-lg mx-auto bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm",
        "rounded-[2.5rem] border border-gray-100 dark:border-gray-900",
        "shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Cabecera del Formulario */}
      {(title || subtitle) && (
        <header className="px-8 pt-10 pb-6 text-center border-b border-gray-50 dark:border-gray-900">
          {title && (
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-1 uppercase">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              {subtitle}
            </p>
          )}
        </header>
      )}

      {/* Contenido (El formulario real) */}
      <div className="px-8 py-8">
        {onSubmit ? (
          <form onSubmit={onSubmit} className="space-y-6">
            {children}
          </form>
        ) : (
          <div className="space-y-6">
            {children}
          </div>
        )}
      </div>

      {/* Pie (Opcional, para links de 'olvidé mi contraseña' o similares) */}
      {footer && (
        <footer className="px-8 py-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center">
          {footer}
        </footer>
      )}
    </div>
  );
};
