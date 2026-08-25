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
      title: 'Open Tickets',
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
      badge: '>75% SLA Spent',
    },
    {
      title: 'SLA Breached',
      count: dashboard?.breachedTickets ?? 0,
      status: undefined,
      slaState: 'BREACHED' as SLAState,
      dot: 'bg-rose-500',
      badge: 'Deadline Passed',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
      {cards.map((card) => {
        const isActive =
          (card.status && activeStatus === card.status && !activeSLAState) ||
          (card.slaState && activeSLAState === card.slaState && !activeStatus);

        return (
          <button
            key={card.title}
            onClick={() => onFilterChange(card.status, card.slaState)}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition cursor-pointer bg-white ${
              isActive
                ? 'border-slate-900 ring-2 ring-slate-900 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  {card.title}
                </span>
              </div>
              {card.badge && (
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono font-medium">
                  {card.badge}
                </span>
              )}
            </div>

            <div className="mt-2.5 sm:mt-3">
              {loading ? (
                <div className="h-8 w-12 bg-slate-100 animate-pulse rounded-lg"></div>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
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
