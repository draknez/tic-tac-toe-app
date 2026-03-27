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
  label = "Nodo", 
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
    e.stopPropagation();
    onSelect(id);
    if (isEditing) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    initialDragPos.current = { x: position.x, y: position.y };
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (!isDragging) return;
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
  }, [isDragging, id, onMove]);

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
        "absolute w-32 h-20 rounded-[1.5rem] border flex flex-col items-center justify-center p-3",
        "bg-white dark:bg-gray-900", // Colores refinados para dark mode
        isSelected 
          ? "z-50 border-teal-500 shadow-2xl shadow-teal-500/10 scale-[1.02]" 
          : "z-10 border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/30 dark:shadow-none",
        isDragging && "opacity-90 cursor-grabbing",
        className
      )}
    >
      <div className="text-center w-full px-1" onDoubleClick={() => setIsEditing(true)}>
        {isEditing ? (
          <input ref={inputRef} autoFocus value={label} onChange={(e) => onRename(id, e.target.value)} onBlur={() => setIsEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)} className="w-full bg-gray-50 dark:bg-gray-950 border-none rounded-md text-[9px] font-black uppercase text-center" />
        ) : (
          <p className="text-[9px] font-black uppercase tracking-tighter text-gray-700 dark:text-gray-200 break-words line-clamp-2 leading-none pointer-events-none italic">{label}</p>
        )}
      </div>

      <div className={cn("absolute bottom-2 right-3 flex gap-1 z-[60] transition-all", isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none")}>
        <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove(id); }} className="w-5 h-5 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-md">-</button>
        <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onAddChild(id); }} className="w-5 h-5 rounded-lg bg-teal-500 text-white flex items-center justify-center text-[10px] font-black shadow-md">+</button>
      </div>
    </div>
  );
};
