import React, { useState } from 'react';
import { useQuery, useMutation } from 'urql';
import {
  GET_TICKET_QUERY,
  GET_USERS_QUERY,
  ADD_COMMENT_MUTATION,
  ASSIGN_TICKET_MUTATION,
  CHANGE_STATUS_MUTATION,
  RESOLVE_TICKET_MUTATION,
} from '../graphql/operations';
import { Ticket, User, TicketStatus } from '../types';
import { useAuth } from '../context/useAuth';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SLARingIcon } from './icons/CustomIcons';
import { X, Send, ChevronDown, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface TicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  onTicketUpdated: () => void;
}

function parseSafeDate(val: string | number | Date | null | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    if (!isNaN(Number(val)) && !val.includes('-') && !val.includes('T')) {
      const d = new Date(Number(val));
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function safeFormatDistance(val: string | number | Date | null | undefined): string {
  const d = parseSafeDate(val);
  if (!d) return 'Just now';
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

function safeFormatTime(val: string | number | Date | null | undefined): string {
  const d = parseSafeDate(val);
  if (!d) return '--:--';
  try {
    return format(d, 'HH:mm');
  } catch {
    return '--:--';
  }
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  onClose,
  onTicketUpdated,
}) => {
  const { user, isAgent } = useAuth();
  const [commentContent, setCommentContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [{ data, fetching, error }, reexecuteTicket] = useQuery<{ ticket: Ticket }>({
    query: GET_TICKET_QUERY,
    variables: { id: ticketId },
    pause: !ticketId,
    requestPolicy: 'cache-and-network',
  });

  const [{ data: agentsData }] = useQuery<{ users: User[] }>({
    query: GET_USERS_QUERY,
    variables: { role: 'AGENT' },
    pause: !ticketId,
  });

  const [, executeAddComment] = useMutation(ADD_COMMENT_MUTATION);
  const [, executeAssign] = useMutation(ASSIGN_TICKET_MUTATION);
  const [, executeChangeStatus] = useMutation(CHANGE_STATUS_MUTATION);
  const [, executeResolve] = useMutation(RESOLVE_TICKET_MUTATION);

  if (!ticketId) return null;

  const ticket = data?.ticket;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setErrorMessage(null);
    const result = await executeAddComment({
      ticketId,
      content: commentContent.trim(),
    });

    if (result.error) {
      setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
    } else {
      setCommentContent('');
      reexecuteTicket({ requestPolicy: 'network-only' });
      onTicketUpdated();
    }
  };

  const handleAssign = async (assigneeId: string) => {
    if (!assigneeId) return;
    setErrorMessage(null);
    const result = await executeAssign({
      ticketId,
      assigneeId,
    });

    if (result.error) {
      setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
    } else {
      reexecuteTicket({ requestPolicy: 'network-only' });
      onTicketUpdated();
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setErrorMessage(null);
    const result = await executeChangeStatus({
      ticketId,
      status: newStatus,
    });

    if (result.error) {
      setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
    } else {
      reexecuteTicket({ requestPolicy: 'network-only' });
      onTicketUpdated();
    }
  };

  const handleResolve = async () => {
    setErrorMessage(null);
    const result = await executeResolve({ ticketId });

    if (result.error) {
      setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
    } else {
      reexecuteTicket({ requestPolicy: 'network-only' });
      onTicketUpdated();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatMinutes = (minutes?: number) => {
    if (!minutes || minutes <= 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  const commentsList = ticket?.comments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-stone-200/90 overflow-hidden">
        {/* Header matching mockup */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-stone-500 font-bold">
              TKT-{ticket?.id ? ticket.id.substring(0, 3).toUpperCase() : '104'}
            </span>
            {ticket && (
              <>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {fetching && !ticket && (
            <div className="py-12 text-center text-xs text-stone-400">Loading ticket details...</div>
          )}

          {error && !ticket && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs">
              Error loading ticket: {error.message}
            </div>
          )}

          {ticket && (
            <div className="space-y-6">
              {/* Bold Title */}
              <h2 className="text-xl font-bold text-stone-950 tracking-tight">
                {ticket.title}
              </h2>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* 2-Column Split Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column (65% width) */}
                <div className="md:col-span-2 space-y-6">
                  {/* Description Block */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase font-mono">
                      DESCRIPTION
                    </span>
                    <div className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal whitespace-pre-wrap">
                      {ticket.description}
                    </div>
                  </div>

                  {/* Activity & Comments Block */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase font-mono">
                      ACTIVITY &amp; COMMENTS
                    </span>

                    {/* Comments Feed */}
                    <div className="space-y-3">
                      {commentsList.length === 0 ? (
                        <div className="py-6 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                          No replies yet. Be the first to leave a comment.
                        </div>
                      ) : (
                        commentsList.map((comment) => {
                          const commentDate = parseSafeDate(comment.createdAt);
                          const firstResponseDate = parseSafeDate(ticket.firstResponseAt);

                          const isFirstResponseAuthor =
                            firstResponseDate &&
                            commentDate &&
                            comment.author?.role === 'AGENT' &&
                            comment.author?.id !== ticket.reporter?.id &&
                            Math.abs(commentDate.getTime() - firstResponseDate.getTime()) < 2000;

                          return (
                            <div
                              key={comment.id}
                              className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/40 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                                      comment.author?.role === 'AGENT'
                                        ? 'bg-purple-600'
                                        : 'bg-sky-600'
                                    }`}
                                  >
                                    {getInitials(comment.author?.name)}
                                  </div>
                                  <span className="text-xs font-bold text-stone-900">
                                    {comment.author?.name || 'User'}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase ${
                                      comment.author?.role === 'AGENT'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                        : 'bg-sky-50 text-sky-700 border border-sky-200/60'
                                    }`}
                                  >
                                    {comment.author?.role || 'USER'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-stone-400">
                                  {safeFormatDistance(comment.createdAt)}
                                </span>
                              </div>

                              <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                              </div>

                              {/* Green Milestone Box matching mockup */}
                              {isFirstResponseAuthor && (
                                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-1.5 font-medium">
                                  <span>🎯</span>
                                  <span>1st Response SLA Milestone (Clock Frozen)</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Reply Input Box with inline Send button */}
                    <form onSubmit={handleAddComment} className="relative mt-3">
                      <input
                        type="text"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-400 bg-white"
                      />
                      <button
                        type="submit"
                        disabled={!commentContent.trim()}
                        className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column (35% width) */}
                <div className="space-y-4">
                  {/* Card 1: SLA Countdown */}
                  <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/30 space-y-3">
                    <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase font-mono block">
                      SLA COUNTDOWN
                    </span>

                    {/* First Response */}
                    <div className="flex items-center gap-3">
                      <SLARingIcon
                        state={ticket.sla?.firstResponseState || 'ON_TRACK'}
                        className="w-6 h-6"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">First Response</div>
                        <div className="text-xs font-mono font-semibold text-emerald-600">
                          {ticket.firstResponseAt
                            ? '✓ Met'
                            : `${formatMinutes(ticket.sla?.firstResponseRemainingMinutes)} remaining`}
                        </div>
                      </div>
                    </div>

                    {/* Resolution SLA */}
                    <div className="flex items-center gap-3">
                      <SLARingIcon
                        state={ticket.sla?.resolutionState || 'ON_TRACK'}
                        className="w-6 h-6"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">Resolution SLA</div>
                        <div className="text-xs font-mono font-semibold text-emerald-600">
                          {ticket.resolvedAt
                            ? '✓ Met'
                            : `${formatMinutes(ticket.sla?.resolutionRemainingMinutes)} remaining`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ticket Info */}
                  <div className="p-4 rounded-xl border border-stone-200/80 bg-white space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase font-mono block">
                      TICKET INFO
                    </span>
                    <div className="flex justify-between py-0.5">
                      <span className="text-stone-400">Reporter</span>
                      <span className="font-medium text-stone-900">{ticket.reporter?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-stone-400">Assignee</span>
                      <span className="font-medium text-stone-900">
                        {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-stone-400">Created</span>
                      <span className="font-mono text-stone-600">
                        {safeFormatTime(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Section 3: Agent Actions (Visible to Agents) */}
                  {isAgent && (
                    <div className="space-y-3 pt-1">
                      <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase font-mono block">
                        AGENT ACTIONS
                      </span>

                      {/* Reassign Ticket Dropdown */}
                      <div className="relative">
                        <select
                          value={ticket.assignee?.id || ''}
                          onChange={(e) => handleAssign(e.target.value)}
                          className="w-full appearance-none px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 bg-white focus:outline-none cursor-pointer"
                        >
                          <option value="">Reassign Ticket</option>
                          {agentsData?.users?.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} {agent.id === user?.id ? '(Me)' : ''}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                      </div>

                      {/* Segmented Status Toggle: OPEN | PROG | RESOLVED */}
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-stone-100 border border-stone-200/60">
                        <button
                          onClick={() => handleStatusChange('OPEN')}
                          className={`py-1 rounded text-xs font-bold font-mono transition cursor-pointer ${
                            ticket.status === 'OPEN'
                              ? 'bg-white text-stone-900 shadow-2xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          OPEN
                        </button>
                        <button
                          onClick={() => handleStatusChange('IN_PROGRESS')}
                          className={`py-1 rounded text-xs font-bold font-mono transition cursor-pointer ${
                            ticket.status === 'IN_PROGRESS'
                              ? 'bg-white text-stone-900 shadow-2xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          PROG
                        </button>
                        <button
                          onClick={() => handleStatusChange('RESOLVED')}
                          className={`py-1 rounded text-xs font-bold font-mono transition cursor-pointer ${
                            ticket.status === 'RESOLVED'
                              ? 'bg-white text-stone-900 shadow-2xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          RESOLVED
                        </button>
                      </div>

                      {/* Primary Black Resolve Button */}
                      {ticket.status !== 'RESOLVED' && (
                        <button
                          onClick={handleResolve}
                          className="w-full py-2.5 rounded-lg bg-[#18181b] hover:bg-black text-white text-xs font-semibold transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Ticket</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
