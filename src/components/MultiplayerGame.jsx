import React, { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const MultiplayerGame = ({ sessionId, onGameOver }) => {
  const { user, token, API_URL, socket } = useAuth();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rematchOffered, setRematchOffered] = useState(false);
  const [waitingForRematch, setWaitingForRematch] = useState(false);

  const fetchSession = async () => {
    if (!token || !sessionId) return;
    try {
      const res = await fetch(`${API_URL}/api/game/session/${sessionId}`, {
        headers: { 'x-access-token': token }
      });
      
      if (!res.ok) {
        if (res.status === 401) console.error("Sesión no autorizada");
        return;
      }

      const data = await res.json();
      if (data && data.board) {
        setSession(data);
        setBoard(typeof data.board === 'string' ? JSON.parse(data.board) : data.board);
        setCurrentTurn(data.current_turn);
      }
    } catch (error) {
      console.error('Error de red al consultar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup Socket.io para movimientos, reconexión y revancha
  useEffect(() => {
    if (!sessionId || !socket) return;

    const joinRoom = () => {
      socket.emit('join-game', sessionId);
    };

    joinRoom();
    socket.on('connect', joinRoom);

    const handleMove = (data) => {
      setBoard(data.board);
      setCurrentTurn(data.nextTurn);
      setSession(prev => {
        if (!prev) return prev;
        return { 
          ...prev, 
          status: data.status, 
          winner_id: data.winnerId,
          current_turn: data.nextTurn,
          board: data.board
        };
      });
    };

    const handleRematchOffered = () => {
      setRematchOffered(true);
    };

    const handleRematchDeclined = () => {
      setWaitingForRematch(false);
      alert("La revancha ha sido rechazada.");
    };

    const handleGameRestarted = (data) => {
      setBoard(data.board);
      setCurrentTurn('X');
      setSession(prev => ({ ...prev, status: 'playing', winner_id: null, current_turn: 'X' }));
      setRematchOffered(false);
      setWaitingForRematch(false);
    };

    socket.on('move-made', handleMove);
    socket.on('rematch-offered', handleRematchOffered);
    socket.on('rematch-declined', handleRematchDeclined);
    socket.on('game-restarted', handleGameRestarted);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('move-made', handleMove);
      socket.off('rematch-offered', handleRematchOffered);
      socket.off('rematch-declined', handleRematchDeclined);
      socket.off('game-restarted', handleGameRestarted);
    };
  }, [sessionId, socket]);

  const handleRequestRematch = () => {
    setWaitingForRematch(true);
    socket.emit('request-rematch', { sessionId, from: user.username });
  };

  const handleRejectRematch = () => {
    setRematchOffered(false);
    socket.emit('reject-rematch', { sessionId });
  };

  const handleAcceptRematch = () => {
    socket.emit('accept-rematch', { sessionId });
  };

  const handleExit = () => {
    socket.emit('leave-game', { sessionId });
    onGameOver();
  };

  // Carga inicial de la sesión
  useEffect(() => {
    setLoading(true);
    fetchSession();
  }, [sessionId, token]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = async (i) => {
    if (session?.status !== 'playing' || board[i]) return;
    
    // Validar si es mi turno
    const isMyTurn = (currentTurn === 'X' && session.player_x_id === user.id) ||
                     (currentTurn === 'O' && session.player_o_id === user.id);
    
    if (!isMyTurn) return;

    const newBoard = board.slice();
    newBoard[i] = currentTurn;
    const nextTurn = currentTurn === 'X' ? 'O' : 'X';
    
    const winner = calculateWinner(newBoard);
    let winnerId = null;
    if (winner) {
      winnerId = winner === 'X' ? session.player_x_id : session.player_o_id;
    }

    // Optimistic UI
    setBoard(newBoard);
    setCurrentTurn(nextTurn);

    try {
      await fetch(`${API_URL}/api/game/move/${sessionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token 
        },
        body: JSON.stringify({ 
          board: newBoard, 
          nextTurn,
          winnerId // Será null si no hay ganador aún o es empate
        })
      });
      // No llamamos a fetchSession aquí, confiamos en el Socket
    } catch (error) {
      console.error('Error sending move:', error);
    }
  };

  if (loading && !session) return <div className="text-center p-10 font-black animate-pulse">Cargando partida...</div>;

  const isMyTurn = session && (
    (currentTurn === 'X' && session.player_x_id === user.id) ||
    (currentTurn === 'O' && session.player_o_id === user.id)
  );

  const mySymbol = session?.player_x_id === user.id ? 'X' : 'O';
  const opponentName = session?.player_x_id === user.id ? session.player_o_name : session.player_x_name;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
          {session?.status === 'finished' ? (
            session.winner_id ? (session.winner_id === user.id ? '¡Has ganado! 🏆' : 'Has perdido 💀') : 'Empate 🤝'
          ) : (
            isMyTurn ? '¡Tu turno!' : `Esperando a ${opponentName}...`
          )}
        </h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
          Juegas con <span className={mySymbol === 'X' ? 'text-teal-600' : 'text-rose-500'}>{mySymbol}</span> vs <span className="text-gray-600 dark:text-gray-300">{opponentName}</span>
        </p>
      </div>

      <div className={`grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] shadow-inner border-4 border-white dark:border-gray-800 transition-all duration-500 ${!isMyTurn && session?.status !== 'finished' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
        {board.map((val, i) => (
          <button
            key={i}
            disabled={!isMyTurn || !!val || session?.status === 'finished'}
            className={`w-20 h-20 md:w-24 md:h-24 text-3xl md:text-4xl font-black rounded-2xl transition-all duration-300 transform 
              ${!val && isMyTurn && session?.status === 'playing' ? 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 active:scale-95' : ''}
              ${val ? 'scale-100' : 'scale-90 opacity-50'}
              bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white shadow-sm flex items-center justify-center`}
            onClick={() => handleClick(i)}
          >
            <span className={`transition-all duration-500 ${val ? 'scale-110 rotate-0' : 'scale-0 rotate-12'}`}>
              {val === 'X' ? <span className="text-teal-600">X</span> : <span className="text-rose-500">O</span>}
            </span>
          </button>
        ))}
      </div>

      {session?.status === 'finished' ? (
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500 w-full max-w-xs">
          <p className="text-teal-600 font-black uppercase text-[10px] tracking-widest bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-full shadow-sm">Partida Finalizada</p>
          
          <div className="flex flex-col gap-3 w-full">
            {rematchOffered ? (
              <>
                <Button onClick={handleAcceptRematch} className="bg-teal-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 animate-bounce">
                   ACEPTAR REVANCHA 🔄
                </Button>
                <Button onClick={handleRejectRematch} variant="secondary" className="h-10 text-rose-500 border-rose-100 font-bold uppercase text-[10px] tracking-widest">
                   RECHAZAR REVANCHA ❌
                </Button>
              </>
            ) : waitingForRematch ? (
              <Button disabled className="bg-gray-100 dark:bg-gray-800 text-gray-400 h-14 rounded-2xl font-black uppercase tracking-widest cursor-wait">
                 Esperando respuesta...
              </Button>
            ) : (
              <Button onClick={handleRequestRematch} className="bg-teal-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-105 transition-transform">
                 SOLICITAR REVANCHA 🔄
              </Button>
            )}

            <Button onClick={handleExit} variant="secondary" className="h-14 rounded-2xl font-black uppercase tracking-widest border-2 border-gray-200 dark:border-gray-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">
               SALIR AL MENÚ 🚪
            </Button>
          </div>
        </div>
      ) : (
        !isMyTurn && (
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 animate-pulse">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            El oponente está pensando...
          </div>
        )
      )}
    </div>
  );
};

export default MultiplayerGame;
