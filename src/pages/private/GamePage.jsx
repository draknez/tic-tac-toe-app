import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TicTacToe from '../../components/TicTacToe';
import MultiplayerGame from '../../components/MultiplayerGame';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import GameStats from '../../components/ui/GameStats';
import UserStatusDot from '../../components/ui/UserStatusDot';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const GamePage = () => {
  const { user, token, API_URL, socket } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [mode, setMode] = useState('menu'); // 'menu', 'solo', 'multi'
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false });

  const fetchData = async () => {
    if (!token) return;
    try {
      // Estadísticas
      const resStats = await fetch(`${API_URL}/api/user/stats`, {
        headers: { 'x-access-token': token }
      });
      if (resStats.ok) setStats(await resStats.json());

      // Usuarios Online (Público)
      const resOnline = await fetch(`${API_URL}/api/users/status`);
      if (resOnline.ok) {
        const users = await resOnline.json();
        // Solo otros usuarios que estén online
        setOnlineUsers(users.filter(u => u.id !== user.id && u.online));
      }

      // Sesiones Activas
      const resSessions = await fetch(`${API_URL}/api/game/sessions`, {
        headers: { 'x-access-token': token }
      });
      if (resSessions.ok) {
        const sessions = await resSessions.json();
        setActiveSessions(Array.isArray(sessions) ? sessions : []);
      }

    } catch (e) { console.error('Error fetching game data:', e); }
  };

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserChange = ({ username, online, is_busy }) => {
      console.log(`👤 Cambio de estado: ${username} (Online: ${online}, Ocupado: ${is_busy})`);
      
      setOnlineUsers(prev => {
        // Si el usuario ya está en la lista, lo actualizamos
        const exists = prev.find(u => u.username === username);
        if (exists) {
          return prev.map(u => 
            u.username === username ? { ...u, online, is_busy } : u
          ).filter(u => u.online); // Si se desconectó, lo quitamos
        }
        
        // Si es un nuevo usuario que se conectó y NO es el usuario actual
        if (online && username !== user.username) {
          // Nota: Aquí lo ideal es un fetch rápido para tener su ID, pero
          // por ahora refrescamos la lista completa para asegurar integridad de IDs
          fetchData();
        }
        
        return prev;
      });
    };

    const handleGameUpdate = (data) => {
      console.log('🎮 Actualización de juego recibida:', data);
      if (data.type === 'new-challenge') {
        addToast('¡Tienes un nuevo reto! 🎮', 'info');
      }
      
      if (data.type === 'challenge-rejected') {
        addToast('Tu reto ha sido rechazado ❌', 'error');
      }

      // AUTO-INICIO: Si alguien aceptó mi reto, vamos directo al tablero
      if (data.type === 'challenge-accepted') {
        addToast('¡Reto aceptado! Iniciando partida...', 'success');
        setSelectedSessionId(data.sessionId);
        setMode('multi');
      }

      fetchData(); // Refrescar sesiones y estados
    };

    const handleForceExit = () => {
      addToast('La sesión ha finalizado.', 'info');
      setMode('menu');
      setSelectedSessionId(null);
      fetchData();
    };

    socket.on('user-status-changed', handleUserChange);
    socket.on('game-updated', handleGameUpdate);
    socket.on('force-exit', handleForceExit);

    return () => {
      socket.off('user-status-changed', handleUserChange);
      socket.off('game-updated', handleGameUpdate);
      socket.off('force-exit', handleForceExit);
    };
  }, [socket]);

  const handleExit = () => {
    setMode('menu');
    setSelectedSessionId(null);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [token, API_URL]);

  const handleChallenge = async (opponentId) => {
    try {
      const res = await fetch(`${API_URL}/api/game/challenge`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token 
        },
        body: JSON.stringify({ opponentId })
      });
      if (res.ok) {
        addToast('¡Reto enviado! 🎮', 'success');
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleAccept = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/api/game/accept/${sessionId}`, {
        method: 'POST',
        headers: { 'x-access-token': token }
      });
      if (res.ok) {
        setSelectedSessionId(sessionId);
        setMode('multi');
      }
    } catch (e) { console.error(e); }
  };

  const handleReject = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/api/game/reject/${sessionId}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token }
      });
      if (res.ok) {
        addToast('Reto rechazado', 'info');
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleSoloGameOver = async (result) => {
    try {
      await fetch(`${API_URL}/api/game/result`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token 
        },
        body: JSON.stringify({ result })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleResetStats = () => {
    setDialogConfig({
      isOpen: true,
      title: "Reiniciar Estadísticas",
      description: "¿Seguro que quieres poner a cero tus contadores? Esta acción no se puede deshacer.",
      confirmText: "SÍ, REINICIAR",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/api/game/reset-stats`, {
            method: 'POST',
            headers: { 'x-access-token': token }
          });
          if (res.ok) {
            addToast('Estadísticas reiniciadas ♻️', 'success');
            fetchData();
          }
        } catch (e) { console.error(e); }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-3 text-center md:text-left group">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-2xl transition-all group-hover:scale-105">
            <svg className="w-3 h-3 animate-pulse text-rose-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
            PvP Battleground
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none italic">
            ARENA <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 drop-shadow-sm">BALOG</span>
          </h1>
          <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">
            Forja tu leyenda en el tablero ⚔️
          </p>
        </div>

        <GameStats stats={stats} onReset={handleResetStats} className="!p-4 !rounded-[2rem] shadow-2xl" />
      </div>

      {mode === 'menu' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: Retos / Partidas */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Partidas Multijugador</h3>
                
                <div className="space-y-4">
                   {activeSessions.length === 0 && (
                     <p className="text-center py-10 text-gray-400 font-bold italic">No tienes partidas activas. ¡Reta a alguien!</p>
                   )}
                   {activeSessions.map(s => (
                     <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-teal-500/5 transition-all group">
                        <div className="flex items-center gap-4">
                           {/* Icono Estilo Game */}
                           <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                              <svg className="w-7 h-7 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 14l9-9m-9 9l-9-9m9 9v9" className="opacity-40" />
                              </svg>
                           </div>
                           <div>
                              <p className="font-black text-gray-900 dark:text-white text-lg leading-tight">
                                 {s.player_x_id === user.id ? s.player_o_name : s.player_x_name}
                              </p>
                              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${s.status === 'pending' ? 'text-amber-500 animate-pulse' : 'text-teal-600'}`}>
                                 {s.status === 'pending' ? (s.player_o_id === user.id ? '🔥 NUEVO RETO' : 'PENDIENTE') : `⚔️ EN COMBATE`}
                              </p>
                           </div>
                        </div>
                        
                        <div className="flex gap-2">
                           {s.status === 'pending' && s.player_o_id === user.id && (
                             <>
                               <Button size="sm" onClick={() => handleAccept(s.id)} className="bg-teal-600 text-white font-bold h-10 px-4 rounded-xl">ACEPTAR</Button>
                               <Button size="sm" variant="secondary" onClick={() => handleReject(s.id)} className="text-rose-500 border-rose-200 h-10 px-4 rounded-xl">RECHAZAR</Button>
                             </>
                           )}
                           {s.status === 'playing' && (
                             <Button size="sm" onClick={() => { setSelectedSessionId(s.id); setMode('multi'); }} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold h-10 px-6 rounded-xl">JUGAR</Button>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
            </div>

            <div className="flex justify-center pt-4">
               <Button onClick={() => setMode('solo')} className="bg-teal-600/10 text-teal-600 border border-teal-600/20 h-14 px-10 rounded-full font-black uppercase tracking-[0.2em] hover:bg-teal-600 hover:text-white transition-all">
                  🎮 Modo Práctica (vs IA)
               </Button>
            </div>
          </div>

          {/* COLUMNA 2: Usuarios Online */}
          <div className="bg-gray-50 dark:bg-gray-800/30 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
             <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Jugadores Online</h3>
             <div className="space-y-3">
                {onlineUsers.length === 0 && (
                  <p className="text-center py-4 text-gray-400 text-xs font-bold italic">No hay otros jugadores en línea ahora.</p>
                )}
                {onlineUsers.map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => !u.is_busy && handleChallenge(u.id)}
                    className={`flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all active:scale-95 group ${u.is_busy ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-teal-500 dark:hover:border-teal-500'}`}
                  >
                     <div className="flex items-center gap-3">
                        <UserStatusDot online={true} is_busy={u.is_busy} />
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-teal-600 transition-colors">{u.username}</span>
                           {u.is_busy && <span className="text-[8px] font-black text-amber-600 uppercase">En Partida 🎮</span>}
                        </div>
                     </div>
                     {!u.is_busy && (
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Retar</span>
                           <div className="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           </div>
                        </div>
                     )}
                  </div>
                ))}
             </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8 animate-in zoom-in duration-500">
           {mode === 'solo' ? (
             <>
               <Button variant="ghost" onClick={() => setMode('menu')} className="font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest text-[10px]">
                  ← Volver al Menú
               </Button>
               <TicTacToe onGameOver={handleSoloGameOver} />
             </>
           ) : (
             <MultiplayerGame sessionId={selectedSessionId} onGameOver={handleExit} />
           )}
        </div>
      )}

      <ConfirmDialog 
        {...dialogConfig} 
        onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })} 
      />
    </div>
  );
};

export default GamePage;
