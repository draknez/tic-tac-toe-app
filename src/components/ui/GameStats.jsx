import React from 'react';

const Icons = {
  Trophy: () => <svg className="w-3 h-3 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 3v4M19 3v4M5 7h14M5 7a2 2 0 00-2 2v1a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2M5 7v4a2 2 0 002 2h10a2 2 0 002-2V7M8 21h8m-4-4v4" /></svg>,
  Draw: () => <svg className="w-3 h-3 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 8h10M7 12h10M7 16h10" /></svg>,
  Loss: () => <svg className="w-3 h-3 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

const GameStats = ({ stats, className = "", onReset = null }) => {
  return (
    <div className={`flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-inner ${className}`}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 border-r border-gray-200 dark:border-gray-700">
        <span className="text-teal-500"><Icons.Trophy /></span>
        <p className="text-[9px] font-black text-teal-600 uppercase tracking-tighter">Wins</p>
        <p className="text-xl font-black dark:text-white leading-none">{stats.wins}</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 border-r border-gray-200 dark:border-gray-700">
        <span className="text-amber-500"><Icons.Draw /></span>
        <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Draws</p>
        <p className="text-xl font-black dark:text-white leading-none">{stats.draws}</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 border-r border-gray-200 dark:border-gray-700 last:border-none">
        <span className="text-rose-500"><Icons.Loss /></span>
        <p className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">Losses</p>
        <p className="text-xl font-black dark:text-white leading-none">{stats.losses}</p>
      </div>
      
      {onReset && (
        <button 
          onClick={onReset}
          title="Reiniciar Estadísticas"
          className="p-3 text-gray-300 hover:text-red-500 transition-all hover:scale-110 active:rotate-12 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}
    </div>
  );
};

export default GameStats;
