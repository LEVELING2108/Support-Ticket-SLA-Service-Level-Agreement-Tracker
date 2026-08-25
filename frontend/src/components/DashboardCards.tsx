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
      badge: 'Active Queue',
      borderActive: 'border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/30',
    },
    {
      title: 'In Progress',
      count: dashboard?.inProgressTickets ?? 0,
      status: 'IN_PROGRESS' as TicketStatus,
      slaState: undefined,
      dot: 'bg-indigo-500',
      badge: 'Under Work',
      borderActive: 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30',
    },
    {
      title: 'SLA At Risk',
      count: dashboard?.atRiskTickets ?? 0,
      status: undefined,
      slaState: 'AT_RISK' as SLAState,
      dot: 'bg-amber-500 animate-subtle-pulse',
      badge: '>75% SLA Spent',
      borderActive: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/30',
    },
    {
      title: 'SLA Breached',
      count: dashboard?.breachedTickets ?? 0,
      status: undefined,
      slaState: 'BREACHED' as SLAState,
      dot: 'bg-rose-500 animate-subtle-pulse',
      badge: 'Overdue',
      borderActive: 'border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/30',
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
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer bg-white shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${
              isActive
                ? `${card.borderActive} shadow-sm`
                : 'border-stone-200/90 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
                <span className="text-xs sm:text-sm font-semibold text-stone-600">
                  {card.title}
                </span>
              </div>
              {card.badge && (
                <span className="text-[10px] sm:text-xs text-stone-400 font-mono font-medium bg-stone-100/70 px-1.5 py-0.5 rounded-md border border-stone-200/50">
                  {card.badge}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-12 bg-stone-100 animate-pulse rounded-lg"></div>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight transition-transform">
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
