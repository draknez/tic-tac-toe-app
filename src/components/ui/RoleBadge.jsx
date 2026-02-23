import React from 'react';

/**
 * RoleBadge: Componente unificado para mostrar roles con soporte para modo oscuro.
 */
const RoleBadge = ({ role, className = "" }) => {
  let badgeStyle = "bg-gray-500 text-white"; // Fallback
  let label = role;

  if (role === 'usr') {
    badgeStyle = "bg-sky-500 text-white dark:bg-sky-500/20 dark:border dark:border-sky-500/20";
    label = "Usr";
  } else if (role === 'adm') {
    badgeStyle = "bg-emerald-600 text-white dark:bg-emerald-500/20 dark:border dark:border-emerald-500/20";
    label = "Adm";
  } else if (role === 'Sa') {
    badgeStyle = "bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] to-[#AA771C] text-[#5B3A08] shadow-md border border-amber-200/50";
    label = "Sa";
  } else if (role === 'enc') {
    badgeStyle = "bg-teal-600 text-white dark:bg-teal-500/20 dark:border dark:border-teal-500/20";
    label = "Enc";
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center justify-center whitespace-nowrap ${badgeStyle} ${className}`}>
      {label}
    </span>
  );
};

export const RoleBadgeList = ({ roles = [] }) => {
  return (
    <div className="flex gap-1 justify-center">
      {roles.map(r => <RoleBadge key={r} role={r} />)}
    </div>
  );
};

export default RoleBadge;
