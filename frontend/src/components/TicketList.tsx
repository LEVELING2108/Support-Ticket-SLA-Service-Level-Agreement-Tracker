import React, { useState, useEffect } from 'react';
import { useQuery } from 'urql';
import { GET_TICKETS_QUERY, GET_USERS_QUERY } from '../graphql/operations';
import { TicketStatus, Priority, SLAState, User, TicketConnection } from '../types';
import { useAuth } from '../context/useAuth';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SLABadge } from './SLABadge';
import { Search, RotateCw, X, ChevronRight, Lock } from 'lucide-react';
import { format } from 'date-fns';

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

  if (!isAuthenticated) {
    return (
      <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-xs p-12 text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
          <Lock className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-stone-800">Authentication Required</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Please sign in with a demo account (Agent or Reporter) to view live support tickets and manage SLA workflows.
          </p>
        </div>
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="mt-2 inline-flex items-center px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-2xs active:scale-95"
          >
            Sign In with Demo Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all">
      {/* Search & Filter Strip */}
      <div className="p-4 sm:p-4.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-stone-50/40">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, reporter, or assignee..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200/60 bg-white shadow-2xs transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter || ''}
            onChange={(e) =>
              onStatusFilterChange((e.target.value as TicketStatus) || undefined)
            }
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-white font-medium shadow-2xs cursor-pointer hover:border-stone-300 transition-colors"
          >
            <option value="">Status: All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter || ''}
            onChange={(e) =>
              setPriorityFilter((e.target.value as Priority) || undefined)
            }
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-white font-medium shadow-2xs cursor-pointer hover:border-stone-300 transition-colors"
          >
            <option value="">Priority: All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* SLA State Filter */}
          <select
            value={slaStateFilter || ''}
            onChange={(e) =>
              onSLAStateFilterChange((e.target.value as SLAState) || undefined)
            }
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-white font-medium shadow-2xs cursor-pointer hover:border-stone-300 transition-colors"
          >
            <option value="">SLA: All</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="BREACHED">Breached</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter || ''}
            onChange={(e) => setAssigneeFilter(e.target.value || undefined)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-white font-medium shadow-2xs cursor-pointer hover:border-stone-300 transition-colors hidden md:inline-block"
          >
            <option value="">Assignee: All</option>
            {agentsData?.users.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              title="Reset all filters"
              className="text-xs sm:text-sm text-stone-500 hover:text-stone-900 font-semibold underline flex items-center gap-1 ml-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        <button
          onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}
          className="p-2 text-stone-400 hover:text-stone-700 transition rounded-xl hover:bg-white border border-stone-200/80 shadow-2xs active:scale-95"
          title="Refresh table"
        >
          <RotateCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-8 text-center text-sm text-rose-600">
          Failed to load tickets: {error.message}
        </div>
      )}

      {/* Empty State */}
      {!fetching && filteredTickets.length === 0 && (
        <div className="p-16 text-center text-stone-400 text-sm">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            ✓
          </div>
          <p className="font-semibold text-stone-700 text-base">All clear — no tickets found</p>
          <p className="mt-1 text-stone-400 text-xs sm:text-sm">
            {hasActiveFilters ? 'Try adjusting your filters.' : 'Click "New Ticket" to raise a support issue.'}
          </p>
        </div>
      )}

      {/* Full-width Ticket Table View */}
      {filteredTickets.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-xs font-bold text-stone-400 uppercase tracking-wider">
                <th className="py-3 px-5">Priority &amp; Status</th>
                <th className="py-3 px-5">Ticket Summary</th>
                <th className="py-3 px-5 hidden md:table-cell">Reporter / Assignee</th>
                <th className="py-3 px-5 text-center">First Response SLA</th>
                <th className="py-3 px-5 text-center">Resolution SLA</th>
                <th className="py-3 px-5 text-right hidden lg:table-cell">Created</th>
                <th className="py-3 px-4 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className="hover:bg-amber-50/20 transition-all duration-150 cursor-pointer group hover:shadow-xs"
                >
                  {/* Priority & Status */}
                  <td className="py-3.5 px-5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </td>

                  {/* Title & Description */}
                  <td className="py-3.5 px-5 align-middle max-w-md">
                    <div className="font-bold text-stone-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base truncate">
                      {ticket.title}
                    </div>
                    <div className="text-xs text-stone-500 truncate mt-0.5 font-normal">
                      {ticket.description}
                    </div>
                  </td>

                  {/* Reporter / Assignee */}
                  <td className="py-3.5 px-5 align-middle whitespace-nowrap hidden md:table-cell text-xs text-stone-600">
                    <div>
                      <span className="text-stone-400">By:</span> <strong className="font-medium text-stone-800">{ticket.reporter.name}</strong>
                    </div>
                    <div className="text-stone-600 mt-0.5">
                      <span className="text-stone-400">To:</span> <span className="font-medium">{ticket.assignee ? ticket.assignee.name : 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* First Response SLA */}
                  <td className="py-3.5 px-5 align-middle text-center whitespace-nowrap">
                    <SLABadge
                      state={ticket.sla.firstResponseState}
                      remainingMinutes={ticket.sla.firstResponseRemainingMinutes}
                      isCompleted={!!ticket.firstResponseAt}
                    />
                  </td>

                  {/* Resolution SLA */}
                  <td className="py-3.5 px-5 align-middle text-center whitespace-nowrap">
                    <SLABadge
                      state={ticket.sla.resolutionState}
                      remainingMinutes={ticket.sla.resolutionRemainingMinutes}
                      isCompleted={!!ticket.resolvedAt}
                    />
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-5 align-middle text-right whitespace-nowrap text-xs text-stone-400 hidden lg:table-cell font-mono">
                    {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
                  </td>

                  {/* Arrow */}
                  <td className="py-3.5 px-4 align-middle text-right">
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all duration-150" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
