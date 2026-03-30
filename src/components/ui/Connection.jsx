import React from 'react';
import { cn } from "../../utils/cn";

export const Connection = ({ start, end, type = 'bezier', isSelected, className }) => {
  if (!start || !end) return null;

  // Centro X: 128/2 = 64 | Centro Y: 80/2 = 40
  const x1 = start.x + 64;
  const y1 = start.y + 40;
  const x2 = end.x + 64;
  const y2 = end.y + 40;

  let pathData = "";
  if (type === 'orthogonal') {
    const midY = y1 + (y2 - y1) / 2;
    pathData = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
  } else {
    const midY = (y1 + y2) / 2;
    pathData = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }

  return (
    <g className={cn("transition-all duration-500", isSelected ? "opacity-100" : "opacity-80", className)}>
      {/* Glow effect sutil */}
      <path d={pathData} fill="none" stroke="currentColor" strokeWidth="6" className="text-teal-500/5 blur-sm" />
      
      {/* Línea Principal con contraste mejorado */}
      <path 
        d={pathData} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        className={cn(
          "transition-all duration-300", 
          isSelected 
            ? "text-teal-500/70 stroke-[2.5]" 
            : "text-gray-300 dark:text-zinc-800" // Gris más contrastado
        )}
      />
      
      <circle 
        cx={x2} cy={y2} r="3" 
        className={cn("transition-all", isSelected ? "fill-teal-500" : "fill-gray-300 dark:fill-zinc-800")} 
      />
    </g>
  );
};
