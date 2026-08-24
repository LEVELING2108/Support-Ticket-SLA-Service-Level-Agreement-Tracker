import React from 'react';
import { TicketDashboard, TicketStatus, SLAState } from '../types';
import { Inbox, PlayCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

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
      icon: <Inbox className="w-5 h-5 text-sky-600" />,
      color: 'border-sky-200 bg-sky-50/50 hover:bg-sky-50',
      activeColor: 'border-sky-500 ring-2 ring-sky-200 bg-sky-50',
      status: 'OPEN' as TicketStatus,
      slaState: undefined,
      description: 'Awaiting triage & initial response',
    },
    {
      title: 'In Progress',
      count: dashboard?.inProgressTickets ?? 0,
      icon: <PlayCircle className="w-5 h-5 text-indigo-600" />,
      color: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50',
      activeColor: 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50',
      status: 'IN_PROGRESS' as TicketStatus,
      slaState: undefined,
      description: 'Currently being actively worked',
    },
    {
      title: 'SLA At Risk',
      count: dashboard?.atRiskTickets ?? 0,
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
      activeColor: 'border-amber-500 ring-2 ring-amber-200 bg-amber-50',
      status: undefined,
      slaState: 'AT_RISK' as SLAState,
      description: '>75% SLA budget consumed',
    },
    {
      title: 'SLA Breached',
      count: dashboard?.breachedTickets ?? 0,
      icon: <AlertOctagon className="w-5 h-5 text-rose-600" />,
      color: 'border-rose-200 bg-rose-50/50 hover:bg-rose-50',
      activeColor: 'border-rose-500 ring-2 ring-rose-200 bg-rose-50',
      status: undefined,
      slaState: 'BREACHED' as SLAState,
      description: 'Business hours deadline passed',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isActive =
          (card.status && activeStatus === card.status && !activeSLAState) ||
          (card.slaState && activeSLAState === card.slaState && !activeStatus);

        return (
          <button
            key={card.title}
            onClick={() => onFilterChange(card.status, card.slaState)}
            className={`p-4 rounded-xl border text-left transition relative cursor-pointer ${
              isActive ? card.activeColor : card.color
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-white/80 shadow-2xs">{card.icon}</div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div>
              ) : (
                <span className="text-2xl font-black text-slate-900">{card.count}</span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{card.description}</p>
          </button>
        );
      })}
    </div>
  );
};
