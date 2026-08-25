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
import { useAuth } from '../context/useAuth';
import { Ticket, User, TicketStatus, Comment } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SLABadge } from './SLABadge';
import { X, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  onClose,
  onTicketUpdated,
}) => {
  const { isAgent } = useAuth();
  const [commentContent, setCommentContent] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [{ data, fetching, error }, reexecuteQuery] = useQuery<{ ticket: Ticket }>({
    query: GET_TICKET_QUERY,
    variables: { id: ticketId },
    pause: !ticketId,
  });

  const [{ data: agentsData }] = useQuery<{ users: User[] }>({
    query: GET_USERS_QUERY,
    variables: { role: 'AGENT' },
    pause: !isAgent,
  });

  const [, executeAddComment] = useMutation<{ addComment: Comment }>(ADD_COMMENT_MUTATION);
  const [, executeAssign] = useMutation<{ assignTicket: Ticket }>(ASSIGN_TICKET_MUTATION);
  const [, executeChangeStatus] = useMutation<{ changeTicketStatus: Ticket }>(CHANGE_STATUS_MUTATION);
  const [, executeResolve] = useMutation<{ resolveTicket: Ticket }>(RESOLVE_TICKET_MUTATION);

  if (!ticketId) return null;

  const ticket = data?.ticket;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setActionError(null);
    setSubmittingComment(true);

    try {
      const result = await executeAddComment({
        ticketId,
        content: commentContent,
      });

      if (result.error) {
        setActionError(result.error.message.replace('[GraphQL] ', ''));
      } else {
        setCommentContent('');
        reexecuteQuery({ requestPolicy: 'network-only' });
        onTicketUpdated();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssign = async (assigneeId: string) => {
    setActionError(null);
    try {
      const result = await executeAssign({ ticketId, assigneeId });
      if (result.error) {
        setActionError(result.error.message.replace('[GraphQL] ', ''));
      } else {
        reexecuteQuery({ requestPolicy: 'network-only' });
        onTicketUpdated();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to assign ticket');
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setActionError(null);
    try {
      const result = await executeChangeStatus({ ticketId, status: newStatus });
      if (result.error) {
        setActionError(result.error.message.replace('[GraphQL] ', ''));
      } else {
        reexecuteQuery({ requestPolicy: 'network-only' });
        onTicketUpdated();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleResolve = async () => {
    setActionError(null);
    try {
      const result = await executeResolve({ ticketId });
      if (result.error) {
        setActionError(result.error.message.replace('[GraphQL] ', ''));
      } else {
        reexecuteQuery({ requestPolicy: 'network-only' });
        onTicketUpdated();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to resolve ticket');
    }
  };

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'PPp');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in duration-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2.5 flex-wrap">
              {ticket && <PriorityBadge priority={ticket.priority} />}
              {ticket && <StatusBadge status={ticket.status} />}
              <span className="text-xs text-slate-400 font-mono">#{ticketId.slice(0, 8)}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {ticket ? ticket.title : 'Loading ticket details...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {fetching && (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3"></div>
              <div className="h-24 bg-slate-50 rounded"></div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm">
              Failed to load ticket: {error.message}
            </div>
          )}

          {ticket && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Description & Comments */}
              <div className="md:col-span-2 space-y-5">
                {/* Description */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Activity &amp; Comments ({ticket.comments.length})
                  </span>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {ticket.comments.length === 0 ? (
                      <p className="text-slate-400 italic text-sm">No comments yet.</p>
                    ) : (
                      ticket.comments.map((c) => {
                        const isFirstResponse =
                          ticket.firstResponseAt &&
                          new Date(ticket.firstResponseAt).getTime() ===
                            new Date(c.createdAt).getTime();

                        return (
                          <div
                            key={c.id}
                            className={`p-4 rounded-xl border text-sm space-y-1.5 ${
                              isFirstResponse
                                ? 'border-indigo-200 bg-indigo-50/50 ring-1 ring-indigo-200'
                                : 'border-slate-100 bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{c.author.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  ({c.author.role})
                                </span>
                                {isFirstResponse && (
                                  <span className="text-[11px] text-indigo-700 bg-indigo-100 font-bold px-2 py-0.5 rounded-full">
                                    1st Response Milestone
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400">{formatTimestamp(c.createdAt)}</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                              {c.content}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      required
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder={
                        isAgent
                          ? 'Add agent reply (triggers First Response SLA)...'
                          : 'Write a comment or follow-up...'
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-slate-400 bg-white shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentContent.trim()}
                      className="px-4.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-xs disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Col: SLA Breakdown & Agent Toolbar */}
              <div className="space-y-4">
                {/* SLA Summary Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    SLA Status (Business Hours)
                  </span>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-slate-700 font-bold">1st Response</span>
                        <SLABadge
                          state={ticket.sla.firstResponseState}
                          remainingMinutes={ticket.sla.firstResponseRemainingMinutes}
                          isCompleted={!!ticket.firstResponseAt}
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="text-slate-400">Due:</span> {formatTimestamp(ticket.sla.firstResponseDueAt)}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-slate-700 font-bold">Resolution</span>
                        <SLABadge
                          state={ticket.sla.resolutionState}
                          remainingMinutes={ticket.sla.resolutionRemainingMinutes}
                          isCompleted={!!ticket.resolvedAt}
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="text-slate-400">Due:</span> {formatTimestamp(ticket.sla.resolutionDueAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 text-xs sm:text-sm shadow-2xs">
                  <div>
                    <span className="text-slate-400 block text-xs font-medium">Reporter</span>
                    <span className="font-semibold text-slate-900">{ticket.reporter.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-medium">Assignee</span>
                    <span className="font-semibold text-slate-900">
                      {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs font-medium">Created</span>
                    <span className="font-medium text-slate-700">{formatTimestamp(ticket.createdAt)}</span>
                  </div>
                </div>

                {/* Agent Actions Toolbar */}
                {isAgent && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Agent Controls
                    </span>

                    <div className="space-y-2.5">
                      <select
                        value={ticket.assignee?.id || ''}
                        onChange={(e) => handleAssign(e.target.value)}
                        className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-slate-400 shadow-2xs font-medium cursor-pointer"
                      >
                        <option value="" disabled>
                          Assign Agent...
                        </option>
                        {agentsData?.users.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-1.5">
                        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map(
                          (st) => (
                            <button
                              key={st}
                              disabled={ticket.status === st}
                              onClick={() => handleStatusChange(st)}
                              className={`text-xs py-2 px-2 rounded-lg font-bold transition ${
                                ticket.status === st
                                  ? 'bg-slate-900 text-white shadow-2xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st === 'IN_PROGRESS' ? 'IN PROG' : st}
                            </button>
                          ),
                        )}
                      </div>

                      {ticket.status !== 'RESOLVED' && (
                        <button
                          onClick={handleResolve}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition text-center mt-1 shadow-xs"
                        >
                          Resolve Ticket
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
