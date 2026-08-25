import React from 'react';
import { TicketDashboard, TicketStatus, SLAState } from '../types';
import {
  OpenStatusIcon,
  InProgressStatusIcon,
  SLAAtRiskIcon,
  SLABreachedIcon,
} from './icons/CustomIcons';

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
      icon: <OpenStatusIcon className="w-5 h-5 text-sky-600" />,
      color: 'border-sky-200/80 bg-sky-50/40 hover:bg-sky-50/80',
      activeColor: 'border-sky-500 ring-2 ring-sky-300 bg-sky-50',
      status: 'OPEN' as TicketStatus,
      slaState: undefined,
      description: 'Awaiting triage & initial response',
    },
    {
      title: 'In Progress',
      count: dashboard?.inProgressTickets ?? 0,
      icon: <InProgressStatusIcon className="w-5 h-5 text-indigo-600" />,
      color: 'border-indigo-200/80 bg-indigo-50/40 hover:bg-indigo-50/80',
      activeColor: 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50',
      status: 'IN_PROGRESS' as TicketStatus,
      slaState: undefined,
      description: 'Currently being actively worked',
    },
    {
      title: 'SLA At Risk',
      count: dashboard?.atRiskTickets ?? 0,
      icon: <SLAAtRiskIcon className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/80',
      activeColor: 'border-amber-500 ring-2 ring-amber-300 bg-amber-50',
      status: undefined,
      slaState: 'AT_RISK' as SLAState,
      description: '>75% SLA budget consumed',
    },
    {
      title: 'SLA Breached',
      count: dashboard?.breachedTickets ?? 0,
      icon: <SLABreachedIcon className="w-5 h-5 text-rose-600" />,
      color: 'border-rose-200/80 bg-rose-50/40 hover:bg-rose-50/80',
      activeColor: 'border-rose-500 ring-2 ring-rose-300 bg-rose-50',
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
            className={`p-4 rounded-2xl border text-left transition relative cursor-pointer shadow-xs ${
              isActive ? card.activeColor : card.color
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100">
                {card.icon}
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-12 bg-slate-200 animate-pulse rounded-lg"></div>
              ) : (
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {card.count}
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-slate-500 font-medium line-clamp-1">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
