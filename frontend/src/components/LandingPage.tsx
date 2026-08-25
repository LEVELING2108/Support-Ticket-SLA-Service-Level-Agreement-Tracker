import React from 'react';
import { BrandIcon, BusinessClockIcon, MilestoneBeaconIcon, AgentRoleIcon, ReporterRoleIcon } from './icons/CustomIcons';
import { ArrowRight, ShieldCheck, Zap, Sparkles, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#fbfbfa] text-stone-900 flex flex-col font-sans antialiased selection:bg-stone-200">
      {/* Top Floating Nav */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandIcon className="w-8 h-8 shadow-xs rounded-xl" />
          <div>
            <span className="text-base font-black text-stone-900 tracking-tight">Burdenoff</span>
            <span className="text-[11px] text-stone-400 font-mono ml-2">/ SLA Tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuth}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 flex flex-col items-center text-center space-y-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 shadow-2xs animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-semibold text-stone-700">
            Precision Business-Hours SLA Engine (Mon–Fri 09:00–18:00)
          </span>
        </div>

        {/* Hero Heading */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-[1.1]">
            Support ticketing with <span className="underline decoration-indigo-500/40 decoration-wavy decoration-2">true SLA enforcement</span>.
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Never breach SLAs during nights, weekends, or public holidays. Accurate business-minute calculation with automatic milestone clock freezing.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2">
          <button
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm border border-stone-200/90 transition-all shadow-2xs hover:shadow-xs active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Sign In / Demo Accounts</span>
          </button>
        </div>

        {/* Persona Quick Launch Cards */}
        <div className="w-full pt-8 space-y-4">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Explore as a Persona
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {/* Agent Persona */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60 inline-flex">
                    <AgentRoleIcon className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    Support Staff
                  </span>
                </div>
                <h3 className="font-bold text-base text-stone-900">Support Agent</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Triage incoming tickets, assign agents, change statuses, post replies to trigger 1st-response SLA milestones, and resolve issues.
                </p>
              </div>
              <button
                onClick={() => handleQuickLogin('AGENT')}
                className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-colors flex items-center justify-between"
              >
                <span>Enter as Agent</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reporter Persona */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/60 inline-flex">
                    <ReporterRoleIcon className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                    Customer / User
                  </span>
                </div>
                <h3 className="font-bold text-base text-stone-900">Ticket Reporter</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Raise support tickets with Urgent/High/Medium/Low priority, track live SLA countdowns, and follow conversation threads.
                </p>
              </div>
              <button
                onClick={() => handleQuickLogin('REPORTER')}
                className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-colors flex items-center justify-between"
              >
                <span>Enter as Reporter</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Guest Persona */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-stone-100 text-stone-700 border border-stone-200/60 inline-flex">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    Read-Only
                  </span>
                </div>
                <h3 className="font-bold text-base text-stone-900">Guest Observer</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Explore the full ticket dashboard, filter by priority and SLA state, view business hours policies, and review metrics.
                </p>
              </div>
              <button
                onClick={onEnterDashboard}
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center justify-between"
              >
                <span>Explore as Guest</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="w-full pt-10 border-t border-stone-200/70 text-left space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Engine Architectural Pillars
            </h2>
            <p className="text-xs text-stone-500">
              Deterministic, pure functional mathematics running on PostgreSQL &amp; GraphQL Yoga
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 w-fit">
                <BusinessClockIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Business Hours Arithmetic</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tickets created on Friday at 17:59 count exactly 1 minute on Friday, skip Saturday &amp; Sunday, and resume counting Monday at 09:00.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 w-fit">
                <MilestoneBeaconIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Milestone Clock Freezing</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                When an agent replies, the first-response clock locks permanently. Once a ticket is resolved, the SLA can never retroactively breach.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Backend Single Source of Truth</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                GraphQL API delivers authoritative SLA states (<span className="text-emerald-700 font-semibold">ON_TRACK</span>, <span className="text-amber-700 font-semibold">AT_RISK</span>, <span className="text-rose-700 font-semibold">BREACHED</span>) directly to the UI.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/70 py-6 text-center text-xs text-stone-400 font-normal">
        Burdenoff · Precision Business Hours SLA Engine · GraphQL Yoga &amp; React
      </footer>
    </div>
  );
};
