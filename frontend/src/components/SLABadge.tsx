import React from 'react';
import { SLAState } from '../types';

interface SLABadgeProps {
  state: SLAState;
  remainingMinutes?: number;
  label?: string;
  isCompleted?: boolean;
}

export const SLABadge: React.FC<SLABadgeProps> = ({
  state,
  remainingMinutes,
  label,
  isCompleted = false,
}) => {
  const formatMinutes = (minutes: number) => {
    if (minutes <= 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getStyle = () => {
    switch (state) {
      case 'ON_TRACK':
        return {
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50/70 border-emerald-200/60',
          label: 'On Track',
        };
      case 'AT_RISK':
        return {
          dot: 'bg-amber-500 animate-pulse',
          text: 'text-amber-700',
          bg: 'bg-amber-50/70 border-amber-200/60',
          label: 'At Risk',
        };
      case 'BREACHED':
        return {
          dot: 'bg-rose-500',
          text: 'text-rose-700',
          bg: 'bg-rose-50/70 border-rose-200/60',
          label: 'Breached',
        };
      default:
        return {
          dot: 'bg-slate-400',
          text: 'text-slate-600',
          bg: 'bg-slate-50 border-slate-200',
          label: state,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style.bg} transition-all`}
    >
      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${style.dot}`}></span>
      {label && <span className="text-slate-400 font-normal hidden sm:inline">{label}:</span>}
      <span className={`font-semibold ${style.text}`}>{style.label}</span>
      {!isCompleted && remainingMinutes !== undefined && remainingMinutes > 0 && (
        <span className="text-slate-600 font-mono text-[11px] ml-0.5 font-medium">
          ({formatMinutes(remainingMinutes)})
        </span>
      )}
      {isCompleted && (
        <span className="text-emerald-600 font-mono text-xs ml-0.5 font-bold">✓</span>
      )}
    </div>
  );
};
