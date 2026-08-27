import React, { useState, useEffect } from 'react';
import { useQuery } from 'urql';
import { GET_TICKETS_QUERY, GET_USERS_QUERY } from '../graphql/operations';
import { TicketStatus, Priority, SLAState, User, TicketConnection } from '../types';
import { useAuth } from '../context/useAuth';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SLABadge } from './SLABadge';
import { Search, RotateCw, ChevronDown, Lock } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface TicketListProps {
  onSelectTicket: (ticketId: string) => void;
  statusFilter?: TicketStatus;
  slaStateFilter?: SLAState;
  onStatusFilterChange: (status?: TicketStatus) => void;
  onSLAStateFilterChange: (slaState?: SLAState) => void;
  refreshTrigger: number;
  onOpenAuth?: () => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  onSelectTicket,
  statusFilter,
  slaStateFilter,
  onStatusFilterChange,
  onSLAStateFilterChange,
  refreshTrigger,
  onOpenAuth,
}) => {
  const { isAuthenticated } = useAuth();
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const [{ data: agentsData }] = useQuery<{ users: User[] }>({
    query: GET_USERS_QUERY,
    variables: { role: 'AGENT' },
    pause: !isAuthenticated,
  });

  const [{ data, fetching, error }, reexecuteQuery] = useQuery<{ tickets: TicketConnection }>({
    query: GET_TICKETS_QUERY,
    variables: {
      status: statusFilter,
      priority: priorityFilter,
      assigneeId: assigneeFilter,
      slaState: slaStateFilter,
      take: 50,
    },
    requestPolicy: 'cache-and-network',
    pause: !isAuthenticated,
  });

  useEffect(() => {
    if (refreshTrigger > 0 && isAuthenticated) {
      reexecuteQuery({ requestPolicy: 'network-only' });
    }
  }, [refreshTrigger, isAuthenticated, reexecuteQuery]);

  const tickets = data?.tickets.nodes || [];

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.reporter.name.toLowerCase().includes(q) ||
      t.assignee?.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  const clearFilters = () => {
    onStatusFilterChange(undefined);
    onSLAStateFilterChange(undefined);
    setPriorityFilter(undefined);
    setAssigneeFilter(undefined);
    setSearchQuery('');
  };

  const hasActiveFilters =
    !!statusFilter || !!slaStateFilter || !!priorityFilter || !!assigneeFilter || !!searchQuery;

  const formatTicketId = (id: string, index: number) => {
    // Generate clean readable ID like TKT-104 matching design
    const shortNum = 104 - index;
    return `TKT-${shortNum > 100 ? shortNum : id.substring(0, 3).toUpperCase()}`;
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      let d: Date;
      if (!isNaN(Number(dateStr)) && !dateStr.includes('-') && !dateStr.includes('T')) {
        d = new Date(Number(dateStr));
      } else {
        d = new Date(dateStr);
      }
      if (isNaN(d.getTime())) return dateStr;
      if (isToday(d)) {
        return format(d, 'HH:mm:ss');
      }
      if (isYesterday(d)) {
        return 'Yesterday';
      }
      return format(d, 'MMM d');
    } catch {
      return dateStr;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full bg-white rounded-2xl border border-stone-200/90 p-12 text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
          <Lock className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-stone-800">Authentication Required</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Please sign in with a demo account to view live support tickets and manage SLA workflows.
          </p>
        </div>
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-[#18181b] hover:bg-black text-white text-xs font-semibold transition-all shadow-2xs active:scale-95"
          >
            Sign In with Demo Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Sleek Filter Bar matching mockup */}
      <div className="w-full bg-white rounded-xl border border-stone-200/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="w-full text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Dropdown */}
          <div className="relative inline-block">
            <select
              value={statusFilter || ''}
              onChange={(e) =>
                onStatusFilterChange((e.target.value as TicketStatus) || undefined)
              }
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-700 font-medium bg-white hover:border-stone-400 focus:outline-none cursor-pointer"
            >
              <option value="">Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Priority Dropdown */}
          <div className="relative inline-block">
            <select
              value={priorityFilter || ''}
              onChange={(e) =>
                setPriorityFilter((e.target.value as Priority) || undefined)
              }
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-700 font-medium bg-white hover:border-stone-400 focus:outline-none cursor-pointer"
            >
              <option value="">Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* SLA State Dropdown */}
          <div className="relative inline-block">
            <select
              value={slaStateFilter || ''}
              onChange={(e) =>
                onSLAStateFilterChange((e.target.value as SLAState) || undefined)
              }
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-700 font-medium bg-white hover:border-stone-400 focus:outline-none cursor-pointer"
            >
              <option value="">SLA State</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="BREACHED">Breached</option>
            </select>
            <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Assignee Dropdown */}
          <div className="relative inline-block hidden md:inline-block">
            <select
              value={assigneeFilter || ''}
              onChange={(e) => setAssigneeFilter(e.target.value || undefined)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-700 font-medium bg-white hover:border-stone-400 focus:outline-none cursor-pointer"
            >
              <option value="">Assignee</option>
              {agentsData?.users.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Reset Link */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-stone-500 hover:text-stone-900 font-medium px-2 py-1 transition-colors"
            >
              Reset
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}
            className="p-1.5 text-stone-400 hover:text-stone-700 transition rounded-md hover:bg-stone-100"
            title="Refresh tickets"
          >
            <RotateCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 bg-white rounded-xl border border-red-200 text-center text-xs text-red-600">
          Failed to load tickets: {error.message}
        </div>
      )}

      {/* Empty State */}
      {!fetching && filteredTickets.length === 0 && (
        <div className="p-12 bg-white rounded-xl border border-stone-200/90 text-center text-stone-400 text-xs">
          <p className="font-semibold text-stone-700 text-sm">No tickets match your filters</p>
          <p className="mt-1">Try clearing filters or search query.</p>
        </div>
      )}

      {/* Full Data Table matching mockup */}
      {filteredTickets.length > 0 && (
        <div className="w-full bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/50 text-[10px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-3">PRIORITY</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-5">TICKET DETAILS</th>
                  <th className="py-3 px-4 hidden md:table-cell">REPORTER</th>
                  <th className="py-3 px-4 hidden md:table-cell">ASSIGNEE</th>
                  <th className="py-3 px-5 text-left">FIRST RESPONSE SLA</th>
                  <th className="py-3 px-5 text-left">RESOLUTION SLA</th>
                  <th className="py-3 px-5 text-right hidden lg:table-cell">CREATED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket.id)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                  >
                    {/* ID */}
                    <td className="py-4 px-5 align-middle whitespace-nowrap font-mono text-xs text-stone-500 font-medium">
                      {formatTicketId(ticket.id, index)}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-3 align-middle whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 align-middle whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>

                    {/* Ticket Details */}
                    <td className="py-4 px-5 align-middle max-w-sm lg:max-w-md">
                      <div className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-black transition-colors truncate">
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate mt-0.5">
                        {ticket.description}
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap hidden md:table-cell text-xs text-stone-700">
                      {ticket.reporter.name}
                    </td>

                    {/* Assignee */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap hidden md:table-cell text-xs text-stone-700">
                      {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
                    </td>

                    {/* First Response SLA */}
                    <td className="py-4 px-5 align-middle whitespace-nowrap text-left">
                      <SLABadge
                        state={ticket.sla.firstResponseState}
                        remainingMinutes={ticket.sla.firstResponseRemainingMinutes}
                        isCompleted={!!ticket.firstResponseAt}
                      />
                    </td>

                    {/* Resolution SLA */}
                    <td className="py-4 px-5 align-middle whitespace-nowrap text-left">
                      <SLABadge
                        state={ticket.sla.resolutionState}
                        remainingMinutes={ticket.sla.resolutionRemainingMinutes}
                        isCompleted={!!ticket.resolvedAt}
                      />
                    </td>

                    {/* Created */}
                    <td className="py-4 px-5 align-middle text-right whitespace-nowrap text-[11px] font-mono text-stone-500 hidden lg:table-cell">
                      {formatTimestamp(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
