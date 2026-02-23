import React from 'react';
import { cn } from '../../utils/cn';

/**
 * ActionButton
 * Botón pequeño y estandarizado para acciones en tablas (Edit, Ban, Elim, etc.)
 * Centraliza los estilos Light y Dark para que no sea necesario editar cada página.
 */
const ActionButton = ({ 
  children, 
  onClick, 
  variant = 'sky', 
  className, 
  disabled = false,
  title
}) => {
  
  const baseStyles = "px-3 h-5 flex items-center justify-center rounded-full text-[9px] font-black uppercase transition-all shadow-sm disabled:opacity-50 whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-offset-1 tracking-wider hover:-translate-y-px active:scale-95";
  
  const variants = {
    // Edit / Info
    sky: "bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500 dark:bg-sky-500/10 dark:text-sky-400 dark:border dark:border-sky-500/30 dark:hover:bg-sky-500/20",
    
    // Unban / Positive
    teal: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-600 dark:bg-teal-500/10 dark:text-teal-400 dark:border dark:border-teal-500/30 dark:hover:bg-teal-500/20",
    
    // Ban / Warning
    red: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/30 dark:hover:bg-red-500/20",
    
    // Delete / Danger
    danger: "bg-red-800 text-white hover:bg-red-900 focus:ring-red-800 dark:bg-red-950/40 dark:text-red-500 dark:border dark:border-red-900/50 dark:hover:bg-red-900/30",
    
    // Orange (ENC)
    orange: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 dark:bg-orange-500/10 dark:text-orange-400 dark:border dark:border-orange-500/30 dark:hover:bg-orange-500/20",
    
    // Emerald (ADM)
    emerald: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/30 dark:hover:bg-emerald-500/20",
    
    // Inactive / Neutral
    gray: "bg-gray-200 text-gray-500 hover:bg-gray-300 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
    
    // Ghost (simple text)
    ghost: "bg-transparent text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-gray-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(baseStyles, variants[variant] || variants.sky, className)}
    >
      {children}
    </button>
  );
};

export default ActionButton;
