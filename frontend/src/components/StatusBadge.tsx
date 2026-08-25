import React from 'react';
import { TicketStatus } from '../types';
import {
  OpenStatusIcon,
  InProgressStatusIcon,
  ResolvedStatusIcon,
  ClosedStatusIcon,
} from './icons/CustomIcons';

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'OPEN':
        return {
          css: 'bg-sky-50 text-sky-700 border-sky-200/90 shadow-2xs',
          icon: <OpenStatusIcon className="w-3.5 h-3.5" />,
          label: 'Open',
        };
      case 'IN_PROGRESS':
        return {
          css: 'bg-indigo-50 text-indigo-700 border-indigo-200/90 shadow-2xs',
          icon: <InProgressStatusIcon className="w-3.5 h-3.5" />,
          label: 'In Progress',
        };
      case 'RESOLVED':
        return {
          css: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-2xs',
          icon: <ResolvedStatusIcon className="w-3.5 h-3.5" />,
          label: 'Resolved',
        };
      case 'CLOSED':
        return {
          css: 'bg-slate-100 text-slate-600 border-slate-200 shadow-2xs',
          icon: <ClosedStatusIcon className="w-3.5 h-3.5" />,
          label: 'Closed',
        };
      default:
        return {
          css: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: null,
          label: status,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.css}`}
    >
      {style.icon}
      <span>{style.label}</span>
    </span>
  );
};
