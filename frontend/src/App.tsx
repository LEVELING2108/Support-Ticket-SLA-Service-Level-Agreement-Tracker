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
import { GET_DASHBOARD_QUERY, GET_HOLIDAYS_QUERY } from './graphql/operations';
import { TicketDashboard, TicketStatus, SLAState, Holiday } from './types';
import { Calendar, Globe2, AlertCircle } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
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
  });

  const [{ data: holidaysData }] = useQuery<{ holidays: Holiday[] }>({
    query: GET_HOLIDAYS_QUERY,
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenCreateTicket={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsCreateModalOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight">
                  Support SLA Control Center
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                  Engine Live
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                SLAs are enforced strictly using business hours (Mon–Fri 09:00–18:00). Nights,
                weekends, and public holidays never count against the timer. Clocks freeze
                permanently upon response and resolution.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-xs">
                <Globe2 className="w-3.5 h-3.5 text-indigo-300" />
                <span>Zone: Asia/Kolkata (9:00–18:00)</span>
              </div>

              {holidaysData?.holidays && holidaysData.holidays.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-xs">
                  <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{holidaysData.holidays.length} Holiday(s) Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Not authenticated banner */}
        {!isAuthenticated && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You are currently viewing as Guest. Sign in as <strong>agent@example.com</strong> or{' '}
                <strong>reporter@example.com</strong> (password: <code>password123</code>) to create
                tickets and execute actions.
              </span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Dashboard Stat Cards */}
        <DashboardCards
          dashboard={dashboardData?.dashboard ?? null}
          loading={dashboardFetching}
          onFilterChange={handleCardFilter}
          activeStatus={statusFilter}
          activeSLAState={slaStateFilter}
        />

        {/* Tickets Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Support Tickets &amp; SLA Status</h2>
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

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Support Ticket &amp; SLA Tracker · Strict Business Hours Engine · TypeScript &amp; GraphQL Yoga
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <UrqlProvider value={urqlClient}>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </UrqlProvider>
  );
};
