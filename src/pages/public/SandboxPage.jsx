import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FormWrapper } from '../../components/ui/FormWrapper';
import { OrgChart } from '../../components/ui/OrgChart';
import { cn } from "../../utils/cn";

const STORAGE_KEY = 'sandbox-org-tree-v3';
const LINE_TYPE_KEY = 'sandbox-line-type';

const SandboxPage = () => {
  const [activeTab, setActiveTab] = useState('structure');
  const [lineType, setLineType] = useState(() => {
    return localStorage.getItem(LINE_TYPE_KEY) || 'bezier';
  });
  
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [{ id: 'root-1', parentId: null, label: 'Fundador', pos: { x: 400, y: 100 } }];
  });

  const handleSave = (newNodes) => {
    setNodes(newNodes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNodes));
  };

  const handleLineTypeChange = (type) => {
    setLineType(type);
    localStorage.setItem(LINE_TYPE_KEY, type);
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
            <div className="flex bg-gray-50 dark:bg-gray-900 p-0.5 rounded-md">
              <button onClick={() => handleLineTypeChange('bezier')} className={cn("px-2 py-0.5 text-[7px] font-bold rounded-sm", lineType === 'bezier' ? "bg-white dark:bg-black text-teal-600" : "text-gray-400")}>Curve</button>
              <button onClick={() => handleLineTypeChange('orthogonal')} className={cn("px-2 py-0.5 text-[7px] font-bold rounded-sm", lineType === 'orthogonal' ? "bg-white dark:bg-black text-teal-600" : "text-gray-400")}>Grid</button>
            </div>
            <StatusBadge status="online">Editor Active</StatusBadge>
          </div>
        )}

        {activeTab === 'preview' && (
          <StatusBadge status="busy">Read Only Mode</StatusBadge>
        )}
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {/* MODO EDICIÓN */}
        {activeTab === 'structure' && (
          <OrgChart 
            initialData={nodes} 
            readOnly={false} 
            lineType={lineType}
            onSave={handleSave} 
          />
        )}

        {/* MODO PREVISUALIZACIÓN (FRONTEND) */}
        {activeTab === 'preview' && (
          <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 z-50 bg-white/80 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-gray-100 dark:border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Live Preview (No Editable)
            </div>
            <OrgChart 
              initialData={nodes} 
              readOnly={true} 
              lineType={lineType}
            />
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