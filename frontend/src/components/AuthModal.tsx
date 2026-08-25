import React, { useState } from 'react';
import { useMutation } from 'urql';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/operations';
import { useAuth } from '../context/useAuth';
import { UserRole, AuthPayload } from '../types';
import { X, AlertCircle, KeyRound, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('REPORTER');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [, executeLogin] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);
  const [, executeRegister] = useMutation<{ register: AuthPayload }>(REGISTER_MUTATION);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const fillCredentials = (demoEmail: string, demoRole: UserRole) => {
    setIsRegister(false);
    setEmail(demoEmail);
    setPassword('password123');
    setRole(demoRole);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        const result = await executeRegister({
          name,
          email,
          password,
          role,
        });

        if (result.error) {
          setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
          setLoading(false);
          return;
        }

        if (result.data?.register) {
          login(result.data.register.token, result.data.register.user);
          onClose();
        }
      } else {
        const result = await executeLogin({
          email: email.trim().toLowerCase(),
          password,
        });

        if (result.error) {
          setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
          setLoading(false);
          return;
        }

        if (result.data?.login) {
          login(result.data.login.token, result.data.login.user);
          onClose();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative border border-slate-200/80 animate-in fade-in zoom-in duration-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">
            {isRegister ? 'Create an Account' : 'Sign in to Burdenoff'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Fill Buttons */}
        {!isRegister && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Fill Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials('agent@example.com', 'AGENT')}
                className="px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold flex items-center justify-center gap-1 transition shadow-2xs"
              >
                <UserCheck className="w-3 h-3" />
                <span>Agent</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('reporter@example.com', 'REPORTER')}
                className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1 transition shadow-2xs"
              >
                <KeyRound className="w-3 h-3" />
                <span>Reporter</span>
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRole('REPORTER')}
                  className={`py-1.5 rounded-lg border text-xs font-semibold transition ${
                    role === 'REPORTER'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  REPORTER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('AGENT')}
                  className={`py-1.5 rounded-lg border text-xs font-semibold transition ${
                    role === 'AGENT'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  AGENT
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="mt-3 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-900 transition"
          >
            {isRegister ? 'Already registered? Sign in' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
