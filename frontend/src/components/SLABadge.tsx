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
          text: 'text-emerald-800',
          bg: 'bg-emerald-50/80 border-emerald-200/70',
          label: 'On Track',
          glow: '',
        };
      case 'AT_RISK':
        return {
          dot: 'bg-amber-500 animate-subtle-pulse',
          text: 'text-amber-800',
          bg: 'bg-amber-50/90 border-amber-300/80 shadow-2xs',
          label: 'At Risk',
          glow: 'ring-1 ring-amber-400/30',
        };
      case 'BREACHED':
        return {
          dot: 'bg-rose-500 animate-subtle-pulse',
          text: 'text-rose-800',
          bg: 'bg-rose-50/90 border-rose-300/80 shadow-2xs',
          label: 'Breached',
          glow: 'ring-1 ring-rose-400/30',
        };
      default:
        return {
          dot: 'bg-stone-400',
          text: 'text-stone-700',
          bg: 'bg-stone-50 border-stone-200',
          label: state,
          glow: '',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${style.bg} ${style.glow} transition-all duration-200 hover:scale-[1.02]`}
    >
      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${style.dot} shrink-0`}></span>
      {label && <span className="text-stone-400 font-normal hidden sm:inline">{label}:</span>}
      <span className={`font-semibold ${style.text}`}>{style.label}</span>
      {!isCompleted && remainingMinutes !== undefined && remainingMinutes > 0 && (
        <span className="text-stone-600 font-mono text-[11px] ml-0.5 font-medium bg-white/70 px-1 py-0.2 rounded border border-stone-200/50">
          {formatMinutes(remainingMinutes)}
        </span>
      )}
      {isCompleted && (
        <span className="text-emerald-700 font-mono text-xs ml-0.5 font-bold">✓ Met</span>
      )}
    </div>
  );
};
