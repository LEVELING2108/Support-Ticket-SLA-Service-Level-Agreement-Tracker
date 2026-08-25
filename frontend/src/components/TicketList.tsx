import React, { useState, useEffect } from 'react';
import { useQuery } from 'urql';
import { GET_TICKETS_QUERY, GET_USERS_QUERY } from '../graphql/operations';
import { TicketStatus, Priority, SLAState, User, TicketConnection } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SLABadge } from './SLABadge';
import { Search, RotateCw, X } from 'lucide-react';
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
      take: 50,
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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Search & Filter Strip */}
      <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tickets..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter || ''}
            onChange={(e) =>
              onStatusFilterChange((e.target.value as TicketStatus) || undefined)
            }
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-slate-400 bg-white"
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
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-slate-400 bg-white"
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
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-slate-400 bg-white"
          >
            <option value="">All SLAs</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="BREACHED">Breached</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter || ''}
            onChange={(e) => setAssigneeFilter(e.target.value || undefined)}
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-slate-400 bg-white hidden sm:inline-block"
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
              title="Reset filters"
              className="p-1 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}
          className="p-1.5 text-slate-400 hover:text-slate-700 transition rounded-md hover:bg-slate-50"
          title="Refresh"
        >
          <RotateCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 text-center text-xs text-rose-600">
          Failed to load tickets: {error.message}
        </div>
      )}

      {/* Empty State */}
      {!fetching && filteredTickets.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-xs">
          <p className="font-medium text-slate-600">No tickets found</p>
          <p className="mt-0.5 text-slate-400">
            {hasActiveFilters ? 'Clear filters to see all tickets.' : 'No tickets have been created yet.'}
          </p>
        </div>
      )}

      {/* Ticket List */}
      {filteredTickets.length > 0 && (
        <div className="divide-y divide-slate-100">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="px-4 py-3 hover:bg-slate-50/70 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="space-y-1 flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {ticket.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{ticket.reporter.name}</span>
                  <span>·</span>
                  <span>{ticket.assignee ? ticket.assignee.name : 'Unassigned'}</span>
                  <span>·</span>
                  <span>{format(new Date(ticket.createdAt), 'MMM d, h:mm a')}</span>
                </div>
              </div>

              {/* SLA Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                <SLABadge
                  state={ticket.sla.firstResponseState}
                  remainingMinutes={ticket.sla.firstResponseRemainingMinutes}
                  label="1st Resp"
                  isCompleted={!!ticket.firstResponseAt}
                />
                <SLABadge
                  state={ticket.sla.resolutionState}
                  remainingMinutes={ticket.sla.resolutionRemainingMinutes}
                  label="Resolve"
                  isCompleted={!!ticket.resolvedAt}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
