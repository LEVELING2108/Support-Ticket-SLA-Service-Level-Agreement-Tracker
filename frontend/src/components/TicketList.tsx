import React, { useState, useEffect } from 'react';
import { useQuery } from 'urql';
import { GET_TICKETS_QUERY, GET_USERS_QUERY } from '../graphql/operations';
import { TicketStatus, Priority, SLAState, User, TicketConnection } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SLABadge } from './SLABadge';
import { Search, Filter, Shield, RefreshCw, ChevronRight, Inbox } from 'lucide-react';
import { format } from 'date-fns';

interface TicketListProps {
  onSelectTicket: (ticketId: string) => void;
  statusFilter?: TicketStatus;
  slaStateFilter?: SLAState;
  onStatusFilterChange: (status?: TicketStatus) => void;
  onSLAStateFilterChange: (slaState?: SLAState) => void;
  refreshTrigger: number;
}

export const TicketList: React.FC<TicketListProps> = ({
  onSelectTicket,
  statusFilter,
  slaStateFilter,
  onStatusFilterChange,
  onSLAStateFilterChange,
  refreshTrigger,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const [{ data: agentsData }] = useQuery<{ users: User[] }>({
    query: GET_USERS_QUERY,
    variables: { role: 'AGENT' },
  });

  const [{ data, fetching, error }, reexecuteQuery] = useQuery<{ tickets: TicketConnection }>({
    query: GET_TICKETS_QUERY,
    variables: {
      status: statusFilter,
      priority: priorityFilter,
      assigneeId: assigneeFilter,
      slaState: slaStateFilter,
      take: 25,
    },
    requestPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      reexecuteQuery({ requestPolicy: 'network-only' });
    }
  }, [refreshTrigger, reexecuteQuery]);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/60 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, reporter, or ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>

          <button
            onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}
            title="Refresh tickets list"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filters:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter || ''}
            onChange={(e) =>
              onStatusFilterChange((e.target.value as TicketStatus) || undefined)
            }
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
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
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
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
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All SLA States</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk (&gt;75% budget)</option>
            <option value="BREACHED">Breached</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter || ''}
            onChange={(e) => setAssigneeFilter(e.target.value || undefined)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Assignees</option>
            {agentsData?.users.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Ticket List Table / Empty State */}
      {error && (
        <div className="p-8 text-center text-rose-600 text-sm">
          Failed to load tickets: {error.message}
        </div>
      )}

      {fetching && tickets.length === 0 && (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-sm">Loading tickets with SLA calculations...</p>
        </div>
      )}

      {!fetching && filteredTickets.length === 0 && (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Inbox className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No tickets found</p>
          <p className="text-xs text-slate-400">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Create a new ticket to get started!'}
          </p>
        </div>
      )}

      {filteredTickets.length > 0 && (
        <div className="divide-y divide-slate-100">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="p-4 hover:bg-slate-50/80 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition">
                    {ticket.title}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                  <span>By {ticket.reporter.name}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-500" />
                    {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
                  </span>
                  <span>·</span>
                  <span>{format(new Date(ticket.createdAt), 'PPp')}</span>
                </div>
              </div>

              {/* SLA Badges Section */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <div className="flex flex-col gap-1 items-start md:items-end">
                  <SLABadge
                    state={ticket.sla.firstResponseState}
                    remainingMinutes={ticket.sla.firstResponseRemainingMinutes}
                    label="Response"
                    isCompleted={!!ticket.firstResponseAt}
                  />
                  <SLABadge
                    state={ticket.sla.resolutionState}
                    remainingMinutes={ticket.sla.resolutionRemainingMinutes}
                    label="Resolution"
                    isCompleted={!!ticket.resolvedAt}
                  />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition hidden md:block" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
