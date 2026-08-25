import React from 'react';
import { SLAState } from '../types';
import { SLARingIcon } from './icons/CustomIcons';
import { Check } from 'lucide-react';

interface SLABadgeProps {
  state: SLAState;
  remainingMinutes?: number;
  label?: string;
  isCompleted?: boolean;
}

export const SLABadge: React.FC<SLABadgeProps> = ({
  state,
  remainingMinutes,
  isCompleted = false,
}) => {
  const formatMinutes = (minutes: number) => {
    if (minutes <= 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  if (isCompleted) {
    return (
      <div className="inline-flex items-center gap-1 text-emerald-600 font-mono text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>Met</span>
      </div>
    );
  }

  const getTextColor = () => {
    switch (state) {
      case 'ON_TRACK':
        return 'text-emerald-600';
      case 'AT_RISK':
        return 'text-amber-600';
      case 'BREACHED':
        return 'text-rose-600';
      default:
        return 'text-stone-600';
    }
  };

  const getSuffix = () => {
    switch (state) {
      case 'AT_RISK':
        return ' at-risk';
      case 'BREACHED':
        return ' overdue';
      default:
        return remainingMinutes !== undefined && remainingMinutes < 60 ? ' remaining' : '';
    }
  };

  const minutesText = remainingMinutes !== undefined ? formatMinutes(remainingMinutes) : '';

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs">
      <SLARingIcon state={state} className="w-3.5 h-3.5" />
      <span className={`font-semibold ${getTextColor()}`}>
        {minutesText}
        {getSuffix()}
      </span>
    </div>
  );
};
