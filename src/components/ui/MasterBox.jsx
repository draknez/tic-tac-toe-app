import React, { useState, useRef, useEffect } from 'react';
import { cn } from "../../utils/cn";

export const MasterBox = ({ 
  id, 
  initialPosition = { x: 0, y: 0 },
  isSelected,
  onSelect,
  onAddChild, 
  onRemove, 
  onMove, 
  onRename,
  label = "Nombre", 
  role = "Cargo",
  type = "Unidad",
  readOnly = false,
  className 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialDragPos = useRef({ x: 0, y: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isDragging) setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y, isDragging]);

  const handleStart = (e) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelect?.(id);
    if (isEditing) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    initialDragPos.current = { x: position.x, y: position.y };
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (!isDragging || readOnly) return;
      if (e.cancelable) e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const GRID_SIZE = 20;
      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;
      const newX = Math.round((initialDragPos.current.x + dx) / GRID_SIZE) * GRID_SIZE;
      const newY = Math.round((initialDragPos.current.y + dy) / GRID_SIZE) * GRID_SIZE;
      setPosition({ x: newX, y: newY });
      onMove?.(id, { x: newX, y: newY });
    };

    const handleGlobalEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('touchend', handleGlobalEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, id, onMove, readOnly]);

  return (
    <div 
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
      className={cn(
        "absolute w-40 h-24 rounded-[1.8rem] border flex flex-col items-center justify-center p-4 transition-all duration-300",
        "bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        "dark:bg-zinc-900 dark:border-white/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        isSelected && !readOnly
          ? "z-50 border-teal-500/50 ring-[3px] ring-teal-500/20 shadow-xl shadow-teal-500/10" 
          : "z-10",
        !readOnly && "hover:border-gray-200 dark:hover:border-white/10 hover:shadow-2xl",
        isDragging && "opacity-90 cursor-grabbing shadow-2xl scale-[1.02]",
        className
      )}
    >
      {/* Indicador de Tipo de Unidad */}
      <div className={cn(
        "absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest leading-none",
        type === 'Dirección' ? "bg-amber-500/10 text-amber-600" :
        type === 'Departamento' ? "bg-blue-500/10 text-blue-600" :
        "bg-teal-500/10 text-teal-600"
      )}>
        {type}
      </div>

      <div className="text-center w-full mt-2" onDoubleClick={() => !readOnly && setIsEditing(true)}>
        {isEditing && !readOnly ? (
          <input 
            ref={inputRef} 
            autoFocus 
            value={label} 
            onChange={(e) => onRename?.(id, e.target.value)} 
            onBlur={() => setIsEditing(false)} 
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)} 
            className="w-full bg-gray-50 dark:bg-zinc-950 border-none rounded-md text-[9px] font-black uppercase text-center focus:ring-1 focus:ring-teal-500/50" 
          />
        ) : (
          <>
            <p className="text-[10px] font-black uppercase tracking-tighter text-gray-800 dark:text-zinc-100 break-words line-clamp-1 leading-none italic">
              {label}
            </p>
            <p className="text-[7px] font-medium uppercase tracking-widest text-gray-400 dark:text-zinc-500 mt-1 line-clamp-1">
              {role}
            </p>
          </>
        )}
      </div>

      {!readOnly && (
        <div className={cn("absolute bottom-2 right-3 flex gap-1 z-[60] transition-all", isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none")}>
          <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove?.(id); }} className="w-5 h-5 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-md">-</button>
          <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onAddChild?.(id); }} className="w-5 h-5 rounded-lg bg-teal-500 text-white flex items-center justify-center text-[10px] font-black shadow-md">+</button>
        </div>
      )}
    </div>
  );
};