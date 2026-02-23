import React from 'react';

const UserStatusDot = ({ online, is_busy, showLabel = false }) => {
  if (!online) return null;

  const colorClass = is_busy ? 'bg-amber-500' : 'bg-green-500';
  const pingClass = is_busy ? 'bg-amber-400' : 'bg-green-400';
  const label = is_busy ? 'En Partida 🎮' : 'Online';

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex shrink-0">
        <div className={`w-2 h-2 ${colorClass} rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>
        <div className={`absolute inset-0 w-2 h-2 ${pingClass} rounded-full animate-ping`}></div>
      </div>
      {showLabel && (
        <span className={`text-[8px] font-black uppercase tracking-widest ${is_busy ? 'text-amber-600' : 'text-green-600'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default UserStatusDot;
