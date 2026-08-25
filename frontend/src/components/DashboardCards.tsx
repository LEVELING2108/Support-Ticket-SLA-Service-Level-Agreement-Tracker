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
      dot: 'bg-cyan-500',
    },
    {
      title: 'In Progress',
      count: dashboard?.inProgressTickets ?? 0,
      status: 'IN_PROGRESS' as TicketStatus,
      slaState: undefined,
      dot: 'bg-purple-600',
    },
    {
      title: 'SLA At Risk',
      count: dashboard?.atRiskTickets ?? 0,
      status: undefined,
      slaState: 'AT_RISK' as SLAState,
      dot: 'bg-amber-500',
    },
    {
      title: 'SLA Breached',
      count: dashboard?.breachedTickets ?? 0,
      status: undefined,
      slaState: 'BREACHED' as SLAState,
      dot: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card) => {
        const isActive =
          (card.status && activeStatus === card.status && !activeSLAState) ||
          (card.slaState && activeSLAState === card.slaState && !activeStatus);

        return (
          <button
            key={card.title}
            onClick={() => onFilterChange(card.status, card.slaState)}
            className={`p-5 rounded-2xl border text-left transition-all duration-150 cursor-pointer bg-white ${
              isActive
                ? 'border-stone-900 ring-1 ring-stone-900 shadow-sm'
                : 'border-stone-200/90 hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">
                {card.title}
              </span>
              <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="h-9 w-10 bg-stone-100 animate-pulse rounded-md"></div>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-sans tracking-tight">
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
