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
import {
  BusinessClockIcon,
  MilestoneBeaconIcon,
  SendPaperPlaneIcon,
  AgentRoleIcon,
  ReporterRoleIcon,
} from './icons/CustomIcons';
import {
  X,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar,
  UserCheck,
} from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col relative border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="pr-6">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {ticket && <PriorityBadge priority={ticket.priority} />}
              {ticket && <StatusBadge status={ticket.status} />}
              <span className="text-xs text-slate-400 font-mono">ID: {ticketId.slice(0, 8)}...</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {ticket ? ticket.title : 'Loading ticket details...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {actionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}

          {fetching && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-24 bg-slate-100 rounded"></div>
              <div className="h-32 bg-slate-100 rounded"></div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm">
              Failed to load ticket: {error.message}
            </div>
          )}

          {ticket && (
            <>
              {/* SLA Metrics Card */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <BusinessClockIcon className="w-4 h-4 text-indigo-600" />
                    SLA Clock &amp; Business-Hours Status
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Strictly business hours (09:00–18:00)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* First Response SLA */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">First Response SLA</span>
                      <SLABadge
                        state={ticket.sla.firstResponseState}
                        remainingMinutes={ticket.sla.firstResponseRemainingMinutes}
                        isCompleted={!!ticket.firstResponseAt}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div>
                        <span className="text-slate-400">Target Deadline: </span>
                        <span className="font-semibold text-slate-800">
                          {formatTimestamp(ticket.sla.firstResponseDueAt)}
                        </span>
                      </div>
                      {ticket.firstResponseAt && (
                        <div>
                          <span className="text-slate-400">Responded At: </span>
                          <span className="font-bold text-emerald-700">
                            {formatTimestamp(ticket.firstResponseAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resolution SLA */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Resolution SLA</span>
                      <SLABadge
                        state={ticket.sla.resolutionState}
                        remainingMinutes={ticket.sla.resolutionRemainingMinutes}
                        isCompleted={!!ticket.resolvedAt}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div>
                        <span className="text-slate-400">Target Deadline: </span>
                        <span className="font-semibold text-slate-800">
                          {formatTimestamp(ticket.sla.resolutionDueAt)}
                        </span>
                      </div>
                      {ticket.resolvedAt && (
                        <div>
                          <span className="text-slate-400">Resolved At: </span>
                          <span className="font-bold text-emerald-700">
                            {formatTimestamp(ticket.resolvedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </h3>
                <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                  <span className="text-slate-400 block mb-0.5 font-medium">Reporter</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ReporterRoleIcon className="w-3.5 h-3.5 text-slate-500" />
                    {ticket.reporter.name}
                  </div>
                  <span className="text-[11px] text-slate-400">{ticket.reporter.email}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                  <span className="text-slate-400 block mb-0.5 font-medium">Assignee</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <AgentRoleIcon className="w-3.5 h-3.5 text-purple-600" />
                    {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {ticket.assignee ? ticket.assignee.email : 'No agent assigned yet'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                  <span className="text-slate-400 block mb-0.5 font-medium">Created At</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatTimestamp(ticket.createdAt)}
                  </div>
                </div>
              </div>

              {/* Agent Actions Toolbar */}
              {isAgent && (
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-2">
                      <AgentRoleIcon className="w-4 h-4 text-purple-700" />
                      Support Agent Action Center
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Assignment Selector */}
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <select
                        value={ticket.assignee?.id || ''}
                        onChange={(e) => handleAssign(e.target.value)}
                        className="text-xs bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">Status:</span>
                      {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            disabled={ticket.status === st}
                            onClick={() => handleStatusChange(st)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition ${
                              ticket.status === st
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100'
                            }`}
                          >
                            {st}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Quick Resolve */}
                    {ticket.status !== 'RESOLVED' && (
                      <button
                        onClick={handleResolve}
                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve Ticket
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Timeline */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Activity &amp; Comments ({ticket.comments.length})
                </h3>

                <div className="space-y-3">
                  {ticket.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments posted yet.</p>
                  ) : (
                    ticket.comments.map((c, index) => {
                      const isFirstResponse =
                        ticket.firstResponseAt &&
                        new Date(ticket.firstResponseAt).getTime() ===
                          new Date(c.createdAt).getTime();

                      return (
                        <div
                          key={c.id}
                          className={`p-4 rounded-xl border text-xs space-y-1.5 transition ${
                            isFirstResponse
                              ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-200 shadow-xs'
                              : 'border-slate-200 bg-white shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{c.author.name}</span>
                              {c.author.role === 'AGENT' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  <AgentRoleIcon className="w-3 h-3" />
                                  AGENT
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  <ReporterRoleIcon className="w-3 h-3" />
                                  REPORTER
                                </span>
                              )}
                              {isFirstResponse && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                                  <MilestoneBeaconIcon className="w-3 h-3" />
                                  1st Response SLA Milestone
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              #{index + 1} · {formatTimestamp(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="pt-2">
                  <div className="flex gap-2">
                    <textarea
                      required
                      rows={2}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder={
                        isAgent
                          ? 'Add agent reply (triggers First Response SLA if initial reply)...'
                          : 'Add comment or update on ticket...'
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={submittingComment || !commentContent.trim()}
                      className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                    >
                      <SendPaperPlaneIcon className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
