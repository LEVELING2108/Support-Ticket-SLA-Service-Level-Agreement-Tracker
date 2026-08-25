import React, { useState } from 'react';
import { useMutation } from 'urql';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/operations';
import { useAuth } from '../context/useAuth';
import { UserRole, AuthPayload } from '../types';
import { BrandIcon } from './icons/CustomIcons';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('REPORTER');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [, executeLogin] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);
  const [, executeRegister] = useMutation<{ register: AuthPayload }>(REGISTER_MUTATION);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickDemoFill = async (demoEmail: string) => {
    setActiveTab('LOGIN');
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await executeLogin({
        email: demoEmail,
        password: 'password123',
      });

      if (result.error) {
        setErrorMessage(result.error.message.replace('[GraphQL] ', ''));
      } else if (result.data?.login) {
        login(result.data.login.token, result.data.login.user);
        onClose();
      }
    } catch {
      setErrorMessage('Failed to sign in with demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (activeTab === 'REGISTER') {
        const result = await executeRegister({
          name,
          email: email.trim().toLowerCase(),
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
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-stone-200/90 animate-in fade-in zoom-in duration-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centered Brand Header */}
        <div className="flex flex-col items-center justify-center space-y-1 mb-5">
          <div className="flex items-center gap-2">
            <BrandIcon className="w-6 h-6 text-stone-950" />
            <h2 className="text-base font-black text-stone-950 tracking-tight">Burdenoff</h2>
          </div>
        </div>

        {/* Login / Register Tabs */}
        <div className="flex border-b border-stone-200 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-2.5 text-center transition-colors relative ${
              activeTab === 'LOGIN'
                ? 'text-stone-900 border-b-2 border-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('REGISTER');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-2.5 text-center transition-colors relative ${
              activeTab === 'REGISTER'
                ? 'text-stone-900 border-b-2 border-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {activeTab === 'REGISTER' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Agent"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-400 bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@burdenoff.io"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-400 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700">Password</label>
              <button
                type="button"
                className="text-[11px] text-stone-400 hover:text-stone-700 transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-400 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {activeTab === 'REGISTER' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('REPORTER')}
                  className={`py-1.5 rounded-xl border text-xs font-semibold transition ${
                    role === 'REPORTER'
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  REPORTER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('AGENT')}
                  className={`py-1.5 rounded-xl border text-xs font-semibold transition ${
                    role === 'AGENT'
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
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
            className="w-full mt-2 py-2.5 rounded-xl bg-[#18181b] hover:bg-black text-white font-semibold text-xs transition shadow-2xs active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : activeTab === 'REGISTER' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* OR QUICK DEMO ACCESS */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="text-center mb-3">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono font-medium">
              OR QUICK DEMO ACCESS
            </span>
          </div>

          <div className="space-y-2">
            {/* Agent Demo Row */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoFill('agent@example.com')}
              className="w-full p-2.5 rounded-xl border border-stone-200/90 hover:border-purple-300 hover:bg-purple-50/30 flex items-center justify-between transition group cursor-pointer bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
                  AA
                </div>
                <span className="text-xs font-medium text-stone-800">agent@example.com</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
                AGENT
              </span>
            </button>

            {/* Reporter Demo Row */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoFill('reporter@example.com')}
              className="w-full p-2.5 rounded-xl border border-stone-200/90 hover:border-sky-300 hover:bg-sky-50/30 flex items-center justify-between transition group cursor-pointer bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center text-[9px] font-bold text-white">
                  RA
                </div>
                <span className="text-xs font-medium text-stone-800">reporter@example.com</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-sky-50 text-sky-700 border border-sky-200/60">
                REPORTER
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
