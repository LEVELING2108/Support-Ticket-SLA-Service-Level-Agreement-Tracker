import React from 'react';
import { Priority } from '../types';
import {
  UrgentPriorityIcon,
  HighPriorityIcon,
  MediumPriorityIcon,
  LowPriorityIcon,
} from './icons/CustomIcons';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const getStyle = () => {
    switch (priority) {
      case 'URGENT':
        return {
          css: 'bg-red-50 text-red-700 border-red-200/90 shadow-2xs',
          icon: <UrgentPriorityIcon className="w-3.5 h-3.5" />,
        };
      case 'HIGH':
        return {
          css: 'bg-orange-50 text-orange-700 border-orange-200/90 shadow-2xs',
          icon: <HighPriorityIcon className="w-3.5 h-3.5" />,
        };
      case 'MEDIUM':
        return {
          css: 'bg-blue-50 text-blue-700 border-blue-200/90 shadow-2xs',
          icon: <MediumPriorityIcon className="w-3.5 h-3.5" />,
        };
      case 'LOW':
        return {
          css: 'bg-slate-50 text-slate-700 border-slate-200 shadow-2xs',
          icon: <LowPriorityIcon className="w-3.5 h-3.5" />,
        };
      default:
        return {
          css: 'bg-slate-50 text-slate-700 border-slate-200 shadow-2xs',
          icon: null,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${style.css}`}
    >
      {style.icon}
      <span>{priority}</span>
    </span>
  );
};
