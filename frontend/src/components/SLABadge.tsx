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
          bg: 'bg-emerald-50/60 border-emerald-200/50',
          label: 'On Track',
        };
      case 'AT_RISK':
        return {
          dot: 'bg-amber-500 animate-pulse',
          text: 'text-amber-700',
          bg: 'bg-amber-50/60 border-amber-200/50',
          label: 'At Risk',
        };
      case 'BREACHED':
        return {
          dot: 'bg-rose-500',
          text: 'text-rose-700',
          bg: 'bg-rose-50/60 border-rose-200/50',
          label: 'Breached',
        };
      default:
        return {
          dot: 'bg-slate-400',
          text: 'text-slate-600',
          bg: 'bg-slate-50 border-slate-200/60',
          label: state,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {label && <span className="text-slate-400 font-normal">{label}:</span>}
      <span className={`font-semibold ${style.text}`}>{style.label}</span>
      {!isCompleted && remainingMinutes !== undefined && remainingMinutes > 0 && (
        <span className="text-slate-500 font-mono text-[10px] ml-0.5 font-normal">
          ({formatMinutes(remainingMinutes)})
        </span>
      )}
      {isCompleted && (
        <span className="text-emerald-600 font-mono text-[10px] ml-0.5 font-bold">✓</span>
      )}
    </div>
  );
};
