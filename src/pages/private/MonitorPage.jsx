import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import RoleBadge from '../../components/ui/RoleBadge';

const StatCard = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-xl`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live</span>
    </div>
    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{title}</p>
    {subValue && <p className="text-[10px] text-gray-400 mt-2">{subValue}</p>}
  </div>
);

const MonitorPage = () => {
  const { user, token, socket } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSa = user?.roles?.includes('Sa');

  // Socket Listener para cambios en tiempo real
  useEffect(() => {
    if (!socket || !isSa) return;

    const handleStatusChange = ({ online }) => {
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: {
            ...prev.users,
            online: online ? prev.users.online + 1 : Math.max(0, prev.users.online - 1)
          }
        };
      });
    };

    socket.on('user-status-changed', handleStatusChange);
    return () => socket.off('user-status-changed', handleStatusChange);
  }, [socket, isSa]);

  const fetchStats = async () => {
    if (!isSa) return;
    try {
      const API_URL = `http://${window.location.hostname}:3000`;
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'x-access-token': token }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error("Error fetching stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Auto-update cada 10s
    return () => clearInterval(interval);
  }, []);

  if (!isSa) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 px-6">
        <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Monitor del Sistema</h1>
          <p className="text-gray-500 text-lg">Esta sección está restringida a personal técnico de nivel SuperAdmin.</p>
          <div className="mt-8 flex justify-center">
             <div className="w-16 h-1 bg-teal-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Panel de Monitor</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em]">Estadísticas Globales en Tiempo Real</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-full">
           <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping"></span>
           Conectado al Servidor
        </div>
      </header>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Usuarios Online" 
          value={stats?.users?.online || 0} 
          icon="🌐" 
          color="text-blue-500 bg-blue-500" 
        />
        <StatCard 
          title="Total Usuarios" 
          value={stats?.users?.total || 0} 
          subValue={`${stats?.users?.active || 0} activos / ${stats?.users?.inactive || 0} inactivos`}
          icon="👥" 
          color="text-teal-500 bg-teal-500" 
        />
        <StatCard 
          title="Grupos Creados" 
          value={stats?.groups?.total || 0} 
          icon="📁" 
          color="text-purple-500 bg-purple-500" 
        />
        <StatCard 
          title="Seguridad" 
          value="100%" 
          subValue="Firewall Activo"
          icon="🛡️" 
          color="text-emerald-500 bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DISTRIBUCIÓN DE ROLES */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">Distribución por Roles</h4>
          <div className="space-y-4">
            {stats?.roles?.map(role => (
              <div key={role.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <RoleBadge role={role.name} />
                  <span className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">{role.name === 'Sa' ? 'SuperAdmin' : role.name === 'adm' ? 'Administrador' : 'Usuario'}</span>
                </div>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RECIENTES */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">Últimos Registros</h4>
          <div className="space-y-4">
            {stats?.recentUsers?.map(u => (
              <div key={u.id} className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-3 last:border-none">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{u.username}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">ID: {u.id}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? 'Activo' : 'Baneado'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Última actualización: {new Date(stats?.serverTime || Date.now()).toLocaleTimeString()}
        </p>
      </footer>
    </div>
  );
};

export default MonitorPage;
