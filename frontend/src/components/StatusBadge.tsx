import React from 'react';
import { TicketStatus } from '../types';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyle = () => {
    switch (status) {
      case 'OPEN':
        return {
          border: 'border-sky-500 text-sky-600 bg-sky-50/30',
          label: 'OPEN',
        };
      case 'IN_PROGRESS':
        return {
          border: 'border-purple-500 text-purple-600 bg-purple-50/30',
          label: 'IN PROGRESS',
        };
      case 'RESOLVED':
        return {
          border: 'border-emerald-500 text-emerald-600 bg-emerald-50/30',
          label: 'RESOLVED',
        };
      case 'CLOSED':
        return {
          border: 'border-stone-400 text-stone-600 bg-stone-50/40',
          label: 'CLOSED',
        };
      default:
        return {
          border: 'border-stone-400 text-stone-600 bg-stone-50/40',
          label: status,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono ${style.border} ${className}`}
    >
      {style.label}
    </span>
  );
};
