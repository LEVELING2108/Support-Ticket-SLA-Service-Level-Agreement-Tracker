import React from 'react';
import { Priority } from '../types';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const getStyle = () => {
    switch (priority) {
      case 'URGENT':
        return 'text-rose-700 bg-rose-50 border-rose-200/70';
      case 'HIGH':
        return 'text-orange-700 bg-orange-50 border-orange-200/70';
      case 'MEDIUM':
        return 'text-blue-700 bg-blue-50 border-blue-200/70';
      case 'LOW':
        return 'text-slate-600 bg-slate-50 border-slate-200/70';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200/70';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getStyle()}`}
    >
      {priority}
    </span>
  );
};
