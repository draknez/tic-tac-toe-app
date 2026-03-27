import React from 'react';
import { cn } from "../../utils/cn";

/**
 * Componente StatusBadge
 * Generado por Component Factory
 */
export const StatusBadge = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950",
        className
      )} 
      {...props}
    >
      {children || 'StatusBadge Placeholder'}
    </div>
  );
};
