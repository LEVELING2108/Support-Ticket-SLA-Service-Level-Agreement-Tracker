import React from 'react';
import { SLAState } from '../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';

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

  const getBadgeStyle = () => {
    switch (state) {
      case 'ON_TRACK':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          text: 'On Track',
        };
      case 'AT_RISK':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          text: 'At Risk',
        };
      case 'BREACHED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />,
          text: 'Breached',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
          text: state,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg}`}
      title={label ? `${label}: ${style.text}` : style.text}
    >
      {style.icon}
      {label && <span className="text-slate-500 font-normal">{label}:</span>}
      <span className="font-semibold">{style.text}</span>
      {!isCompleted && remainingMinutes !== undefined && remainingMinutes > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded bg-white/70 text-[11px] font-semibold text-slate-700 border border-slate-200/60">
          {formatMinutes(remainingMinutes)} left
        </span>
      )}
      {isCompleted && (
        <span className="ml-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          (Done)
        </span>
      )}
    </div>
  );
};
