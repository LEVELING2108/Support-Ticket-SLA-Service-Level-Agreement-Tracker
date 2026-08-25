import React, { useState } from 'react';
import { useMutation } from 'urql';
import { CREATE_TICKET_MUTATION } from '../graphql/operations';
import { Priority, Ticket } from '../types';
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
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [, executeCreateTicket] = useMutation<{ createTicket: Ticket }>(CREATE_TICKET_MUTATION);

  if (!isOpen) return null;

  const priorities: { value: Priority; label: string; sla: string }[] = [
    { value: 'URGENT', label: 'Urgent', sla: '1h / 4h' },
    { value: 'HIGH', label: 'High', sla: '4h / 24h' },
    { value: 'MEDIUM', label: 'Medium', sla: '8h / 48h' },
    { value: 'LOW', label: 'Low', sla: '24h / 72h' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-slate-200/80 animate-in fade-in zoom-in duration-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">New Support Ticket</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
            <input
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary of the issue..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              required
              rows={3}
              minLength={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and reproduction steps..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
            <div className="grid grid-cols-4 gap-1.5">
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`p-2 rounded-lg border text-center transition ${
                    priority === p.value
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-[11px] uppercase font-bold">{p.label}</div>
                  <div className="text-[9px] opacity-75 mt-0.5">{p.sla}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
