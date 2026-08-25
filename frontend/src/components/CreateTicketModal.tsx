import React, { useState } from 'react';
import { useMutation } from 'urql';
import { CREATE_TICKET_MUTATION } from '../graphql/operations';
import { Priority } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('URGENT');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [, executeCreateTicket] = useMutation(CREATE_TICKET_MUTATION);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (title.trim().length < 3) {
      setErrorMessage('Title must be at least 3 characters');
      return;
    }

    if (description.trim().length < 5) {
      setErrorMessage('Description must be at least 5 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await executeCreateTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      if (result.error) {
        setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
      } else {
        setTitle('');
        setDescription('');
        setPriority('URGENT');
        onTicketCreated();
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    {
      value: 'URGENT' as Priority,
      label: 'URGENT',
      resp: 'Resp: 1h',
      resolv: 'Resolv: 4h',
      activeColor: 'border-red-500 bg-red-50/30 text-red-600',
      titleColor: 'text-red-600',
    },
    {
      value: 'HIGH' as Priority,
      label: 'HIGH',
      resp: 'Resp: 4h',
      resolv: 'Resolv: 24h',
      activeColor: 'border-amber-500 bg-amber-50/30 text-amber-600',
      titleColor: 'text-amber-600',
    },
    {
      value: 'MEDIUM' as Priority,
      label: 'MEDIUM',
      resp: 'Resp: 8h',
      resolv: 'Resolv: 48h',
      activeColor: 'border-indigo-500 bg-indigo-50/30 text-indigo-600',
      titleColor: 'text-indigo-600',
    },
    {
      value: 'LOW' as Priority,
      label: 'LOW',
      resp: 'Resp: 24h',
      resolv: 'Resolv: 72h',
      activeColor: 'border-stone-500 bg-stone-50 text-stone-700',
      titleColor: 'text-stone-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-stone-200/90 animate-in fade-in zoom-in duration-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-stone-950">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Ticket Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Payment gateway timeout on checkout"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 bg-white"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">min 3 chars</span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 bg-white resize-none"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">min 5 chars</span>
          </div>

          {/* SLA Priority Level Grid */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              SLA Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    priority === opt.value
                      ? `${opt.activeColor} shadow-2xs`
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <div className={`text-[11px] font-bold font-mono ${opt.titleColor}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono mt-1">{opt.resp}</div>
                  <div className="text-[10px] text-stone-500 font-mono">{opt.resolv}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#18181b] hover:bg-black text-white text-xs font-semibold transition shadow-2xs active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
