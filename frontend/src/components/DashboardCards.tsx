import React from 'react';
import { TicketDashboard, TicketStatus, SLAState } from '../types';

interface DashboardCardsProps {
  dashboard: TicketDashboard | null;
  loading: boolean;
  onFilterChange: (status?: TicketStatus, slaState?: SLAState) => void;
  activeStatus?: TicketStatus;
  activeSLAState?: SLAState;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  dashboard,
  loading,
  onFilterChange,
  activeStatus,
  activeSLAState,
}) => {
  const cards = [
    {
      title: 'Open',
      count: dashboard?.openTickets ?? 0,
      status: 'OPEN' as TicketStatus,
      slaState: undefined,
      dot: 'bg-sky-500',
    },
    {
      title: 'In Progress',
      count: dashboard?.inProgressTickets ?? 0,
      status: 'IN_PROGRESS' as TicketStatus,
      slaState: undefined,
      dot: 'bg-indigo-500',
    },
    {
      title: 'SLA At Risk',
      count: dashboard?.atRiskTickets ?? 0,
      status: undefined,
      slaState: 'AT_RISK' as SLAState,
      dot: 'bg-amber-500',
      badge: '>75%',
    },
    {
      title: 'SLA Breached',
      count: dashboard?.breachedTickets ?? 0,
      status: undefined,
      slaState: 'BREACHED' as SLAState,
      dot: 'bg-rose-500',
      badge: 'Overdue',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => {
        const isActive =
          (card.status && activeStatus === card.status && !activeSLAState) ||
          (card.slaState && activeSLAState === card.slaState && !activeStatus);

        return (
          <button
            key={card.title}
            onClick={() => onFilterChange(card.status, card.slaState)}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer bg-white ${
              isActive
                ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`}></span>
                <span className="text-xs font-medium text-slate-500">{card.title}</span>
              </div>
              {card.badge && (
                <span className="text-[10px] text-slate-400 font-mono">{card.badge}</span>
              )}
            </div>

            <div className="mt-2">
              {loading ? (
                <div className="h-6 w-8 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <span className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                  {card.count}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
