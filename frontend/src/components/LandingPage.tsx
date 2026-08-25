import React from 'react';
import { BrandIcon, AgentRoleIcon, ReporterRoleIcon } from './icons/CustomIcons';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard, onOpenAuth }) => {
  const { login } = useAuth();

  const handleQuickLogin = (role: 'AGENT' | 'REPORTER') => {
    if (role === 'AGENT') {
      login('demo-agent-token', {
        id: 'agent-demo-id',
        email: 'agent@example.com',
        name: 'Alex Agent',
        role: 'AGENT',
        createdAt: new Date().toISOString(),
      });
    } else {
      login('demo-reporter-token', {
        id: 'reporter-demo-id',
        email: 'reporter@example.com',
        name: 'Rachel Reporter',
        role: 'REPORTER',
        createdAt: new Date().toISOString(),
      });
    }
    onEnterDashboard();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-stone-900 flex flex-col justify-between font-sans antialiased selection:bg-stone-200">
      {/* Top Floating Nav */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandIcon className="w-7 h-7" />
          <span className="text-sm font-bold text-stone-900 tracking-tight">Burdenoff</span>
          <span className="text-[10px] text-stone-400 font-mono">/ SLA Engine</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAuth}
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 px-3 py-1.5 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-2xs active:scale-95"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Hero Section — Perfectly Proportioned within Screen Height */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center text-center space-y-6 flex-1 justify-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-semibold text-stone-700">
            Mon–Fri 09:00–18:00 · Timezone: Asia/Kolkata
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 tracking-tight leading-[1.15]">
            Support ticketing with true business-hours SLA tracking.
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto font-normal leading-relaxed">
            Zero SLA penalties during nights, weekends, or public holidays. Accurate business-minute countdowns with automatic milestone clock freezing.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleQuickLogin('AGENT')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-purple-800 font-semibold text-xs border border-stone-200/90 transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <AgentRoleIcon className="w-3.5 h-3.5" />
            <span>Enter as Agent</span>
          </button>

          <button
            onClick={() => handleQuickLogin('REPORTER')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs border border-stone-200/90 transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ReporterRoleIcon className="w-3.5 h-3.5" />
            <span>Enter as Reporter</span>
          </button>
        </div>

        {/* 3-Point Compact Feature Grid */}
        <div className="w-full pt-8 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-3xl">
          <div className="p-3.5 rounded-xl bg-white border border-stone-200/70 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-400">01</span>
            <h4 className="text-xs font-bold text-stone-900">09:00 – 18:00 Window</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
              Weekends &amp; holidays contribute zero minutes against the ticket SLA.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-stone-200/70 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-400">02</span>
            <h4 className="text-xs font-bold text-stone-900">Milestone Clock Freeze</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
              1st agent reply and ticket resolution permanently lock the SLA clock.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-stone-200/70 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-400">03</span>
            <h4 className="text-xs font-bold text-stone-900">Authoritative API</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
              Backend is the single source of truth for all SLA remaining timers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 py-3 text-center text-xs text-stone-400 font-normal">
        Burdenoff · Precision Business Hours SLA Engine · GraphQL Yoga
      </footer>
    </div>
  );
};
