import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getStyle = () => {
    switch (priority) {
      case 'URGENT':
        return 'border-red-500 text-red-600 bg-red-50/30';
      case 'HIGH':
        return 'border-amber-500 text-amber-600 bg-amber-50/30';
      case 'MEDIUM':
        return 'border-indigo-500 text-indigo-600 bg-indigo-50/30';
      case 'LOW':
        return 'border-stone-400 text-stone-600 bg-stone-50/40';
      default:
        return 'border-stone-400 text-stone-600 bg-stone-50/40';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono ${getStyle()} ${className}`}
    >
      {priority}
    </span>
  );
};
