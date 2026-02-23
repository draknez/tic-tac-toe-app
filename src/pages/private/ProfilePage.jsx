import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import RoleBadge from '../../components/ui/RoleBadge';
import GameStats from '../../components/ui/GameStats';
import UserStatusDot from '../../components/ui/UserStatusDot';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const ProfilePage = () => {
  const { user, token, logout, API_URL } = useAuth();
  const { appStyle, toggleAppStyle } = useTheme();
  const navigate = useNavigate();
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [seedCount, setSeedCount] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
  
  // State para Diálogos
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false });

  // Cargar estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/stats`, {
          headers: { 'x-access-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, [token, API_URL]);

  // Verificar roles de forma segura
  const roles = user.roles || [];
  const isAdmin = roles.includes('adm');
  const isSuperAdmin = roles.includes('Sa');

  // Color del Contenedor Principal
  let containerClass = "bg-sky-500 shadow-lg shadow-sky-500/30";
  if (isAdmin) containerClass = "bg-emerald-600 shadow-lg shadow-emerald-600/30";
  if (isSuperAdmin) containerClass = "bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] to-[#AA771C] shadow-lg shadow-[#AA771C]/40";

  // Estilos dinámicos para el nombre de usuario
  let nameBadgeClass = "bg-white text-sky-600";
  if (isAdmin) nameBadgeClass = "bg-white text-emerald-700";
  if (isSuperAdmin) nameBadgeClass = "bg-white text-[#855a15]";

  // Generar Usuarios Masivos
  const handleSeedUsers = () => {
    setDialogConfig({
      isOpen: true,
      title: "Generar Usuarios",
      description: `¿Estás seguro de generar ${seedCount} usuarios aleatorios en el sistema?`,
      confirmText: "Generar",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/api/admin/seed-users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ count: parseInt(seedCount) })
          });
          if (res.ok) {
            const data = await res.json();
            setDialogConfig({
              isOpen: true,
              isAlert: true,
              title: "Éxito",
              description: data.message
            });
          }
        } catch (error) { console.error(error); }
      }
    });
  };

  // Manejar Reset Total (Solo SuperAdmin)
  const handleSystemReset = () => {
    setDialogConfig({
      isOpen: true,
      title: "⚠️ PELIGRO CRÍTICO",
      description: "¿Estás a punto de ELIMINAR TODOS LOS USUARIOS del sistema? Esta acción es irreversible.",
      confirmText: "DESTRUIR DATOS",
      variant: "danger",
      onConfirm: () => {
        setDialogConfig({
          isOpen: true,
          title: "Confirmación Final",
          description: "Esta es tu última oportunidad. ¿Realmente quieres borrar todo?",
          confirmText: "SÍ, BORRAR TODO",
          variant: "danger",
          onConfirm: async () => {
            try {
              const res = await fetch(`${API_URL}/api/admin/system-reset`, {
                method: 'POST',
                headers: { 'x-access-token': token }
              });
              if (res.ok) {
                logout();
                navigate('/');
              }
            } catch (error) { console.error(error); }
          }
        });
      }
    });
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4">
      <Card className="w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:shadow-none border-none p-12 flex flex-col items-center gap-10 bg-white dark:bg-gray-900/40 backdrop-blur-md rounded-[4rem]">
        
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600 dark:text-teal-400">Player Profile</p>
          <div className="h-1 w-16 bg-gradient-to-r from-transparent via-teal-600 to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Perfil Header */}
        <div className={`flex items-center gap-5 p-2.5 pr-8 rounded-full ${containerClass} transition-all hover:scale-105 duration-500 shadow-2xl`}>
            <div className={`px-10 py-4 rounded-full shadow-2xl ${nameBadgeClass}`}>
                <span className="text-3xl font-black tracking-tighter italic uppercase">{user.username}</span>
            </div>
            <div className="flex gap-2.5">
                {roles.map(role => (
                    <RoleBadge key={role} role={role} className="!text-[11px] !px-5 !py-2 !shadow-2xl !border-white/20" />
                ))}
            </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 px-8 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 shadow-inner">
            <UserStatusDot online={true} showLabel={true} />
        </div>

        {/* ESTADÍSTICAS */}
        <div className="w-full space-y-4">
          <p className="text-[10px] font-black text-center uppercase tracking-[0.3em] text-gray-400">Combat Record</p>
          <GameStats stats={stats} className="w-full !bg-transparent !shadow-none !border-none !gap-8" />
        </div>

        <Link to="/game" className="w-full group">
            <Button className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black h-20 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] group-hover:bg-teal-600 group-hover:text-white transition-all flex items-center justify-center gap-4 text-xl tracking-tighter uppercase">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 14l9-9m-9 9l-9-9m9 9v9" className="opacity-30" />
                </svg>
                Enter Arena ⚔️
            </Button>
        </Link>

        {/* Herramientas SA */}
        <div className="w-full mt-4 space-y-4">
             {isSuperAdmin && (
                <div className="pt-6 mt-2 border-t border-gray-100 dark:border-gray-800 w-full">
                   <button 
                     onClick={() => setShowAdminTools(!showAdminTools)}
                     className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-amber-500 transition-colors w-full text-center mb-4"
                   >
                     {showAdminTools ? 'OCULTAR TOOLS' : 'HERRAMIENTAS SA'}
                   </button>

                   {showAdminTools && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">UI Style</span>
                          <button onClick={toggleAppStyle} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${appStyle === 'modern' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {appStyle === 'modern' ? 'MODERN v2' : 'CLASSIC v1'}
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seed Engine</p>
                          <div className="flex gap-2">
                            <Input type="number" value={seedCount} onChange={(e) => setSeedCount(e.target.value)} className="w-20 text-center h-10 font-bold" min="1" max="500" />
                            <Button size="sm" onClick={handleSeedUsers} className="flex-1 bg-[#AA771C] text-white h-10 font-bold hover:bg-[#8E6316]">GENERAR</Button>
                          </div>
                        </div>

                        <Button size="sm" variant="danger" onClick={handleSystemReset} className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-10 text-xs tracking-widest flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          SYSTEM RESET
                        </Button>
                     </div>
                   )}
                </div>
             )}
        </div>
      </Card>

      <ConfirmDialog 
        {...dialogConfig} 
        onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })} 
      />
    </div>
  );
};

export default ProfilePage;
