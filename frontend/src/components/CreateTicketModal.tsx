import React, { useState } from 'react';
import { useMutation } from 'urql';
import { CREATE_TICKET_MUTATION } from '../graphql/operations';
import { Priority, Ticket } from '../types';
import { X, PlusCircle, AlertCircle, Clock } from 'lucide-react';

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
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [, executeCreateTicket] = useMutation<{ createTicket: Ticket }>(CREATE_TICKET_MUTATION);

  if (!isOpen) return null;

  const priorities: { value: Priority; label: string; slaDesc: string; color: string }[] = [
    {
      value: 'URGENT',
      label: 'Urgent',
      slaDesc: '1h Response · 4h Resolution',
      color: 'border-red-300 bg-red-50/60 text-red-800',
    },
    {
      value: 'HIGH',
      label: 'High',
      slaDesc: '4h Response · 24h Resolution',
      color: 'border-orange-300 bg-orange-50/60 text-orange-800',
    },
    {
      value: 'MEDIUM',
      label: 'Medium',
      slaDesc: '8h Response · 48h Resolution',
      color: 'border-blue-300 bg-blue-50/60 text-blue-800',
    },
    {
      value: 'LOW',
      label: 'Low',
      slaDesc: '24h Response · 72h Resolution',
      color: 'border-slate-300 bg-slate-50/60 text-slate-700',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await executeCreateTicket({
        title,
        description,
        priority,
      });

      if (result.error) {
        setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
        setLoading(false);
        return;
      }

      if (result.data?.createTicket) {
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        onTicketCreated();
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100 animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Support Ticket</h2>
            <p className="text-xs text-slate-500">
              SLA deadline is calculated using business hours only
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Summary
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production database latency spike"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              required
              rows={4}
              minLength={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, steps to reproduce, or affected services..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Priority &amp; SLA Policy
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    priority === p.value
                      ? `${p.color} ring-2 ring-indigo-400 font-bold`
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase">{p.label}</span>
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">{p.slaDesc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
