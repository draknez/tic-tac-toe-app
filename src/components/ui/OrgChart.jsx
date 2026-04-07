import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MasterBox } from './MasterBox';
import { Connection } from './Connection';
import { cn } from "../../utils/cn";

export const OrgChart = ({ 
  initialData = [], 
  readOnly = false, 
  onSave,
  lineType = 'bezier',
  enablePhysicsDefault = false,
  className 
}) => {
  // Estado interno para manejo fluido
  const [nodes, setNodes] = useState(initialData || []);
  const [positions, setPositions] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [enablePhysics, setEnablePhysics] = useState(enablePhysicsDefault);
  
  // Ref para evitar bucles de actualización con el padre
  const isInternalUpdate = useRef(false);

  // 1. Sincronización inicial o cambio externo (Importar JSON)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
    if (initialData && Array.isArray(initialData)) {
      setNodes(initialData);
      const posMap = {};
      initialData.forEach(n => { 
        if (n && n.id) posMap[n.id] = n.pos || { x: 0, y: 0 }; 
      });
      setPositions(posMap);
    }
  }, [initialData]);

  // 2. Notificar al padre solo cuando los NODOS cambian (no en cada movimiento de posiciones)
  useEffect(() => {
    if (onSave && nodes.length > 0) {
      isInternalUpdate.current = true;
      onSave(nodes);
    }
  }, [nodes]);

  const handleAddChild = (parentId) => {
    if (readOnly) return;
    const parentPos = positions[parentId] || { x: 400, y: 100 };
    const newId = `node-${Math.random().toString(36).substr(2, 9)}`;
    const spacing = 160;
    const targetY = parentPos.y + 160;

    setNodes(currentNodes => {
      const siblings = currentNodes.filter(n => n.parentId === parentId);
      const totalChildren = siblings.length + 1;
      const startX = parentPos.x - ((totalChildren - 1) * spacing) / 2;

      const updatedNodes = currentNodes.map(node => {
        if (node.parentId === parentId) {
          const index = siblings.findIndex(s => s.id === node.id);
          const newX = startX + index * spacing;
          return { ...node, pos: { ...node.pos, x: newX } };
        }
        return node;
      });

      const newNode = { 
        id: newId, 
        parentId, 
        label: 'Nueva Unidad', 
        role: 'Cargo',
        type: 'Unidad',
        pos: { x: startX + (totalChildren - 1) * spacing, y: targetY } 
      };

      const finalNodes = [...updatedNodes, newNode];
      // Actualizar posiciones inmediatamente para las líneas
      const newPosMap = {};
      finalNodes.forEach(n => { newPosMap[n.id] = n.pos; });
      setPositions(newPosMap);
      
      return finalNodes;
    });
    setSelectedId(parentId);
  };

  const handleRemoveNode = (id) => {
    if (readOnly) return;
    const nodeToRemove = nodes.find(n => n.id === id);
    if (!nodeToRemove) return;
    const parentId = nodeToRemove.parentId;
    const nodesToRemove = new Set([id]);
    
    const findChildren = (pid) => {
      nodes.filter(n => n.parentId === pid).forEach(child => {
        nodesToRemove.add(child.id);
        findChildren(child.id);
      });
    };
    findChildren(id);

    setNodes(current => {
      const filteredNodes = current.filter(n => !nodesToRemove.has(n.id));
      if (parentId) {
        const remainingSiblings = filteredNodes.filter(n => n.parentId === parentId);
        if (remainingSiblings.length > 0) {
          const parentPos = positions[parentId] || { x: 0, y: 0 };
          const spacing = 160;
          const startX = parentPos.x - ((remainingSiblings.length - 1) * spacing) / 2;

          const reCenteredNodes = filteredNodes.map(node => {
            if (node.parentId === parentId) {
              const index = remainingSiblings.findIndex(s => s.id === node.id);
              const newX = startX + index * spacing;
              return { ...node, pos: { ...node.pos, x: newX } };
            }
            return node;
          });

          const newPositions = { ...positions };
          reCenteredNodes.forEach(n => { newPositions[n.id] = n.pos; });
          setPositions(newPositions);
          return reCenteredNodes;
        }
      }
      return filteredNodes;
    });
    if (nodesToRemove.has(selectedId)) setSelectedId(null);
  };

  const handleUpdatePositionCapture = useCallback((id, pos) => {
    if (readOnly) return;
    setPositions(prev => {
      const newPositions = { ...prev, [id]: pos };
      if (!enablePhysics) return newPositions;

      const MIN_DIST_X = 140; 
      const MIN_DIST_Y = 90;

      Object.keys(newPositions).forEach(otherId => {
        if (otherId === id) return;
        const otherPos = newPositions[otherId];
        if (!otherPos) return;

        const dx = pos.x - otherPos.x;
        const dy = pos.y - otherPos.y;
        if (Math.abs(dx) < MIN_DIST_X && Math.abs(dy) < MIN_DIST_Y) {
          const overlapX = MIN_DIST_X - Math.abs(dx);
          const overlapY = MIN_DIST_Y - Math.abs(dy);
          const pushX = overlapX * (dx > 0 ? -0.4 : 0.4);
          const pushY = overlapY * (dy > 0 ? -0.4 : 0.4);
          newPositions[otherId] = { x: otherPos.x + pushX, y: otherPos.y + pushY };
        }
      });
      return newPositions;
    });
  }, [enablePhysics, readOnly]);

  // Actualizar el estado de NODOS (persistente) solo cuando el usuario termina de mover o cada 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setNodes(current => {
        let changed = false;
        const updated = current.map(n => {
          const p = positions[n.id];
          if (p && (p.x !== n.pos.x || p.y !== n.pos.y)) {
            changed = true;
            return { ...n, pos: p };
          }
          return n;
        });
        return changed ? updated : current;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [positions]);

  const handleRename = (id, newLabel) => {
    if (readOnly) return;
    setNodes(current => current.map(n => n.id === id ? { ...n, label: newLabel } : n));
  };

  return (
    <div className={cn("w-full h-full relative overflow-hidden bg-white dark:bg-black", className)}>
      <div 
        className="w-full h-full overflow-auto p-20 relative scrollbar-hide" 
        onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
      >
        <div className="relative min-w-[3000px] min-h-[3000px]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern id="grid-dots-reusable" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" className="fill-gray-200/50 dark:fill-zinc-800" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-dots-reusable)" />
            {nodes.map(node => (
              node && node.id && (
                <Connection 
                  key={`line-${node.id}`} 
                  start={positions[node.parentId]} 
                  end={positions[node.id]} 
                  type={lineType}
                  isSelected={selectedId === node.id || selectedId === node.parentId} 
                />
              )
            ))}
          </svg>
          {nodes.map(node => (
            node && node.id && (
              <MasterBox 
                key={node.id} 
                id={node.id} 
                label={node.label || "Nombre"} 
                role={node.role || "Cargo"}
                type={node.type || "Unidad"}
                initialPosition={node.pos || { x: 0, y: 0 }} 
                isSelected={selectedId === node.id} 
                readOnly={readOnly}
                onSelect={setSelectedId} 
                onAddChild={handleAddChild} 
                onRemove={handleRemoveNode} 
                onRename={handleRename} 
                onMove={handleUpdatePositionCapture} 
              />
            )
          ))}
        </div>
      </div>

      {!readOnly && (
        <div className="absolute bottom-4 left-4 flex gap-2 z-[200]">
          <button 
            onClick={() => setEnablePhysics(!enablePhysics)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all shadow-lg",
              enablePhysics ? "bg-teal-500 text-white border-teal-600" : "bg-white dark:bg-zinc-900 text-gray-400 border-gray-100 dark:border-white/5"
            )}
          >
            Physics: {enablePhysics ? 'ON' : 'OFF'}
          </button>
        </div>
      )}
    </div>
  );
};