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
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col relative border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in duration-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              {ticket && <PriorityBadge priority={ticket.priority} />}
              {ticket && <StatusBadge status={ticket.status} />}
              <span className="text-[11px] text-slate-400 font-mono">#{ticketId.slice(0, 8)}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {ticket ? ticket.title : 'Loading ticket...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {actionError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {fetching && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-16 bg-slate-50 rounded"></div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-50 text-rose-700">
              Failed to load ticket: {error.message}
            </div>
          )}

          {ticket && (
            <>
              {/* SLA Minimal Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">First Response:</span>
                  <div className="flex items-center gap-1.5">
                    <SLABadge
                      state={ticket.sla.firstResponseState}
                      remainingMinutes={ticket.sla.firstResponseRemainingMinutes}
                      isCompleted={!!ticket.firstResponseAt}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Resolution:</span>
                  <div className="flex items-center gap-1.5">
                    <SLABadge
                      state={ticket.sla.resolutionState}
                      remainingMinutes={ticket.sla.resolutionRemainingMinutes}
                      isCompleted={!!ticket.resolvedAt}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </span>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-slate-400 text-[11px] border-t border-b border-slate-100 py-2.5 flex-wrap">
                <span>Reporter: <strong className="text-slate-700 font-medium">{ticket.reporter.name}</strong></span>
                <span>·</span>
                <span>Assignee: <strong className="text-slate-700 font-medium">{ticket.assignee ? ticket.assignee.name : 'Unassigned'}</strong></span>
                <span>·</span>
                <span>Created: <strong className="text-slate-700 font-medium">{formatTimestamp(ticket.createdAt)}</strong></span>
              </div>

              {/* Agent Actions Toolbar */}
              {isAgent && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 flex-wrap justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={ticket.assignee?.id || ''}
                      onChange={(e) => handleAssign(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-slate-400"
                    >
                      <option value="" disabled>
                        Assign to...
                      </option>
                      {agentsData?.users.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((st) => (
                        <button
                          key={st}
                          disabled={ticket.status === st}
                          onClick={() => handleStatusChange(st)}
                          className={`text-[11px] px-2 py-1 rounded-md font-semibold transition ${
                            ticket.status === st
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st === 'IN_PROGRESS' ? 'IN PROG' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {ticket.status !== 'RESOLVED' && (
                    <button
                      onClick={handleResolve}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Activity ({ticket.comments.length})
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ticket.comments.length === 0 ? (
                    <p className="text-slate-400 italic">No comments yet.</p>
                  ) : (
                    ticket.comments.map((c) => {
                      const isFirstResponse =
                        ticket.firstResponseAt &&
                        new Date(ticket.firstResponseAt).getTime() ===
                          new Date(c.createdAt).getTime();

                      return (
                        <div
                          key={c.id}
                          className={`p-3 rounded-lg border text-xs space-y-1 ${
                            isFirstResponse
                              ? 'border-indigo-200 bg-indigo-50/40'
                              : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">{c.author.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({c.author.role})
                              </span>
                              {isFirstResponse && (
                                <span className="text-[10px] text-indigo-700 bg-indigo-100/70 font-bold px-1.5 py-0.2 rounded">
                                  1st Response
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400">{formatTimestamp(c.createdAt)}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{c.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    required
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder={
                      isAgent
                        ? 'Add agent reply (triggers First Response SLA)...'
                        : 'Write a comment...'
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
