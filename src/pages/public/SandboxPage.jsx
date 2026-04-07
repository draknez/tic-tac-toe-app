import React, { useState, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FormWrapper } from '../../components/ui/FormWrapper';
import { OrgChart } from '../../components/ui/OrgChart';
import { cn } from "../../utils/cn";

const STORAGE_KEY = 'sandbox-org-tree-v3';
const LINE_TYPE_KEY = 'sandbox-line-type';

const MOCK_DATA = [
  { id: 'root', parentId: null, label: 'Lic. Roberto Gómez', role: 'Director General', type: 'Dirección', pos: { x: 500, y: 50 } },
  { id: 'd1', parentId: 'root', label: 'Ing. Alicia Rivas', role: 'Gerente Operaciones', type: 'Departamento', pos: { x: 300, y: 200 } },
  { id: 'd2', parentId: 'root', label: 'CPA. Marcos Sosa', role: 'Gerente Finanzas', type: 'Departamento', pos: { x: 700, y: 200 } },
  { id: 's1', parentId: 'd1', label: 'Lic. Sandra Luz', role: 'Jefe Logística', type: 'Sección', pos: { x: 200, y: 350 } },
  { id: 's2', parentId: 'd1', label: 'Téc. Raúl Peña', role: 'Jefe Almacén', type: 'Sección', pos: { x: 400, y: 350 } },
  { id: 'u1', parentId: 's1', label: 'Pedro Armas', role: 'Supervisor A', type: 'Unidad', pos: { x: 200, y: 500 } }
];

const SandboxPage = () => {
  const [activeTab, setActiveTab] = useState('structure');
  const [lineType, setLineType] = useState(() => localStorage.getItem(LINE_TYPE_KEY) || 'bezier');
  const fileInputRef = useRef(null);
  
  const [nodes, setNodes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [{ id: 'root-1', parentId: null, label: 'Fundador', role: 'Director', type: 'Dirección', pos: { x: 400, y: 100 } }];
    } catch (e) {
      return [{ id: 'root-1', parentId: null, label: 'Fundador', role: 'Director', type: 'Dirección', pos: { x: 400, y: 100 } }];
    }
  });

  const handleSave = (newNodes) => {
    if (!newNodes || !Array.isArray(newNodes)) return;
    setNodes(newNodes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNodes));
  };

  const handleLineTypeChange = (type) => {
    setLineType(type);
    localStorage.setItem(LINE_TYPE_KEY, type);
  };

  const addIndependentNode = () => {
    const id = `node-${Math.random().toString(36).substr(2, 9)}`;
    const newNode = { id, parentId: null, label: 'Nuevo Nodo', role: 'Cargo', type: 'Unidad', pos: { x: 100, y: 100 } };
    handleSave([...nodes, newNode]);
  };

  const resetCanvas = () => {
    if (window.confirm("¿Estás seguro de resetear todo el organigrama?")) {
      const initial = [{ id: 'root-1', parentId: null, label: 'Fundador', role: 'Director', type: 'Dirección', pos: { x: 400, y: 100 } }];
      handleSave(initial);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (Array.isArray(json)) {
            handleSave(json);
          }
        } catch (err) {
          console.error("Error al cargar JSON");
        }
      };
      reader.readAsText(file);
    }
    if (event.target) event.target.value = '';
  };

  return (
    <div className="w-full h-screen bg-white dark:bg-black flex flex-col overflow-hidden select-none">
      <nav className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 px-4 py-2.5 flex items-center justify-between z-[100] gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-black tracking-tighter uppercase leading-none text-teal-600">Org Master</h1>
          <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
            {['structure', 'preview', 'forms', 'components'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-2.5 py-1 text-[8px] font-black uppercase rounded-md transition-all", activeTab === tab ? "bg-white dark:bg-black shadow-sm text-teal-600" : "text-gray-400")}>{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === 'structure' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 mr-2">
              <Button variant="outline" className="h-6 px-2 text-[7px] font-black border-rose-500/20 text-rose-500 hover:bg-rose-50" onClick={resetCanvas}>Reset</Button>
              <Button variant="outline" className="h-6 px-2 text-[7px] font-black" onClick={() => handleSave(MOCK_DATA)}>Seed Data</Button>
              <Button variant="outline" className="h-6 px-2 text-[7px] font-black" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
            </div>

            <div className="flex bg-gray-50 dark:bg-gray-900 p-0.5 rounded-md">
              <button onClick={() => handleLineTypeChange('bezier')} className={cn("px-2 py-0.5 text-[7px] font-bold rounded-sm", lineType === 'bezier' ? "bg-white dark:bg-black text-teal-600" : "text-gray-400")}>Curve</button>
              <button onClick={() => handleLineTypeChange('orthogonal')} className={cn("px-2 py-0.5 text-[7px] font-bold rounded-sm", lineType === 'orthogonal' ? "bg-white dark:bg-black text-teal-600" : "text-gray-400")}>Grid</button>
            </div>
            
            <Button variant="primary" className="h-6 px-3 text-[7px] font-bold rounded-full" onClick={addIndependentNode}>+ Raíz</Button>
          </div>
        )}

        {activeTab === 'preview' && (
          <StatusBadge status="busy">Read Only Mode</StatusBadge>
        )}
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'structure' && (
          <OrgChart initialData={nodes} readOnly={false} lineType={lineType} onSave={handleSave} />
        )}

        {activeTab === 'preview' && (
          <OrgChart initialData={nodes} readOnly={true} lineType={lineType} />
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SandboxPage;