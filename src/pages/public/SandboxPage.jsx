import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MasterBox } from '../../components/ui/MasterBox';
import { FormWrapper } from '../../components/ui/FormWrapper';
import { Connection } from '../../components/ui/Connection';
import { cn } from "../../utils/cn";

const STORAGE_KEY = 'sandbox-org-tree-v3';

const SandboxPage = () => {
  const [activeTab, setActiveTab] = useState('structure');
  const [selectedId, setSelectedId] = useState(null);
  const [lineType, setLineType] = useState('bezier');
  const [enablePhysics, setEnablePhysics] = useState(false); // Desactivado por defecto
  
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [{ id: 'root-1', parentId: null, label: 'Fundador', pos: { x: 400, y: 100 } }];
  });
  
  const [positions, setPositions] = useState({});

  useEffect(() => {
    const initialPositions = {};
    nodes.forEach(n => { initialPositions[n.id] = n.pos; });
    setPositions(initialPositions);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  }, [nodes]);

  const addIndependentNode = () => {
    const id = `node-${Math.random().toString(36).substr(2, 9)}`;
    const pos = { x: 100, y: 100 };
    setNodes([...nodes, { id, parentId: null, label: 'Nuevo Nodo', pos }]);
    setPositions(prev => ({ ...prev, [id]: pos }));
    setSelectedId(id);
  };

  const handleAddChild = (parentId) => {
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
        label: 'Miembro', 
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

  const handleRename = (id, newLabel) => {
    setNodes(current => current.map(n => n.id === id ? { ...n, label: newLabel } : n));
  };

  const handleUpdatePositionCapture = useCallback((id, pos) => {
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
  }, [positions, enablePhysics]);

  return (
    <div className="w-full h-screen bg-white dark:bg-black flex flex-col overflow-hidden select-none">
      <nav className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 px-4 py-2.5 flex items-center justify-between z-[100] gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-black tracking-tighter uppercase leading-none text-teal-600">Org Master</h1>
          <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
            {['structure', 'forms', 'components'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-2.5 py-1 text-[8px] font-black uppercase rounded-md transition-all", activeTab === tab ? "bg-white dark:bg-black shadow-sm text-teal-600" : "text-gray-400")}>{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === 'structure' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setEnablePhysics(!enablePhysics)}
              className={cn(
                "px-2 py-1 rounded-md text-[7px] font-black uppercase border transition-all",
                enablePhysics 
                  ? "bg-teal-500/10 border-teal-500/20 text-teal-600" 
                  : "bg-gray-100 border-gray-200 text-gray-400"
              )}
            >
              Physics: {enablePhysics ? 'ON' : 'OFF'}
            </button>

            <div className="flex bg-gray-50 dark:bg-gray-900 p-0.5 rounded-md">
              <button onClick={() => setLineType('bezier')} className={cn("px-2 py-0.5 text-[7px] font-bold rounded-sm", lineType === 'bezier' ? "bg-white dark:bg-black text-teal-600" : "text-gray-400")}>Curve</button>
              <button onClick={() => setLineType('orthogonal')} className={cn("px-2 py-0.5 text-[7px] font-bold rounded-sm", lineType === 'orthogonal' ? "bg-white dark:bg-black text-teal-600" : "text-gray-400")}>Grid</button>
            </div>
            <Button variant="primary" className="h-6 px-3 text-[7px] font-bold rounded-full" onClick={addIndependentNode}>+ Raíz</Button>
          </div>
        )}
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'structure' && (
          <div 
            className="w-full h-full overflow-auto p-20 relative scrollbar-hide" 
            onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
            onTouchStart={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
          >
            <div className="relative min-w-[3000px] min-h-[3000px]">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <pattern id="grid-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" className="fill-gray-200/50 dark:fill-zinc-800" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-dots)" />
                {nodes.map(node => (
                  <Connection key={`line-${node.id}`} start={positions[node.parentId]} end={positions[node.id]} type={lineType} isSelected={selectedId === node.id || selectedId === node.parentId} />
                ))}
              </svg>
              {nodes.map(node => (
                <MasterBox key={node.id} id={node.id} label={node.label} initialPosition={node.pos} isSelected={selectedId === node.id} onSelect={setSelectedId} onAddChild={handleAddChild} onRemove={handleRemoveNode} onRename={handleRename} onMove={handleUpdatePositionCapture} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="w-full h-full p-8 flex items-center justify-center overflow-auto bg-gray-50 dark:bg-black">
            <FormWrapper title="JSON EXPORT" subtitle="Persistence Status">
              <pre className="p-4 bg-white dark:bg-gray-950 text-teal-600 dark:text-teal-400 rounded-2xl text-[8px] max-h-[300px] overflow-auto border border-gray-100 dark:border-gray-900 font-mono">
                {JSON.stringify(nodes, null, 2)}
              </pre>
            </FormWrapper>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="w-full h-full p-8 overflow-auto bg-gray-50 dark:bg-black space-y-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Status Badges" subtitle="Component library previews">
                <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-white/5">
                  <StatusBadge status="online">Sincronizado</StatusBadge>
                  <StatusBadge status="busy">Ocupado</StatusBadge>
                  <StatusBadge status="offline">Desconectado</StatusBadge>
                </div>
              </Card>
              <Card title="Interactive Buttons" subtitle="Visual styles">
                <div className="flex gap-2 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-white/5">
                  <Button variant="primary" size="sm">Primary Action</Button>
                  <Button variant="outline" size="sm">Secondary</Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SandboxPage;