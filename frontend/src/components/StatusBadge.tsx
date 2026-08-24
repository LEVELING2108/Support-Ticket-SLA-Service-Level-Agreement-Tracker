import React from 'react';
import { TicketStatus } from '../types';

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'OPEN':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {getLabel()}
    </span>
  );
};
