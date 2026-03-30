import React, { useState, useCallback, useEffect } from 'react';
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
  const [nodes, setNodes] = useState(initialData);
  const [positions, setPositions] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [enablePhysics, setEnablePhysics] = useState(enablePhysicsDefault);

  // Sincronizar posiciones iniciales
  useEffect(() => {
    const posMap = {};
    nodes.forEach(n => { posMap[n.id] = n.pos || { x: 0, y: 0 }; });
    setPositions(posMap);
  }, [initialData]);

  // Notificar cambios al padre si existe onSave
  useEffect(() => {
    if (onSave) onSave(nodes);
  }, [nodes, onSave]);

  const handleAddChild = (parentId) => {
    if (readOnly) return;
    const parentPos = positions[parentId] || { x: 0, y: 0 };
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
        pos: { x: startX + (totalChildren - 1) * spacing, y: targetY } 
      };

      const finalNodes = [...updatedNodes, newNode];
      const newPositions = { ...positions };
      finalNodes.forEach(n => { newPositions[n.id] = n.pos; });
      setPositions(newPositions);
      return finalNodes;
    });
    setSelectedId(parentId);
  };

  const handleRemoveNode = (id) => {
    if (readOnly) return;
    const nodeToRemove = nodes.find(n => n.id === id);
    const parentId = nodeToRemove?.parentId;
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
              const index = siblings.findIndex(s => s.id === node.id);
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
        const dx = pos.x - otherPos.x;
        const dy = pos.y - otherPos.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx < MIN_DIST_X && absDy < MIN_DIST_Y) {
          const overlapX = MIN_DIST_X - absDx;
          const overlapY = MIN_DIST_Y - absDy;
          const pushX = overlapX * (dx > 0 ? -0.4 : 0.4);
          const pushY = overlapY * (dy > 0 ? -0.4 : 0.4);
          newPositions[otherId] = { x: otherPos.x + pushX, y: otherPos.y + pushY };
        }
      });
      return newPositions;
    });

    const timer = setTimeout(() => {
      setNodes(current => current.map(n => ({
        ...n,
        pos: positions[n.id] || n.pos
      })));
    }, 50);
    return () => clearTimeout(timer);
  }, [positions, enablePhysics, readOnly]);

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
              <Connection 
                key={`line-${node.id}`} 
                start={positions[node.parentId]} 
                end={positions[node.id]} 
                type={lineType}
                isSelected={selectedId === node.id || selectedId === node.parentId} 
              />
            ))}
          </svg>
          {nodes.map(node => (
            <MasterBox 
              key={node.id} 
              id={node.id} 
              label={node.label} 
              initialPosition={node.pos} 
              isSelected={selectedId === node.id} 
              readOnly={readOnly}
              onSelect={setSelectedId} 
              onAddChild={handleAddChild} 
              onRemove={handleRemoveNode} 
              onRename={handleRename} 
              onMove={handleUpdatePositionCapture} 
            />
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