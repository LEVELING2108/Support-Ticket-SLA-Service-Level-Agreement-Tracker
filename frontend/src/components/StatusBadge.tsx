import React from 'react';
import { TicketStatus } from '../types';

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'OPEN':
        return {
          dot: 'bg-sky-500',
          text: 'text-sky-700',
          bg: 'bg-sky-50/60 border-sky-200/60',
          label: 'Open',
        };
      case 'IN_PROGRESS':
        return {
          dot: 'bg-indigo-500',
          text: 'text-indigo-700',
          bg: 'bg-indigo-50/60 border-indigo-200/60',
          label: 'In Progress',
        };
      case 'RESOLVED':
        return {
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50/60 border-emerald-200/60',
          label: 'Resolved',
        };
      case 'CLOSED':
        return {
          dot: 'bg-slate-400',
          text: 'text-slate-600',
          bg: 'bg-slate-100 border-slate-200/60',
          label: 'Closed',
        };
      default:
        return {
          dot: 'bg-slate-400',
          text: 'text-slate-600',
          bg: 'bg-slate-100 border-slate-200/60',
          label: status,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      <span className={style.text}>{style.label}</span>
    </span>
  );
};
