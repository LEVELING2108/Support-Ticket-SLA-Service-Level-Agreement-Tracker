import React, { useState } from 'react';
import { Provider as UrqlProvider, useQuery } from 'urql';
import { urqlClient } from './lib/urqlClient';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Navbar } from './components/Navbar';
import { DashboardCards } from './components/DashboardCards';
import { TicketList } from './components/TicketList';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CreateTicketModal } from './components/CreateTicketModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { GET_DASHBOARD_QUERY, GET_HOLIDAYS_QUERY } from './graphql/operations';
import { TicketDashboard, TicketStatus, SLAState, Holiday } from './types';
import { Globe, Calendar, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD'>('LANDING');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);
  const [slaStateFilter, setSLAStateFilter] = useState<SLAState | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const [{ data: dashboardData, fetching: dashboardFetching }, reexecuteDashboard] = useQuery<{
    dashboard: TicketDashboard;
  }>({
    query: GET_DASHBOARD_QUERY,
    requestPolicy: 'cache-and-network',
    pause: currentView !== 'DASHBOARD',
  });

  const [{ data: holidaysData }] = useQuery<{ holidays: Holiday[] }>({
    query: GET_HOLIDAYS_QUERY,
    pause: currentView !== 'DASHBOARD',
  });

  const handleRefresh = () => {
    reexecuteDashboard({ requestPolicy: 'network-only' });
    setRefreshKey((k) => k + 1);
  };

  const handleCardFilter = (status?: TicketStatus, slaState?: SLAState) => {
    setStatusFilter(status);
    setSLAStateFilter(slaState);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans text-stone-900 selection:bg-stone-200 w-full antialiased">
      {currentView === 'LANDING' ? (
        <LandingPage
          onEnterDashboard={() => setCurrentView('DASHBOARD')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      ) : (
        <>
          <Navbar
            onNavigateHome={() => setCurrentView('LANDING')}
            onOpenCreateTicket={() => {
              if (!isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
            {/* Full-width Top Metadata Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/70 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    Support Ticket SLA Center
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-subtle-pulse"></span>
                    Engine Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 font-normal">
                  SLA clocks count business hours only (Mon–Fri, 09:00–18:00) · Nights, weekends, and holidays excluded
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-600 font-medium flex-wrap">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-stone-400" />
                  <span>Zone: <strong>Asia/Kolkata</strong></span>
                </div>

                {holidaysData?.holidays && holidaysData.holidays.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{holidaysData.holidays.length} Holiday Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guest Banner */}
            {!isAuthenticated && (
              <div className="px-4 py-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Viewing as Guest. Sign in as <strong className="font-bold">agent@example.com</strong> or{' '}
                    <strong className="font-bold">reporter@example.com</strong> (<code>password123</code>) to create &amp; manage tickets.
                  </span>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs sm:text-sm text-amber-950 font-bold underline hover:text-black shrink-0 active:scale-95 transition-transform"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Full-width Stat Counters */}
            <DashboardCards
              dashboard={dashboardData?.dashboard ?? null}
              loading={dashboardFetching}
              onFilterChange={handleCardFilter}
              activeStatus={statusFilter}
              activeSLAState={slaStateFilter}
            />

            {/* Full-width Ticket List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold text-stone-400 uppercase tracking-wider">
                  Tickets &amp; SLA Milestones
                </h2>
              </div>

              <TicketList
                onSelectTicket={(id) => setSelectedTicketId(id)}
                statusFilter={statusFilter}
                slaStateFilter={slaStateFilter}
                onStatusFilterChange={setStatusFilter}
                onSLAStateFilterChange={setSLAStateFilter}
                refreshTrigger={refreshKey}
              />
            </div>
          </main>

          <footer className="border-t border-stone-200/70 py-5 text-center text-xs text-stone-400 font-normal w-full">
            Burdenoff · Precision Business Hours SLA Engine · Crafted with care
          </footer>
        </>
      )}

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleRefresh}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onTicketUpdated={handleRefresh}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <UrqlProvider value={urqlClient}>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </UrqlProvider>
  );
};
