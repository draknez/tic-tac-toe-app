import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TableDiv from '../../components/ui/TableDiv';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SearchInput from '../../components/ui/SearchInput';
import RoleBadge from '../../components/ui/RoleBadge';
import ActionButton from '../../components/ui/ActionButton';
import { Navigate } from 'react-router-dom';

const GroupsPage = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const { appStyle, navbarPosition } = useTheme();
  
  const isSa = user?.roles?.includes('Sa');
  if (!isSa) return <Navigate to="/profile" replace />;

  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [managingGroup, setManagingGroup] = useState(null); 
  const [memberSearch, setMemberSearch] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [createData, setCreateData] = useState({ name: '', description: '', parent_id: '' });
  const [editData, setEditData] = useState({ name: '', description: '' });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const API_URL = `http://${window.location.hostname}:3000`;
      const res = await fetch(`${API_URL}/api/groups`, { headers: { 'x-access-token': token } });
      if (res.ok) setGroups(await res.json());
    } catch (e) { addToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const API_URL = `http://${window.location.hostname}:3000`;
      const res = await fetch(`${API_URL}/api/admin/users`, { headers: { 'x-access-token': token } });
      if (res.ok) setUsers(await res.json());
    } catch (e) {}
  };

  useEffect(() => { fetchGroups(); fetchUsers(); }, []);

  useEffect(() => {
    if (managingGroup) setEditData({ name: managingGroup.name, description: managingGroup.description || '' });
  }, [managingGroup]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'default';
    setSortConfig({ key, direction });
  };

  const processedGroups = useMemo(() => {
    let result = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortConfig.direction !== 'default' && sortConfig.key) {
      result.sort((a, b) => {
        let aV = a[sortConfig.key];
        let bV = b[sortConfig.key];
        if (sortConfig.key === 'leader') { aV = a.leader_name || ''; bV = b.leader_name || ''; }
        if (sortConfig.key === 'parent') { aV = a.parent_name || ''; bV = b.parent_name || ''; }
        if (aV < bV) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aV > bV) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [groups, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedGroups.length / itemsPerPage);
  const currentGroups = processedGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { 
    setCurrentPage(1); 
    setSelectedIds(new Set()); 
  }, [searchTerm, itemsPerPage, sortConfig]);

  const handleSelectAll = (checked) => {
    if (checked) setSelectedIds(new Set(currentGroups.map(g => g.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const executeBulkAction = async (actionType) => {
    const idsToProcess = Array.from(selectedIds);
    if (idsToProcess.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: `Eliminar ${idsToProcess.length} grupos`,
      description: "¿Estás seguro? Esta acción es irreversible.",
      confirmText: "Eliminar Todo",
      variant: "danger",
      onConfirm: async () => {
        const API_URL = `http://${window.location.hostname}:3000`;
        try {
          const promises = idsToProcess.map(id => 
            fetch(`${API_URL}/api/groups/${id}`, { method: 'DELETE', headers: { 'x-access-token': token } })
          );
          await Promise.all(promises);
          addToast("Acción masiva completada", 'success');
          setSelectedIds(new Set());
          fetchGroups();
        } catch(e) { addToast("Error en acción masiva", 'error'); }
      }
    });
  };

  const handleCreateSubmit = async () => {
    const API_URL = `http://${window.location.hostname}:3000`;
    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify(createData)
      });
      if (res.ok) { setIsCreateOpen(false); setCreateData({ name: '', description: '', parent_id: '' }); addToast("Grupo creado", 'success'); fetchGroups(); }
      else { const err = await res.json(); addToast(err.error, 'error'); }
    } catch (e) { addToast("Error", 'error'); }
  };

  const handleUpdateGroup = async () => {
    const API_URL = `http://${window.location.hostname}:3000`;
    try {
      const res = await fetch(`${API_URL}/api/groups/${managingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify(editData)
      });
      if (res.ok) { addToast("Actualizado", 'success'); fetchGroups(); setManagingGroup(prev => ({ ...prev, ...editData })); }
      else { const err = await res.json(); addToast(err.error, 'error'); }
    } catch (e) { addToast("Error", 'error'); }
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Eliminar Grupo",
      description: "¿Confirmar eliminación?",
      confirmText: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const API_URL = `http://${window.location.hostname}:3000`;
        const res = await fetch(`${API_URL}/api/groups/${id}`, { method: 'DELETE', headers: { 'x-access-token': token } });
        if (res.ok) { addToast("Eliminado", 'success'); fetchGroups(); }
        else addToast("Error", 'error');
      }
    });
  };

  const handleAssignMember = async (userId, groupId) => {
    const API_URL = `http://${window.location.hostname}:3000`;
    try {
      const res = await fetch(`${API_URL}/api/admin/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify({ group_id: groupId }) 
      });
      if (res.ok) { fetchGroups(); fetchUsers(); addToast("Cambio guardado", 'success'); }
    } catch (e) { addToast("Error", 'error'); }
  };

  const handleSetLeader = async (groupId, leaderId) => {
    const API_URL = `http://${window.location.hostname}:3000`;
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify({ leader_id: leaderId })
      });
      if (res.ok) { fetchGroups(); setManagingGroup(prev => ({ ...prev, leader_id: leaderId })); addToast("Encargado asignado", 'success'); }
    } catch (e) { addToast("Error", 'error'); }
  };

  const handleToggleAdmin = async (userId, isNowAdmin) => {
    const API_URL = `http://${window.location.hostname}:3000`;
    try {
      const res = await fetch(`${API_URL}/api/admin/toggle-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify({ targetUserId: userId, roleName: 'adm' })
      });
      if (res.ok) { fetchUsers(); addToast("Rol actualizado", 'success'); }
    } catch (e) { addToast("Error", 'error'); }
  };

  const columns = [
    { key: 'name', label: 'Nombre', sortable: true, className: 'font-bold w-48 justify-center', render: (g) => <div className="text-center"><p>{g.name}</p><p className="text-[9px] text-gray-400 uppercase tracking-tighter">{g.description}</p></div> },
    { key: 'leader', label: 'Encargado', sortable: true, className: 'w-48 justify-center', render: (g) => g.leader_name ? <div className="flex items-center gap-2 justify-center"><span>{g.leader_name}</span><RoleBadge role="enc" /></div> : <span className="text-gray-300 text-xs">--</span> },
    { key: 'count', label: 'Miembros', sortable: true, className: 'w-24 justify-center', render: (g) => <div className="flex justify-center w-full"><span className="bg-gray-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{g.member_count || 0}</span></div> },
    { key: 'parent', label: 'Dependencia', sortable: true, className: 'w-32 justify-center', render: (g) => g.parent_name ? <span className="text-xs text-gray-500">↳ {g.parent_name}</span> : <span className="text-gray-300 text-[10px] uppercase font-black tracking-widest">Raíz</span> },
    { key: 'actions', label: 'Controles', sticky: 'right', className: 'w-32 justify-center', render: (g) => <div className="flex gap-2 justify-center"><ActionButton variant="sky" onClick={() => setManagingGroup(g)}>EDIT</ActionButton><ActionButton variant="danger" onClick={() => handleDelete(g.id)}>Elim</ActionButton></div> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div><h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter text-center md:text-left">Grupos</h1><p className="text-gray-500 text-sm uppercase font-black tracking-widest text-center md:text-left">Estructura</p></div>
        <div className="flex gap-3 w-full md:w-auto items-center">
           <div className="flex-1 md:w-48"><SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." /></div>
           {appStyle === 'classic' && <Button onClick={() => setIsCreateOpen(true)}>+ GRUPO</Button>}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-teal-600 p-2 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 shadow-lg">
          <span className="text-xs font-black text-white uppercase tracking-widest ml-4">{selectedIds.size} SELECCIONADOS</span>
          <div className="flex gap-2 mr-2">
            <ActionButton variant="gray" className="!bg-white !text-teal-700" onClick={() => executeBulkAction('delete')}>BORRAR MASIVO</ActionButton>
          </div>
        </div>
      )}

      <TableDiv 
        columns={columns} 
        data={currentGroups} 
        loading={loading} 
        emptyMessage="No hay grupos."
        sort={{ key: sortConfig.key, direction: sortConfig.direction, onSort: requestSort }}
        pagination={{ currentPage, totalPages, itemsPerPage, onPageChange: setCurrentPage, onLimitChange: setItemsPerPage }}
        selection={{ selectedIds, onSelectAll: handleSelectAll, onSelectOne: handleSelectOne }}
      />

      {appStyle === 'modern' && (
        <button onClick={() => setIsCreateOpen(true)} className={`fixed right-6 z-40 bg-teal-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${navbarPosition === 'bottom' ? 'bottom-20' : 'bottom-6'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nuevo Grupo">
        <div className="space-y-4">
          <Input label="Nombre" value={createData.name} onChange={e => setCreateData({...createData, name: e.target.value})} />
          <Input label="Descripción" value={createData.description} onChange={e => setCreateData({...createData, description: e.target.value})} />
          <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black uppercase text-gray-500 ml-1">Grupo Padre</label><select className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-xs font-bold outline-none" value={createData.parent_id} onChange={e => setCreateData({...createData, parent_id: e.target.value})}><option value="">NINGUNO (RAÍZ)</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div className="flex justify-end gap-2 pt-4"><Button variant="secondary" onClick={() => setIsCreateOpen(false)}>CANCELAR</Button><Button onClick={handleCreateSubmit}>GUARDAR</Button></div>
        </div>
      </Modal>

      <Modal isOpen={!!managingGroup} onClose={() => setManagingGroup(null)} title="Administrar" className="max-w-3xl">
        <div className="flex flex-col h-[70vh] md:h-[500px] gap-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 w-full space-y-3">
                <Input label="Nombre" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                <Input label="Descripción" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
             </div>
             <Button onClick={handleUpdateGroup}>GUARDAR</Button>
          </div>
          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
            <div className="flex-[1.5] flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-4 md:pr-6">
              <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Miembros ({users.filter(u => u.group_id === managingGroup?.id).length})</h4>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {users.filter(u => u.group_id === managingGroup?.id).map(u => {
                  const isLeader = managingGroup?.leader_id === u.id;
                  return (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shrink-0">
                      <span className="text-sm font-bold truncate">{u.username}</span>
                      <div className="flex items-center gap-2">
                        <ActionButton onClick={() => handleSetLeader(managingGroup.id, isLeader ? null : u.id)} variant={isLeader ? 'orange' : 'gray'}>ENC</ActionButton>
                        <ActionButton onClick={() => handleToggleAdmin(u.id, u.isAdmin)} variant={u.isAdmin ? 'emerald' : 'gray'}>ADM</ActionButton>
                        <ActionButton onClick={() => handleAssignMember(u.id, null)} variant="ghost" className="!px-1">✕</ActionButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0 pt-4 md:pt-0">
              <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Añadir</h4>
              <SearchInput value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Buscar..." className="mb-3" />
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {users.filter(u => u.group_id !== managingGroup?.id && u.username.toLowerCase().includes(memberSearch.toLowerCase())).slice(0, 50).map(u => ( 
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shrink-0">
                    <div className="flex flex-col overflow-hidden"><span className="text-sm font-bold truncate">{u.username}</span><span className="text-[10px] text-gray-400 uppercase font-black">{u.group_id ? 'En otro grupo' : 'Sin grupo'}</span></div>
                    <button onClick={() => handleAssignMember(u.id, managingGroup.id)} className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-teal-700 shadow-sm font-black">+</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-2 shrink-0"><Button variant="secondary" onClick={() => setManagingGroup(null)}>CERRAR</Button></div>
        </div>
      </Modal>
      <ConfirmDialog isOpen={confirmConfig.isOpen} onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} description={confirmConfig.description} confirmText={confirmConfig.confirmText} variant={confirmConfig.variant} />
    </div>
  );
};

export default GroupsPage;
