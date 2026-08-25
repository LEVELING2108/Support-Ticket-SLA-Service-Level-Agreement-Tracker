import React, { useState } from 'react';
import { useMutation } from 'urql';
import { LOGIN_MUTATION } from '../graphql/operations';
import { AuthPayload } from '../types';
import { BrandIcon } from './icons/CustomIcons';
import { useAuth } from '../context/useAuth';
import { Loader2 } from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard, onOpenAuth }) => {
  const { login } = useAuth();
  const [loadingRole, setLoadingRole] = useState<'AGENT' | 'REPORTER' | null>(null);
  const [, executeLogin] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);

  const handleQuickLogin = async (role: 'AGENT' | 'REPORTER') => {
    setLoadingRole(role);
    try {
      const email = role === 'AGENT' ? 'agent@example.com' : 'reporter@example.com';
      const result = await executeLogin({
        email,
        password: 'password123',
      });

      if (result.data?.login) {
        login(result.data.login.token, result.data.login.user);
      }
    } catch {
      // fallback
    } finally {
      setLoadingRole(null);
      onEnterDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-stone-900 flex flex-col justify-between font-sans antialiased selection:bg-stone-200">
      {/* Top Navbar matching mockup */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-stone-200/60 bg-white">
        <div className="flex items-center gap-2.5">
          <BrandIcon className="w-6 h-6 text-stone-950" />
          <span className="text-sm font-black text-stone-950 tracking-tight">Burdenoff</span>
          <span className="text-[10px] text-stone-400 font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/60 uppercase">
            SLA ENGINE
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onOpenAuth}
            className="text-xs font-medium text-stone-600 hover:text-stone-950 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onEnterDashboard}
            className="text-xs font-medium text-stone-600 hover:text-stone-950 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section matching mockup */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center space-y-7 flex-1 justify-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200/90 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-xs font-mono text-stone-700 font-medium">
            Mon-Fri 09:00-18:00 Asia/Kolkata
          </span>
        </div>

        {/* Big Bold Headline */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-[1.1]">
            Support ticketing with<br />true business-hours SLA tracking
          </h1>
          <p className="text-sm sm:text-base text-stone-500 max-w-xl mx-auto font-normal leading-relaxed">
            Zero SLA penalties during nights, weekends, or holidays. Accurate countdowns with milestone clock freezing.
          </p>
        </div>

        {/* 3 Buttons Strip matching mockup */}
        <div className="pt-3 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#18181b] hover:bg-black text-white font-semibold text-xs transition-all shadow-2xs active:scale-95"
          >
            Launch Dashboard
          </button>

          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleQuickLogin('AGENT')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-200 transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loadingRole === 'AGENT' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Enter as Agent</span>
          </button>

          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleQuickLogin('REPORTER')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-200 transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loadingRole === 'REPORTER' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Enter as Reporter</span>
          </button>
        </div>

        {/* 3 Bottom Feature Cards matching mockup */}
        <div className="w-full pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-stone-400">01</span>
              <h4 className="text-xs font-bold text-stone-900">Business Hours Window</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              SLA clock counts only when you are working.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-stone-400">02</span>
              <h4 className="text-xs font-bold text-stone-900">Milestone Clock Freeze</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Freeze progress automatically on customer reply.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-stone-400">03</span>
              <h4 className="text-xs font-bold text-stone-900">Authoritative Engine</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              No complex calendar mapping required.
            </p>
          </div>
        </div>
      </main>

      {/* Footer matching mockup */}
      <footer className="border-t border-stone-200/60 px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-normal bg-white">
        <div>© 2026 Burdenoff SLA Engine. Designed for precision ops.</div>
        <div className="mt-1 sm:mt-0 font-mono text-[11px] text-stone-400">
          System Status: Operational (100%)
        </div>
      </footer>
    </div>
  );
};
