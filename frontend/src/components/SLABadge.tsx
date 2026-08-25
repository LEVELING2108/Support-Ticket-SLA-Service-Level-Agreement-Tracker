import React from 'react';
import { SLAState } from '../types';
import {
  SLAOnTrackIcon,
  SLAAtRiskIcon,
  SLABreachedIcon,
  BusinessClockIcon,
} from './icons/CustomIcons';

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
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-2xs',
          icon: <SLAOnTrackIcon className="w-4 h-4 shrink-0" />,
          text: 'On Track',
        };
      case 'AT_RISK':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/90 shadow-2xs',
          icon: <SLAAtRiskIcon className="w-4 h-4 shrink-0" />,
          text: 'At Risk',
        };
      case 'BREACHED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200/90 shadow-2xs',
          icon: <SLABreachedIcon className="w-4 h-4 shrink-0" />,
          text: 'Breached',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200 shadow-2xs',
          icon: <BusinessClockIcon className="w-4 h-4 shrink-0 text-slate-500" />,
          text: state,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${style.bg}`}
      title={label ? `${label}: ${style.text}` : style.text}
    >
      {style.icon}
      {label && <span className="text-slate-500 font-normal">{label}:</span>}
      <span className="font-bold tracking-tight">{style.text}</span>
      {!isCompleted && remainingMinutes !== undefined && remainingMinutes > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white text-[11px] font-bold text-slate-800 border border-slate-200 shadow-2xs">
          {formatMinutes(remainingMinutes)} left
        </span>
      )}
      {isCompleted && (
        <span className="ml-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 bg-emerald-100/60 px-1 py-0.5 rounded">
          MET
        </span>
      )}
    </div>
  );
};
